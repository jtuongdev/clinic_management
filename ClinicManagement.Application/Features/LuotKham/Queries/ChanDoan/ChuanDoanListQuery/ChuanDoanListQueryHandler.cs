using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham.ChanDoan;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetChanDoanListQueryHandler : IRequestHandler<GetChuanDoanListQuery, List<ChanDoanDto>>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public GetChanDoanListQueryHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<List<ChanDoanDto>> Handle(GetChuanDoanListQuery request, CancellationToken cancellationToken)
        {
            if (!request.LuotKhamId.HasValue || request.LuotKhamId.Value <= 0)
            {
                throw new ArgumentException("Id lượt khám không hợp lệ.");
            }

            var diagnoses = await _luotKhamRepository.GetDiagnosePatientInExamination(
                request.LuotKhamId.Value, cancellationToken);

            var diagnosesList = diagnoses
                .SelectMany(lk => (lk.ChanDoans ?? new List<Domain.Examination.ChanDoan>())
                    .Where(cd => !cd.IsDeleted)
                    .Select(cd => new ChanDoanDto
                    {  
                        Id = cd.Id,
                        MaICD = cd.MaICD,
                        TenICD = cd.ICD != null ? cd.ICD.TenICD : string.Empty, 
                        TenChanDoan = cd.TenChanDoan,
                        LaChanDoanChinh = cd.LaChanDoanChinh,
                        GhiChu = cd.GhiChu,
                        CreatedAt = cd.CreatedAt
                    }))
                .ToList();

            return diagnosesList ?? new List<ChanDoanDto>();
        }
    }
}
