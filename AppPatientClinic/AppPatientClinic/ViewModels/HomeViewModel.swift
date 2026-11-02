import Foundation
import Combine

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var profile: PatientProfile?
    @Published var upcomingAppointment: AppointmentItem?
    @Published var specialties: [BookingSpecialty] = []
    @Published var featuredDoctors: [BookingDoctor] = []
    
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func loadDashboard() async {
        isLoading = true
        errorMessage = nil
        
        async let profileTask: () = loadProfile()
        async let appointmentTask: () = loadUpcomingAppointment()
        async let specialtiesTask: () = loadSpecialties()
        async let doctorsTask: () = loadDoctors()
        
        _ = await (profileTask, appointmentTask, specialtiesTask, doctorsTask)
        isLoading = false
    }
    
    private func loadProfile() async {
        do {
            let res: PatientProfile = try await APIClient.shared.get(
                endpoint: "patient/me/profile"
            )
            self.profile = res
        } catch {
            print("Error loading profile: \(error)")
        }
    }
    
    private func loadUpcomingAppointment() async {
        do {
            let res: PagedResponse<AppointmentItem> = try await APIClient.shared.get(
                endpoint: "patient/booking/appointments?statusGroup=SAP_TOI&pageSize=5"
            )
            self.upcomingAppointment = res.items.first
        } catch {
            print("Error loading upcoming appointment: \(error)")
        }
    }
    
    private func loadSpecialties() async {
        do {
            let list: [BookingSpecialty] = try await APIClient.shared.get(
                endpoint: "patient/booking/specialties"
            )
            self.specialties = list
        } catch {
            print("Error loading specialties: \(error)")
        }
    }
    
    private func loadDoctors() async {
        do {
            let list: [BookingDoctor] = try await APIClient.shared.get(
                endpoint: "patient/booking/doctors"
            )
            self.featuredDoctors = Array(list.prefix(6))
        } catch {
            print("Error loading doctors: \(error)")
        }
    }
}
