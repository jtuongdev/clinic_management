using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.FinanceReports;
using ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoCongNoTongHop;
using ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoDoanhThu;
using ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoThuChi;
using MediatR;

namespace ClinicManagement.Application.Features.FinanceReports.Queries.XuatBaoCaoTaiChinh;

public sealed class XuatBaoCaoTaiChinhQueryHandler(IMediator mediator)
    : IRequestHandler<XuatBaoCaoTaiChinhQuery, ExportFinancialReportDto>
{
    public async Task<ExportFinancialReportDto> Handle(
        XuatBaoCaoTaiChinhQuery request,
        CancellationToken cancellationToken)
    {
        var sb = new StringBuilder();
        var now = DateTime.UtcNow;
        var fileName = $"BaoCaoTaiChinh_{request.ReportType}_{now:yyyyMMddHHmmss}.csv";

        // UTF-8 BOM cho Excel hiển thị đúng tiếng Việt
        sb.Append('\uFEFF');

        if (request.ReportType.Equals("debts", StringComparison.OrdinalIgnoreCase))
        {
            var debts = await mediator.Send(new LayBaoCaoCongNoTongHopQuery(request.FacilityId, request.ToDate), cancellationToken);

            sb.AppendLine("BÁO CÁO CÔNG NỢ TỔNG HỢP TOÀN HỆ THỐNG");
            sb.AppendLine($"Thời điểm kết xuất: {now:dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine();

            sb.AppendLine("1. TỔNG QUAN CÔNG NỢ");
            sb.AppendLine($"Tổng phải thu bệnh nhân: {debts.TongQuan.TongPhaiThuBenhNhan:N0} đ");
            sb.AppendLine($"Phải thu trong hạn: {debts.TongQuan.PhaiThuTrongHan:N0} đ");
            sb.AppendLine($"Phải thu quá hạn: {debts.TongQuan.PhaiThuQuaHan:N0} đ");
            sb.AppendLine($"Tổng phải trả nhà cung cấp: {debts.TongQuan.TongPhaiTraNhaCungCap:N0} đ");
            sb.AppendLine($"Phải trả trong hạn: {debts.TongQuan.PhaiTraTrongHan:N0} đ");
            sb.AppendLine($"Phải trả quá hạn: {debts.TongQuan.PhaiTraQuaHan:N0} đ");
            sb.AppendLine($"Chênh lệch công nợ: {debts.TongQuan.ChenhLechCongNo:N0} đ");
            sb.AppendLine();

            sb.AppendLine("2. PHÂN BỔ TUỔI NỢ");
            sb.AppendLine("Nhóm tuổi nợ,Phải thu BN (đ),Tỷ trọng thu (%),Phải trả NCC (đ),Tỷ trọng trả (%)");
            foreach (var a in debts.PhanBoTuoiNo)
            {
                sb.AppendLine($"\"{a.NhomTuoi}\",{a.SoTienPhaiThu},{a.TyTrongPhaiThu},{a.SoTienPhaiTra},{a.TyTrongPhaiTra}");
            }
            sb.AppendLine();

            sb.AppendLine("3. TOP BỆNH NHÂN CÒN NỢ NHIỀU NHẤT");
            sb.AppendLine("Mã BN,Họ và tên,Số điện thoại,Nợ ban đầu (đ),Đã trả (đ),Còn nợ (đ),Hạn thanh toán,Trạng thái");
            foreach (var b in debts.TopBenhNhanNo)
            {
                sb.AppendLine($"#{b.MaBenhNhan},\"{b.HoTen}\",\"{b.SoDienThoai}\",{b.SoTienNo},{b.SoTienDaTra},{b.SoTienConLai},\"{b.HanThanhToan:dd/MM/yyyy}\",\"{b.TrangThai}\"");
            }
        }
        else if (request.ReportType.Equals("cashflow", StringComparison.OrdinalIgnoreCase))
        {
            var cf = await mediator.Send(new LayBaoCaoThuChiLoiNhuanQuery(request.FacilityId, request.FromDate, request.ToDate), cancellationToken);

            sb.AppendLine("BÁO CÁO DÒNG TIỀN THU - CHI & LỢI NHUẬN GỘP");
            sb.AppendLine($"Khoảng thời gian: {request.FromDate:dd/MM/yyyy} - {request.ToDate:dd/MM/yyyy}");
            sb.AppendLine();

            sb.AppendLine("1. CHỈ SỐ DÒNG TIỀN & LỢI NHUẬN");
            sb.AppendLine($"Tổng dòng tiền vào (Thu): {cf.TongQuan.TongThu:N0} đ");
            sb.AppendLine($"Tổng dòng tiền ra (Chi): {cf.TongQuan.TongChi:N0} đ");
            sb.AppendLine($"Dòng tiền ròng: {cf.TongQuan.DongTienRong:N0} đ");
            sb.AppendLine($"Doanh thu thuần: {cf.TongQuan.DoanhThuThuan:N0} đ");
            sb.AppendLine($"Giá vốn hàng bán (COGS): {cf.TongQuan.GiaVonHangBan:N0} đ");
            sb.AppendLine($"Chi phí nhân sự: {cf.TongQuan.ChiPhiNhanSu:N0} đ");
            sb.AppendLine($"Lợi nhuận gộp ước tính: {cf.TongQuan.LoiNhuanGopUocTinh:N0} đ");
            sb.AppendLine($"Tỷ suất lợi nhuận gộp: {cf.TongQuan.TySuatLoiNhuanGop:N1}%");
            sb.AppendLine();

            sb.AppendLine("2. PHÂN BỔ PHƯƠNG THỨC THU TIỀN");
            sb.AppendLine("Phương thức,Tên phương thức,Số tiền (đ),Số giao dịch,Tỷ trọng (%)");
            foreach (var p in cf.PhanBoThu)
            {
                sb.AppendLine($"\"{p.PhuongThuc}\",\"{p.TenPhuongThuc}\",{p.SoTien},{p.SoGiaoDich},{p.TyTrong}");
            }
        }
        else
        {
            var rev = await mediator.Send(new LayBaoCaoDoanhThuQuery(request.FacilityId, null, request.FromDate, request.ToDate), cancellationToken);

            sb.AppendLine("BÁO CÁO DOANH THU HỆ THỐNG PHÒNG KHÁM");
            sb.AppendLine($"Khoảng thời gian: {request.FromDate:dd/MM/yyyy} - {request.ToDate:dd/MM/yyyy}");
            sb.AppendLine();

            sb.AppendLine("1. CHỈ SỐ DOANH THU CHÍNH");
            sb.AppendLine($"Tổng doanh thu: {rev.TongQuan.TongDoanhThu:N0} đ");
            sb.AppendLine($"Thực thu từ bệnh nhân: {rev.TongQuan.DoanhThuThucThu:N0} đ");
            sb.AppendLine($"BHYT chi trả: {rev.TongQuan.BHYTChiTra:N0} đ");
            sb.AppendLine($"Chưa thanh toán: {rev.TongQuan.ChuaThanhToan:N0} đ");
            sb.AppendLine($"Tổng số hóa đơn: {rev.TongQuan.SoLuongHoaDon}");
            sb.AppendLine();

            sb.AppendLine("2. DOANH THU THEO CƠ SỞ");
            sb.AppendLine("Mã cơ sở,Tên cơ sở,Số hóa đơn,Doanh thu (đ),Đã thu (đ),Tỷ trọng (%)");
            foreach (var cs in rev.TheoCoSo)
            {
                sb.AppendLine($"#{cs.MaCoSo},\"{cs.TenCoSo}\",{cs.SoHoaDon},{cs.DoanhThu},{cs.DaThu},{cs.TyTrong}");
            }
            sb.AppendLine();

            sb.AppendLine("3. TOP DỊCH VỤ / THUỐC MANG LẠI DOANH THU CAO");
            sb.AppendLine("Mã,Tên dịch vụ/Mặt hàng,Phân loại,Số lượng,Doanh thu (đ)");
            foreach (var dv in rev.TopDichVu)
            {
                sb.AppendLine($"\"{dv.MaDichVu}\",\"{dv.TenDichVu}\",\"{dv.Loai}\",{dv.SoLuong},{dv.DoanhThu}");
            }
        }

        var fileBytes = Encoding.UTF8.GetBytes(sb.ToString());
        return new ExportFinancialReportDto
        {
            FileContent = fileBytes,
            ContentType = "text/csv; charset=utf-8",
            FileName = fileName
        };
    }
}
