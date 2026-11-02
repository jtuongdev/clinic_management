//
//  APIClient.swift
//  AppPatientClinic
//

import Foundation

typealias APIError = NetworkError

enum NetworkError: LocalizedError {
    case invalidURL
    case serverError(String)
    case unauthorized
    case decodingError(String)
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Đường dẫn máy chủ không hợp lệ"
        case .serverError(let msg): return msg
        case .unauthorized: return "Phiên đăng nhập đã hết hạn"
        case .decodingError(let detail): return "Lỗi xử lý dữ liệu: \(detail)"
        case .unknown: return "Đã xảy ra lỗi không xác định"
        }
    }
}

struct ApiResponse<T: Decodable>: Decodable {
    let success: Bool?
    let data: T?
    let message: String?
}

// Bỏ qua kiểm tra chứng chỉ SSL tự ký của localhost trong môi trường dev/simulator
final class LocalhostURLSessionDelegate: NSObject, URLSessionDelegate {
    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        if let host = challenge.protectionSpace.host as String?,
           (host == "localhost" || host == "127.0.0.1"),
           challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
           let serverTrust = challenge.protectionSpace.serverTrust {
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
        } else {
            completionHandler(.performDefaultHandling, nil)
        }
    }
}

@MainActor
final class APIClient {
    static let shared = APIClient()
    
    // Simulator dùng localhost. Thiết bị thật phải trỏ tới IP LAN của máy chạy API,
    // đặt qua UserDefaults key "api_base_url" (vd: https://192.168.1.10:7081/api/v1).
    private var baseURL: String {
        #if targetEnvironment(simulator)
        return "https://localhost:7081/api/v1"
        #else
        return UserDefaults.standard.string(forKey: "api_base_url") ?? "https://localhost:7081/api/v1"
        #endif
    }
    
    private let session: URLSession
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config, delegate: LocalhostURLSessionDelegate(), delegateQueue: nil)
    }
    
    private struct RefreshTokenRequest: Encodable {
        let refreshToken: String
    }
    
    /// Dùng refresh token để lấy phiên mới. Trả về true nếu thành công.
    private func refreshAccessToken() async -> Bool {
        guard let refresh = AuthManager.shared.refreshToken, !refresh.isEmpty else { return false }
        do {
            let response: PatientAuthResponse = try await request(
                endpoint: "patient-auth/refresh-token",
                method: "POST",
                body: RefreshTokenRequest(refreshToken: refresh),
                requiresAuth: false,
                isRetry: true
            )
            AuthManager.shared.saveAuth(response: response)
            return true
        } catch {
            return false
        }
    }
    
    func get<T: Decodable>(
        endpoint: String,
        requiresAuth: Bool = true
    ) async throws -> T {
        try await request(endpoint: endpoint, method: "GET", body: nil, requiresAuth: requiresAuth)
    }
    
    func post<T: Decodable>(
        endpoint: String,
        body: (any Encodable)? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        try await request(endpoint: endpoint, method: "POST", body: body, requiresAuth: requiresAuth)
    }
    
    func put<T: Decodable>(
        endpoint: String,
        body: (any Encodable)? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        try await request(endpoint: endpoint, method: "PUT", body: body, requiresAuth: requiresAuth)
    }
    
    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: (any Encodable)? = nil,
        requiresAuth: Bool = true,
        isRetry: Bool = false
    ) async throws -> T {
        let cleanEndpoint = endpoint.hasPrefix("/") ? String(endpoint.dropFirst()) : endpoint
        guard let url = URL(string: "\(baseURL)/\(cleanEndpoint)") else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        if requiresAuth, let token = AuthManager.shared.accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            let encoder = JSONEncoder()
            request.httpBody = try encoder.encode(body)
            if var bodyString = String(data: request.httpBody!, encoding: .utf8) {
                // Che mật khẩu trong log
                bodyString = bodyString.replacingOccurrences(
                    of: "\"(?i:password)\"\\s*:\\s*\"(?:[^\"\\\\]|\\\\.)*\"",
                    with: "\"password\":\"***\"",
                    options: .regularExpression
                )
                print("➡️ [APIClient] \(method) \(url.absoluteString) Body: \(bodyString)")
            }
        } else {
            print("➡️ [APIClient] \(method) \(url.absoluteString)")
        }
        
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            print("❌ [APIClient] Connection error: \(error)")
            throw NetworkError.serverError("Không thể kết nối đến máy chủ (\(error.localizedDescription)). Vui lòng kiểm tra lại mạng hoặc backend.")
        }
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.unknown
        }
        
        let responseString = String(data: data, encoding: .utf8) ?? ""
        print("⬅️ [APIClient] Status: \(httpResponse.statusCode), Response: \(responseString)")
        
        if httpResponse.statusCode == 401 {
            // Request không cần auth (đăng nhập...): trả thông báo thực của backend, không đăng xuất
            if !requiresAuth {
                let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
                let msg = (obj?["message"] as? String) ?? (obj?["title"] as? String) ?? "Sai tài khoản hoặc mật khẩu"
                throw NetworkError.serverError(msg)
            }
            // Thử làm mới token một lần rồi gọi lại
            if !isRetry, await refreshAccessToken() {
                return try await self.request(endpoint: endpoint, method: method, body: body, requiresAuth: requiresAuth, isRetry: true)
            }
            AuthManager.shared.logout()
            throw NetworkError.unauthorized
        }
        
        // Xử lý khi HTTP status không thành công (4xx, 5xx)
        if httpResponse.statusCode < 200 || httpResponse.statusCode >= 300 {
            if let errorObj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                // ASP.NET Core Validation ProblemDetails (errors dict)
                if let errorsDict = errorObj["errors"] as? [String: [String]] {
                    let allMessages = errorsDict.values.flatMap { $0 }.joined(separator: "\n")
                    throw NetworkError.serverError(allMessages)
                } else if let errorsDictAny = errorObj["errors"] as? [String: Any] {
                    var msgs: [String] = []
                    for (_, val) in errorsDictAny {
                        if let arr = val as? [String] {
                            msgs.append(contentsOf: arr)
                        } else if let s = val as? String {
                            msgs.append(s)
                        }
                    }
                    if !msgs.isEmpty {
                        throw NetworkError.serverError(msgs.joined(separator: "\n"))
                    }
                }
                
                if let message = errorObj["message"] as? String {
                    throw NetworkError.serverError(message)
                }
                if let title = errorObj["title"] as? String {
                    throw NetworkError.serverError(title)
                }
            }
            throw NetworkError.serverError("Máy chủ trả về mã lỗi: \(httpResponse.statusCode)")
        }
        
        // Giải mã JSON thành công
        do {
            let decoder = JSONDecoder()
            // Thử decode ApiResponse bọc ngoài
            if let decodedResponse = try? decoder.decode(ApiResponse<T>.self, from: data) {
                if let dataContent = decodedResponse.data {
                    return dataContent
                }
                if decodedResponse.success == true, T.self == String.self {
                    return (decodedResponse.message ?? "Thành công") as! T
                }
                if let msg = decodedResponse.message, decodedResponse.success == false {
                    throw NetworkError.serverError(msg)
                }
            }
            
            // Hoặc decode trực tiếp kiểu T
            let directResult = try decoder.decode(T.self, from: data)
            return directResult
        } catch let err as NetworkError {
            throw err
        } catch {
            print("❌ [APIClient] Decode error: \(error)")
            throw NetworkError.decodingError(error.localizedDescription)
        }
    }
}
