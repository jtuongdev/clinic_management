using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.Common.Notifications.Templates;

public class LowStockAlertData
{
    public string TenKho { get; set; } = "Kho Dược Trung Tâm";
    public DateTime ThoiGianKiemTra { get; set; } = DateTime.Now;
    public List<LowStockItemDto> Items { get; set; } = new();
}

public class LowStockItemDto
{
    public string MaThuoc { get; set; } = string.Empty;
    public string TenThuoc { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = "Hộp";
    public decimal TonKhoHienTai { get; set; }
    public decimal DinhMucToiThieu { get; set; }
    public string CanhBao { get; set; } = "Dưới định mức";
}

public sealed class LowStockAlertEmail : BaseEmailNotification<LowStockAlertData>
{
    public LowStockAlertEmail(LowStockAlertData data) : base(data) { }

    public override string Subject => $"[Cảnh báo Dược] Phát hiện {Data.Items.Count} mặt hàng chạm ngưỡng tồn kho tối thiểu";

    protected override string RenderSpecificContent()
    {
        var itemRows = string.Empty;
        int idx = 1;
        foreach (var item in Data.Items)
        {
            itemRows += $@"
                <tr>
                    <td style='text-align: center; color: #64748b;'>{idx++}</td>
                    <td><code>{item.MaThuoc}</code></td>
                    <td><b style='color: #0f172a;'>{item.TenThuoc}</b></td>
                    <td style='text-align: center; font-weight: bold; color: #e11d48;'>{item.TonKhoHienTai} {item.DonViTinh}</td>
                    <td style='text-align: center; color: #64748b;'>{item.DinhMucToiThieu} {item.DonViTinh}</td>
                    <td style='text-align: center;'><span class='badge' style='background: #fee2e2; color: #b91c1c;'>{item.CanhBao}</span></td>
                </tr>";
        }

        return $@"
            <h2 style='color: #dc2626; margin-top: 0;'>⚠️ Cảnh Báo Thuốc &amp; Vật Tư Dưới Ngưỡng Tồn Kho An Toàn</h2>
            <p>Kính gửi <b>Ban Điều hành Kho &amp; Trưởng khoa Dược</b>,</p>
            <p>Hệ thống quản lý kho phát hiện một số mặt hàng trong <b>{Data.TenKho}</b> đã giảm xuống dưới mức tồn trữ an toàn tính đến thời điểm {Data.ThoiGianKiemTra:HH:mm dd/MM/yyyy}:</p>

            <table class='table-data'>
                <thead>
                    <tr>
                        <th style='width: 40px; text-align: center;'>STT</th>
                        <th style='width: 80px;'>Mã thuốc</th>
                        <th>Tên biệt dược / Vật tư</th>
                        <th style='width: 100px; text-align: center;'>Tồn hiện tại</th>
                        <th style='width: 90px; text-align: center;'>Định mức</th>
                        <th style='width: 120px; text-align: center;'>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {itemRows}
                </tbody>
            </table>

            <div style='background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin-top: 20px; font-size: 13px; color: #991b1b;'>
                <b>Khuyến nghị hành động:</b><br/>
                Vui lòng lập ngay Đơn đặt hàng (Purchase Order - PO) cho Nhà cung cấp để đảm bảo không bị gián đoạn hoạt động khám chữa bệnh và cấp phát thuốc cho bệnh nhân.
            </div>";
    }
}
