import Foundation
import Combine

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var phone = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    
    // Register extra fields
    @Published var ho = ""
    @Published var ten = ""
    @Published var cccd = ""
    @Published var ngaySinh = Calendar.current.date(byAdding: .year, value: -25, to: Date()) ?? Date()
    @Published var gioiTinh = "NAM" // "NAM" hoặc "NU"
    @Published var diaChi = ""
    @Published var email = ""
    
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isSuccess = false
    
    private let authManager = AuthManager.shared
    
    func login() async {
        let cleanPhone = phone.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanPhone.isEmpty, !password.isEmpty else {
            errorMessage = "Vui lòng nhập đầy đủ số điện thoại và mật khẩu"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        let request = DangNhapRequest(
            taiKhoan: cleanPhone,
            password: password
        )
        
        do {
            let response: PatientAuthResponse = try await APIClient.shared.post(
                endpoint: "patient-auth/login",
                body: request,
                requiresAuth: false
            )
            
            authManager.saveAuth(response: response)
            isSuccess = true
        } catch let apiError as NetworkError {
            errorMessage = apiError.localizedDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func register() async {
        let cleanPhone = phone.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanHo = ho.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanTen = ten.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !cleanPhone.isEmpty, !password.isEmpty, !cleanTen.isEmpty else {
            errorMessage = "Vui lòng nhập đầy đủ Tên, Số điện thoại và Mật khẩu"
            return
        }
        
        guard cleanPhone.count >= 9 else {
            errorMessage = "Số điện thoại không hợp lệ"
            return
        }
        
        guard password == confirmPassword else {
            errorMessage = "Mật khẩu xác nhận không khớp"
            return
        }
        
        guard password.count >= 6 else {
            errorMessage = "Mật khẩu phải từ 6 ký tự trở lên"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // Định dạng ngày sinh ISO 8601 chuẩn backend .NET
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        let ngaySinhStr = formatter.string(from: ngaySinh)
        
        // 0: Nam (M), 1: Nữ (F), 2: Khác (O)
        let gioiTinhInt = (gioiTinh == "NAM") ? 0 : 1
        
        let request = DangKyRequest(
            ho: cleanHo.isEmpty ? "Nguyễn" : cleanHo,
            ten: cleanTen,
            dienThoai: cleanPhone,
            password: password,
            ngaySinh: ngaySinhStr,
            gioiTinh: gioiTinhInt,
            email: email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : email.trimmingCharacters(in: .whitespacesAndNewlines),
            soCCCD: cccd.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : cccd.trimmingCharacters(in: .whitespacesAndNewlines),
            diaChi: diaChi.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : diaChi.trimmingCharacters(in: .whitespacesAndNewlines)
        )
        
        do {
            let response: PatientAuthResponse = try await APIClient.shared.post(
                endpoint: "patient-auth/register",
                body: request,
                requiresAuth: false
            )
            
            authManager.saveAuth(response: response)
            isSuccess = true
        } catch let apiError as NetworkError {
            errorMessage = apiError.localizedDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}
