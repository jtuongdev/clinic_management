import Foundation
import Combine

enum RecordTab: String, CaseIterable, Identifiable {
    case visits = "Lượt khám"
    case prescriptions = "Đơn thuốc"
    case labResults = "Xét nghiệm / CĐHA"
    case invoices = "Hóa đơn"
    
    var id: String { self.rawValue }
    
    var iconName: String {
        switch self {
        case .visits: return "stethoscope"
        case .prescriptions: return "pills.fill"
        case .labResults: return "waveform.path.ecg.rectangle"
        case .invoices: return "creditcard.fill"
        }
    }
}

@MainActor
final class HealthRecordsViewModel: ObservableObject {
    @Published var selectedTab: RecordTab = .visits
    
    @Published var visits: [VisitItem] = []
    @Published var prescriptions: [PrescriptionItem] = []
    @Published var labResults: [LabResultItem] = []
    @Published var invoices: [InvoiceItem] = []
    
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let pageQuery = "?pageIndex=1&pageSize=50"
    
    func loadCurrentTab() async {
        isLoading = true
        errorMessage = nil
        
        switch selectedTab {
        case .visits:
            visits = await fetchPaged("patient/me/visits", label: "lượt khám") ?? visits
        case .prescriptions:
            prescriptions = await fetchPaged("patient/me/prescriptions", label: "đơn thuốc") ?? prescriptions
        case .labResults:
            labResults = await fetchPaged("patient/me/lab-results", label: "kết quả xét nghiệm") ?? labResults
        case .invoices:
            invoices = await fetchPaged("patient/me/invoices", label: "hóa đơn") ?? invoices
        }
        
        isLoading = false
    }
    
    /// Tất cả API sổ y bạ trả về PagedResult<T> -> lấy items.
    private func fetchPaged<T: Codable>(_ endpoint: String, label: String) async -> [T]? {
        do {
            let res: PagedResponse<T> = try await APIClient.shared.get(endpoint: endpoint + pageQuery)
            return res.items
        } catch {
            errorMessage = "Không thể tải \(label): \(error.localizedDescription)"
            return nil
        }
    }
}
