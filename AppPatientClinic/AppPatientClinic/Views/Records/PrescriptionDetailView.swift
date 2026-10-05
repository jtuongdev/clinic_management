import SwiftUI

struct PrescriptionDetailView: View {
    let prescription: PrescriptionItem
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Header Đơn thuốc
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("Toa thuốc #\(prescription.id)")
                                .font(.system(size: 16, weight: .bold, design: .monospaced))
                                .foregroundColor(.appPrimary)
                            Spacer()
                            Text(String(prescription.ngayKe.prefix(10)))
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        
                        Text(prescription.ghiChuText)
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.appTextPrimary)
                        
                        Text("Trạng thái: \(prescription.trangThaiText)")
                            .font(.caption)
                            .foregroundColor(.appSecondary)
                    }
                    .padding(18)
                    .background(Color.white)
                    .cornerRadius(18)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                    
                    // Danh sách thuốc
                    if let chiTiet = prescription.chiTiet, !chiTiet.isEmpty {
                        VStack(alignment: .leading, spacing: 14) {
                            Text("Danh sách thuốc (\(chiTiet.count))")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(.appTextPrimary)
                            
                            ForEach(Array(chiTiet.enumerated()), id: \.element.id) { index, item in
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack(alignment: .top) {
                                        Text("\(index + 1).")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(.appPrimary)
                                        
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(item.tenThuoc)
                                                .font(.system(size: 15, weight: .bold))
                                                .foregroundColor(.appTextPrimary)
                                            
                                            Text("Liều: \(item.lieuDung ?? "Theo chỉ định") - \(item.tanSuat ?? "")")
                                                .font(.caption)
                                                .foregroundColor(.appTextSecondary)
                                        }
                                        
                                        Spacer()
                                        
                                        Text("\(Int(item.soLuongKe ?? 0)) \(item.donViTinh ?? "")")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(.appPrimaryDark)
                                    }
                                    
                                    if let huongDan = item.huongDan, !huongDan.isEmpty {
                                        HStack(spacing: 6) {
                                            Image(systemName: "info.circle")
                                                .font(.caption2)
                                                .foregroundColor(.appSecondary)
                                            Text(huongDan)
                                                .font(.caption)
                                                .foregroundColor(.appTextSecondary)
                                        }
                                        .padding(.leading, 18)
                                    }
                                }
                                .padding(.vertical, 6)
                                
                                if index < chiTiet.count - 1 {
                                    Divider()
                                }
                            }
                        }
                        .padding(18)
                        .background(Color.white)
                        .cornerRadius(18)
                        .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                    }
                }
                .padding(16)
            }
            .background(Color.appBackground.ignoresSafeArea())
            .navigationTitle("Toa Thuốc Điện Tử")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Đóng") { dismiss() }
                }
            }
        }
    }
}
