import Foundation
import Combine

enum AppointmentFilterStatus: String, CaseIterable, Identifiable {
    case all = "Tất cả"
    case sapToi = "Sắp tới"
    case daKham = "Đã khám"
    case daHuy = "Đã hủy"
    
    var id: String { self.rawValue }
    
    var apiQueryValue: String? {
        switch self {
        case .all: return nil
        case .sapToi: return "SAP_TOI"
        case .daKham: return "DA_KHAM"
        case .daHuy: return "DA_HUY"
        }
    }
}

@MainActor
final class AppointmentsViewModel: ObservableObject {
    @Published var selectedFilter: AppointmentFilterStatus = .sapToi
    @Published var appointments: [AppointmentItem] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // Cancel appointment state
    @Published var selectedAppointmentToCancel: AppointmentItem?
    @Published var cancelReason: String = ""
    @Published var isCancelling = false
    @Published var cancelSuccess = false
    
    func loadAppointments() async {
        isLoading = true
        errorMessage = nil
        
        var query = ""
        if let apiVal = selectedFilter.apiQueryValue {
            query = "?statusGroup=\(apiVal)&pageSize=30"
        } else {
            query = "?pageSize=30"
        }
        
        do {
            let res: PagedResponse<AppointmentItem> = try await APIClient.shared.get(
                endpoint: "patient/booking/appointments\(query)"
            )
            self.appointments = res.items
        } catch {
            self.errorMessage = "Không thể tải danh sách lịch hẹn: \(error.localizedDescription)"
        }
        isLoading = false
    }
    
    func cancelAppointment() async {
        guard let appt = selectedAppointmentToCancel else { return }
        guard !cancelReason.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            errorMessage = "Vui lòng nhập lý do hủy lịch khám"
            return
        }
        
        isCancelling = true
        errorMessage = nil
        
        let req = CancelAppointmentRequest(lyDoHuy: cancelReason)
        do {
            let _: String = try await APIClient.shared.put(
                endpoint: "patient/booking/appointments/\(appt.id)/cancel",
                body: req
            )
            cancelSuccess = true
            selectedAppointmentToCancel = nil
            cancelReason = ""
            await loadAppointments()
        } catch let apiError as NetworkError {
            errorMessage = apiError.localizedDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        isCancelling = false
    }
}
