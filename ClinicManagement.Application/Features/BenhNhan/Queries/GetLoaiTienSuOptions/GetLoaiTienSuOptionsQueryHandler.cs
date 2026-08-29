using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetLoaiTienSuOptionsQueryHandler : IRequestHandler<GetLoaiTienSuOptionsQuery, List<LoaiTienSuOptionDto>>
    {
        public Task<List<LoaiTienSuOptionDto>> Handle(GetLoaiTienSuOptionsQuery request, CancellationToken cancellationToken)
        {
            var options = Enum.GetValues<LoaiTienSu>()
                .Select(x => new LoaiTienSuOptionDto
                {
                    Value = x.ToString(),
                    Label = x switch
                    {
                        LoaiTienSu.BENH_NEN => "Bệnh nền",
                        LoaiTienSu.DI_UNG => "Dị ứng",
                        LoaiTienSu.PHAU_THUAT => "Phẫu thuật",
                        LoaiTienSu.TIEN_SU_GIA_DINH => "Tiền sử gia đình",
                        LoaiTienSu.THOI_QUEN_SINH_HOAT => "Thói quen sinh hoạt",
                        _ => x.ToString()
                    },
                    Description = x switch
                    {
                        LoaiTienSu.BENH_NEN => "Thông tin bệnh nền của bệnh nhân",
                        LoaiTienSu.DI_UNG => "Thông tin dị ứng thuốc hoặc thức ăn",
                        LoaiTienSu.PHAU_THUAT => "Lịch sử phẫu thuật",
                        LoaiTienSu.TIEN_SU_GIA_DINH => "Tiền sử bệnh trong gia đình",
                        LoaiTienSu.THOI_QUEN_SINH_HOAT => "Thói quen sinh hoạt ảnh hưởng sức khỏe",
                        _ => string.Empty
                    }
                })
                .ToList();

            return Task.FromResult(options);
        }
    }
}
