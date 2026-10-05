import SwiftUI

struct BookingFlowView: View {
    @StateObject private var vm = BookingViewModel()
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()
                
                if vm.isSuccess, let res = vm.bookingResult {
                    BookingSuccessView(appointment: res) {
                        vm.reset()
                    }
                } else {
                    VStack(spacing: 0) {
                        // Step Indicator
                        StepIndicatorView(currentStep: vm.currentStep)
                            .padding(.vertical, 12)
                            .background(Color.white)
                        
                        Divider()
                        
                        // Content based on step
                        ScrollView(showsIndicators: false) {
                            VStack(spacing: 20) {
                                switch vm.currentStep {
                                case 0:
                                    Step1FacilityAndSpecialty(vm: vm)
                                case 1:
                                    Step2SelectDoctor(vm: vm)
                                case 2:
                                    Step3SelectDateTime(vm: vm)
                                case 3:
                                    Step4ConfirmBooking(vm: vm)
                                default:
                                    EmptyView()
                                }
                            }
                            .padding(20)
                        }
                        
                        // Bottom Action Bar
                        BottomActionBar(vm: vm)
                    }
                }
            }
            .navigationTitle("Đặt Lịch Khám")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await vm.loadInitialData()
            }
        }
    }
}

// MARK: - Step Indicator
private struct StepIndicatorView: View {
    let currentStep: Int
    let steps = ["Cơ sở & Khoa", "Bác sĩ", "Thời gian", "Xác nhận"]
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(0..<steps.count, id: \.self) { idx in
                VStack(spacing: 4) {
                    ZStack {
                        Circle()
                            .fill(idx <= currentStep ? Color.appPrimary : Color.gray.opacity(0.2))
                            .frame(width: 28, height: 28)
                        
                        if idx < currentStep {
                            Image(systemName: "checkmark")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                        } else {
                            Text("\(idx + 1)")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(idx == currentStep ? .white : .gray)
                        }
                    }
                    
                    Text(steps[idx])
                        .font(.system(size: 10, weight: idx == currentStep ? .bold : .medium))
                        .foregroundColor(idx <= currentStep ? .appPrimary : .gray)
                }
                .frame(maxWidth: .infinity)
                
                if idx < steps.count - 1 {
                    Rectangle()
                        .fill(idx < currentStep ? Color.appPrimary : Color.gray.opacity(0.2))
                        .frame(height: 2)
                        .padding(.horizontal, -8)
                        .padding(.bottom, 16)
                }
            }
        }
        .padding(.horizontal, 20)
    }
}

// MARK: - Step 1: Cơ sở & Chuyên khoa
private struct Step1FacilityAndSpecialty: View {
    @ObservedObject var vm: BookingViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Chọn Cơ sở
            VStack(alignment: .leading, spacing: 10) {
                Text("1. Chọn Chi nhánh / Cơ sở khám")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.appTextPrimary)
                
                ForEach(vm.facilities) { fac in
                    Button(action: { vm.selectedFacility = fac }) {
                        HStack(spacing: 12) {
                            Image(systemName: "building.2.crop.circle.fill")
                                .font(.title2)
                                .foregroundColor(vm.selectedFacility?.id == fac.id ? .appPrimary : .gray)
                            
                            VStack(alignment: .leading, spacing: 3) {
                                Text(fac.ten)
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.appTextPrimary)
                                
                                Text(fac.diaChi)
                                    .font(.caption)
                                    .foregroundColor(.appTextSecondary)
                            }
                            
                            Spacer()
                            
                            if vm.selectedFacility?.id == fac.id {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.appPrimary)
                            }
                        }
                        .padding(14)
                        .background(Color.white)
                        .cornerRadius(14)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(vm.selectedFacility?.id == fac.id ? Color.appPrimary : Color.clear, lineWidth: 2)
                        )
                    }
                }
            }
            
            // Chọn Chuyên khoa
            VStack(alignment: .leading, spacing: 10) {
                Text("2. Chọn Chuyên khoa khám")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.appTextPrimary)
                
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(vm.specialties) { spec in
                        Button(action: { vm.selectedSpecialty = spec }) {
                            VStack(spacing: 8) {
                                Image(systemName: "cross.fill")
                                    .font(.title3)
                                    .foregroundColor(vm.selectedSpecialty?.id == spec.id ? .white : .appPrimary)
                                
                                Text(spec.ten)
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(vm.selectedSpecialty?.id == spec.id ? .white : .appTextPrimary)
                                    .multilineTextAlignment(.center)
                                    .lineLimit(2)
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 80)
                            .padding(8)
                            .background(vm.selectedSpecialty?.id == spec.id ? Color.appPrimary : Color.white)
                            .cornerRadius(14)
                            .shadow(color: Color.black.opacity(0.03), radius: 6, y: 2)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Step 2: Chọn Bác sĩ
private struct Step2SelectDoctor: View {
    @ObservedObject var vm: BookingViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Chọn Bác sĩ phụ trách")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.appTextPrimary)
            
            if vm.isLoading {
                ProgressView("Đang tải danh sách bác sĩ...")
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 30)
            } else if vm.doctors.isEmpty {
                EmptyStateView(
                    icon: "person.crop.circle.badge.exclamationmark",
                    title: "Chưa có bác sĩ trong chuyên khoa này",
                    subtitle: "Vui lòng quay lại và chọn chuyên khoa khác."
                )
            } else {
                ForEach(vm.doctors) { doc in
                    Button(action: { vm.selectedDoctor = doc }) {
                        HStack(spacing: 14) {
                            Circle()
                                .fill(LinearGradient(
                                    colors: [Color.appSecondary.opacity(0.7), Color.appSecondary],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ))
                                .frame(width: 54, height: 54)
                                .overlay(
                                    Image(systemName: "person.fill")
                                        .font(.title2)
                                        .foregroundColor(.white)
                                )
                            
                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Text(doc.hoTen)
                                        .font(.system(size: 15, weight: .bold))
                                        .foregroundColor(.appTextPrimary)
                                    
                                    if let hocVi = doc.hocHamHocVi {
                                        Text(hocVi)
                                            .font(.caption2)
                                            .fontWeight(.semibold)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Color.appSecondary.opacity(0.12))
                                            .foregroundColor(.appSecondary)
                                            .cornerRadius(4)
                                    }
                                }
                                
                                Text(doc.chuyenKhoa ?? doc.moTa ?? "Bác sĩ chuyên khoa")
                                    .font(.caption)
                                    .foregroundColor(.appTextSecondary)
                                    .lineLimit(2)
                            }
                            
                            Spacer()
                            
                            if vm.selectedDoctor?.id == doc.id {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.appPrimary)
                                    .font(.title3)
                            }
                        }
                        .padding(14)
                        .background(Color.white)
                        .cornerRadius(16)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(vm.selectedDoctor?.id == doc.id ? Color.appPrimary : Color.clear, lineWidth: 2)
                        )
                    }
                }
            }
        }
        .task {
            await vm.loadDoctors()
        }
    }
}

// MARK: - Step 3: Chọn Ngày & Slot 30 phút
private struct Step3SelectDateTime: View {
    @ObservedObject var vm: BookingViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Chọn Ngày & Khung giờ khám")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.appTextPrimary)
            
            // Date picker
            VStack(alignment: .leading, spacing: 8) {
                Text("Ngày khám dự kiến")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.appTextSecondary)
                
                DatePicker("Chọn ngày", selection: $vm.selectedDate, in: Date()..., displayedComponents: .date)
                    .datePickerStyle(.graphical)
                    .environment(\.locale, Locale(identifier: "vi_VN"))
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(16)
                    .onChange(of: vm.selectedDate) { _, _ in
                        Task {
                            await vm.loadSlots()
                        }
                    }
            }
            
            // Available slots
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("Khung giờ trống")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.appTextPrimary)
                    
                    Spacer()
                    
                    Text("30 phút / lượt")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
                
                if vm.isLoadingSlots {
                    ProgressView("Đang kiểm tra ca trực...")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                } else if vm.availableSlots.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .font(.title2)
                            .foregroundColor(.gray)
                        Text("Bác sĩ không có lịch trống trong ngày này.")
                            .font(.caption)
                            .foregroundColor(.appTextSecondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 24)
                    .background(Color.white)
                    .cornerRadius(14)
                } else {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                        ForEach(vm.availableSlots) { slot in
                            Button(action: {
                                if slot.conTrong {
                                    vm.selectedSlot = slot
                                }
                            }) {
                                VStack(spacing: 4) {
                                    Text(slot.label)
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundColor(
                                            !slot.conTrong ? .gray :
                                            vm.selectedSlot?.id == slot.id ? .white : .appTextPrimary
                                        )
                                    
                                    Text(slot.conTrong ? "Còn chỗ" : "Hết chỗ")
                                        .font(.system(size: 10))
                                        .foregroundColor(
                                            !slot.conTrong ? .gray.opacity(0.7) :
                                            vm.selectedSlot?.id == slot.id ? .white.opacity(0.9) : .appSecondary
                                        )
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(
                                    !slot.conTrong ? Color.gray.opacity(0.12) :
                                    vm.selectedSlot?.id == slot.id ? Color.appPrimary : Color.white
                                )
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(
                                            vm.selectedSlot?.id == slot.id ? Color.appPrimary : Color.gray.opacity(0.15),
                                            lineWidth: 1
                                        )
                                )
                            }
                            .disabled(!slot.conTrong)
                        }
                    }
                }
            }
        }
        .task {
            await vm.loadSlots()
        }
    }
}

// MARK: - Step 4: Xác nhận & Triệu chứng
private struct Step4ConfirmBooking: View {
    @ObservedObject var vm: BookingViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Xác nhận thông tin đặt khám")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.appTextPrimary)
            
            // Thẻ tóm tắt thông tin
            VStack(spacing: 12) {
                SummaryRow(label: "Cơ sở", value: vm.selectedFacility?.ten ?? "Phòng khám Đa Khoa")
                Divider()
                SummaryRow(label: "Chuyên khoa", value: vm.selectedSpecialty?.ten ?? "Đa khoa")
                Divider()
                SummaryRow(label: "Bác sĩ", value: vm.selectedDoctor?.hoTen ?? "Bác sĩ trực")
                Divider()
                SummaryRow(label: "Thời gian", value: vm.selectedSlot?.label ?? "")
                Divider()
                SummaryRow(label: "Tiền đặt cọc", value: "100.000 đ (Thu tại quầy)", valueColor: .appSecondary)
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            
            // Nhập triệu chứng / Lý do khám
            VStack(alignment: .leading, spacing: 8) {
                Text("Mô tả triệu chứng / Lý do khám (*)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.appTextSecondary)
                
                TextEditor(text: $vm.lyDoKham)
                    .frame(height: 90)
                    .padding(8)
                    .background(Color.white)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2), lineWidth: 1))
            }
            
            // Ghi chú chính sách hủy lịch
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "info.circle.fill")
                    .foregroundColor(.appPrimary)
                    .font(.subheadline)
                
                Text("Chính sách: Quý khách có thể tự hủy lịch khám trước giờ bắt đầu tối thiểu 2 tiếng. Sau thời gian này, vui lòng liên hệ hotline phòng khám.")
                    .font(.caption)
                    .foregroundColor(.appTextSecondary)
                    .lineSpacing(2)
            }
            .padding(12)
            .background(Color.appPrimaryLight.opacity(0.3))
            .cornerRadius(12)
            
            if let err = vm.errorMessage {
                Text(err)
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
    }
}

private struct SummaryRow: View {
    let label: String
    let value: String
    var valueColor: Color = .appTextPrimary
    
    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.appTextSecondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(valueColor)
        }
    }
}

// MARK: - Bottom Action Bar
private struct BottomActionBar: View {
    @ObservedObject var vm: BookingViewModel
    
    var isNextEnabled: Bool {
        switch vm.currentStep {
        case 0: return vm.selectedFacility != nil && vm.selectedSpecialty != nil
        case 1: return vm.selectedDoctor != nil
        case 2: return vm.selectedSlot != nil
        case 3: return true
        default: return false
        }
    }
    
    var body: some View {
        HStack(spacing: 12) {
            if vm.currentStep > 0 {
                Button(action: { vm.currentStep -= 1 }) {
                    Text("Quay lại")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.appTextPrimary)
                        .padding(.vertical, 14)
                        .padding(.horizontal, 20)
                        .background(Color.gray.opacity(0.12))
                        .cornerRadius(14)
                }
            }
            
            if vm.currentStep < 3 {
                Button(action: { vm.currentStep += 1 }) {
                    Text("Tiếp tục")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(isNextEnabled ? Color.appPrimary : Color.gray.opacity(0.3))
                        .cornerRadius(14)
                }
                .disabled(!isNextEnabled)
            } else {
                AppButton(
                    title: "Xác Nhận Đặt Lịch",
                    icon: "calendar.badge.checkmark",
                    style: .secondary,
                    isLoading: vm.isSubmitting
                ) {
                    Task {
                        await vm.submitBooking()
                    }
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color.white)
        .shadow(color: Color.black.opacity(0.04), radius: 6, y: -2)
    }
}
