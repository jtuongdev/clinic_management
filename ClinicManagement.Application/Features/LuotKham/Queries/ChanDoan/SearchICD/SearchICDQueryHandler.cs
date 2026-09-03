using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham.ChanDoan;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class SearchICDQueryHandler : IRequestHandler<SearchICDQuery, List<ICDOptionDto>>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public SearchICDQueryHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<List<ICDOptionDto>> Handle(SearchICDQuery request, CancellationToken cancellationToken)
        {
            var keyword = request.Keyword?.Trim();
            var items = await _luotKhamRepository.SearchICDAsync(keyword, cancellationToken);

            return items.Select(icd => new ICDOptionDto
            {
                MaICD = icd.MaICD,
                TenICD = icd.TenICD,
                Chuong = icd.Chuong
            }).ToList();
        }
    }
}
