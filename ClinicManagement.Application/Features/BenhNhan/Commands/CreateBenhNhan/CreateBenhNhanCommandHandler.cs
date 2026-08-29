using AutoMapper;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Patient;
using BenhNhanEntity = ClinicManagement.Domain.Patient.BenhNhan;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Examination;
using System;
using System.Threading;
using System.Threading.Tasks;
using LuotKhamEntity = ClinicManagement.Domain.Examination.LuotKham;

namespace ClinicManagement.Application.Features.BenhNhan.Commands
{
    public class CreateBenhNhanCommandHandler
        : IRequestHandler<CreateBenhNhanCommand, BenhNhanDto>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly ILuotKhamRepository _luotKhamRepo;
        private readonly IMapper _mapper;

        public CreateBenhNhanCommandHandler(
            IBenhNhanRepository benhNhanRepo,
            ILuotKhamRepository luotKhamRepo,
            IMapper mapper)
        {
            _benhNhanRepo = benhNhanRepo;
            _luotKhamRepo = luotKhamRepo;
            _mapper = mapper;
        }

        public async Task<BenhNhanDto> Handle(
            CreateBenhNhanCommand request,
            CancellationToken cancellationToken)
        {
            // 1. Kiểm tra CCCD
            if (!string.IsNullOrEmpty(request.SoCCCD))
            {
                var exists = await _benhNhanRepo.IsCCCDExistAsync(request.SoCCCD);
                if (exists)
                    throw new InvalidOperationException("Số CCCD đã được sử dụng.");
            }

            // 2. Sinh mã bệnh nhân nội bộ
            var maNoiBo = await _benhNhanRepo.GenerateMaBenhNhanNoiBoAsync(request.MaCoSo);

            // 3. Tạo tài khoản
            var username = maNoiBo;
            var password = "123456";

            // 4. Tạo bệnh nhân
            var benhNhan = new BenhNhanEntity(
                request.Ho,
                request.Ten,
                request.NgaySinh,
                request.GioiTinh,
                request.DienThoai,
                request.Email,
                request.SoCCCD,
                request.DiaChi,
                request.CreatedBy,
                request.NguoiLienHeTen,
                request.NguoiLienHeDienThoai,
                username,
                password
            );

            var benhNhanCoSo = new BenhNhanCoSo
            {
                MaBenhNhan = benhNhan.Id,
                MaCoSo = request.MaCoSo,
                MaBenhNhanNoiBo = maNoiBo,
                NgayDangKy = DateTime.UtcNow,
                CreatedBy = request.CreatedBy
            };
            benhNhan.BenhNhanCoSo.Add(benhNhanCoSo);

            if (request.BaoHiem != null)
            {
                benhNhan.AddBaoHiem(
                    request.BaoHiem.LoaiBaoHiem,
                    request.BaoHiem.TenNhaCungCap,
                    request.BaoHiem.SoThe,
                    request.BaoHiem.NgayBatDau,
                    request.BaoHiem.NgayKetThuc,
                    request.BaoHiem.MucHuong
                );
            }

            foreach (var tienSu in request.TienSuBenhs)
            {
                benhNhan.AddTienSu(
                    tienSu.LoaiTienSu,
                    tienSu.Ten,
                    tienSu.GhiChu,
                    request.CreatedBy
                );
            }

            // 5. Sinh số thứ tự cho lượt khám
            var maxSoThuTu = await _luotKhamRepo.GetMaxSoThuTuAsync(DateTime.UtcNow.Date, request.MaKhoa, cancellationToken);
            var soThuTu = maxSoThuTu + 1;

            // 6. Tạo lượt khám
            var maBacSi = request.MaBacSi ?? 0;
            var maPhongKham = request.MaPhongKham;  

            var luotKham = new LuotKhamEntity(
                benhNhan.Id,
                request.MaCoSo,
                request.MaKhoa,
                soThuTu,
                maBacSi,
                null,
                maPhongKham 
            );

            benhNhan.AddLuotKham(luotKham);

            await _benhNhanRepo.AddAsync(benhNhan);
            await _benhNhanRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            var result = await _benhNhanRepo.GetByIdAsync(benhNhan.Id);
            return _mapper.Map<BenhNhanDto>(result);
        }
    }
}