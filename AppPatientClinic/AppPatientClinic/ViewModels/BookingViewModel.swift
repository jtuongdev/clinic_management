import Foundation
import Combine

@MainActor
final class BookingViewModel: ObservableObject {
    // Flow steps: 0: Cơ sở & Chuyên khoa, 1: Bác sĩ, 2: Thời gian & Slot, 3: Xác nhận & Đặt
    @Published var currentStep = 0
    
    // Master data
    @Published var facilities: [BookingFacility] = []
    @Published var specialties: [BookingSpecialty] = []
    @Published var doctors: [BookingDoctor] = []
    @Published var availableSlots: [TimeSlot] = []
    
    // Selections
    @Published var selectedFacility: BookingFacility?
    @Published var selectedSpecialty: BookingSpecialty?
    @Published var selectedDoctor: BookingDoctor?
    @Published var selectedDate: Date = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
    @Published var selectedSlot: TimeSlot?
    @Published var lyDoKham: String = ""
    
    // State
    @Published var isLoading = false
    @Published var isLoadingSlots = false
    @Published var isSubmitting = false
    @Published var errorMessage: String?
    @Published var bookingResult: AppointmentItem?
    @Published var isSuccess = false
    
    func loadInitialData() async {
        isLoading = true
        errorMessage = nil
        
        async let facTask: () = loadFacilities()
        async let specTask: () = loadSpecialties()
        
        _ = await (facTask, specTask)
        isLoading = false
    }
    
    func loadFacilities() async {
        do {
            let list: [BookingFacility] = try await APIClient.shared.get(
                endpoint: "patient/booking/facilities"
            )
            self.facilities = list
            if self.selectedFacility == nil, let first = list.first {
                self.selectedFacility = first
            }
        } catch {
            print("Error loading facilities: \(error)")
        }
    }
    
    func loadSpecialties() async {
        do {
            let list: [BookingSpecialty] = try await APIClient.shared.get(
                endpoint: "patient/booking/specialties"
            )
            self.specialties = list
        } catch {
            print("Error loading specialties: \(error)")
        }
    }
    
    func loadDoctors() async {
        isLoading = true
        var queryItems: [String] = []
        if let specId = selectedSpecialty?.id {
            queryItems.append("maKhoa=\(specId)")
        }
        if let facId = selectedFacility?.id {
            queryItems.append("maCoSo=\(facId)")
        }
        
        let queryString = queryItems.isEmpty ? "" : "?" + queryItems.joined(separator: "&")
        do {
            let list: [BookingDoctor] = try await APIClient.shared.get(
                endpoint: "patient/booking/doctors\(queryString)"
            )
            self.doctors = list
        } catch {
            errorMessage = "Không thể tải danh sách bác sĩ: \(error.localizedDescription)"
        }
        isLoading = false
    }
    
    func loadSlots() async {
        guard let doctor = selectedDoctor else { return }
        isLoadingSlots = true
        selectedSlot = nil
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateStr = formatter.string(from: selectedDate)
        
        do {
            let list: [TimeSlot] = try await APIClient.shared.get(
                endpoint: "patient/booking/doctors/\(doctor.id)/slots?date=\(dateStr)"
            )
            self.availableSlots = list
        } catch {
            self.availableSlots = []
            print("Error loading slots: \(error)")
        }
        isLoadingSlots = false
    }
    
    func submitBooking() async {
        guard let slot = selectedSlot else {
            errorMessage = "Vui lòng chọn khung giờ khám"
            return
        }
        
        guard let doctor = selectedDoctor else {
            errorMessage = "Vui lòng chọn bác sĩ khám"
            return
        }
        
        guard let facility = selectedFacility else {
            errorMessage = "Vui lòng chọn cơ sở khám"
            return
        }
        
        isSubmitting = true
        errorMessage = nil
        
        let req = CreateAppointmentRequest(
            maBacSi: doctor.id,
            maCoSo: facility.id,
            maKhoa: selectedSpecialty?.id,
            thoiGianBatDau: slot.thoiGianBatDau,
            thoiGianKetThuc: slot.thoiGianKetThuc,
            lyDo: lyDoKham.isEmpty ? "Khám theo yêu cầu" : lyDoKham
        )
        
        do {
            let result: AppointmentItem = try await APIClient.shared.post(
                endpoint: "patient/booking/appointments",
                body: req
            )
            self.bookingResult = result
            self.isSuccess = true
        } catch let apiError as NetworkError {
            self.errorMessage = apiError.localizedDescription
        } catch {
            self.errorMessage = error.localizedDescription
        }
        
        isSubmitting = false
    }
    
    func reset() {
        currentStep = 0
        selectedSpecialty = nil
        selectedDoctor = nil
        selectedSlot = nil
        lyDoKham = ""
        bookingResult = nil
        isSuccess = false
        errorMessage = nil
    }
}
