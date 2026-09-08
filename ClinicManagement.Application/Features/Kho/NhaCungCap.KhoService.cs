using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClinicManagement.Application.Features.Kho;

public partial class KhoService
{
    public async Task<InventoryResult> NhaCungCaps(string? keyword, TrangThaiNhaCungCap? status, int pageIndex = 1, int pageSize = 20)
    {
        pageIndex = Math.Max(1, pageIndex);
        pageSize = Math.Clamp(pageSize, 1, 100);
        keyword = keyword?.Trim();

        var q = db.NhaCungCaps
            .AsNoTracking()
            .Where(x => !x.IsDeleted);
        if (!string.IsNullOrWhiteSpace(keyword))
            q = q.Where(x => x.Ma.Contains(keyword) || x.Ten.Contains(keyword));
        if (status.HasValue)
            q = q.Where(x => x.TrangThai == status.Value);
        
        var total = await q.CountAsync();
        var items = await q.OrderBy(x => x.Id)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new NhaCungCapDto(x.Id, x.Ma, x.Ten, x.DiaChi, x.DienThoai, x.Email, x.MaSoThue, x.TrangThai))
            .ToListAsync();
            
        if (items.Count == 0)
            logger.LogWarning("Không có nhà cung cấp phù hợp. Keyword={Keyword}, Status={Status}, PageIndex={PageIndex}, PageSize={PageSize}",
                keyword, status, pageIndex, pageSize);

        return InventoryResult.Ok(new { items, total, pageIndex, pageSize });
    }

    public async Task<InventoryResult> CreateNhaCungCap(NhaCungCapRequest request)
    {
        var ma = request.Ma.Trim();
        var ten = request.Ten.Trim();
        if (string.IsNullOrWhiteSpace(ma) || string.IsNullOrWhiteSpace(ten))
            return InventoryResult.Error("Mã và tên nhà cung cấp không được để trống.");

        if (await db.NhaCungCaps.AnyAsync(x => x.Ma == ma && !x.IsDeleted))
            return InventoryResult.Error("Mã nhà cung cấp đã tồn tại");
            
        var entity = new NhaCungCap
        {
            Ma = ma,
            Ten = ten,
            DiaChi = request.DiaChi ?? "",
            DienThoai = request.DienThoai ?? "",
            Email = request.Email ?? "",
            MaSoThue = request.MaSoThue ?? "",
            TrangThai = TrangThaiNhaCungCap.HoatDong
        };
        
        db.Add(entity);
        await db.SaveEntitiesAsync();
        return InventoryResult.Ok(new { entity.Id });
    }

    public async Task<InventoryResult> UpdateNhaCungCap(int id, NhaCungCapRequest request)
    {
        var entity = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (entity is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp", 404);
        
        var ma = request.Ma.Trim();
        var ten = request.Ten.Trim();
        if (string.IsNullOrWhiteSpace(ma) || string.IsNullOrWhiteSpace(ten))
            return InventoryResult.Error("Mã và tên nhà cung cấp không được để trống.");

        if (entity.Ma != ma && await db.NhaCungCaps.AnyAsync(x => x.Ma == ma && x.Id != id && !x.IsDeleted))
            return InventoryResult.Error("Mã nhà cung cấp đã tồn tại");
            
        entity.Ma = ma;
        entity.Ten = ten;
        entity.DiaChi = request.DiaChi ?? "";
        entity.DienThoai = request.DienThoai ?? "";
        entity.Email = request.Email ?? "";
        entity.MaSoThue = request.MaSoThue ?? "";
        
        await db.SaveEntitiesAsync();
        return InventoryResult.Ok(new { entity.Id });
    }

    public async Task<InventoryResult> ToggleNhaCungCap(int id)
    {
        var entity = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (entity is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp", 404);
        
        entity.TrangThai = entity.TrangThai == TrangThaiNhaCungCap.HoatDong ? TrangThaiNhaCungCap.NgungHopTac : TrangThaiNhaCungCap.HoatDong;
        await db.SaveEntitiesAsync();
        return InventoryResult.Ok(new { entity.Id, entity.TrangThai });
    }
}
