import SwiftUI

struct RegisterView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var vm = AuthViewModel()
    @State private var isPasswordVisible = false
    
    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Header Banner Info
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 10) {
                            Image(systemName: "person.badge.shield.checkmark.fill")
                                .font(.title2)
                                .foregroundColor(.appPrimary)
                            Text("Tạo Tài Khoản Bệnh Nhân")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.appTextPrimary)
                        }
                        
                        Text("Nếu bạn từng khám bệnh tại phòng khám trước đây, hệ thống sẽ tự động liên kết hồ sơ y bạ cũ dựa theo CCCD hoặc Số điện thoại.")
                            .font(.caption)
                            .foregroundColor(.appTextSecondary)
                            .lineSpacing(2)
                    }
                    .padding(16)
                    .background(Color.appPrimaryLight.opacity(0.3))
                    .cornerRadius(14)
                    .padding(.horizontal, 20)
                    .padding(.top, 10)
                    
                    // Form fields
                    VStack(spacing: 16) {
                        // Họ đệm & Tên
                        HStack(spacing: 12) {
                            FormField(label: "Họ đệm", icon: "person.fill") {
                                TextField("Ví dụ: Nguyễn Văn", text: $vm.ho)
                            }
                            
                            FormField(label: "Tên (*)", icon: "person.text.rectangle") {
                                TextField("Ví dụ: An", text: $vm.ten)
                            }
                        }
                        
                        // Số điện thoại
                        FormField(label: "Số điện thoại (*)", icon: "phone.fill") {
                            TextField("0912345678", text: $vm.phone)
                                .keyboardType(.phonePad)
                        }
                        
                        // CCCD / Định danh
                        FormField(label: "Số CCCD / CMND", icon: "creditcard.fill") {
                            TextField("12 số căn cước (tự liên kết y bạ)", text: $vm.cccd)
                                .keyboardType(.numberPad)
                        }
                        
                        // Ngày sinh & Giới tính
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Ngày sinh")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.appTextSecondary)
                                
                                DatePicker("", selection: $vm.ngaySinh, displayedComponents: .date)
                                    .labelsHidden()
                                    .environment(\.locale, Locale(identifier: "vi_VN"))
                                    .padding(.vertical, 4)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Giới tính")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.appTextSecondary)
                                
                                Picker("Giới tính", selection: $vm.gioiTinh) {
                                    Text("Nam").tag("NAM")
                                    Text("Nữ").tag("NU")
                                }
                                .pickerStyle(.segmented)
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .padding(12)
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                        
                        // Địa chỉ
                        FormField(label: "Địa chỉ hiện tại", icon: "house.fill") {
                            TextField("Số nhà, đường, phường/xã...", text: $vm.diaChi)
                        }
                        
                        // Email
                        FormField(label: "Email", icon: "envelope.fill") {
                            TextField("nhan@email.com", text: $vm.email)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                        }
                        
                        // Mật khẩu
                        FormField(label: "Mật khẩu (*)", icon: "lock.fill") {
                            HStack {
                                if isPasswordVisible {
                                    TextField("Tối thiểu 6 ký tự", text: $vm.password)
                                } else {
                                    SecureField("Tối thiểu 6 ký tự", text: $vm.password)
                                }
                                Button(action: { isPasswordVisible.toggle() }) {
                                    Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                                        .foregroundColor(.gray)
                                }
                            }
                        }
                        
                        // Xác nhận mật khẩu
                        FormField(label: "Xác nhận mật khẩu (*)", icon: "lock.shield.fill") {
                            SecureField("Nhập lại mật khẩu", text: $vm.confirmPassword)
                        }
                        
                        // Error banner
                        if let error = vm.errorMessage {
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.red)
                                    .padding(.top, 2)
                                Text(error)
                                    .font(.caption)
                                    .foregroundColor(.red)
                                    .multilineTextAlignment(.leading)
                                Spacer()
                            }
                            .padding(12)
                            .background(Color.red.opacity(0.08))
                            .cornerRadius(10)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.red.opacity(0.2), lineWidth: 1))
                        }
                        
                        // Nút Đăng ký
                        AppButton(
                            title: "Đăng Ký Tài Khoản",
                            icon: "checkmark.circle.fill",
                            style: .primary,
                            isLoading: vm.isLoading
                        ) {
                            Task {
                                await vm.register()
                                if vm.isSuccess {
                                    dismiss()
                                }
                            }
                        }
                        .padding(.top, 10)
                    }
                    .padding(20)
                    .background(Color.appCardBackground)
                    .cornerRadius(20)
                    .shadow(color: Color.black.opacity(0.04), radius: 8, y: 3)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
            }
        }
        .navigationTitle("Đăng Ký")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct FormField<Content: View>: View {
    let label: String
    let icon: String
    @ViewBuilder let content: () -> Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.appTextSecondary)
            
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(.appPrimary)
                    .frame(width: 20)
                content()
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
        }
    }
}
