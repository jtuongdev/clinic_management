import SwiftUI

struct AppointmentsListView: View {
    @StateObject private var vm = AppointmentsViewModel()
    @State private var selectedAppointment: AppointmentItem?
    @State private var showCancelModal = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Filter Picker Segmented
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(AppointmentFilterStatus.allCases) { filter in
                                Button(action: {
                                    vm.selectedFilter = filter
                                    Task { await vm.loadAppointments() }
                                }) {
                                    Text(filter.rawValue)
                                        .font(.system(size: 13, weight: vm.selectedFilter == filter ? .bold : .medium))
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(vm.selectedFilter == filter ? Color.appPrimary : Color.white)
                                        .foregroundColor(vm.selectedFilter == filter ? .white : .appTextSecondary)
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
                    
                    // List
                    if vm.isLoading {
                        ProgressView("Đang tải danh sách lịch hẹn...")
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if vm.appointments.isEmpty {
                        EmptyStateView(
                            icon: "calendar.badge.clock",
                            title: "Không có lịch hẹn nào",
                            subtitle: "Bạn chưa có lịch khám trong danh mục này."
                        )
                        .frame(maxHeight: .infinity)
                    } else {
                        ScrollView(showsIndicators: false) {
                            LazyVStack(spacing: 14) {
                                ForEach(vm.appointments) { appt in
                                    AppointmentCard(appointment: appt) {
                                        selectedAppointment = appt
                                    } onCancel: {
                                        vm.selectedAppointmentToCancel = appt
                                        showCancelModal = true
                                    }
                                }
                            }
                            .padding(16)
                        }
                    }
                }
            }
            .navigationTitle("Lịch Khám Của Tôi")
            .navigationBarTitleDisplayMode(.inline)
            .refreshable {
                await vm.loadAppointments()
            }
            .sheet(item: $selectedAppointment) { appt in
                AppointmentDetailView(appointment: appt) {
                    Task { await vm.loadAppointments() }
                }
            }
            .sheet(isPresented: $showCancelModal) {
                CancelAppointmentSheet(vm: vm)
            }
            .task {
                await vm.loadAppointments()
            }
        }
    }
}

// MARK: - Appointment Card
private struct AppointmentCard: View {
    let appointment: AppointmentItem
    let onTap: () -> Void
    let onCancel: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    StatusBadge(status: appointment.trangThai)
                    Spacer()
                    Text("#\(appointment.id)")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.gray)
                }
                
                Divider()
                
                HStack(spacing: 12) {
                    VStack(alignment: .center, spacing: 2) {
                        Text(appointment.ngayHen)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.appPrimary)
                        Text(appointment.khungGio)
                            .font(.system(size: 13, weight: .heavy))
                            .foregroundColor(.appTextPrimary)
                    }
                    .padding(8)
                    .background(Color.appPrimaryLight.opacity(0.3))
                    .cornerRadius(10)
                    
                    VStack(alignment: .leading, spacing: 3) {
                        Text(appointment.tenBacSi)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.appTextPrimary)
                        
                        Text(appointment.tenKhoa)
                            .font(.caption)
                            .foregroundColor(.appTextSecondary)
                        
                        Text(appointment.tenCoSo)
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                }
                
                if !appointment.lyDo.isEmpty {
                    Text("Lý do: \(appointment.lyDo)")
                        .font(.caption)
                        .foregroundColor(.appTextSecondary)
                        .lineLimit(1)
                }
                
                // Nút hủy nhanh nếu là sắp tới và đủ điều kiện
                if appointment.coTheHuy {
                    HStack {
                        Spacer()
                        Button(action: onCancel) {
                            Text("Hủy lịch khám")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.red)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.red.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }
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

// MARK: - Cancel Sheet Modal
private struct CancelAppointmentSheet: View {
    @ObservedObject var vm: AppointmentsViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 20) {
            HStack {
                Text("Hủy Lịch Hẹn Khám")
                    .font(.headline)
                    .foregroundColor(.appTextPrimary)
                Spacer()
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                        .font(.title3)
                }
            }
            .padding(.top, 16)
            
            Text("Lưu ý: Chỉ cho phép hủy lịch trước giờ khám tối thiểu 2 tiếng. Sau khi hủy, khung giờ sẽ được mở lại cho bệnh nhân khác.")
                .font(.caption)
                .foregroundColor(.appTextSecondary)
                .multilineTextAlignment(.leading)
            
            VStack(alignment: .leading, spacing: 6) {
                Text("Lý do hủy khám (*)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.appTextSecondary)
                
                TextEditor(text: $vm.cancelReason)
                    .frame(height: 90)
                    .padding(8)
                    .background(Color.gray.opacity(0.06))
                    .cornerRadius(10)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.2), lineWidth: 1))
            }
            
            if let err = vm.errorMessage {
                Text(err)
                    .font(.caption)
                    .foregroundColor(.red)
            }
            
            AppButton(
                title: "Xác Nhận Hủy",
                icon: "trash.fill",
                style: .danger,
                isLoading: vm.isCancelling
            ) {
                Task {
                    await vm.cancelAppointment()
                    if vm.cancelSuccess {
                        dismiss()
                    }
                }
            }
            
            Spacer()
        }
        .padding(20)
    }
}
