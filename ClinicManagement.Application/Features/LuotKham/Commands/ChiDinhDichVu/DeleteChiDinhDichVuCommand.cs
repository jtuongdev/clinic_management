using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class DeleteChiDinhDichVuCommand : IRequest<bool>
    {
        public int LuotKhamId { get; set; }
        public int ChiDinhDichVuId { get; set; }
        public int DeletedBy { get; set; }
    }
}
