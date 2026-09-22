using System.Collections.Generic;
using ClinicManagement.Application.DTOs.LuotKham;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Queries.ChiDinhDichVu
{
    public class LayChiDinhDichVuTheoLuotKhamQuery : IRequest<List<ChiDinhDichVuDto>>
    {
        public int LuotKhamId { get; set; }
    }
}
