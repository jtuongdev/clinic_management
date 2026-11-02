using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record GetDoctorTodayStatusQuery(int EmployeeId) : IRequest<DoctorTodayStatusDto>;
