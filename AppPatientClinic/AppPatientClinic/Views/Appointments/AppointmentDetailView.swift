import SwiftUI

struct AppointmentDetailView: View {
    let appointment: AppointmentItem
    let onDismiss: () -> Void
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // QR Check-in Box
                    VStack(spacing: 12) {
                        QRCodeView(text: "APPT-\(appointment.id)-\(appointment.maBenhNhan)", size: 190)
                        
                        Text("#\(appointment.id)")
                            .font(.system(size: 20, weight: .bold, design: .monospaced))
                            .foregroundColor(.appPrimary)
                        
                        StatusBadge(status: appointment.trangThai)
                    }
                    .padding(20)
                    .background(Color.white)
                    .cornerRadius(20)
                    .shadow(color: Color.black.opacity(0.04), radius: 8, y: 3)
                    
                    // Detailed Information
                    VStack(spacing: 14) {
                        Text("Thông tin lịch hẹn")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.appTextPrimary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        InfoRow(icon: "calendar", title: "Ngày khám", value: appointment.ngayHen)
                        Divider()
                        InfoRow(icon: "clock", title: "Khung giờ", value: appointment.khungGio)
                        Divider()
                        InfoRow(icon: "person.text.rectangle", title: "Bác sĩ", value: appointment.tenBacSi)
                        Divider()
                        InfoRow(icon: "cross.fill", title: "Chuyên khoa", value: appointment.tenKhoa)
                        Divider()
                        InfoRow(icon: "building.2", title: "Cơ sở", value: appointment.tenCoSo)
                        Divider()
                        InfoRow(icon: "dollarsign.circle", title: "Tiền đặt cọc", value: "\(Int(appointment.chiPhiGiuCho).formatted()) đ")
                        
                        if !appointment.lyDo.isEmpty {
                            Divider()
                            InfoRow(icon: "text.bubble", title: "Lý do khám", value: appointment.lyDo)
                        }
                        
                        if let ghiChu = appointment.ghiChuHuy {
                            Divider()
                            InfoRow(icon: "exclamationmark.circle", title: "Lý do hủy", value: ghiChu)
                        }
                    }
                    .padding(18)
                    .background(Color.white)
                    .cornerRadius(18)
                    .shadow(color: Color.black.opacity(0.04), radius: 8, y: 3)
                }
                .padding(20)
            }
            .background(Color.appBackground.ignoresSafeArea())
            .navigationTitle("Chi Tiết Lịch Hẹn")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Đóng") {
                        dismiss()
                    }
                }
            }
        }
    }
}

private struct InfoRow: View {
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
