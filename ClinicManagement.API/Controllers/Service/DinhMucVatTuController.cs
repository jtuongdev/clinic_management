using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Service;
using ClinicManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Authorize]
[Route("api/dich-vu")]
public class DinhMucVatTuController(ClinicDbContext db) : BaseController
{
    public sealed record DinhMucItemRequest(int ItemId, decimal SoLuong, string? DonViTinh, string? GhiChu);
    public sealed record SetDinhMucRequest(IEnumerable<DinhMucItemRequest> Items);

    [HttpGet("{dichVuId:int}/dinh-muc-vat-tu")]
    public async Task<IActionResult> GetDinhMuc(int dichVuId)
    {
        var items = await db.DinhMucVatTuDichVus
            .AsNoTracking()
            .Where(x => x.MaDanhMucDichVu == dichVuId && !x.IsDeleted)
            .Include(x => x.Item)
            .Select(x => new
            {
                id = x.Id,
                dichVuId = x.MaDanhMucDichVu,
                itemId = x.MaItem,
                itemCode = x.Item.Ma,
                itemName = x.Item.Ten,
                itemType = x.Item.LoaiItem.ToString(),
                quantity = x.SoLuong,
                unit = x.DonViTinh,
                note = x.GhiChu
            })
            .ToListAsync();

        return Success(items);
    }

    [HttpPost("{dichVuId:int}/dinh-muc-vat-tu")]
    public async Task<IActionResult> SetDinhMuc(int dichVuId, SetDinhMucRequest request)
    {
        var dichVu = await db.DanhMucDichVus.FirstOrDefaultAsync(x => x.Id == dichVuId && !x.IsDeleted);
        if (dichVu is null) return Failure("Không tìm thấy dịch vụ.", 404);

        var existing = await db.DinhMucVatTuDichVus.Where(x => x.MaDanhMucDichVu == dichVuId).ToListAsync();
        db.DinhMucVatTuDichVus.RemoveRange(existing);

        foreach (var itemReq in request.Items ?? Enumerable.Empty<DinhMucItemRequest>())
        {
            if (itemReq.SoLuong <= 0) return Failure("Số lượng định mức phải lớn hơn 0.", 400);
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == itemReq.ItemId && x.IsActive);
            if (item is null) return Failure($"Vật tư #{itemReq.ItemId} không tồn tại.", 404);

            var bom = new DinhMucVatTuDichVu
            {
                MaDanhMucDichVu = dichVuId,
                MaItem = itemReq.ItemId,
                SoLuong = itemReq.SoLuong,
                DonViTinh = string.IsNullOrWhiteSpace(itemReq.DonViTinh) ? item.DonViTinhCoBan : itemReq.DonViTinh,
                GhiChu = itemReq.GhiChu ?? string.Empty
            };
            db.DinhMucVatTuDichVus.Add(bom);
        }

        await db.SaveChangesAsync();
        return Success(new { message = "Cập nhật định mức vật tư thành công" });
    }
}
