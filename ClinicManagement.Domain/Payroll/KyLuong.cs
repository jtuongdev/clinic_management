using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Payroll
{
    public class KyLuong : BaseEntity, IAggregateRoot
    {
        public int Thang { get; private set; }
        public int Nam { get; private set; }
        public DateTime TuNgay { get; private set; }
        public DateTime DenNgay { get; private set; }
        public int? MaKyChamCong { get; private set; }
        public string TrangThai { get; private set; } = "NHAP";

        public virtual ICollection<BangLuong> BangLuongs { get; private set; }

        private KyLuong()
        {
            BangLuongs = new List<BangLuong>();
        }

        public KyLuong(int thang, int nam, DateTime tuNgay, DateTime denNgay)
        {
            if (thang is < 1 or > 12)
                throw new ArgumentOutOfRangeException(nameof(thang));
            if (nam < 2000)
                throw new ArgumentOutOfRangeException(nameof(nam));
            if (denNgay.Date < tuNgay.Date)
                throw new ArgumentException("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");

            Thang = thang;
            Nam = nam;
            TuNgay = tuNgay.Date;
            DenNgay = denNgay.Date;
            BangLuongs = new List<BangLuong>();
        }

        public void LinkAttendancePeriod(int maKyChamCong)
        {
            if (maKyChamCong <= 0) throw new ArgumentOutOfRangeException(nameof(maKyChamCong));
            if (TrangThai != "NHAP") throw new InvalidOperationException("Kỳ lương đã đóng không thể thay đổi.");
            MaKyChamCong = maKyChamCong;
        }

        public void Approve()
        {
            if (TrangThai != "NHAP") throw new InvalidOperationException("Chỉ kỳ lương nháp mới được duyệt.");
            TrangThai = "DA_DUYET";
        }

        public void Chot()
        {
            if (TrangThai != "DA_DUYET")
                throw new InvalidOperationException("Kỳ lương phải được duyệt trước khi chốt.");

            TrangThai = "DA_CHOT";
        }

        public void MarkAsPaid()
        {
            if (TrangThai != "DA_CHOT")
                throw new InvalidOperationException("Kỳ lương phải được chốt trước khi thanh toán.");

            TrangThai = "DA_THANH_TOAN";
        }
    }
}
