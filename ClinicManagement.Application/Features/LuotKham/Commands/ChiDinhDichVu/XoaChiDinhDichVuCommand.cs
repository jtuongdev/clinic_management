using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class XoaChiDinhDichVuCommand : IRequest<bool>
    {
        public int LuotKhamId { get; set; }
        public int ChiDinhDichVuId { get; set; }
        public int DeletedBy { get; set; }
    }
}
