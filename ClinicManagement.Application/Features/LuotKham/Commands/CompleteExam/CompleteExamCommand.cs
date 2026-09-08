using ClinicManagement.Application.DTOs.BenhNhan;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.CompleteExam;

public sealed record CompleteExamCommand(int Id, int UserId) : IRequest<HoaDonDetailDto?>;
