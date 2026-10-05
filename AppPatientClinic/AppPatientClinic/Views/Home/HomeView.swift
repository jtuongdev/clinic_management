import SwiftUI

struct HomeView: View {
    @StateObject private var vm = HomeViewModel()
    @Binding var selectedTab: Int
    @State private var showQRModal = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // MARK: - Header Profile & Welcome
                        HStack(spacing: 14) {
                            Circle()
                                .fill(LinearGradient(
                                    colors: [Color.appPrimary, Color.appPrimaryDark],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ))
                                .frame(width: 52, height: 52)
                                .overlay(
                                    Text(vm.profile?.hoTen.prefix(1) ?? "B")
                                        .font(.system(size: 22, weight: .bold))
                                        .foregroundColor(.white)
                                )
                                .shadow(color: Color.appPrimary.opacity(0.3), radius: 6, y: 3)
                            
                            VStack(alignment: .leading, spacing: 3) {
                                Text("Xin chào,")
                                    .font(.caption)
                                    .foregroundColor(.appTextSecondary)
                                
                                Text(vm.profile?.hoTen ?? "Bệnh nhân")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.appTextPrimary)
                                
                                if let maBN = vm.profile?.maBenhNhanNoiBo {
                                    Text("Mã BN: \(maBN)")
                                        .font(.system(size: 11, weight: .semibold))
                                        .foregroundColor(.appPrimary)
                                }
                            }
                            
                            Spacer()
                            
                            // Bell icon or Notification
                            Button(action: {}) {
                                ZStack {
                                    Circle()
                                        .fill(Color.white)
                                        .frame(width: 42, height: 42)
                                        .shadow(color: Color.black.opacity(0.06), radius: 6, y: 2)
                                    
                                    Image(systemName: "bell.fill")
                                        .foregroundColor(.appTextPrimary)
                                        .font(.system(size: 18))
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 12)
                        
                        // MARK: - Upcoming Appointment Card
                        if let appt = vm.upcomingAppointment {
                            UpcomingCard(appointment: appt) {
                                showQRModal = true
                            }
                            .padding(.horizontal, 20)
                        } else {
                            // Quick Booking Banner
                            QuickBookingBanner {
                                selectedTab = 1 // Switch to Booking tab
                            }
                            .padding(.horizontal, 20)
                        }
                        
                        // MARK: - Quick Action Shortcuts
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Dịch vụ y tế")
                                .font(.system(size: 17, weight: .bold))
                                .foregroundColor(.appTextPrimary)
                                .padding(.horizontal, 20)
                            
                            HStack(spacing: 12) {
                                QuickActionItem(title: "Đặt lịch khám", icon: "calendar.badge.plus", color: .appPrimary) {
                                    selectedTab = 1
                                }
                                QuickActionItem(title: "Lịch hẹn", icon: "clock.badge.checkmark", color: .appSecondary) {
                                    selectedTab = 2
                                }
                                QuickActionItem(title: "Sổ y bạ", icon: "doc.text.image.fill", color: Color(hex: "#8B5CF6")) {
                                    selectedTab = 3
                                }
                                QuickActionItem(title: "Hồ sơ BHYT", icon: "person.text.rectangle.fill", color: Color(hex: "#F59E0B")) {
                                    selectedTab = 4
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                        
                        // MARK: - Chuyên khoa phòng khám
                        VStack(alignment: .leading, spacing: 14) {
                            SectionHeader(title: "Chuyên khoa khám", actionTitle: "Đặt khám") {
                                selectedTab = 1
                            }
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 14) {
                                    ForEach(vm.specialties) { spec in
                                        SpecialtyCard(specialty: spec) {
                                            selectedTab = 1
                                        }
                                    }
                                }
                                .padding(.horizontal, 20)
                                .padding(.vertical, 4)
                            }
                        }
                        
                        // MARK: - Đội ngũ bác sĩ tiêu biểu
                        if !vm.featuredDoctors.isEmpty {
                            VStack(alignment: .leading, spacing: 14) {
                                SectionHeader(title: "Bác sĩ tiêu biểu", actionTitle: "Xem thêm") {
                                    selectedTab = 1
                                }
                                
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 14) {
                                        ForEach(vm.featuredDoctors) { doc in
                                            DoctorMiniCard(doctor: doc) {
                                                selectedTab = 1
                                            }
                                        }
                                    }
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 4)
                                }
                            }
                        }
                        
                        // MARK: - Health Tips / Info Card
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Image(systemName: "shield.lefthalf.filled.badge.checkmark")
                                    .foregroundColor(.appSecondary)
                                    .font(.title3)
                                Text("Lưu ý khi đi khám")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(.appTextPrimary)
                            }
                            
                            Text("Quý khách vui lòng đến trước giờ hẹn 15 phút và xuất trình mã QR Check-in trên app tại quầy tiếp đón để được ưu tiên phân luồng khám nhanh.")
                                .font(.system(size: 13))
                                .foregroundColor(.appTextSecondary)
                                .lineSpacing(3)
                        }
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(16)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 24)
                    }
                }
                .refreshable {
                    await vm.loadDashboard()
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showQRModal) {
                if let appt = vm.upcomingAppointment {
                    QRCheckInSheet(appointment: appt)
                }
            }
            .task {
                await vm.loadDashboard()
            }
        }
    }
}

// MARK: - Upcoming Appointment Card Component
private struct UpcomingCard: View {
    let appointment: AppointmentItem
    let onShowQR: () -> Void
    
    var body: some View {
        VStack(spacing: 14) {
            HStack {
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.appSecondary)
                        .frame(width: 8, height: 8)
                    Text("LỊCH KHÁM SẮP TỚI")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.appSecondary)
                }
                Spacer()
                Text("Mã: #\(appointment.id)")
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.appPrimaryLight.opacity(0.3))
                    .foregroundColor(.appPrimary)
                    .cornerRadius(6)
            }
            
            Divider()
            
            HStack(spacing: 14) {
                VStack(alignment: .center, spacing: 4) {
                    Image(systemName: "calendar")
                        .font(.title2)
                        .foregroundColor(.appPrimary)
                    Text(appointment.ngayHen)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.appTextPrimary)
                    Text(appointment.khungGio)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.appPrimaryDark)
                }
                .padding(10)
                .background(Color.appPrimaryLight.opacity(0.2))
                .cornerRadius(12)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(appointment.tenBacSi)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.appTextPrimary)
                    
                    Text(appointment.tenKhoa)
                        .font(.system(size: 13))
                        .foregroundColor(.appTextSecondary)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.caption2)
                            .foregroundColor(.gray)
                        Text(appointment.tenCoSo)
                            .font(.caption)
                            .foregroundColor(.gray)
                            .lineLimit(1)
                    }
                }
                Spacer()
            }
            
            Button(action: onShowQR) {
                HStack(spacing: 8) {
                    Image(systemName: "qrcode")
                        .font(.system(size: 16, weight: .bold))
                    Text("Xem mã QR Tiếp đón")
                        .font(.system(size: 14, weight: .semibold))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.appPrimary)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(18)
        .shadow(color: Color.black.opacity(0.06), radius: 10, y: 3)
    }
}

// MARK: - Quick Booking Banner
private struct QuickBookingBanner: View {
    let onBook: () -> Void
    
    var body: some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Bạn cần khám bệnh?")
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Chọn chuyên khoa và đặt lịch khám nhanh chóng chỉ trong vài thao tác.")
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.9))
                    .lineLimit(2)
                
                Button(action: onBook) {
                    Text("Đặt lịch ngay")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.appPrimary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.white)
                        .cornerRadius(10)
                }
                .padding(.top, 4)
            }
            
            Spacer()
            
            Image(systemName: "calendar.badge.clock")
                .font(.system(size: 50))
                .foregroundColor(.white.opacity(0.85))
        }
        .padding(18)
        .background(
            LinearGradient(
                colors: [Color.appPrimary, Color.appPrimaryDark],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(18)
        .shadow(color: Color.appPrimary.opacity(0.3), radius: 8, y: 4)
    }
}

// MARK: - Quick Action Item
private struct QuickActionItem: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(color.opacity(0.12))
                        .frame(height: 52)
                    
                    Image(systemName: icon)
                        .font(.system(size: 22))
                        .foregroundColor(color)
                }
                
                Text(title)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.appTextPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(height: 28)
            }
            .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - Specialty Card
private struct SpecialtyCard: View {
    let specialty: BookingSpecialty
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 10) {
                Circle()
                    .fill(Color.appPrimaryLight.opacity(0.3))
                    .frame(width: 52, height: 52)
                    .overlay(
                        Image(systemName: "cross.fill")
                            .font(.system(size: 22))
                            .foregroundColor(.appPrimary)
                    )
                
                Text(specialty.ten)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.appTextPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(width: 88, height: 36)
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(14)
            .shadow(color: Color.black.opacity(0.03), radius: 6, y: 2)
        }
    }
}

// MARK: - Doctor Mini Card
private struct DoctorMiniCard: View {
    let doctor: BookingDoctor
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Circle()
                    .fill(LinearGradient(
                        colors: [Color.appSecondary.opacity(0.7), Color.appSecondary],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: "person.crop.circle.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.white)
                    )
                
                VStack(spacing: 2) {
                    Text(doctor.hoTen)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.appTextPrimary)
                        .lineLimit(1)
                    
                    Text(doctor.chuyenKhoa ?? doctor.hocHamHocVi ?? "Bác sĩ khám")
                        .font(.system(size: 11))
                        .foregroundColor(.appTextSecondary)
                        .lineLimit(1)
                }
            }
            .frame(width: 120)
            .padding(12)
            .background(Color.white)
            .cornerRadius(14)
            .shadow(color: Color.black.opacity(0.03), radius: 6, y: 2)
        }
    }
}

// MARK: - QR Check-In Sheet
private struct QRCheckInSheet: View {
    let appointment: AppointmentItem
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 22) {
            HStack {
                Spacer()
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title2)
                        .foregroundColor(.gray.opacity(0.6))
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            
            Text("Mã QR Tiếp Đón")
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.appTextPrimary)
            
            Text("Quét mã này tại Kiosk hoặc đưa cho nhân viên tiếp đón tại phòng khám để nhận số thứ tự.")
                .font(.footnote)
                .foregroundColor(.appTextSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            QRCodeView(text: "APPT-\(appointment.id)-\(appointment.maBenhNhan)", size: 210)
                .padding(10)
            
            VStack(spacing: 6) {
                Text("#\(appointment.id)")
                    .font(.system(size: 20, weight: .bold, design: .monospaced))
                    .foregroundColor(.appPrimary)
                
                Text("\(appointment.ngayHen) • \(appointment.khungGio)")
                    .font(.subheadline)
                    .foregroundColor(.appTextPrimary)
                
                Text(appointment.tenBacSi)
                    .font(.caption)
                    .foregroundColor(.appTextSecondary)
            }
            .padding(.top, 4)
            
            Spacer()
        }
    }
}
