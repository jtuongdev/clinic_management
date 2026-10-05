using System;

namespace ClinicManagement.Application.Common.Notifications.Templates;

public class PayslipEmailData
{
    public string TenNhanVien { get; set; } = string.Empty;
    public string MaNhanVien { get; set; } = string.Empty;
    public string ChucVu { get; set; } = string.Empty;
    public int Thang { get; set; }
    public int Nam { get; set; }
    public decimal LuongCoBan { get; set; }
    public decimal PhuCap { get; set; }
    public decimal TienTruc { get; set; }
    public decimal Thuong { get; set; }
    public decimal KhauTru { get; set; }
    public decimal ThucLinh { get; set; }
    public decimal SoNgayCong { get; set; }
}

public sealed class PayslipEmail : BaseEmailNotification<PayslipEmailData>
{
    public PayslipEmail(PayslipEmailData data) : base(data) { }

    public override string Subject => $"[Phiếu lương điện tử] Bảng lương tháng {Data.Thang}/{Data.Nam} - {Data.TenNhanVien}";

    protected override string RenderSpecificContent()
    {
        return $@"
            <h2 style='color: #0b4f6c; margin-top: 0;'>Phiếu Lương Nhân Viên Tháng {Data.Thang}/{Data.Nam}</h2>
            <p>Kính gửi đồng nghiệp <b>{Data.TenNhanVien}</b> ({Data.ChucVu}),</p>
            <p>Phòng Nhân sự &amp; Kế toán xin gửi đến bạn chi tiết bảng lương kỳ làm việc tháng <b>{Data.Thang}/{Data.Nam}</b>:</p>

            <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;'>
                <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>
                    <tr style='border-bottom: 1px solid #e2e8f0;'>
                        <td style='padding: 8px 0; color: #64748b;'>Số công chuẩn / Thực tế:</td>
                        <td style='padding: 8px 0; text-align: right; font-weight: 600;'>{Data.SoNgayCong} ngày</td>
                    </tr>
                    <tr style='border-bottom: 1px solid #e2e8f0;'>
                        <td style='padding: 8px 0; color: #64748b;'>Lương cơ bản &amp; theo ca:</td>
                        <td style='padding: 8px 0; text-align: right; font-weight: 600;'>{Data.LuongCoBan:N0} ₫</td>
                    </tr>
                    <tr style='border-bottom: 1px solid #e2e8f0;'>
                        <td style='padding: 8px 0; color: #64748b;'>Phụ cấp &amp; Tiền trực đêm:</td>
                        <td style='padding: 8px 0; text-align: right; font-weight: 600;'>+{Data.PhuCap + Data.TienTruc:N0} ₫</td>
                    </tr>
                    <tr style='border-bottom: 1px solid #e2e8f0;'>
                        <td style='padding: 8px 0; color: #64748b;'>Thưởng năng suất / HIS:</td>
                        <td style='padding: 8px 0; text-align: right; font-weight: 600;'>+{Data.Thuong:N0} ₫</td>
                    </tr>
                    <tr style='border-bottom: 1px solid #e2e8f0;'>
                        <td style='padding: 8px 0; color: #64748b;'>Các khoản khấu trừ (BHXH, thuế):</td>
                        <td style='padding: 8px 0; text-align: right; font-weight: 600; color: #e11d48;'>-{Data.KhauTru:N0} ₫</td>
                    </tr>
                    <tr style='background: #f1f5f9; font-size: 16px;'>
                        <td style='padding: 12px 10px; font-weight: bold; color: #0b4f6c;'>LƯƠNG THỰC LĨNH CHUYỂN KHOẢN:</td>
                        <td style='padding: 12px 10px; text-align: right; font-weight: bold; color: #16a34a;'>{Data.ThucLinh:N0} ₫</td>
                    </tr>
                </table>
            </div>

            <p style='font-size: 13px; color: #64748b;'>Nếu có thắc mắc hoặc cần đối soát bảng chấm công / tiền trực, vui lòng phản hồi phòng Nhân sự trong vòng 48 giờ làm việc kể từ khi nhận được email này.</p>
            <p>Chúc bạn một tháng làm việc hiệu quả và nhiều niềm vui!</p>";
    }
}
