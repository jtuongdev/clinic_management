using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.Common.Notifications.Templates;

public class PrescriptionEmailData
{
    public int MaDonThuoc { get; set; }
    public string TenBenhNhan { get; set; } = string.Empty;
    public string TenBacSi { get; set; } = string.Empty;
    public DateTime NgayKeDon { get; set; } = DateTime.Now;
    public string ChanDoan { get; set; } = string.Empty;
    public string LoiDanBacSi { get; set; } = string.Empty;
    public List<PrescriptionDrugItemEmailDto> Thuocs { get; set; } = new();
}

public class PrescriptionDrugItemEmailDto
{
    public string TenThuoc { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = "Viên";
    public decimal SoLuong { get; set; }
    public string CachDung { get; set; } = string.Empty;
}

public sealed class PrescriptionDispenseEmail : BaseEmailNotification<PrescriptionEmailData>
{
    public PrescriptionDispenseEmail(PrescriptionEmailData data) : base(data) { }

    public override string Subject => $"[Đơn thuốc điện tử] Đơn thuốc #{Data.MaDonThuoc} - {Data.TenBenhNhan}";

    protected override string RenderSpecificContent()
    {
        var drugRows = string.Empty;
        int index = 1;
        foreach (var t in Data.Thuocs)
        {
            drugRows += $@"
                <tr>
                    <td style='text-align: center; color: #64748b;'>{index++}</td>
                    <td>
                        <b style='color: #0b4f6c; font-size: 14px;'>{t.TenThuoc}</b>
                        <div style='font-size: 12px; color: #475569; margin-top: 3px;'>Cách dùng: <i>{t.CachDung}</i></div>
                    </td>
                    <td style='text-align: center; font-weight: 600;'>{t.SoLuong} {t.DonViTinh}</td>
                </tr>";
        }

        return $@"
            <h2 style='color: #0b4f6c; margin-top: 0;'>Bản sao Đơn Thuốc Điện Tử &amp; Hướng Dẫn Dùng Thuốc</h2>
            <p>Kính gửi quý khách <b>{Data.TenBenhNhan}</b>,</p>
            <p>Nhà thuốc phòng khám xác nhận đã hoàn tất cấp phát đơn thuốc số <code style='background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #0b4f6c; font-weight: bold;'>#{Data.MaDonThuoc}</code> cho quý khách.</p>

            <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin: 16px 0; font-size: 13px;'>
                <div style='margin-bottom: 6px;'>• Bác sĩ điều trị: <b>{Data.TenBacSi}</b></div>
                <div style='margin-bottom: 6px;'>• Ngày kê đơn: <b>{Data.NgayKeDon:dd/MM/yyyy HH:mm}</b></div>
                {(string.IsNullOrWhiteSpace(Data.ChanDoan) ? "" : $"<div style='margin-bottom: 6px;'>• Chẩn đoán: <b>{Data.ChanDoan}</b></div>")}
                {(string.IsNullOrWhiteSpace(Data.LoiDanBacSi) ? "" : $"<div style='color: #b45309;'>• Lời dặn: <i>{Data.LoiDanBacSi}</i></div>")}
            </div>

            <h3 style='margin: 20px 0 8px; font-size: 15px; color: #334155;'>Danh mục thuốc được chỉ định:</h3>
            <table class='table-data'>
                <thead>
                    <tr>
                        <th style='width: 40px; text-align: center;'>STT</th>
                        <th>Tên thuốc &amp; Hướng dẫn uống</th>
                        <th style='width: 100px; text-align: center;'>Số lượng</th>
                    </tr>
                </thead>
                <tbody>
                    {drugRows}
                </tbody>
            </table>

            <div style='background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-top: 20px; font-size: 13px; color: #92400e;'>
                <b>Lưu ý an toàn dùng thuốc:</b><br/>
                - Uống thuốc đúng liều lượng và thời gian theo chỉ dẫn của bác sĩ.<br/>
                - Không tự ý ngưng thuốc hoặc chia sẻ thuốc cho người khác.<br/>
                - Khi có dấu hiệu dị ứng, buồn nôn hoặc bất thường, vui lòng liên hệ ngay hotline phòng khám.
            </div>";
    }
}
