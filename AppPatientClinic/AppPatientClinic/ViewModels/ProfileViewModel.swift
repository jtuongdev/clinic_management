import Foundation
import Combine

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var profile: PatientProfile?
    @Published var isLoading = false
    @Published var isUpdating = false
    @Published var errorMessage: String?
    @Published var updateSuccess = false
    
    // Editable fields
    @Published var ho = ""
    @Published var ten = ""
    @Published var diaChi = ""
    @Published var email = ""
    @Published var nguoiLienHeTen = ""
    @Published var nguoiLienHeDienThoai = ""
    
    func loadProfile() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: PatientProfile = try await APIClient.shared.get(
                endpoint: "patient/me/profile"
            )
            self.profile = res
            self.ho = res.ho ?? ""
            self.ten = res.ten ?? ""
            self.diaChi = res.diaChi ?? ""
            self.email = res.email ?? ""
            self.nguoiLienHeTen = res.nguoiLienHeTen ?? ""
            self.nguoiLienHeDienThoai = res.nguoiLienHeDienThoai ?? ""
        } catch {
            errorMessage = "Không thể tải thông tin hồ sơ: \(error.localizedDescription)"
        }
        isLoading = false
    }
    
    func updateProfile() async {
        isUpdating = true
        errorMessage = nil
        
        let req = UpdateProfileRequest(
            ho: ho.isEmpty ? nil : ho,
            ten: ten.isEmpty ? nil : ten,
            ngaySinh: nil,
            gioiTinh: nil,
            email: email.isEmpty ? nil : email,
            diaChi: diaChi.isEmpty ? nil : diaChi,
            nguoiLienHeTen: nguoiLienHeTen.isEmpty ? nil : nguoiLienHeTen,
            nguoiLienHeDienThoai: nguoiLienHeDienThoai.isEmpty ? nil : nguoiLienHeDienThoai
        )
        
        do {
            let res: PatientProfile = try await APIClient.shared.put(
                endpoint: "patient/me/profile",
                body: req
            )
            self.profile = res
            self.ho = res.ho ?? ""
            self.ten = res.ten ?? ""
            self.diaChi = res.diaChi ?? ""
            self.email = res.email ?? ""
            self.nguoiLienHeTen = res.nguoiLienHeTen ?? ""
            self.nguoiLienHeDienThoai = res.nguoiLienHeDienThoai ?? ""
            self.updateSuccess = true
        } catch let apiError as NetworkError {
            errorMessage = apiError.localizedDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isUpdating = false
    }
    
    func logout() {
        AuthManager.shared.logout()
    }
}
