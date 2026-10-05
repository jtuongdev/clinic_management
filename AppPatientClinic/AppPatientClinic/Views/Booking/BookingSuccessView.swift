import SwiftUI

struct BookingSuccessView: View {
    let appointment: AppointmentItem
    let onDone: () -> Void
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                // Success Badge
                VStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(Color.appSecondary.opacity(0.15))
                            .frame(width: 80, height: 80)
                        
                        Circle()
                            .fill(Color.appSecondary)
                            .frame(width: 64, height: 64)
                        
                        Image(systemName: "checkmark")
                            .font(.system(size: 30, weight: .bold))
                            .foregroundColor(.white)
                    }
                    
                    Text("Đặt Lịch Khám Thành Công!")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.appTextPrimary)
                    
                    Text("Vui lòng lưu lại mã lịch hẹn hoặc xuất trình mã QR tại quầy tiếp đón khi đến khám.")
                        .font(.subheadline)
                        .foregroundColor(.appTextSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
                .padding(.top, 20)
                
                // QR & Code Card
                VStack(spacing: 16) {
                    Text("MÃ LỊCH HẸN")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.appTextSecondary)
                    
                    Text("#\(appointment.id)")
                        .font(.system(size: 26, weight: .heavy, design: .monospaced))
                        .foregroundColor(.appPrimary)
                    
                    QRCodeView(text: "APPT-\(appointment.id)-\(appointment.maBenhNhan)", size: 180)
                    
                    Divider()
                        .padding(.vertical, 4)
                    
                    VStack(spacing: 10) {
                        DetailRow(icon: "calendar", title: "Thời gian", value: "\(appointment.ngayHen) \(appointment.khungGio)")
                        DetailRow(icon: "person.text.rectangle", title: "Bác sĩ", value: appointment.tenBacSi)
                        DetailRow(icon: "cross.case", title: "Chuyên khoa", value: appointment.tenKhoa)
                        DetailRow(icon: "building.2", title: "Cơ sở", value: appointment.tenCoSo)
                    }
                }
                .padding(20)
                .background(Color.white)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.06), radius: 10, y: 3)
                .padding(.horizontal, 20)
                
                // Nút hoàn tất
                AppButton(title: "Hoàn tất & Về trang chủ", icon: "house.fill", style: .primary) {
                    onDone()
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
        }
    }
}

private struct DetailRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(.appPrimary)
                .frame(width: 20)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.appTextSecondary)
            
            Spacer()
            
            Text(value)
                .font(.footnote)
                .fontWeight(.semibold)
                .foregroundColor(.appTextPrimary)
        }
    }
}
