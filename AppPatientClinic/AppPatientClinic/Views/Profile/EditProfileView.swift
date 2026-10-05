import SwiftUI

struct EditProfileView: View {
    @ObservedObject var vm: ProfileViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 18) {
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Họ đệm")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(.appTextSecondary)
                            
                            TextField("Họ đệm", text: $vm.ho)
                                .padding(12)
                                .background(Color.white)
                                .cornerRadius(12)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                        }
                        
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Tên (*)")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(.appTextSecondary)
                            
                            TextField("Tên", text: $vm.ten)
                                .padding(12)
                                .background(Color.white)
                                .cornerRadius(12)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                        }
                    }
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Email liên hệ")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.appTextSecondary)
                        
                        TextField("Email", text: $vm.email)
                            .padding(12)
                            .background(Color.white)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Địa chỉ thường trú")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.appTextSecondary)
                        
                        TextField("Địa chỉ", text: $vm.diaChi)
                            .padding(12)
                            .background(Color.white)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                    }
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Người liên hệ khẩn cấp")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.appTextSecondary)
                        
                        TextField("Họ tên người thân", text: $vm.nguoiLienHeTen)
                            .padding(12)
                            .background(Color.white)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                    }
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Số điện thoại khẩn cấp")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.appTextSecondary)
                        
                        TextField("SĐT người thân", text: $vm.nguoiLienHeDienThoai)
                            .padding(12)
                            .background(Color.white)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                            .keyboardType(.phonePad)
                    }
                    
                    if let err = vm.errorMessage {
                        Text(err)
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                    
                    AppButton(
                        title: "Lưu Thay Đổi",
                        icon: "checkmark",
                        style: .primary,
                        isLoading: vm.isUpdating
                    ) {
                        Task {
                            await vm.updateProfile()
                            if vm.updateSuccess {
                                dismiss()
                            }
                        }
                    }
                    .padding(.top, 10)
                }
                .padding(20)
            }
            .background(Color.appBackground.ignoresSafeArea())
            .navigationTitle("Chỉnh Sửa Hồ Sơ")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Hủy") { dismiss() }
                }
            }
        }
    }
}
