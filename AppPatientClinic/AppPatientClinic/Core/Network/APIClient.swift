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
    
    #if targetEnvironment(simulator)
    private let baseURL = "https://localhost:7081/api/v1"
    #else
    private let baseURL = "https://localhost:7081/api/v1"
    #endif
    
    private let session: URLSession
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config, delegate: LocalhostURLSessionDelegate(), delegateQueue: nil)
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
        requiresAuth: Bool = true
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
            if let bodyString = String(data: request.httpBody!, encoding: .utf8) {
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
