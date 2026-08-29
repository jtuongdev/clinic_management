using MediatR;

namespace ClinicManagement.Application.Features.BenhNhan.Commands
{
    public class DeleteBenhNhanCommand : IRequest<bool>
    {
        public int Id { get; set; }
        public int DeletedBy { get; set; }
    }
}