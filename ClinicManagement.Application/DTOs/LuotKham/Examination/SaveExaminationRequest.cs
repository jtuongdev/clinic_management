using System.Collections.Generic;
using ClinicManagement.Application.DTOs.BenhNhan;

namespace ClinicManagement.Application.DTOs.LuotKham.Examination
{
    /// <summary>
    /// Dữ liệu khám ban đầu của một lượt khám.
    /// Chỉ tập trung vào lý do khám, tiền sử bệnh, sinh hiệu.
    /// Không dùng để lưu toàn bộ hồ sơ bệnh án chi tiết.
    /// </summary>
    public class SaveExaminationRequest
    {
        /// <summary>
        /// Lý do bệnh nhân đến khám / nguyên nhân khám hiện tại.
        /// </summary>
        public string LyDoKham { get; set; } = string.Empty;

        /// <summary>
        /// Ghi chú bổ sung về tiền sử bệnh hoặc thông tin liên quan (nếu có).
        /// </summary>
        public string GhiChuTienSu { get; set; } = string.Empty;

        /// <summary>
        /// Danh sách tiền sử bệnh theo từng nhóm bệnh nền, dị ứng, phẫu thuật,...
        /// </summary>
        public List<TienSuBenhRequest> TienSuBenhs { get; set; } = new();

        /// <summary>
        /// Sinh hiệu đo trong buổi khám.
        /// </summary>
        public SinhHieuRequest? SinhHieu { get; set; }
    }

    public class SinhHieuRequest
    {
        public int? Id { get; set; }

        /// <summary>
        /// Nhiệt độ (°C)
        /// </summary>
        public decimal? NhietDo { get; set; }

        /// <summary>
        /// Mạch (nhịp/phút)
        /// </summary>
        public int? Mach { get; set; }

        /// <summary>
        /// Huyết áp tâm thu (mmHg)
        /// </summary>
        public int? HuyetApTamThu { get; set; }

        /// <summary>
        /// Huyết áp tâm trương (mmHg)
        /// </summary>
        public int? HuyetApTamTruong { get; set; }

        /// <summary>
        /// SpO2 (%)
        /// </summary>
        public decimal? SpO2 { get; set; }

        /// <summary>
        /// Cân nặng (kg)
        /// </summary>
        public decimal? CanNang { get; set; }

        /// <summary>
        /// Chiều cao (cm)
        /// </summary>
        public decimal? ChieuCao { get; set; }
    }
}
