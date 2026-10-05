import SwiftUI

struct LoginView: View {
    @StateObject private var vm = AuthViewModel()
    @State private var showRegister = false
    @State private var isPasswordVisible = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 28) {
                        // Header Branding
                        VStack(spacing: 12) {
                            Image("app_logo")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 88, height: 88)
                                .clipShape(RoundedRectangle(cornerRadius: 20))
                                .shadow(color: Color.appPrimary.opacity(0.25), radius: 12, y: 6)
                                .padding(.top, 36)
                            
                            VStack(spacing: 4) {
                                Text("AnCare")
                                    .font(.system(size: 28, weight: .bold, design: .rounded))
                                    .foregroundColor(.appPrimary)
                                
                                Text("Chăm sóc tận tâm • Trọn vẹn an tâm")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.appTextSecondary)
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        // Card Login Form
                        VStack(spacing: 20) {
                            Text("Đăng nhập tài khoản")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.appTextPrimary)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            
                            // Số điện thoại / CCCD
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Số điện thoại hoặc CCCD")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.appTextSecondary)
                                
                                HStack {
                                    Image(systemName: "person.crop.circle.fill")
                                        .foregroundColor(.appPrimary)
                                        .frame(width: 24)
                                    
                                    TextField("Nhập số điện thoại hoặc CCCD", text: $vm.phone)
                                        .keyboardType(.numbersAndPunctuation)
                                        .autocapitalization(.none)
                                }
                                .padding(14)
                                .background(Color.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                                )
                            }
                            
                            // Mật khẩu
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Mật khẩu")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.appTextSecondary)
                                
                                HStack {
                                    Image(systemName: "lock.fill")
                                        .foregroundColor(.appPrimary)
                                        .frame(width: 24)
                                    
                                    if isPasswordVisible {
                                        TextField("Nhập mật khẩu", text: $vm.password)
                                    } else {
                                        SecureField("Nhập mật khẩu", text: $vm.password)
                                    }
                                    
                                    Button(action: { isPasswordVisible.toggle() }) {
                                        Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                                            .foregroundColor(.gray)
                                    }
                                }
                                .padding(14)
                                .background(Color.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                                )
                            }
                            
                            // Error banner
                            if let error = vm.errorMessage {
                                HStack(spacing: 8) {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .foregroundColor(.red)
                                    Text(error)
                                        .font(.caption)
                                        .foregroundColor(.red)
                                        .multilineTextAlignment(.leading)
                                    Spacer()
                                }
                                .padding(10)
                                .background(Color.red.opacity(0.1))
                                .cornerRadius(8)
                            }
                            
                            // Nút đăng nhập
                            AppButton(
                                title: "Đăng Nhập",
                                icon: "arrow.right",
                                style: .primary,
                                isLoading: vm.isLoading
                            ) {
                                Task {
                                    await vm.login()
                                }
                            }
                            .padding(.top, 6)
                        }
                        .padding(24)
                        .background(Color.appCardBackground)
                        .cornerRadius(20)
                        .shadow(color: Color.black.opacity(0.06), radius: 12, y: 4)
                        .padding(.horizontal, 20)
                        
                        // Chưa có tài khoản -> Đăng ký
                        HStack(spacing: 6) {
                            Text("Chưa có tài khoản bệnh nhân?")
                                .font(.footnote)
                                .foregroundColor(.appTextSecondary)
                            
                            Button(action: { showRegister = true }) {
                                Text("Đăng ký ngay")
                                    .font(.footnote)
                                    .fontWeight(.bold)
                                    .foregroundColor(.appPrimary)
                            }
                        }
                        .padding(.bottom, 32)
                    }
                }
            }
            .navigationDestination(isPresented: $showRegister) {
                RegisterView()
            }
        }
    }
}
