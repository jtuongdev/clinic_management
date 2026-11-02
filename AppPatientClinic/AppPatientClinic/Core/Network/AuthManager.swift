//
//  AuthManager.swift
//  AppPatientClinic
//

import Foundation
import Combine
import Security

/// Lưu/đọc chuỗi bí mật trong Keychain
enum KeychainStore {
    private static let service = "AppPatientClinic.auth"
    
    static func set(_ value: String, for key: String) {
        let data = Data(value.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
        var add = query
        add[kSecValueData as String] = data
        add[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        SecItemAdd(add as CFDictionary, nil)
    }
    
    static func get(_ key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }
    
    static func remove(_ key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}

@MainActor
final class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isAuthenticated: Bool = false
    @Published var currentPatient: PatientInfo? = nil
    
    private let tokenKey = "patient_access_token"
    private let refreshTokenKey = "patient_refresh_token"
    private let patientInfoKey = "patient_profile_cache"
    
    private init() {
        // Di chuyển token cũ từ UserDefaults sang Keychain (nếu có)
        for key in [tokenKey, refreshTokenKey] {
            if let old = UserDefaults.standard.string(forKey: key) {
                KeychainStore.set(old, for: key)
                UserDefaults.standard.removeObject(forKey: key)
            }
        }
        if let token = KeychainStore.get(tokenKey), !token.isEmpty {
            self.isAuthenticated = true
            if let data = UserDefaults.standard.data(forKey: patientInfoKey),
               let patient = try? JSONDecoder().decode(PatientInfo.self, from: data) {
                self.currentPatient = patient
            }
        }
    }
    
    var accessToken: String? {
        KeychainStore.get(tokenKey)
    }
    
    var refreshToken: String? {
        KeychainStore.get(refreshTokenKey)
    }
    
    func saveAuth(response: PatientAuthResponse) {
        setSession(
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            patient: response.patient
        )
    }
    
    func setSession(accessToken: String, refreshToken: String, patient: PatientInfo) {
        KeychainStore.set(accessToken, for: tokenKey)
        KeychainStore.set(refreshToken, for: refreshTokenKey)
        if let encoded = try? JSONEncoder().encode(patient) {
            UserDefaults.standard.setValue(encoded, forKey: patientInfoKey)
        }
        
        self.currentPatient = patient
        self.isAuthenticated = true
    }
    
    func updatePatientProfile(_ patient: PatientInfo) {
        self.currentPatient = patient
        if let encoded = try? JSONEncoder().encode(patient) {
            UserDefaults.standard.setValue(encoded, forKey: patientInfoKey)
        }
    }
    
    func logout() {
        KeychainStore.remove(tokenKey)
        KeychainStore.remove(refreshTokenKey)
        UserDefaults.standard.removeObject(forKey: patientInfoKey)
        self.currentPatient = nil
        self.isAuthenticated = false
    }
}
