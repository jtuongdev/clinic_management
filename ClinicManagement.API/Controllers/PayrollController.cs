using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Application.Features.Payroll;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/payroll")]
    [ClinicalAuthorize("hr", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
public sealed class PayrollController(IMediator mediator) : BaseController
{
    [HttpGet("periods")]
    public async Task<IActionResult> List(CancellationToken ct) => Success(await mediator.Send(new GetPayrollPeriodsQuery(), ct));

    [HttpGet("my-payslips")]
    [AllowSelf]
    public async Task<IActionResult> MyPayslips(CancellationToken ct) =>
        Success(await mediator.Send(new LayBangLuongCaNhanQuery(CurrentUserId), ct));

    [HttpPost("periods")]
    public async Task<IActionResult> Create([FromBody] CreatePayrollPeriodRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CreatePayrollPeriodCommand(request), ct), "Đã tạo kỳ lương.");

    [HttpGet("periods/{id:int}")]
    public async Task<IActionResult> Detail(int id, CancellationToken ct) =>
        Success(await mediator.Send(new GetPayrollPeriodQuery(id), ct));

    [HttpPost("periods/{id:int}/generate")]
    public async Task<IActionResult> Generate(int id, CancellationToken ct) =>
        Success(await mediator.Send(new GeneratePayrollCommand(id), ct), "Đã tạo bảng lương từ kỳ chấm công đã khóa.");

    [HttpPost("periods/{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, CancellationToken ct) =>
        Success(await mediator.Send(new ApprovePayrollCommand(id), ct), "Đã duyệt kỳ lương.");

    [HttpPost("periods/{id:int}/close")]
    public async Task<IActionResult> Close(int id, CancellationToken ct) =>
        Success(await mediator.Send(new ClosePayrollCommand(id), ct), "Đã đóng kỳ lương.");

    [HttpPost("periods/{id:int}/pay")]
    public async Task<IActionResult> Pay(int id, CancellationToken ct) =>
        Success(await mediator.Send(new PayPayrollCommand(id), ct), "Đã đánh dấu thanh toán kỳ lương.");

    [HttpPost("bang-luong/{bangLuongId:int}/items")]
    public async Task<IActionResult> AddItem(int bangLuongId, [FromBody] AddItemRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new ThemKhoanBangLuongCommand(bangLuongId, request), ct), "Đã thêm khoản điều chỉnh.");

    [HttpDelete("bang-luong/{bangLuongId:int}/items/{itemId:int}")]
    public async Task<IActionResult> RemoveItem(int bangLuongId, int itemId, CancellationToken ct) =>
        Success(await mediator.Send(new XoaKhoanBangLuongCommand(bangLuongId, itemId), ct), "Đã xóa khoản điều chỉnh.");

    [HttpPost("bang-luong/{bangLuongId:int}/recalculate")]
    public async Task<IActionResult> Recalculate(int bangLuongId, CancellationToken ct) =>
        Success(await mediator.Send(new TinhLaiBangLuongNhanVienCommand(bangLuongId), ct), "Đã tính lại lương nhân viên.");

    [HttpGet("bang-luong/{bangLuongId:int}/attendance-drilldown")]
    [AllowSelf]
    public async Task<IActionResult> AttendanceDrilldown(int bangLuongId, CancellationToken ct) =>
        Success(await mediator.Send(new LayChiTietChamCongBangLuongQuery(bangLuongId), ct));

    [HttpPost("periods/{id:int}/publish")]
    public async Task<IActionResult> Publish(int id, CancellationToken ct) =>
        Success(await mediator.Send(new CongBoKyLuongCommand(id), ct), "Đã công bố kỳ lương cho nhân viên.");

    [HttpPost("periods/{id:int}/unpublish")]
    public async Task<IActionResult> Unpublish(int id, CancellationToken ct) =>
        Success(await mediator.Send(new HuyPublishKyLuongCommand(id), ct), "Đã hủy công bố kỳ lương.");

    [HttpGet("bang-luong/{bangLuongId:int}/his-summary")]
    [AllowSelf]
    public async Task<IActionResult> HisSummary(int bangLuongId, CancellationToken ct) =>
        Success(await mediator.Send(new HisSummaryBangLuongQuery(bangLuongId), ct));

    [HttpGet("config/chuc-vu")]
    public async Task<IActionResult> GetChucVuRates(CancellationToken ct) =>
        Success(await mediator.Send(new LayDanhSachDinhMucChucVuQuery(), ct));

    [HttpPut("config/chuc-vu/{id:int}")]
    [ClinicalAuthorize("hr", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
    public async Task<IActionResult> UpdateChucVuRate(int id, [FromBody] UpdateChucVuRateRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CapNhatDinhMucChucVuCommand(id, request.ThuLaoMoiLuot), ct), "Đã cập nhật định mức thù lao chức vụ.");

    [HttpGet("config/hoa-hong-loai-dich-vu")]
    public async Task<IActionResult> GetHoaHongLoaiDichVu(CancellationToken ct) =>
        Success(await mediator.Send(new LayDanhSachHoaHongLoaiDichVuQuery(), ct));

    [HttpPut("config/hoa-hong-loai-dich-vu")]
    [ClinicalAuthorize("hr", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
    public async Task<IActionResult> UpdateHoaHongLoaiDichVu([FromBody] BatchUpdateHoaHongLoaiDichVuRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CapNhatHoaHongLoaiDichVuCommand(request.Items), ct), "Đã cập nhật tỷ lệ hoa hồng theo loại dịch vụ.");

    [HttpPut("config/nhan-vien/{id:int}/rate")]
    [ClinicalAuthorize("hr", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
    public async Task<IActionResult> UpdateEmployeeRate(int id, [FromBody] UpdateEmployeeRateRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CapNhatDinhMucNhanVienCommand(id, request.ThuLaoMoiLuot), ct), "Đã cập nhật thù lao nhân viên.");

    [HttpPut("config/dich-vu/{id:int}/rate")]
    [ClinicalAuthorize("hr", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
    public async Task<IActionResult> UpdateServiceRate(int id, [FromBody] UpdateServiceRateRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CapNhatHoaHongDichVuCommand(id, request.TyLeHoaHong), ct), "Đã cập nhật tỷ lệ hoa hồng dịch vụ.");
}
