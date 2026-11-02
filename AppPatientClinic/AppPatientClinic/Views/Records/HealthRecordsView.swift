import SwiftUI

struct HealthRecordsView: View {
    @StateObject private var vm = HealthRecordsViewModel()
    @State private var selectedVisit: VisitItem?
    @State private var selectedPrescription: PrescriptionItem?
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Segmented Tabs
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(RecordTab.allCases) { tab in
                                Button(action: {
                                    vm.selectedTab = tab
                                    Task { await vm.loadCurrentTab() }
                                }) {
                                    HStack(spacing: 6) {
                                        Image(systemName: tab.iconName)
                                            .font(.caption)
                                        Text(tab.rawValue)
                                            .font(.system(size: 13, weight: vm.selectedTab == tab ? .bold : .medium))
                                    }
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 8)
                                    .background(vm.selectedTab == tab ? Color.appPrimary : Color.white)
                                    .foregroundColor(vm.selectedTab == tab ? .white : .appTextSecondary)
                                    .cornerRadius(20)
                                    .shadow(color: Color.black.opacity(0.03), radius: 4, y: 1)
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    }
                    .background(Color.white)
                    
                    Divider()
                    
                    // Tab content
                    if vm.isLoading {
                        ProgressView("Đang tải dữ liệu hồ sơ...")
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                        ScrollView(showsIndicators: false) {
                            VStack(spacing: 14) {
                                switch vm.selectedTab {
                                case .visits:
                                    VisitsListView(visits: vm.visits) { visit in
                                        selectedVisit = visit
                                    }
                                case .prescriptions:
                                    PrescriptionsListView(prescriptions: vm.prescriptions) { pres in
                                        selectedPrescription = pres
                                    }
                                case .labResults:
                                    LabResultsListView(results: vm.labResults)
                                case .invoices:
                                    InvoicesListView(invoices: vm.invoices)
                                }
                            }
                            .padding(16)
                        }
                    }
                }
            }
            .navigationTitle("Sổ Y Bạ Điện Tử")
            .navigationBarTitleDisplayMode(.inline)
            .refreshable {
                await vm.loadCurrentTab()
            }
            .sheet(item: $selectedVisit) { visit in
                VisitDetailView(visit: visit)
            }
            .sheet(item: $selectedPrescription) { pres in
                PrescriptionDetailView(prescription: pres)
            }
            .task {
                await vm.loadCurrentTab()
            }
        }
    }
}

// MARK: - Tab 1: Visits List
private struct VisitsListView: View {
    let visits: [VisitItem]
    let onSelect: (VisitItem) -> Void
    
    var body: some View {
        if visits.isEmpty {
            EmptyStateView(
                icon: "stethoscope",
                title: "Chưa có lượt khám nào",
                subtitle: "Lịch sử các lần khám bệnh của bạn sẽ được lưu trữ tự động tại đây."
            )
        } else {
            ForEach(visits) { visit in
                Button(action: { onSelect(visit) }) {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text(String(visit.ngayKham.prefix(10)))
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.appPrimary)
                            Spacer()
                            Text(visit.trangThaiText)
                                .font(.caption2)
                                .fontWeight(.bold)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.appSecondary.opacity(0.12))
                                .foregroundColor(.appSecondary)
                                .cornerRadius(6)
                        }
                        
                        Divider()
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(visit.chanDoanChinh.isEmpty ? "Khám bệnh định kỳ" : visit.chanDoanChinh)
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(.appTextPrimary)
                                .lineLimit(2)
                            
                            Text("Bác sĩ: \(visit.bacSiKham)")
                                .font(.caption)
                                .foregroundColor(.appTextSecondary)
                            
                            Text("Khoa: \(visit.khoaKham)")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

// MARK: - Tab 2: Prescriptions List
private struct PrescriptionsListView: View {
    let prescriptions: [PrescriptionItem]
    let onSelect: (PrescriptionItem) -> Void
    
    var body: some View {
        if prescriptions.isEmpty {
            EmptyStateView(
                icon: "pills.fill",
                title: "Chưa có đơn thuốc nào",
                subtitle: "Các toa thuốc điện tử do bác sĩ kê sẽ hiển thị tại đây."
            )
        } else {
            ForEach(prescriptions) { pres in
                Button(action: { onSelect(pres) }) {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("Đơn thuốc #\(pres.id)")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.appPrimary)
                            Spacer()
                            Text(String(pres.ngayKe.prefix(10)))
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        
                        Divider()
                        
                        Text(pres.ghiChuText)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.appTextPrimary)
                        
                        HStack {
                            Text("Trạng thái: \(pres.trangThaiText)")
                                .font(.caption)
                                .foregroundColor(.appTextSecondary)
                            Spacer()
                            Text("\(pres.chiTiet?.count ?? 0) loại thuốc")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.appSecondary)
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

// MARK: - Tab 3: Lab Results List
private struct LabResultsListView: View {
    let results: [LabResultItem]
    
    var body: some View {
        if results.isEmpty {
            EmptyStateView(
                icon: "waveform.path.ecg.rectangle",
                title: "Chưa có kết quả xét nghiệm / CĐHA",
                subtitle: "Kết quả cận lâm sàng, X-quang, Siêu âm sẽ hiển thị tại đây."
            )
        } else {
            ForEach(results) { res in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text(res.tenDichVu)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.appTextPrimary)
                        Spacer()
                        Text(res.trangThaiText)
                            .font(.caption2)
                            .fontWeight(.bold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.appSecondary.opacity(0.12))
                            .foregroundColor(.appSecondary)
                            .cornerRadius(6)
                    }
                    
                    if let ketLuan = res.ketQua, !ketLuan.isEmpty {
                        Text("Kết quả: \(ketLuan)")
                            .font(.footnote)
                            .foregroundColor(.appTextSecondary)
                    }
                    
                    Divider()
                    
                    HStack {
                        Text(String(res.ngayChiDinh.prefix(10)))
                            .font(.caption2)
                            .foregroundColor(.gray)
                        Spacer()
                        Text(res.loaiDichVuText)
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }
                .padding(14)
                .background(Color.white)
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
            }
        }
    }
}

// MARK: - Tab 4: Invoices List
private struct InvoicesListView: View {
    let invoices: [InvoiceItem]
    
    var body: some View {
        if invoices.isEmpty {
            EmptyStateView(
                icon: "creditcard.fill",
                title: "Chưa có hóa đơn nào",
                subtitle: "Lịch sử thanh toán viện phí sẽ hiển thị tại đây."
            )
        } else {
            ForEach(invoices) { inv in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text(inv.soHoaDon)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.appPrimary)
                        Spacer()
                        Text(inv.trangThaiText)
                            .font(.caption2)
                            .fontWeight(.bold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(inv.trangThaiText.contains("DA_THANH_TOAN") || inv.trangThaiText.contains("Đã thanh toán") ? Color.appSecondary.opacity(0.12) : Color.orange.opacity(0.12))
                            .foregroundColor(inv.trangThaiText.contains("DA_THANH_TOAN") || inv.trangThaiText.contains("Đã thanh toán") ? .appSecondary : .orange)
                            .cornerRadius(6)
                    }
                    
                    Divider()
                    
                    HStack {
                        Text("Tổng thanh toán:")
                            .font(.subheadline)
                            .foregroundColor(.appTextSecondary)
                        Spacer()
                        Text("\(Int(inv.tongTien).formatted()) đ")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.appPrimaryDark)
                    }
                    
                    if inv.mienGiam > 0 || inv.baoHiemThanhToan > 0 {
                        HStack {
                            Text("BHYT & Miễn giảm:")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Spacer()
                            Text("-\(Int(inv.baoHiemThanhToan + inv.mienGiam).formatted()) đ")
                                .font(.caption)
                                .foregroundColor(.appSecondary)
                        }
                    }
                    
                    HStack {
                        Text("Ngày lập: \(String(inv.ngayPhatHanh.prefix(10)))")
                            .font(.caption2)
                            .foregroundColor(.gray)
                        Spacer()
                        Text("Đã trả: \(Int(inv.daThanhToanTien).formatted()) đ")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }
                .padding(14)
                .background(Color.white)
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
            }
        }
    }
}
