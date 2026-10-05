using System;

namespace ClinicManagement.Application.Common.Notifications.Templates;

public class AppointmentEmailData
{
    public int MaLichHen { get; set; }
    public string TenBenhNhan { get; set; } = string.Empty;
    public string TenBacSi { get; set; } = string.Empty;
    public string TenChuyenKhoa { get; set; } = string.Empty;
    public string TenPhongKham { get; set; } = string.Empty;
    public DateTime GioHen { get; set; }
    public string TenCoSo { get; set; } = "Cơ sở chính";
    public string LyDoKham { get; set; } = string.Empty;
}

public sealed class AppointmentConfirmationEmail : BaseEmailNotification<AppointmentEmailData>
{
    public AppointmentConfirmationEmail(AppointmentEmailData data) : base(data) { }

    public override string Subject => $"[Xác nhận lịch khám] Lịch hẹn khám #{Data.MaLichHen} vào ngày {Data.GioHen:dd/MM/yyyy}";

    protected override string RenderSpecificContent()
    {
        return $@"
            <h2 style='color: #0b4f6c; margin-top: 0;'>Xác nhận Lịch Hẹn Khám Bệnh</h2>
            <p>Xin chào quý khách <b>{Data.TenBenhNhan}</b>,</p>
            <p>Lịch hẹn khám của quý khách đã được hệ thống ghi nhận thành công với các thông tin sau:</p>

            <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;'>
                <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>
                    <tr>
                        <td style='padding: 6px 0; color: #64748b; width: 140px;'>Mã đặt hẹn:</td>
                        <td style='padding: 6px 0; font-weight: bold; color: #0b4f6c;'>#{Data.MaLichHen}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #64748b;'>Thời gian khám:</td>
                        <td style='padding: 6px 0; font-weight: bold; color: #d97706;'>{Data.GioHen:HH:mm} ngày {Data.GioHen:dd/MM/yyyy}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #64748b;'>Bác sĩ phụ trách:</td>
                        <td style='padding: 6px 0; font-weight: bold;'>BS. {Data.TenBacSi}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #64748b;'>Chuyên khoa:</td>
                        <td style='padding: 6px 0;'>{Data.TenChuyenKhoa}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #64748b;'>Địa điểm phòng:</td>
                        <td style='padding: 6px 0;'>{Data.TenPhongKham} ({Data.TenCoSo})</td>
                    </tr>
                    {(string.IsNullOrWhiteSpace(Data.LyDoKham) ? "" : $@"
                    <tr>
                        <td style='padding: 6px 0; color: #64748b;'>Lý do khám:</td>
                        <td style='padding: 6px 0; font-style: italic;'>{Data.LyDoKham}</td>
                    </tr>")}
                </table>
            </div>

            <div style='background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;'>
                <p style='margin: 0; font-size: 13px; color: #1e40af;'>
                    <b>Lưu ý quan trọng:</b><br/>
                    • Quý khách vui lòng có mặt tại quầy Tiếp đón trước giờ hẹn <b>15 phút</b> để hoàn tất thủ tục phân loại.<br/>
                    • Mang theo CCCD/Hộ chiếu và thẻ BHYT (nếu có áp dụng bảo hiểm y tế).<br/>
                    • Nếu cần xét nghiệm máu buổi sáng, vui lòng nhịn ăn sáng ít nhất 6-8 tiếng.
                </p>
            </div>

            <p>Nếu có nhu cầu dời hoặc hủy lịch khám, quý khách có thể thao tác trực tiếp trên Cổng bệnh nhân hoặc gọi hotline phòng khám trước ít nhất 2 giờ.</p>";
    }
}
