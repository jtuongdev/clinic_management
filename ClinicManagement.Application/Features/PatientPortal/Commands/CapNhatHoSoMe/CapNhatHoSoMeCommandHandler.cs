using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.Features.BenhNhan.Queries;
using ClinicManagement.Domain.Repositories;
using PatientEntity = ClinicManagement.Domain.Patient.BenhNhan;

namespace ClinicManagement.Application.Features.PatientPortal.Commands.CapNhatHoSoMe
{
    public class CapNhatHoSoMeCommandHandler : IRequestHandler<CapNhatHoSoMeCommand, BenhNhanProfileDto>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IMediator _mediator;

        public CapNhatHoSoMeCommandHandler(IBenhNhanRepository benhNhanRepo, IMediator mediator)
        {
            _benhNhanRepo = benhNhanRepo;
            _mediator = mediator;
        }

        public async Task<BenhNhanProfileDto> Handle(CapNhatHoSoMeCommand request, CancellationToken cancellationToken)
        {
            PatientEntity? benhNhan = await _benhNhanRepo.GetByIdAsync(request.PatientId);
            if (benhNhan == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy hồ sơ bệnh nhân với Id = {request.PatientId}");
            }

            var ho = !string.IsNullOrWhiteSpace(request.Ho) ? request.Ho.Trim() : benhNhan.Ho;
            var ten = !string.IsNullOrWhiteSpace(request.Ten) ? request.Ten.Trim() : benhNhan.Ten;
            var ngaySinh = request.NgaySinh ?? benhNhan.NgaySinh;
            var gioiTinh = request.GioiTinh ?? benhNhan.GioiTinh;
            var email = request.Email != null ? request.Email.Trim() : benhNhan.Email;
            var diaChi = request.DiaChi != null ? request.DiaChi.Trim() : benhNhan.DiaChi;
            var nguoiLienHeTen = request.NguoiLienHeTen != null ? request.NguoiLienHeTen.Trim() : benhNhan.NguoiLienHeTen;
            var nguoiLienHeDienThoai = request.NguoiLienHeDienThoai != null ? request.NguoiLienHeDienThoai.Trim() : benhNhan.NguoiLienHeDienThoai;

            benhNhan.UpdatePersonalInfo(
                ho,
                ten,
                ngaySinh,
                gioiTinh,
                benhNhan.DienThoai,
                email,
                diaChi,
                nguoiLienHeTen,
                nguoiLienHeDienThoai
            );

            benhNhan.MarkAsUpdated(request.PatientId);
            _benhNhanRepo.Update(benhNhan);
            await _benhNhanRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            // Trả về thông tin profile mới nhất đã cập nhật
            return await _mediator.Send(new LayHoSoBenhNhanQuery { Id = request.PatientId }, cancellationToken);
        }
    }
}
