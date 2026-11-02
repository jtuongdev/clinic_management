import SwiftUI

struct VisitDetailView: View {
    let visit: VisitItem
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Header card
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("Lượt khám #\(visit.id)")
                                .font(.system(size: 16, weight: .bold, design: .monospaced))
                                .foregroundColor(.appPrimary)
                            Spacer()
                            Text(String(visit.ngayKham.prefix(10)))
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        
                        Text(visit.chanDoanChinh.isEmpty ? "Khám bệnh định kỳ" : visit.chanDoanChinh)
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.appTextPrimary)
                        
                        if let lyDo = visit.lyDoKham, !lyDo.isEmpty {
                            Text("Lý do khám: \(lyDo)")
                                .font(.caption)
                                .foregroundColor(.appTextSecondary)
                        }
                    }
                    .padding(18)
                    .background(Color.white)
                    .cornerRadius(18)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                    
                    // Thông tin bác sĩ & khoa
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Thông tin chuyên môn")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.appTextPrimary)
                        
                        HStack {
                            Text("Bác sĩ khám:")
                                .font(.subheadline)
                                .foregroundColor(.appTextSecondary)
                            Spacer()
                            Text(visit.bacSiKham)
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.appTextPrimary)
                        }
                        
                        Divider()
                        
                        HStack {
                            Text("Chuyên khoa:")
                                .font(.subheadline)
                                .foregroundColor(.appTextSecondary)
                            Spacer()
                            Text(visit.khoaKham)
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.appTextPrimary)
                        }
                        
                        Divider()
                        
                        HStack {
                            Text("Trạng thái:")
                                .font(.subheadline)
                                .foregroundColor(.appTextSecondary)
                            Spacer()
                            Text(visit.trangThaiText)
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.appSecondary)
                        }
                    }
                    .padding(18)
                    .background(Color.white)
                    .cornerRadius(18)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                }
                .padding(16)
            }
            .background(Color.appBackground.ignoresSafeArea())
            .navigationTitle("Chi Tiết Lượt Khám")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Đóng") { dismiss() }
                }
            }
        }
    }
}
