using ClinicManagement.API.Authorization;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Common.Utilities;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/Thuoc")]
[Route("api/duoc/thuoc")]
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed class ThuocController(ClinicDbContext db, IInventorySettings settings) : BaseController
{
    /// <summary>
    /// Tìm kiếm danh mục thuốc lâm sàng phục vụ kê đơn (Ultra-fast Clinical Drug Search)
    /// Hỗ trợ tìm theo mã, tên biệt dược, hoạt chất, đường dùng, tiếng Việt có dấu/không dấu
    /// và tính toán tồn kho khả dụng tức thời (unexpired stock - reserved stock).
    /// </summary>
    [HttpGet("search")]
    [HttpGet("catalog")]
    public async Task<IActionResult> Search(
        [FromQuery(Name = "q")] string? q = null,
        [FromQuery(Name = "keyword")] string? keyword = null,
        [FromQuery(Name = "maKho")] int? maKho = null,
        [FromQuery(Name = "pageSize")] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var rawKeyword = (!string.IsNullOrWhiteSpace(q) ? q : keyword)?.Trim();
        var unaccentKeyword = StringUtils.NormalizeSearchKeyword(rawKeyword);
        var warehouseId = maKho.GetValueOrDefault(settings.DefaultWarehouseId);
        var now = DateTime.UtcNow;

        var query = db.Items.AsNoTracking()
            .Where(x => x.IsActive && x.CanKeDon);

        if (!string.IsNullOrWhiteSpace(rawKeyword))
        {
            query = query.Where(x =>
                x.Ma.Contains(rawKeyword) ||
                x.Ten.Contains(rawKeyword) ||
                x.TenGoc.Contains(rawKeyword) ||
                x.HoatChat.Contains(rawKeyword) ||
                x.DuongDung.Contains(rawKeyword) ||
                x.HamLuong.Contains(rawKeyword) ||
                x.MaBHYT.Contains(rawKeyword) ||
                EF.Functions.Collate(x.Ten, "Latin1_General_CI_AI").Contains(unaccentKeyword) ||
                EF.Functions.Collate(x.HoatChat, "Latin1_General_CI_AI").Contains(unaccentKeyword) ||
                EF.Functions.Collate(x.DuongDung, "Latin1_General_CI_AI").Contains(unaccentKeyword) ||
                EF.Functions.Collate(x.HamLuong, "Latin1_General_CI_AI").Contains(unaccentKeyword));
        }

        var size = Math.Clamp(pageSize, 1, 50);

        var data = await query
            .OrderBy(x => x.Ten == rawKeyword ? 0 : 1)
            .ThenBy(x => x.Ma == rawKeyword ? 0 : 1)
            .ThenBy(x => x.Ten)
            .Take(size)
            .Select(x => new
            {
                id = x.Id,
                ma = x.Ma,
                maThuoc = x.Ma,
                ten = x.Ten,
                tenThuoc = x.Ten,
                tenGoc = x.TenGoc,
                hoatChat = x.HoatChat,
                hamLuong = x.HamLuong,
                duongDung = string.IsNullOrEmpty(x.DuongDung) ? "Uống" : x.DuongDung,
                donViTinh = x.DonViTinhCoBan,
                gia = x.GiaBanLe,
                donGia = x.GiaBanLe,
                tonKho = x.TonKhos
                    .Where(t => t.MaKho == warehouseId && t.SoLuongTon > 0 &&
                                (!t.ChiTietNhapKho.HanSuDung.HasValue || t.ChiTietNhapKho.HanSuDung.Value > now))
                    .Sum(t => (decimal?)t.SoLuongTon) ?? 0,
                dangGiuCho = db.ChiTietDonThuocs
                    .Where(ct => ct.MaItem == x.Id && ct.DonThuoc.TrangThai == TrangThaiDonThuoc.DA_DUYET)
                    .Sum(ct => (decimal?)(ct.SoLuongKe - ct.SoLuongDaXuat)) ?? 0,
                laThuocBHYT = !string.IsNullOrEmpty(x.MaBHYT),
                bhyt = !string.IsNullOrEmpty(x.MaBHYT),
                tyLeBHYT = x.TyLeBHYT
            })
            .ToListAsync(cancellationToken);

        var finalResult = data.Select(x =>
        {
            var soLuongKhaDung = Math.Max(0, x.tonKho - x.dangGiuCho);
            return new
            {
                x.id,
                x.ma,
                x.maThuoc,
                x.ten,
                x.tenThuoc,
                x.tenGoc,
                x.hoatChat,
                x.hamLuong,
                x.duongDung,
                x.donViTinh,
                x.gia,
                x.donGia,
                tonKho = x.tonKho,
                soLuongTon = x.tonKho,
                soLuongKhaDung,
                dangGiuCho = x.dangGiuCho,
                x.laThuocBHYT,
                x.bhyt,
                x.tyLeBHYT
            };
        });

        return Success(finalResult);
    }
}
