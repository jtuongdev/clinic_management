import SwiftUI

struct ProfileView: View {
    @StateObject private var vm = ProfileViewModel()
    @State private var showEditProfile = false
    @State private var showLogoutConfirm = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()
                
                if vm.isLoading && vm.profile == nil {
                    VStack(spacing: 12) {
                        ProgressView()
                            .scaleEffect(1.2)
                        Text("Đang đồng bộ hồ sơ từ phòng khám...")
                            .font(.caption)
                            .foregroundColor(.appTextSecondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 20) {
                            // User Avatar & Name Card
                            VStack(spacing: 12) {
                                Circle()
                                    .fill(LinearGradient(
                                        colors: [Color.appPrimary, Color.appPrimaryDark],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ))
                                    .frame(width: 76, height: 76)
                                    .overlay(
                                        Text(vm.profile?.hoTen.prefix(1) ?? "B")
                                            .font(.system(size: 32, weight: .bold))
                                            .foregroundColor(.white)
                                    )
                                    .shadow(color: Color.appPrimary.opacity(0.3), radius: 8, y: 4)
                                
                                VStack(spacing: 4) {
                                    Text(vm.profile?.hoTen ?? "Họ và tên")
                                        .font(.system(size: 20, weight: .bold))
                                        .foregroundColor(.appTextPrimary)
                                    
                                    if let maBN = vm.profile?.maBenhNhanNoiBo, !maBN.isEmpty {
                                        Text("Mã bệnh nhân: \(maBN)")
                                            .font(.system(size: 13, weight: .semibold, design: .monospaced))
                                            .foregroundColor(.appPrimary)
                                    }
                                }
                                
                                Button(action: { showEditProfile = true }) {
                                    HStack(spacing: 6) {
                                        Image(systemName: "pencil")
                                        .font(.caption)
                                    Text("Chỉnh sửa thông tin")
                                        .font(.system(size: 13, weight: .semibold))
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.appPrimaryLight.opacity(0.3))
                                .foregroundColor(.appPrimary)
                                .cornerRadius(20)
                            }
                            .padding(.top, 4)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(20)
                        .background(Color.white)
                        .cornerRadius(20)
                        .shadow(color: Color.black.opacity(0.04), radius: 8, y: 3)
                        .padding(.horizontal, 20)
                        .padding(.top, 10)
                        
                        // Thẻ BHYT Điện Tử
                        if let bhyt = vm.profile?.soBhyt, !bhyt.isEmpty {
                            BHYTCard(
                                soBhyt: bhyt,
                                hoTen: vm.profile?.hoTen ?? "",
                                hanSuDung: vm.profile?.hanSuDungBhyt
                            )
                            .padding(.horizontal, 20)
                        } else if let bh = vm.profile?.baoHiems?.first {
                            BHYTCard(
                                soBhyt: bh.soThe,
                                hoTen: vm.profile?.hoTen ?? "",
                                hanSuDung: bh.ngayKetThuc
                            )
                            .padding(.horizontal, 20)
                        }
                        
                        // Thông tin hành chính
                        VStack(spacing: 12) {
                            Text("Thông tin định danh")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(.appTextPrimary)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            
                            ProfileRow(icon: "person.text.rectangle", title: "CCCD / CMND", value: vm.profile?.soCCCD ?? "Chưa cập nhật")
                            Divider()
                            ProfileRow(icon: "calendar", title: "Ngày sinh", value: DateText.ngay(vm.profile?.ngaySinh))
                            Divider()
                            ProfileRow(icon: "figure.stand", title: "Giới tính", value: vm.profile?.gioiTinhHienThi ?? "Chưa rõ")
                            Divider()
                            ProfileRow(icon: "phone.fill", title: "Số điện thoại", value: vm.profile?.dienThoai ?? "--")
                            Divider()
                            ProfileRow(icon: "envelope.fill", title: "Email", value: vm.profile?.email ?? "Chưa cập nhật")
                            Divider()
                            ProfileRow(icon: "house.fill", title: "Địa chỉ", value: vm.profile?.diaChi ?? "Chưa cập nhật")
                        }
                        .padding(18)
                        .background(Color.white)
                        .cornerRadius(18)
                        .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                        .padding(.horizontal, 20)
                        
                        // Thông tin người thân liên hệ khẩn cấp
                        if let nguoiThan = vm.profile?.nguoiLienHeTen, !nguoiThan.isEmpty {
                            VStack(spacing: 12) {
                                Text("Người liên hệ khẩn cấp")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(.appTextPrimary)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                
                                ProfileRow(icon: "person.2.fill", title: "Họ tên người thân", value: nguoiThan)
                                if let sdtThan = vm.profile?.nguoiLienHeDienThoai, !sdtThan.isEmpty {
                                    Divider()
                                    ProfileRow(icon: "phone.badge.waveform.fill", title: "Số điện thoại", value: sdtThan)
                                }
                            }
                            .padding(18)
                            .background(Color.white)
                            .cornerRadius(18)
                            .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                            .padding(.horizontal, 20)
                        }
                        
                        // Tiền sử bệnh & Dị ứng
                        if vm.profile?.tienSuBenh != nil || vm.profile?.tienSuDiUng != nil || vm.profile?.tienSuBenhs != nil {
                            VStack(spacing: 12) {
                                Text("Tiền sử y khoa")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(.appTextPrimary)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                
                                if let tienSu = vm.profile?.tienSuBenh, !tienSu.isEmpty {
                                    ProfileRow(icon: "heart.text.square", title: "Bệnh lý nền", value: tienSu)
                                }
                                
                                if let diUng = vm.profile?.tienSuDiUng, !diUng.isEmpty {
                                    Divider()
                                    ProfileRow(icon: "exclamationmark.shield", title: "Dị ứng thuốc", value: diUng)
                                }
                                
                                if let list = vm.profile?.tienSuBenhs, !list.isEmpty {
                                    ForEach(list) { item in
                                        Divider()
                                        ProfileRow(icon: "cross.vial", title: item.loai, value: "\(item.ten) (\(item.ghiChu ?? ""))")
                                    }
                                }
                            }
                            .padding(18)
                            .background(Color.white)
                            .cornerRadius(18)
                            .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                            .padding(.horizontal, 20)
                        }
                        
                        // Nút Đăng xuất
                        Button(action: { showLogoutConfirm = true }) {
                            HStack {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                Text("Đăng xuất tài khoản")
                                    .fontWeight(.semibold)
                            }
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color.red.opacity(0.08))
                            .cornerRadius(14)
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 30)
                    }
                }
                .refreshable {
                    await vm.loadProfile()
                }
            }
        }
        .navigationTitle("Hồ Sơ Cá Nhân")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showEditProfile) {
                EditProfileView(vm: vm)
            }
            .confirmationDialog("Bạn có chắc chắn muốn đăng xuất?", isPresented: $showLogoutConfirm, titleVisibility: .visible) {
                Button("Đăng xuất", role: .destructive) {
                    vm.logout()
                }
                Button("Hủy", role: .cancel) {}
            }
            .task {
                await vm.loadProfile()
            }
        }
    }
}

// MARK: - BHYT Card Component
private struct BHYTCard: View {
    let soBhyt: String
    let hoTen: String
    let hanSuDung: String?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "cross.fill")
                        .foregroundColor(.white)
                        .font(.caption)
                    Text("BẢO HIỂM Y TẾ VIỆT NAM")
                        .font(.system(size: 11, weight: .heavy))
                        .foregroundColor(.white)
                }
                Spacer()
                Image(systemName: "qrcode")
                    .foregroundColor(.white)
                    .font(.title3)
            }
            
            Text(soBhyt)
                .font(.system(size: 20, weight: .heavy, design: .monospaced))
                .foregroundColor(.white)
                .tracking(2)
            
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("HỌ VÀ TÊN")
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundColor(.white.opacity(0.8))
                    Text(hoTen.uppercased())
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                if let han = hanSuDung {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("HẠN SỬ DỤNG")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundColor(.white.opacity(0.8))
                        Text(String(han.prefix(10)))
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
            }
        }
        .padding(18)
        .background(
            LinearGradient(
                colors: [Color(hex: "#059669"), Color(hex: "#047857")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(18)
        .shadow(color: Color(hex: "#059669").opacity(0.3), radius: 8, y: 4)
    }
}

private struct ProfileRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(.appPrimary)
                .frame(width: 20)
                .padding(.top, 2)
            
            Text(title)
                .font(.subheadline)
                .foregroundColor(.appTextSecondary)
            
            Spacer()
            
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.appTextPrimary)
                .multilineTextAlignment(.trailing)
        }
    }
}
