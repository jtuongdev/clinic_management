using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Domain.Billing
{
    public class CongNoBenhNhan : BaseEntity
    {
        public int MaBenhNhan { get; set; }
        public int MaHoaDon { get; set; }
        public decimal SoTienNo { get; set; }
        public decimal SoTienDaTra { get; set; }
        public decimal SoTienConLai => SoTienNo - SoTienDaTra;
        public DateTime? HanThanhToan { get; set; }
        public TrangThaiCongNo TrangThai { get; set; }
        public int? CreatedBy { get; set; }

        // Navigation properties
        public virtual BenhNhan BenhNhan { get; set; }
        public virtual HoaDon HoaDon { get; set; }

        public void UpdatePayment(decimal amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Số tiền thanh toán phải lớn hơn 0.");

            if (TrangThai == TrangThaiCongNo.DA_TAT_TOAN)
                throw new InvalidOperationException("Khoản công nợ này đã được tất toán, không thể thanh toán thêm.");

            if (amount > SoTienConLai)
                throw new ArgumentException($"Số tiền thanh toán ({amount}) không được vượt quá số tiền còn lại ({SoTienConLai}).");

            SoTienDaTra += amount;
            
            // Cập nhật trạng thái dựa trên số tiền còn lại
            if (SoTienConLai == 0)
            {
                TrangThai = TrangThaiCongNo.DA_TAT_TOAN;
            }
            else
            {
                // Nếu chưa trả hết, kiểm tra xem đã quá hạn chưa để giữ đúng trạng thái QUA_HAN
                CheckAndSetOverdueStatus();
            }
        }

        public void MarkOverdue()
        {
            // Nếu đã trả hết tiền thì không thể đánh dấu là quá hạn
            if (TrangThai == TrangThaiCongNo.DA_TAT_TOAN)
                return;

            CheckAndSetOverdueStatus();
        }

        private void CheckAndSetOverdueStatus()
        {
            if (HanThanhToan.HasValue && HanThanhToan.Value.Date < DateTime.UtcNow.Date)
            {
                TrangThai = TrangThaiCongNo.QUA_HAN;
            }
            else
            {
                TrangThai = TrangThaiCongNo.DANG_NO;
            }
        }
    }
}
