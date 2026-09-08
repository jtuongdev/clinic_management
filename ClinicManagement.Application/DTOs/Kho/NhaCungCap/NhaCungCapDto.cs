using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.DTOs.Kho;

public sealed record NhaCungCapDto(int Id, string Ma, string Ten, string DiaChi, string DienThoai, string Email, string MaSoThue, TrangThaiNhaCungCap TrangThai);
