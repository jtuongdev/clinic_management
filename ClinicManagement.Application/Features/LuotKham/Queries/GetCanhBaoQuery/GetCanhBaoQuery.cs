using MediatR;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.ThongKe.Queries
{
    public class GetCanhBaoQuery : IRequest<List<CanhBaoDto>> { }

    public class CanhBaoDto
    {
        public string Type { get; set; } = string.Empty; // "red", "orange", "blue"
        public string Title { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }
}