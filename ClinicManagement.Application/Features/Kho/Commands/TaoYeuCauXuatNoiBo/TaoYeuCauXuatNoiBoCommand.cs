using ClinicManagement.Application.DTOs.Kho.XuatNoiBo;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record TaoYeuCauXuatNoiBoCommand(TaoYeuCauXuatNoiBoRequest Data, int UserId) : KhoRequest(UserId);
