using MediatR;
using ClinicManagement.Application.DTOs.ThongKe;
using ClinicManagement.Domain.Repositories;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.ThongKe.Queries
{
    public class LayThongKeBenhNhanQueryHandler
        : IRequestHandler<LayThongKeBenhNhanQuery, ThongKeBenhNhanDto>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public LayThongKeBenhNhanQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<ThongKeBenhNhanDto> Handle(
            LayThongKeBenhNhanQuery request,
            CancellationToken cancellationToken)
        {
            var tong = await _benhNhanRepo.CountBenhNhanAsync();
            var dangKham = await _benhNhanRepo.CountDangKhamAsync();
            var choKham = await _benhNhanRepo.CountChoKhamAsync();
            var hoanThanh = await _benhNhanRepo.CountHoanThanhAsync();
            var daHuy = await _benhNhanRepo.CountHuyAsync();

            return new ThongKeBenhNhanDto
            {
                TongBenhNhan = tong,
                DangKham = dangKham,
                ChoKham = choKham,
                DaHoanThanh = hoanThanh,
                DaHuy = daHuy
            }; 
        }
    }
}