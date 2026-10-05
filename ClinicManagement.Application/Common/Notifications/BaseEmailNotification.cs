using System;

namespace ClinicManagement.Application.Common.Notifications;

/// <summary>
/// Lớp cơ sở trừu tượng cho tất cả các mẫu email trong hệ thống.
/// Định nghĩa cấu trúc khung chuẩn: Header, Logo, Phong cách CSS, Chân trang bản quyền.
/// Các lớp dẫn xuất chỉ cần ghi đè (override) phần nội dung chuyên biệt và tiêu đề thư.
/// </summary>
/// <typeparam name="TModel">Kiểu dữ liệu đầu vào cho mẫu email</typeparam>
public abstract class BaseEmailNotification<TModel>
{
    public TModel Data { get; }
    public abstract string Subject { get; }
    protected virtual string ClinicBrandName => "PHÒNG KHÁM ĐA KHOA QUỐC TẾ";
    protected virtual string ClinicHotline => "1900 6868";
    protected virtual string ClinicAddress => "Số 123 Đường Y Dược, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh";

    protected BaseEmailNotification(TModel data)
    {
        Data = data ?? throw new ArgumentNullException(nameof(data));
    }

    /// <summary>
    /// Xây dựng toàn bộ tài liệu HTML hoàn chỉnh cho email.
    /// </summary>
    public virtual string BuildHtmlBody()
    {
        string specificContent = RenderSpecificContent();

        return $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f1f5f9;
            margin: 0;
            padding: 24px 0;
            color: #1e293b;
        }}
        .email-container {{
            max-width: 620px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }}
        .email-header {{
            background: linear-gradient(135deg, #0b4f6c 0%, #0369a1 100%);
            color: #ffffff;
            padding: 24px 32px;
            text-align: center;
        }}
        .email-header h1 {{
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }}
        .email-header p {{
            margin: 4px 0 0;
            font-size: 13px;
            opacity: 0.85;
        }}
        .email-body {{
            padding: 32px;
            line-height: 1.6;
            font-size: 14px;
        }}
        .email-footer {{
            background: #f8fafc;
            padding: 20px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
        }}
        .badge {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
        }}
        .badge-success {{ background: #dcfce7; color: #15803d; }}
        .badge-info {{ background: #e0f2fe; color: #0369a1; }}
        .table-data {{
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 13px;
        }}
        .table-data th {{
            background: #f8fafc;
            padding: 8px 12px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
            color: #475569;
        }}
        .table-data td {{
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
        }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='email-header'>
            <h1>{ClinicBrandName}</h1>
            <p>Hệ thống Y tế &amp; Quản trị Phòng khám Thông minh</p>
        </div>
        
        <div class='email-body'>
            {specificContent}
        </div>

        <div class='email-footer'>
            <p style='margin: 0 0 6px;'><b>{ClinicBrandName}</b></p>
            <p style='margin: 0 0 4px;'>📍 Địa chỉ: {ClinicAddress}</p>
            <p style='margin: 0 0 10px;'>📞 Hotline hỗ trợ 24/7: <b style='color: #0b4f6c;'>{ClinicHotline}</b></p>
            <div style='border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 11px; color: #94a3b8;'>
                Đây là thư điện tử được gửi tự động từ hệ thống. Quý khách vui lòng không phản hồi trực tiếp vào địa chỉ này.
            </div>
        </div>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Phương thức trừu tượng: Các nhóm chức năng bắt buộc phải ghi đè để render nội dung riêng.
    /// </summary>
    protected abstract string RenderSpecificContent();
}
