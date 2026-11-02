using MediatR;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class LayBacSiTrucQueryHandler
        : IRequestHandler<LayBacSiTrucQuery, List<BacSiTrucDto>>
    {
        private readonly INhanVienRepository _nhanVienRepo;
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayBacSiTrucQueryHandler(
            INhanVienRepository nhanVienRepo,
            ILuotKhamRepository luotKhamRepo)
        {
            _nhanVienRepo = nhanVienRepo;
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<List<BacSiTrucDto>> Handle(
            LayBacSiTrucQuery request,
            CancellationToken cancellationToken)
        {
            // Kiểm tra tham số đầu vào
            if (!request.MaCoSo.HasValue || !request.MaKhoa.HasValue)
            {
                // Có thể trả về danh sách rỗng hoặc throw exception tùy logic
                return new List<BacSiTrucDto>();
            }

            // 1. Lấy danh sách bác sĩ theo khoa và cơ sở (có lịch làm việc)
            var bacSis = await _nhanVienRepo.GetBacSiByKhoaAsync(
                request.MaKhoa.Value,
                request.MaCoSo.Value,
                cancellationToken);

            // 2. Lấy tất cả lượt khám đang được xử lý
            var allVisits = await _luotKhamRepo.GetAllAsync();
            var activeVisits = allVisits
                .Where(l => l.TrangThai == TrangThaiLuotKham.DANG_KHAM || l.TrangThai == TrangThaiLuotKham.CHO_KHAM)
                .GroupBy(l => l.MaBacSi)
                .ToDictionary(g => g.Key ?? 0, g => g.Count());

            var result = new List<BacSiTrucDto>();

            // Ưu tiên bác sĩ đang trong ca trực, nếu không có thì lấy tất cả
            var targetList = bacSis.Any(b => b.DangTruc) 
                ? bacSis.Where(b => b.DangTruc).ToList() 
                : bacSis;

            foreach (var item in targetList)
            {
                var bs = item.NhanVien;
                var count = activeVisits.GetValueOrDefault(bs.Id, 0);
                string trangThai;
                if (count >= 4) trangThai = "alert";      // Quá tải
                else if (count > 0) trangThai = "doing";   // Đang khám
                else trangThai = "idle";                  // Rảnh

                var phongKham = item.TenPhongKhamMacDinh ?? bs.NhanVienKhoa
                    .FirstOrDefault(nk => nk.DenNgay == null)?
                    .Khoa?.Ten ?? "Chưa phân công";

                result.Add(new BacSiTrucDto
                {
                    Id = bs.Id,
                    HoTen = bs.HoTen,
                    Khoa = bs.ChuyenKhoa ?? "Chưa phân công",
                    Phong = phongKham,
                    TrangThai = trangThai,
                    SoLuongCho = count
                });
            }

            // Sắp xếp: đang khám > quá tải > rảnh
            var order = new Dictionary<string, int> { { "doing", 1 }, { "alert", 2 }, { "idle", 3 } };
            return result.OrderBy(r => order[r.TrangThai]).ToList();
        }
    }
}