using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Application.Features.Payroll;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Nhân sự (Human Resources) - Quản lý Bảng lương, Tính lương và Thù lao hoa hồng.
/// Bao gồm: quản lý kỳ tính lương, sinh bảng lương từ dữ liệu chấm công, phê duyệt/đóng/thanh toán kỳ lương,
/// phiếu lương cá nhân (payslip), chi tiết công & HIS, cấu hình thù lao chức vụ, hoa hồng dịch vụ khám.
/// Route: /api/payroll
/// </summary>
[ApiController]
[Route("api/payroll")]
[ClinicalAuthorize("hr", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
public sealed class PayrollController(IMediator mediator) : BaseController
{
    /// <summary>
    /// Lấy danh sách các kỳ tính lương trong hệ thống.
    /// </summary>
    [HttpGet("periods")]
    public async Task<IActionResult> List(CancellationToken ct) => Success(await mediator.Send(new GetPayrollPeriodsQuery(), ct));

    /// <summary>
    /// Lấy danh sách phiếu lương cá nhân (Payslips) của chính nhân viên đang đăng nhập.
    /// </summary>
    [HttpGet("my-payslips")]
    [AllowSelf]
    public async Task<IActionResult> MyPayslips(CancellationToken ct) =>
        Success(await mediator.Send(new LayBangLuongCaNhanQuery(CurrentUserId), ct));

    /// <summary>
    /// Tạo kỳ tính lương mới theo tháng/năm.
    /// </summary>
    [HttpPost("periods")]
    public async Task<IActionResult> Create([FromBody] CreatePayrollPeriodRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CreatePayrollPeriodCommand(request), ct), "Đã tạo kỳ lương.");

    /// <summary>
    /// Lấy chi tiết kỳ tính lương và danh sách bảng lương của toàn bộ nhân viên trong kỳ.
    /// </summary>
    [HttpGet("periods/{id:int}")]
    public async Task<IActionResult> Detail(int id, CancellationToken ct) =>
        Success(await mediator.Send(new GetPayrollPeriodQuery(id), ct));

    /// <summary>
    /// Tự động sinh bảng lương cho nhân viên dựa trên kỳ chấm công đã khóa.
    /// </summary>
    [HttpPost("periods/{id:int}/generate")]
    public async Task<IActionResult> Generate(int id, CancellationToken ct) =>
        Success(await mediator.Send(new GeneratePayrollCommand(id), ct), "Đã tạo bảng lương từ kỳ chấm công đã khóa.");

    /// <summary>
    /// Phê duyệt bảng lương của kỳ tính lương.
    /// </summary>
    [HttpPost("periods/{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, CancellationToken ct) =>
        Success(await mediator.Send(new ApprovePayrollCommand(id), ct), "Đã duyệt kỳ lương.");

    /// <summary>
    /// Đóng kỳ tính lương (khóa không cho chỉnh sửa).
    /// </summary>
    [HttpPost("periods/{id:int}/close")]
    public async Task<IActionResult> Close(int id, CancellationToken ct) =>
        Success(await mediator.Send(new ClosePayrollCommand(id), ct), "Đã đóng kỳ lương.");

    /// <summary>
    /// Đánh dấu đã chi trả tiền lương cho nhân viên trong kỳ.
    /// </summary>
    [HttpPost("periods/{id:int}/pay")]
    public async Task<IActionResult> Pay(int id, CancellationToken ct) =>
        Success(await mediator.Send(new PayPayrollCommand(id), ct), "Đã đánh dấu thanh toán kỳ lương.");

    /// <summary>
    /// Thêm khoản điều chỉnh lương (phụ cấp, thưởng, phạt, tạm ứng) vào bảng lương nhân viên.
    /// </summary>
    [HttpPost("bang-luong/{bangLuongId:int}/items")]
    public async Task<IActionResult> AddItem(int bangLuongId, [FromBody] AddItemRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new ThemKhoanBangLuongCommand(bangLuongId, request), ct), "Đã thêm khoản điều chỉnh.");

    /// <summary>
    /// Xóa khoản điều chỉnh lương khỏi bảng lương nhân viên.
    /// </summary>
    [HttpDelete("bang-luong/{bangLuongId:int}/items/{itemId:int}")]
    public async Task<IActionResult> RemoveItem(int bangLuongId, int itemId, CancellationToken ct) =>
        Success(await mediator.Send(new XoaKhoanBangLuongCommand(bangLuongId, itemId), ct), "Đã xóa khoản điều chỉnh.");

    /// <summary>
    /// Tính toán lại bảng lương cho một nhân viên sau khi có thay đổi khoản phụ cấp/giảm trừ.
    /// </summary>
    [HttpPost("bang-luong/{bangLuongId:int}/recalculate")]
    public async Task<IActionResult> Recalculate(int bangLuongId, CancellationToken ct) =>
        Success(await mediator.Send(new TinhLaiBangLuongNhanVienCommand(bangLuongId), ct), "Đã tính lại lương nhân viên.");

    /// <summary>
    /// Lấy chi tiết dữ liệu chấm công (khoan ngày công, giờ làm, ca trực) của bảng lương cá nhân.
    /// </summary>
    [HttpGet("bang-luong/{bangLuongId:int}/attendance-drilldown")]
    [AllowSelf]
    public async Task<IActionResult> AttendanceDrilldown(int bangLuongId, CancellationToken ct) =>
        Success(await mediator.Send(new LayChiTietChamCongBangLuongQuery(bangLuongId), ct));

    /// <summary>
    /// Công bố bảng lương chính thức cho toàn thể nhân viên xem phiếu lương cá nhân.
    /// </summary>
    [HttpPost("periods/{id:int}/publish")]
    public async Task<IActionResult> Publish(int id, CancellationToken ct) =>
        Success(await mediator.Send(new CongBoKyLuongCommand(id), ct), "Đã công bố kỳ lương cho nhân viên.");

    /// <summary>
    /// Hủy công bố bảng lương để thu hồi hoặc hiệu chỉnh.
    /// </summary>
    [HttpPost("periods/{id:int}/unpublish")]
    public async Task<IActionResult> Unpublish(int id, CancellationToken ct) =>
        Success(await mediator.Send(new HuyPublishKyLuongCommand(id), ct), "Đã hủy công bố kỳ lương.");

    /// <summary>
    /// Lấy tóm tắt thù lao khám bệnh và hoa hồng chỉ định dịch vụ y tế (HIS Summary) gắn với bảng lương.
    /// </summary>
    [HttpGet("bang-luong/{bangLuongId:int}/his-summary")]
    [AllowSelf]
    public async Task<IActionResult> HisSummary(int bangLuongId, CancellationToken ct) =>
        Success(await mediator.Send(new HisSummaryBangLuongQuery(bangLuongId), ct));

    /// <summary>
    /// Lấy danh mục định mức thù lao mỗi lượt khám theo chức vụ (Bác sĩ, Điều dưỡng, v.v.).
    /// </summary>
    [HttpGet("config/chuc-vu")]
    public async Task<IActionResult> GetChucVuRates(CancellationToken ct) =>
        Success(await mediator.Send(new LayDanhSachDinhMucChucVuQuery(), ct));

    /// <summary>
    /// Cập nhật định mức thù lao mỗi lượt khám cho một chức vụ.
    /// </summary>
    [HttpPut("config/chuc-vu/{id:int}")]
    [ClinicalAuthorize("hr", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
    public async Task<IActionResult> UpdateChucVuRate(int id, [FromBody] UpdateChucVuRateRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CapNhatDinhMucChucVuCommand(id, request.ThuLaoMoiLuot), ct), "Đã cập nhật định mức thù lao chức vụ.");

    /// <summary>
    /// Lấy danh mục tỷ lệ hoa hồng theo phân loại dịch vụ y tế.
    /// </summary>
    [HttpGet("config/hoa-hong-loai-dich-vu")]
    public async Task<IActionResult> GetHoaHongLoaiDichVu(CancellationToken ct) =>
        Success(await mediator.Send(new LayDanhSachHoaHongLoaiDichVuQuery(), ct));

    /// <summary>
    /// Cập nhật tỷ lệ hoa hồng hàng loạt theo nhóm loại dịch vụ.
    /// </summary>
    [HttpPut("config/hoa-hong-loai-dich-vu")]
    [ClinicalAuthorize("hr", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
    public async Task<IActionResult> UpdateHoaHongLoaiDichVu([FromBody] BatchUpdateHoaHongLoaiDichVuRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CapNhatHoaHongLoaiDichVuCommand(request.Items), ct), "Đã cập nhật tỷ lệ hoa hồng theo loại dịch vụ.");

    /// <summary>
    /// Cấu hình định mức thù lao riêng biệt cho một nhân viên cụ thể (ghi đè định mức chức vụ).
    /// </summary>
    [HttpPut("config/nhan-vien/{id:int}/rate")]
    [ClinicalAuthorize("hr", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
    public async Task<IActionResult> UpdateEmployeeRate(int id, [FromBody] UpdateEmployeeRateRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CapNhatDinhMucNhanVienCommand(id, request.ThuLaoMoiLuot), ct), "Đã cập nhật thù lao nhân viên.");

    /// <summary>
    /// Cấu hình tỷ lệ hoa hồng riêng biệt cho một dịch vụ cụ thể.
    /// </summary>
    [HttpPut("config/dich-vu/{id:int}/rate")]
    [ClinicalAuthorize("hr", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
    public async Task<IActionResult> UpdateServiceRate(int id, [FromBody] UpdateServiceRateRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CapNhatHoaHongDichVuCommand(id, request.TyLeHoaHong), ct), "Đã cập nhật tỷ lệ hoa hồng dịch vụ.");
}
