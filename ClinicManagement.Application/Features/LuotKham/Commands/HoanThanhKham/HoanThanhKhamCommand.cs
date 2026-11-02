using ClinicManagement.Application.DTOs.BenhNhan;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.CompleteExam;

public sealed record HoanThanhKhamCommand(int Id, int UserId) : IRequest<HoaDonDetailDto?>;
