using ClinicManagement.Domain.Common.Enums;
using System;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class BaoHiemRequest
    {
        public LoaiBaoHiem LoaiBaoHiem { get; set; }

        public string TenNhaCungCap { get; set; } = string.Empty;

        public string SoThe { get; set; } = string.Empty;

        public DateTime NgayBatDau { get; set; }

        public DateTime NgayKetThuc { get; set; }

        public decimal MucHuong { get; set; }
    }
}