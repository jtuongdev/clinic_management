
namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class ThongKeBenhNhanDto
    {
        /// <summary>
        /// Tổng số lượt khám trong ngày hôm nay
        /// </summary>
        public int HomNay { get; set; }

        /// <summary>
        /// Số lượt khám đang chờ khám
        /// </summary>
        public int Cho { get; set; }

        /// <summary>
        /// Số lượt khám đang được khám
        /// </summary>
        public int DangKham { get; set; }

        /// <summary>
        /// Số lượt khám đã hoàn thành
        /// </summary>
        public int HoanThanh { get; set; }
    }
}
