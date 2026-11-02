import SwiftUI
import Combine

@MainActor
final class ChangePasswordViewModel: ObservableObject {
    enum Step: Int {
        case enterEmail = 1
        case verifyOtp = 2
        case setNewPassword = 3
        case completed = 4
    }
    
    @Published var step: Step = .enterEmail
    @Published var email: String = ""
    @Published var taiKhoan: String = ""
    @Published var otpCode: String = ""
    @Published var newPassword: String = ""
    @Published var confirmPassword: String = ""
    
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var infoMessage: String? = nil
    
    init(initialEmail: String? = nil, initialAccount: String? = nil) {
        if let initialEmail, !initialEmail.isEmpty {
            self.email = initialEmail
        } else if let patientEmail = AuthManager.shared.currentPatient?.email, !patientEmail.isEmpty {
            self.email = patientEmail
        }
        
        if let initialAccount, !initialAccount.isEmpty {
            self.taiKhoan = initialAccount
        } else if let phone = AuthManager.shared.currentPatient?.dienThoai, !phone.isEmpty {
            self.taiKhoan = phone
        }
    }
    
    func sendOtp() async {
        let cleanEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        let emailPattern = "^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        guard cleanEmail.range(of: emailPattern, options: .regularExpression) != nil else {
            errorMessage = "Vui lòng nhập địa chỉ email hợp lệ"
            return
        }
        
        isLoading = true
        errorMessage = nil
        infoMessage = nil
        
        let cleanAccount = taiKhoan.trimmingCharacters(in: .whitespacesAndNewlines)
        let req = SendPasswordOtpRequest(
            email: cleanEmail,
            taiKhoan: cleanAccount.isEmpty ? nil : cleanAccount
        )
        
        do {
            let _: Bool = try await APIClient.shared.post(
                endpoint: "patient-auth/send-password-otp",
                body: req,
                requiresAuth: AuthManager.shared.isAuthenticated
            )
            infoMessage = "Mã xác nhận 6 chữ số đã được gửi tới \(cleanEmail). Vui lòng kiểm tra hộp thư."
            step = .verifyOtp
        } catch let apiError as NetworkError {
            errorMessage = apiError.localizedDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func verifyOtp() async {
        let cleanEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanOtp = otpCode.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard cleanOtp.count == 6 else {
            errorMessage = "Vui lòng nhập đủ 6 chữ số mã xác nhận"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        let req = VerifyPasswordOtpRequest(
            email: cleanEmail,
            otpCode: cleanOtp
        )
        
        do {
            let _: Bool = try await APIClient.shared.post(
                endpoint: "patient-auth/verify-password-otp",
                body: req,
                requiresAuth: false
            )
            infoMessage = "Xác thực mã thành công! Vui lòng nhập mật khẩu mới bên dưới."
            step = .setNewPassword
        } catch let apiError as NetworkError {
            errorMessage = apiError.localizedDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func submitNewPassword() async {
        let cleanEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanOtp = otpCode.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard newPassword.count >= 6 else {
            errorMessage = "Mật khẩu mới phải từ 6 ký tự trở lên"
            return
        }
        
        guard newPassword == confirmPassword else {
            errorMessage = "Mật khẩu xác nhận không khớp"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        let req = ChangePasswordWithOtpRequest(
            email: cleanEmail,
            otpCode: cleanOtp,
            newPassword: newPassword
        )
        
        do {
            let _: Bool = try await APIClient.shared.post(
                endpoint: "patient-auth/change-password-with-otp",
                body: req,
                requiresAuth: false
            )
            step = .completed
        } catch let apiError as NetworkError {
            errorMessage = apiError.localizedDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

struct ChangePasswordView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var vm: ChangePasswordViewModel
    @State private var isNewPasswordVisible = false
    @State private var isConfirmPasswordVisible = false
    
    init(initialEmail: String? = nil, initialAccount: String? = nil) {
        _vm = StateObject(wrappedValue: ChangePasswordViewModel(
            initialEmail: initialEmail,
            initialAccount: initialAccount
        ))
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // Step Progress Header
                        stepHeader
                        
                        // Main Card Content
                        VStack(alignment: .leading, spacing: 18) {
                            if vm.step == .completed {
                                completedSection
                            } else {
                                if let info = vm.infoMessage {
                                    HStack(alignment: .top, spacing: 8) {
                                        Image(systemName: "checkmark.seal.fill")
                                            .foregroundColor(AppTheme.emerald)
                                        Text(info)
                                            .font(.caption)
                                            .foregroundColor(AppTheme.emerald)
                                        Spacer()
                                    }
                                    .padding(12)
                                    .background(AppTheme.emeraldLight.opacity(0.6))
                                    .cornerRadius(10)
                                }
                                
                                if let error = vm.errorMessage {
                                    HStack(alignment: .top, spacing: 8) {
                                        Image(systemName: "exclamationmark.triangle.fill")
                                            .foregroundColor(.red)
                                        Text(error)
                                            .font(.caption)
                                            .foregroundColor(.red)
                                        Spacer()
                                    }
                                    .padding(12)
                                    .background(Color.red.opacity(0.08))
                                    .cornerRadius(10)
                                }
                                
                                switch vm.step {
                                case .enterEmail:
                                    enterEmailSection
                                case .verifyOtp:
                                    verifyOtpSection
                                case .setNewPassword:
                                    setNewPasswordSection
                                case .completed:
                                    EmptyView()
                                }
                            }
                        }
                        .padding(22)
                        .background(Color.white)
                        .cornerRadius(20)
                        .shadow(color: Color.black.opacity(0.05), radius: 10, y: 4)
                        .padding(.horizontal, 20)
                    }
                    .padding(.vertical, 20)
                }
            }
            .navigationTitle("Đổi Mật Khẩu")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Đóng") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private var stepHeader: some View {
        HStack(spacing: 12) {
            stepItem(index: 1, title: "Nhập Email", isActive: vm.step.rawValue >= 1)
            Rectangle()
                .fill(vm.step.rawValue >= 2 ? Color.appPrimary : Color.gray.opacity(0.3))
                .frame(height: 2)
                .frame(maxWidth: 32)
            stepItem(index: 2, title: "Mã OTP", isActive: vm.step.rawValue >= 2)
            Rectangle()
                .fill(vm.step.rawValue >= 3 ? Color.appPrimary : Color.gray.opacity(0.3))
                .frame(height: 2)
                .frame(maxWidth: 32)
            stepItem(index: 3, title: "Mật khẩu mới", isActive: vm.step.rawValue >= 3)
        }
        .padding(.horizontal, 24)
    }
    
    private func stepItem(index: Int, title: String, isActive: Bool) -> some View {
        VStack(spacing: 6) {
            Circle()
                .fill(isActive ? Color.appPrimary : Color.gray.opacity(0.2))
                .frame(width: 30, height: 30)
                .overlay(
                    Text("\(index)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(isActive ? .white : .gray)
                )
            Text(title)
                .font(.system(size: 11, weight: isActive ? .semibold : .regular))
                .foregroundColor(isActive ? .appTextPrimary : .appTextSecondary)
        }
    }
    
    private var enterEmailSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Xác thực qua Email")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.appTextPrimary)
            
            Text("Nhập địa chỉ email của bạn để hệ thống gửi mã xác nhận gồm 6 chữ số trước khi đổi mật khẩu.")
                .font(.caption)
                .foregroundColor(.appTextSecondary)
            
            if !AuthManager.shared.isAuthenticated {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Số điện thoại hoặc CCCD (tùy chọn)")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.appTextSecondary)
                    
                    HStack {
                        Image(systemName: "person.crop.circle")
                            .foregroundColor(.appPrimary)
                        TextField("Nhập SĐT hoặc CCCD", text: $vm.taiKhoan)
                            .keyboardType(.numbersAndPunctuation)
                            .autocapitalization(.none)
                    }
                    .padding(13)
                    .background(Color.appBackground)
                    .cornerRadius(12)
                }
            }
            
            VStack(alignment: .leading, spacing: 6) {
                Text("Địa chỉ Email nhận mã (*)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.appTextSecondary)
                
                HStack {
                    Image(systemName: "envelope.fill")
                        .foregroundColor(.appPrimary)
                    TextField("example@gmail.com", text: $vm.email)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                }
                .padding(13)
                .background(Color.appBackground)
                .cornerRadius(12)
            }
            
            AppButton(
                title: "Gửi Mã Xác Nhận",
                icon: "paperplane.fill",
                style: .primary,
                isLoading: vm.isLoading
            ) {
                Task {
                    await vm.sendOtp()
                }
            }
            .padding(.top, 4)
        }
    }
    
    private var verifyOtpSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Nhập mã xác nhận")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.appTextPrimary)
            
            Text("Mã gồm 6 chữ số đã được gửi tới \(vm.email). Sau khi xác nhận đúng mã, bạn sẽ được phép đặt mật khẩu mới.")
                .font(.caption)
                .foregroundColor(.appTextSecondary)
            
            VStack(alignment: .leading, spacing: 6) {
                Text("Mã xác nhận (6 chữ số)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.appTextSecondary)
                
                HStack {
                    Image(systemName: "number.square.fill")
                        .foregroundColor(.appPrimary)
                    TextField("Nhập mã 6 số", text: $vm.otpCode)
                        .keyboardType(.numberPad)
                        .font(.system(size: 18, weight: .bold, design: .monospaced))
                }
                .padding(13)
                .background(Color.appBackground)
                .cornerRadius(12)
            }
            
            AppButton(
                title: "Xác Nhận Mã OTP",
                icon: "checkmark.shield.fill",
                style: .primary,
                isLoading: vm.isLoading
            ) {
                Task {
                    await vm.verifyOtp()
                }
            }
            
            HStack {
                Button("Đổi địa chỉ Email") {
                    vm.errorMessage = nil
                    vm.infoMessage = nil
                    vm.step = .enterEmail
                }
                .font(.caption)
                .foregroundColor(.appTextSecondary)
                
                Spacer()
                
                Button("Gửi lại mã") {
                    Task {
                        await vm.sendOtp()
                    }
                }
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.appPrimary)
            }
            .padding(.top, 4)
        }
    }
    
    private var setNewPasswordSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Đặt mật khẩu mới")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.appTextPrimary)
            
            VStack(alignment: .leading, spacing: 6) {
                Text("Mật khẩu mới (*)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.appTextSecondary)
                
                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundColor(.appPrimary)
                    if isNewPasswordVisible {
                        TextField("Tối thiểu 6 ký tự", text: $vm.newPassword)
                    } else {
                        SecureField("Tối thiểu 6 ký tự", text: $vm.newPassword)
                    }
                    Button(action: { isNewPasswordVisible.toggle() }) {
                        Image(systemName: isNewPasswordVisible ? "eye.slash.fill" : "eye.fill")
                            .foregroundColor(.gray)
                    }
                }
                .padding(13)
                .background(Color.appBackground)
                .cornerRadius(12)
            }
            
            VStack(alignment: .leading, spacing: 6) {
                Text("Xác nhận mật khẩu mới (*)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.appTextSecondary)
                
                HStack {
                    Image(systemName: "lock.rotation")
                        .foregroundColor(.appPrimary)
                    if isConfirmPasswordVisible {
                        TextField("Nhập lại mật khẩu mới", text: $vm.confirmPassword)
                    } else {
                        SecureField("Nhập lại mật khẩu mới", text: $vm.confirmPassword)
                    }
                    Button(action: { isConfirmPasswordVisible.toggle() }) {
                        Image(systemName: isConfirmPasswordVisible ? "eye.slash.fill" : "eye.fill")
                            .foregroundColor(.gray)
                    }
                }
                .padding(13)
                .background(Color.appBackground)
                .cornerRadius(12)
            }
            
            AppButton(
                title: "Cập Nhật Mật Khẩu",
                icon: "key.fill",
                style: .primary,
                isLoading: vm.isLoading
            ) {
                Task {
                    await vm.submitNewPassword()
                }
            }
            .padding(.top, 4)
        }
    }
    
    private var completedSection: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 56))
                .foregroundColor(AppTheme.emerald)
            
            Text("Đổi mật khẩu thành công!")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(.appTextPrimary)
            
            Text("Mật khẩu tài khoản bệnh nhân của bạn đã được cập nhật. Bạn có thể sử dụng mật khẩu mới cho các lần đăng nhập tiếp theo.")
                .font(.subheadline)
                .foregroundColor(.appTextSecondary)
                .multilineTextAlignment(.center)
            
            AppButton(
                title: "Hoàn Tất",
                icon: "checkmark",
                style: .primary,
                isLoading: false
            ) {
                dismiss()
            }
            .padding(.top, 8)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
    }
}
