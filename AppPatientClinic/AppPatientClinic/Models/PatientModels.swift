//
//  PatientModels.swift
//  AppPatientClinic
//

import Foundation

struct PatientInfo: Codable, Identifiable {
    let id: Int
    let ho: String?
    let ten: String?
    let fullName: String
    let dienThoai: String
    let email: String?
    let soCCCD: String?
    let diaChi: String?
    let ngaySinh: String?
    let gioiTinh: String?
    let username: String?
}

struct PatientAuthResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: String
    let isAccountLinked: Bool
    let message: String
    let patient: PatientInfo
}

struct DangNhapRequest: Codable {
    let taiKhoan: String
    let password: String
}

struct DangKyRequest: Codable {
    let ho: String
    let ten: String
    let dienThoai: String
    let password: String
    let ngaySinh: String?
    let gioiTinh: Int // 0: Nam (M), 1: Nữ (F), 2: Khác (O)
    let email: String?
    let soCCCD: String?
    let diaChi: String?
}

struct UpdateProfileRequest: Codable {
    let ho: String?
    let ten: String?
    let ngaySinh: String?
    let gioiTinh: Int?
    let email: String?
    let diaChi: String?
    let nguoiLienHeTen: String?
    let nguoiLienHeDienThoai: String?
}

struct PatientProfile: Codable, Identifiable {
    let id: Int
    let ho: String?
    let ten: String?
    let hoTen: String
    let ngaySinh: String?
    let gioiTinh: String?
    let dienThoai: String?
    let email: String?
    let soCCCD: String?
    let diaChi: String?
    let nguoiLienHeTen: String?
    let nguoiLienHeDienThoai: String?
    let maBenhNhanNoiBo: String?
    let tenCoSo: String?
    let soBhyt: String?
    let hanSuDungBhyt: String?
    let tienSuBenh: String?
    let tienSuDiUng: String?
    let baoHiems: [InsuranceItem]?
    let tienSuBenhs: [MedicalHistoryItem]?
    
    var gioiTinhHienThi: String {
        switch (gioiTinh ?? "").uppercased() {
        case "M", "NAM": return "Nam"
        case "F", "NU", "NỮ": return "Nữ"
        default: return "Khác"
        }
    }
}

struct InsuranceItem: Codable, Identifiable {
    var id: String { soThe }
    let loaiBaoHiem: String?
    let tenNhaCungCap: String?
    let soThe: String
    let ngayBatDau: String?
    let ngayKetThuc: String?
    let mucHuong: Double?
    let isValid: Bool?
}

struct MedicalHistoryItem: Codable, Identifiable {
    var id: String { "\(ten)-\(loaiTienSu ?? "")" }
    let loaiTienSu: String?
    let ten: String
    let ghiChu: String?
    let ngayGhiNhan: String?
    
    var loai: String {
        switch (loaiTienSu ?? "").uppercased() {
        case "DI_UNG": return "Dị ứng"
        case "BENH_NEN": return "Bệnh lý nền"
        case "PHAU_THUAT": return "Phẫu thuật"
        case "TIEN_SU_GIA_DINH": return "Tiền sử gia đình"
        case "THOI_QUEN_SINH_HOAT": return "Thói quen"
        default: return loaiTienSu ?? "Tiền sử y khoa"
        }
    }
}

struct PagedResponse<T: Codable>: Codable {
    let items: [T]
    let totalCount: Int
    let pageIndex: Int
    let pageSize: Int
}
