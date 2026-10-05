//
//  BookingModels.swift
//  AppPatientClinic
//

import Foundation

struct BookingFacility: Codable, Identifiable {
    let id: Int
    let ma: String
    let ten: String
    let diaChi: String
    let dienThoai: String
    let email: String
}

struct BookingSpecialty: Codable, Identifiable {
    let id: Int
    let ma: String
    let ten: String
    let maCoSo: Int
    let tenCoSo: String?
    let iconUrl: String?
    let moTa: String?
}

struct BookingDoctor: Codable, Identifiable {
    let id: Int
    let hoTen: String
    let chuyenKhoa: String?
    let hocHamHocVi: String?
    let soHanhNghe: String
    let email: String
    let dienThoai: String
    let maKhoa: Int?
    let tenKhoa: String?
    let maCoSo: Int?
    let tenCoSo: String?
    let dangTruc: Bool
    let avatarUrl: String?
    let moTa: String?
}

struct TimeSlot: Codable, Identifiable {
    var id: String { "\(thoiGianBatDau)-\(thoiGianKetThuc)" }
    let thoiGianBatDau: String
    let thoiGianKetThuc: String
    let label: String
    let soLuongDaDat: Int
    let soLuongToiDa: Int
    let conTrong: Bool
}

struct AppointmentItem: Codable, Identifiable {
    let id: Int
    let maBenhNhan: Int
    let tenBenhNhan: String
    let soDienThoai: String
    let maBacSi: Int
    let tenBacSi: String
    let maCoSo: Int
    let tenCoSo: String
    let maKhoa: Int?
    let tenKhoa: String
    let thoiGianBatDau: String
    let thoiGianKetThuc: String
    let khungGio: String
    let ngayHen: String
    let trangThai: String
    let trangThaiText: String
    let lyDo: String
    let chiPhiGiuCho: Double
    let daThanhToanGiuCho: Bool
    let ghiChuHuy: String?
    
    var coTheHuy: Bool {
        guard trangThai == "CHO_KHAM" || trangThai == "DA_XAC_NHAN" else { return false }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        var start = formatter.date(from: thoiGianBatDau)
        if start == nil {
            let df = DateFormatter()
            df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            start = df.date(from: thoiGianBatDau)
        }
        guard let validStart = start else { return false }
        return validStart.timeIntervalSince(Date()) >= 2 * 3600
    }
}

struct CreateAppointmentRequest: Codable {
    let maBacSi: Int
    let maCoSo: Int
    let maKhoa: Int?
    let thoiGianBatDau: String
    let thoiGianKetThuc: String
    let lyDo: String
}

struct CancelAppointmentRequest: Codable {
    let lyDoHuy: String
}
