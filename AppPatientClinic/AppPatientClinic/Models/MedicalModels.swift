//
//  MedicalModels.swift
//  AppPatientClinic
//
//  Đồng bộ với DTO backend: LuotKhamDto, DonThuocDto, ChiDinhDichVuDto, HoaDonDto.
//  Các trường để Optional để tránh lỗi decode khi backend bổ sung/thiếu dữ liệu.
//

import Foundation

// MARK: - Lượt khám (LuotKhamDto)
struct ChanDoanItem: Codable, Identifiable, Hashable {
    let id: Int
    let maICD: String?
    let tenICD: String?
    let tenChanDoan: String?
    let laChanDoanChinh: Bool?
    let ghiChu: String?
    
    var hienThi: String {
        let ten = (tenChanDoan?.isEmpty == false ? tenChanDoan : tenICD) ?? ""
        if let ma = maICD, !ma.isEmpty { return "\(ma) - \(ten)" }
        return ten
    }
}

struct SinhHieuItem: Codable, Hashable {
    let huyetApTamThu: Int?
    let huyetApTamTruong: Int?
    let mach: Int?
    let nhietDo: Double?
    let canNang: Double?
    let chieuCao: Double?
    let spO2: Double?
}

struct VisitItem: Codable, Identifiable, Hashable {
    let id: Int
    let ngayKham: String
    let trangThai: String?
    let hinhThucDieuTri: String?
    let lyDoKham: String?
    let tenPhongKham: String?
    let bacSi: String?
    let chuyenKhoaBacSi: String?
    let khoa: String?
    let chanDoans: [ChanDoanItem]?
    let sinhHieu: SinhHieuItem?
    let chiDinhDichVus: [LabResultItem]?
    let donThuocs: [PrescriptionItem]?
    
    var chanDoanChinh: String {
        let list = chanDoans ?? []
        if let chinh = list.first(where: { $0.laChanDoanChinh == true }) { return chinh.hienThi }
        return list.first?.hienThi ?? ""
    }
    
    var bacSiKham: String { bacSi ?? "Bác sĩ phụ trách" }
    var khoaKham: String { chuyenKhoaBacSi ?? khoa ?? "Khoa Khám Bệnh" }
    var trangThaiText: String { trangThai ?? "HOÀN THÀNH" }
}

// MARK: - Đơn thuốc (DonThuocDto)
struct PrescriptionMedicineItem: Codable, Identifiable, Hashable {
    var id: String { "\(tenThuoc)-\(lieuDung ?? "")-\(tanSuat ?? "")" }
    let tenThuoc: String
    let donViTinh: String?
    let soLuongKe: Double?
    let lieuDung: String?
    let tanSuat: String?
    let soNgay: Int?
    let huongDan: String?
    let donGia: Double?
    let thanhTien: Double?
}

struct PrescriptionItem: Codable, Identifiable, Hashable {
    let id: Int
    let ngayKe: String
    let trangThai: String?
    let ghiChu: String?
    let chiTiet: [PrescriptionMedicineItem]?
    
    var ghiChuText: String {
        if let ghiChu = ghiChu, !ghiChu.isEmpty { return ghiChu }
        return "Toa thuốc điều trị"
    }
    var trangThaiText: String { trangThai ?? "Đã cấp thuốc" }
}

// MARK: - Kết quả CLS (ChiDinhDichVuDto)
struct LabResultItem: Codable, Identifiable, Hashable {
    let id: Int
    let tenDichVu: String
    let loaiDichVu: String?
    let trangThai: String?
    let ngayChiDinh: String
    let ngayThucHien: String?
    let ngayCoKetQua: String?
    let ketLuan: String?
    let urlKetQua: String?
    
    var ketQua: String? { ketLuan }
    var trangThaiText: String { trangThai ?? "Đã có kết quả" }
    var loaiDichVuText: String { loaiDichVu ?? "Cận lâm sàng" }
}

// MARK: - Hóa đơn (HoaDonDto)
struct InvoiceItem: Codable, Identifiable, Hashable {
    let id: Int
    let soHoaDon: String
    let ngayLap: String
    let tongTien: Double
    let soTienBaoHiemChiTra: Double?
    let soTienBenhNhanChiTra: Double?
    let daThanhToan: Double?
    let trangThai: String?
    let ghiChu: String?
    
    var ngayPhatHanh: String { ngayLap }
    var trangThaiText: String { trangThai ?? "Chưa thanh toán" }
    var mienGiam: Double { 0 }
    var baoHiemThanhToan: Double { soTienBaoHiemChiTra ?? 0 }
    var daThanhToanTien: Double { daThanhToan ?? 0 }
    
    var conNo: Double {
        max(0, (soTienBenhNhanChiTra ?? tongTien) - (daThanhToan ?? 0))
    }
}

// MARK: - Helpers
enum DateText {
    /// Chuyển "2026-10-03T08:30:00" -> "03/10/2026"
    static func ngay(_ raw: String?) -> String {
        guard let raw, raw.count >= 10 else { return raw ?? "--" }
        let parts = raw.prefix(10).split(separator: "-")
        guard parts.count == 3 else { return String(raw.prefix(10)) }
        return "\(parts[2])/\(parts[1])/\(parts[0])"
    }
}

extension Double {
    var vnd: String { "\(Int(self).formatted()) đ" }
}
