using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Kho.XuatNoiBo;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Application.Features.Kho.Queries.LayDanhSachPhieuXuatNoiBo;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    /// <summary>
    /// Khoa/Phòng gửi yêu cầu xuất vật tư nội bộ (trạng thái khởi tạo: ChoDuyet).
    /// POST /api/v1/inventory/dispense/internal-request
    /// </summary>
    [HttpPost("dispense/internal-request")]
    [ClinicalAuthorize("inventory", HanhDongQuyen.TAO, PhamViDuLieu.CO_SO)]
    public Task<IActionResult> TaoYeuCauXuatNoiBo([FromBody] TaoYeuCauXuatNoiBoRequest request) =>
        Send(new TaoYeuCauXuatNoiBoCommand(request, CurrentUserId));

    /// <summary>
    /// Admin duyệt phiếu xuất — trừ kho tổng theo FEFO và ghi log giao dịch.
    /// PUT /api/v1/inventory/dispense/{id}/approve
    /// </summary>
    [HttpPut("dispense/{id:int}/approve")]
    [ClinicalAuthorize("inventory", HanhDongQuyen.SUA, PhamViDuLieu.CO_SO)]
    public Task<IActionResult> DuyetPhieuXuatNoiBo(int id) =>
        Send(new DuyetPhieuXuatNoiBoCommand(id, CurrentUserId));

    /// <summary>
    /// Trưởng khoa / Điều dưỡng xác nhận đã nhận đủ vật tư bàn giao.
    /// PUT /api/v1/inventory/dispense/{id}/confirm-received
    /// POST /api/v1/inventory/dispense/{id}/confirm-received
    /// </summary>
    [HttpPut("dispense/{id:int}/confirm-received")]
    [HttpPost("dispense/{id:int}/confirm-received")]
    [ClinicalAuthorize("inventory", HanhDongQuyen.SUA, PhamViDuLieu.CO_SO)]
    public Task<IActionResult> XacNhanNhanHang(
        int id,
        [FromQuery] int? nguoiNhanId,
        [FromQuery] string? ghiChuNhanHang,
        [FromBody] XacNhanNhanHangNoiBoRequest? body = null)
    {
        var targetNguoiNhanId = (nguoiNhanId ?? 0) > 0
            ? nguoiNhanId!.Value
            : (body?.NguoiNhanId ?? 0) > 0
                ? body!.NguoiNhanId!.Value
                : CurrentUserId;
        var note = ghiChuNhanHang ?? body?.GhiChuNhanHang;
        return Send(new XacNhanNhanHangCommand(id, targetNguoiNhanId, CurrentUserId, note));
    }

    /// <summary>
    /// Admin từ chối phiếu xuất nội bộ.
    /// PUT /api/v1/inventory/dispense/{id}/reject
    /// </summary>
    [HttpPut("dispense/{id:int}/reject")]
    [ClinicalAuthorize("inventory", HanhDongQuyen.SUA, PhamViDuLieu.CO_SO)]
    public Task<IActionResult> TuChoiPhieuXuatNoiBo(int id, [FromQuery] string lyDo) =>
        Send(new TuChoiPhieuXuatNoiBoCommand(id, lyDo ?? string.Empty, CurrentUserId));

    /// <summary>
    /// Lấy danh sách phiếu xuất nội bộ Khoa/Phòng với phân trang và bộ lọc.
    /// GET /api/v1/inventory/dispense/internal-list
    /// </summary>
    [HttpGet("dispense/internal-list")]
    public Task<IActionResult> DanhSachPhieuXuatNoiBo(
        [FromQuery] int? maKhoa,
        [FromQuery] string? trangThai,
        [FromQuery] DateTime? tuNgay,
        [FromQuery] DateTime? denNgay,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20) =>
        Send(new LayDanhSachPhieuXuatNoiBoQuery(maKhoa, trangThai, tuNgay, denNgay, pageIndex, pageSize, CurrentUserId));

    /// <summary>
    /// Thống kê tiêu hao vật tư theo Khoa/Phòng trong kỳ, đối chiếu với số ca khám/chỉ định.
    /// GET /api/v1/inventory/dispense/department-usage-stats
    /// </summary>
    [HttpGet("dispense/department-usage-stats")]
    public Task<IActionResult> ThongKeTieuHaoTheoKhoa(
        [FromQuery] int? maKhoa,
        [FromQuery] DateTime tuNgay,
        [FromQuery] DateTime denNgay) =>
        Send(new LayThongKeTieuHaoTheoKhoaQuery(maKhoa, tuNgay, denNgay, CurrentUserId));
}
