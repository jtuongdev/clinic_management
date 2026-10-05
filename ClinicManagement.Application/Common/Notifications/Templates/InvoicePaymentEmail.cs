using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.Common.Notifications.Templates;

public class InvoiceEmailData
{
    public string SoHoaDon { get; set; } = string.Empty;
    public string TenBenhNhan { get; set; } = string.Empty;
    public decimal TongTien { get; set; }
    public decimal DaThanhToan { get; set; }
    public decimal ConLai { get; set; }
    public string PhuongThucThanhToan { get; set; } = "Tiền mặt / Chuyển khoản";
    public DateTime NgayThu { get; set; } = DateTime.Now;
    public string NguoiThu { get; set; } = "Bộ phận Thu ngân";
    public List<InvoiceItemEmailDto> Items { get; set; } = new();
}

public class InvoiceItemEmailDto
{
    public string TenDichVu { get; set; } = string.Empty;
    public decimal SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien => SoLuong * DonGia;
}

public sealed class InvoicePaymentEmail : BaseEmailNotification<InvoiceEmailData>
{
    public InvoicePaymentEmail(InvoiceEmailData data) : base(data) { }

    public override string Subject => $"[Biên lai viện phí] Xác nhận thanh toán hóa đơn #{Data.SoHoaDon}";

    protected override string RenderSpecificContent()
    {
        var itemsRows = string.Empty;
        int index = 1;
        foreach (var item in Data.Items)
        {
            itemsRows += $@"
                <tr>
                    <td style='text-align: center; color: #64748b;'>{index++}</td>
                    <td><b>{item.TenDichVu}</b></td>
                    <td style='text-align: center;'>{item.SoLuong}</td>
                    <td style='text-align: right;'>{item.DonGia:N0} ₫</td>
                    <td style='text-align: right; font-weight: 600; color: #0f172a;'>{item.ThanhTien:N0} ₫</td>
                </tr>";
        }

        return $@"
            <h2 style='color: #0b4f6c; margin-top: 0;'>Xác nhận Thanh toán Viện phí Thành công</h2>
            <p>Kính gửi quý khách <b>{Data.TenBenhNhan}</b>,</p>
            <p>Hệ thống phòng khám xác nhận đã tiếp nhận khoản thanh toán viện phí của quý khách cho hóa đơn số <code style='background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #0b4f6c; font-weight: bold;'>#{Data.SoHoaDon}</code>.</p>

            <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;'>
                <div style='display: flex; justify-content: space-between; margin-bottom: 8px;'>
                    <span>Thời gian thanh toán:</span>
                    <b>{Data.NgayThu:HH:mm dd/MM/yyyy}</b>
                </div>
                <div style='display: flex; justify-content: space-between; margin-bottom: 8px;'>
                    <span>Phương thức:</span>
                    <span class='badge badge-success'>{Data.PhuongThucThanhToan}</span>
                </div>
                <div style='display: flex; justify-content: space-between; margin-bottom: 8px;'>
                    <span>Số tiền đã thanh toán:</span>
                    <b style='color: #16a34a; font-size: 16px;'>{Data.DaThanhToan:N0} ₫</b>
                </div>
                <div style='display: flex; justify-content: space-between;'>
                    <span>Số tiền còn lại:</span>
                    <b style='color: {(Data.ConLai > 0 ? "#e11d48" : "#64748b")};'>{Data.ConLai:N0} ₫</b>
                </div>
            </div>

            {(Data.Items.Count > 0 ? $@"
            <h3 style='margin: 20px 0 8px; font-size: 15px; color: #334155;'>Chi tiết dịch vụ / đơn thuốc đã thực hiện:</h3>
            <table class='table-data'>
                <thead>
                    <tr>
                        <th style='width: 40px; text-align: center;'>STT</th>
                        <th>Nội dung</th>
                        <th style='width: 60px; text-align: center;'>SL</th>
                        <th style='width: 100px; text-align: right;'>Đơn giá</th>
                        <th style='width: 110px; text-align: right;'>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsRows}
                </tbody>
            </table>
            " : "")}

            <p style='margin-top: 24px;'>Nếu quý khách cần hỗ trợ xuất hóa đơn GTGT điện tử (e-Invoice) cho doanh nghiệp hoặc đơn vị bảo hiểm, vui lòng liên hệ quầy Thu ngân hoặc hotline trong vòng 24 giờ.</p>
            <p>Trân trọng cảm ơn quý khách đã tin tưởng dịch vụ chăm sóc sức khỏe của chúng tôi!</p>";
    }
}
