using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Application.Features.LichHen.Commands.HuyLichHen;
using ClinicManagement.Application.Features.LichHen.Commands.TaoLichHen;
using ClinicManagement.Application.Features.LichHen.Commands.TiepNhanLichHen;
using ClinicManagement.Application.Features.LichHen.Commands.XacNhanThuTienMat;
using ClinicManagement.Application.Features.LichHen.Queries.LayChiTietLichHen;
using ClinicManagement.Application.Features.LichHen.Queries.LayDanhSachLichHen;
using ClinicManagement.Application.Features.LichHen.Queries.LaySlotKhamBacSi;
using ClinicManagement.Application.Features.LichHen.Queries.LayThongKeLichHen;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ClinicalAuthorize("appointment", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
    public class LichHenController : BaseController
    {
        private readonly IMediator _mediator;

        public LichHenController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/LichHen?pageIndex=1&pageSize=15&keyword=...&trangThai=...&tuNgay=...&denNgay=...
        [HttpGet]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int? maCoSo,
            [FromQuery] int? maBacSi,
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay,
            [FromQuery] string? trangThai,
            [FromQuery] string? keyword,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = new LayDanhSachLichHenQuery
            {
                MaCoSo = maCoSo,
                MaBacSi = maBacSi,
                TuNgay = tuNgay,
                DenNgay = denNgay,
                TrangThai = trangThai,
                Keyword = keyword,
                PageIndex = pageIndex,
                PageSize = pageSize
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }

        // GET: api/LichHen/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new LayChiTietLichHenQuery(id);
            var result = await _mediator.Send(query);
            if (result == null)
            {
                return Failure($"Không tìm thấy lịch hẹn #{id}", 404);
            }
            return Success(result);
        }

        // GET: api/LichHen/slots?maBacSi=12&ngay=2026-09-24
        [HttpGet("slots")]
        public async Task<IActionResult> GetSlots(
            [FromQuery] int maBacSi,
            [FromQuery] DateTime? ngay)
        {
            if (maBacSi <= 0)
            {
                return Failure("Mã bác sĩ không hợp lệ.", 400);
            }

            var query = new LaySlotKhamBacSiQuery
            {
                MaBacSi = maBacSi,
                NgayKham = ngay ?? DateTime.Today
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }

        // GET: api/LichHen/thong-ke?maCoSo=1&maBacSi=12&ngay=2026-09-24
        [HttpGet("thong-ke")]
        public async Task<IActionResult> GetThongKe(
            [FromQuery] int? maCoSo,
            [FromQuery] int? maBacSi,
            [FromQuery] DateTime? ngay)
        {
            var query = new LayThongKeLichHenQuery
            {
                MaCoSo = maCoSo,
                MaBacSi = maBacSi,
                Ngay = ngay
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }

        // POST: api/LichHen
        [HttpPost]
        [ClinicalAuthorize("appointment", HanhDongQuyen.TAO, PhamViDuLieu.CO_SO)]
        public async Task<IActionResult> Create([FromBody] CreateLichHenRequest request)
        {
            var command = new TaoLichHenCommand
            {
                MaBenhNhan = request.MaBenhNhan,
                MaBacSi = request.MaBacSi,
                MaCoSo = request.MaCoSo,
                MaKhoa = request.MaKhoa,
                ThoiGianBatDau = request.ThoiGianBatDau,
                ThoiGianKetThuc = request.ThoiGianKetThuc,
                LyDo = request.LyDo,
                NguonDat = request.NguonDat,
                CreatedBy = CurrentUserId > 0 ? CurrentUserId : null
            };

            try
            {
                var result = await _mediator.Send(command);
                return Success(result, "Tạo lịch hẹn thành công. Vui lòng thu tiền giữ chỗ 100.000 VNĐ tại quầy.");
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
        }

        // POST: api/LichHen/{id}/thu-tien-mat
        [HttpPost("{id}/thu-tien-mat")]
        [ClinicalAuthorize("appointment", HanhDongQuyen.SUA, PhamViDuLieu.CO_SO)]
        public async Task<IActionResult> ThuTienMat(int id, [FromBody] ThuTienRequest? req)
        {
            var command = new XacNhanThuTienMatCommand
            {
                MaLichHen = id,
                NguoiThu = CurrentUserId > 0 ? CurrentUserId : 1,
                GhiChu = req?.GhiChu
            };

            try
            {
                var result = await _mediator.Send(command);
                return Success(result, "Thu tiền giữ chỗ 100.000 VNĐ thành công. Đã xác nhận giữ chỗ cho bệnh nhân.");
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 400);
            }
        }

        // POST: api/LichHen/{id}/huy
        [HttpPost("{id}/huy")]
        [ClinicalAuthorize("appointment", HanhDongQuyen.XOA, PhamViDuLieu.CO_SO)]
        public async Task<IActionResult> HuyLichHen(int id, [FromBody] HuyLichRequest? req)
        {
            var command = new HuyLichHenCommand
            {
                MaLichHen = id,
                LyDoHuy = req?.LyDoHuy ?? "Bệnh nhân tự ý hủy hoặc quá giờ không đến (No-show)",
                NguoiHuy = CurrentUserId > 0 ? CurrentUserId : null
            };

            try
            {
                var result = await _mediator.Send(command);
                return Success(result, "Đã hủy lịch hẹn. Theo quy định, tiền cọc 100.000 VNĐ KHÔNG HOÀN LẠI.");
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 400);
            }
        }

        // POST: api/LichHen/{id}/tiep-nhan
        [HttpPost("{id}/tiep-nhan")]
        [ClinicalAuthorize("appointment", HanhDongQuyen.SUA, PhamViDuLieu.CO_SO)]
        public async Task<IActionResult> TiepNhanVaoKham(int id)
        {
            var command = new TiepNhanLichHenCommand
            {
                MaLichHen = id,
                NguoiTiepNhan = CurrentUserId > 0 ? CurrentUserId : 1
            };

            try
            {
                var result = await _mediator.Send(command);
                return Success(result, result.ThongBao);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return Failure($"Lỗi xử lý tiếp nhận: {ex.Message}", 500);
            }
        }
    }

    public class ThuTienRequest
    {
        public string? GhiChu { get; set; }
    }

    public class HuyLichRequest
    {
        public string? LyDoHuy { get; set; }
    }
}
