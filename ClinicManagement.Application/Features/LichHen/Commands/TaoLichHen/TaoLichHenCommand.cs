using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Common.Notifications.Templates;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.LichHen.Commands.TaoLichHen
{
    public class TaoLichHenCommand : IRequest<LichHenDto>
    {
        public int MaBenhNhan { get; set; }
        public int MaBacSi { get; set; }
        public int MaCoSo { get; set; }
        public int? MaKhoa { get; set; }
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public string LyDo { get; set; } = string.Empty;
        public string NguonDat { get; set; } = "LE_TAN";
        public int? CreatedBy { get; set; }
    }

    public class TaoLichHenCommandHandler : IRequestHandler<TaoLichHenCommand, LichHenDto>
    {
        private readonly ILichHenRepository _lichHenRepo;
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly INhanVienRepository _nhanVienRepo;
        private readonly ICoSoRepository _coSoRepo;
        private readonly ClinicManagement.Application.Common.Interfaces.IEmailSender _emailSender;
        private readonly Microsoft.Extensions.Logging.ILogger<TaoLichHenCommandHandler> _logger;

        public TaoLichHenCommandHandler(
            ILichHenRepository lichHenRepo,
            IBenhNhanRepository benhNhanRepo,
            INhanVienRepository nhanVienRepo,
            ICoSoRepository coSoRepo,
            ClinicManagement.Application.Common.Interfaces.IEmailSender emailSender,
            Microsoft.Extensions.Logging.ILogger<TaoLichHenCommandHandler> logger)
        {
            _lichHenRepo = lichHenRepo;
            _benhNhanRepo = benhNhanRepo;
            _nhanVienRepo = nhanVienRepo;
            _coSoRepo = coSoRepo;
            _emailSender = emailSender;
            _logger = logger;
        }

        public async Task<LichHenDto> Handle(TaoLichHenCommand request, CancellationToken cancellationToken)
        {
            if (request.MaBenhNhan <= 0)
                throw new ArgumentException("Bệnh nhân không hợp lệ.");
            if (request.MaBacSi <= 0)
                throw new ArgumentException("Bác sĩ không hợp lệ.");
            if (request.MaCoSo <= 0)
                throw new ArgumentException("Cơ sở không hợp lệ.");
            if (request.ThoiGianBatDau >= request.ThoiGianKetThuc)
                throw new ArgumentException("Thời gian bắt đầu phải trước thời gian kết thúc.");

            // 1. Kiểm tra tồn tại bệnh nhân & bác sĩ & cơ sở
            var benhNhan = await _benhNhanRepo.GetByIdAsync(request.MaBenhNhan)
                ?? throw new InvalidOperationException($"Không tìm thấy bệnh nhân #{request.MaBenhNhan}");

            var bacSi = await _nhanVienRepo.GetByIdAsync(request.MaBacSi)
                ?? throw new InvalidOperationException($"Không tìm thấy bác sĩ #{request.MaBacSi}");

            var coSo = await _coSoRepo.GetByIdAsync(request.MaCoSo)
                ?? throw new InvalidOperationException($"Không tìm thấy cơ sở #{request.MaCoSo}");

            // 2. Kiểm tra giới hạn slot khám (Tối đa 2 bệnh nhân / slot 30 phút)
            const int maxPerSlot = 2;
            var bookedInSlot = await _lichHenRepo.CountAppointmentsInSlotAsync(
                request.MaBacSi,
                request.ThoiGianBatDau,
                request.ThoiGianKetThuc,
                null,
                cancellationToken);

            if (bookedInSlot >= maxPerSlot)
            {
                throw new InvalidOperationException(
                    $"Khung giờ {request.ThoiGianBatDau:HH:mm} - {request.ThoiGianKetThuc:HH:mm} của bác sĩ {bacSi.HoTen} đã đủ số lượng tiếp nhận ({bookedInSlot}/{maxPerSlot}). Vui lòng chọn khung giờ khác.");
            }

            int? maKhoa = request.MaKhoa;

            // 3. Khởi tạo lịch hẹn với phí giữ chỗ 100.000 VNĐ (Chờ thu tiền mặt tại quầy)
            var lichHen = new Domain.Appointment.LichHen(
                request.MaBenhNhan,
                request.MaBacSi,
                request.MaCoSo,
                maKhoa,
                request.ThoiGianBatDau,
                request.ThoiGianKetThuc,
                request.LyDo,
                request.NguonDat,
                request.CreatedBy
            );

            await _lichHenRepo.AddAsync(lichHen);
            await _lichHenRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            // Gửi email xác nhận đặt lịch hẹn nếu bệnh nhân có email
            if (!string.IsNullOrWhiteSpace(benhNhan.Email))
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var emailData = new AppointmentEmailData
                        {
                            MaLichHen = lichHen.Id,
                            TenBenhNhan = $"{benhNhan.Ho} {benhNhan.Ten}".Trim(),
                            TenBacSi = bacSi.HoTen,
                            TenChuyenKhoa = coSo.Ten,
                            TenPhongKham = "Phòng khám theo lịch trực",
                            GioHen = lichHen.ThoiGianBatDau,
                            TenCoSo = coSo.Ten,
                            LyDoKham = lichHen.LyDo,
                        };

                        var emailNotification = new AppointmentConfirmationEmail(emailData);
                        await _emailSender.SendEmailAsync(
                            benhNhan.Email,
                            emailNotification.Subject,
                            emailNotification.BuildHtmlBody(),
                            cancellationToken: CancellationToken.None);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi gửi email xác nhận lịch hẹn #{Id}", lichHen.Id);
                    }
                }, CancellationToken.None);
            }

            return new LichHenDto
            {
                Id = lichHen.Id,
                MaBenhNhan = benhNhan.Id,
                TenBenhNhan = $"{benhNhan.Ho} {benhNhan.Ten}".Trim(),
                SoDienThoai = benhNhan.DienThoai,
                SoCCCD = benhNhan.SoCCCD,
                NgaySinh = benhNhan.NgaySinh,
                GioiTinh = benhNhan.GioiTinh.ToString(),
                DiaChi = benhNhan.DiaChi,

                MaBacSi = bacSi.Id,
                TenBacSi = bacSi.HoTen,
                MaKhoa = maKhoa,
                MaCoSo = coSo.Id,
                TenCoSo = coSo.Ten,

                ThoiGianBatDau = lichHen.ThoiGianBatDau,
                ThoiGianKetThuc = lichHen.ThoiGianKetThuc,
                TrangThai = lichHen.TrangThai.ToString(),
                TrangThaiText = "Chờ thu tiền giữ chỗ",
                LyDo = lichHen.LyDo,
                NguonDat = lichHen.NguonDat,

                ChiPhiGiuCho = lichHen.ChiPhiGiuCho,
                DaThanhToanGiuCho = lichHen.DaThanhToanGiuCho,
                CreatedAt = lichHen.CreatedAt
            };
        }
    }
}
