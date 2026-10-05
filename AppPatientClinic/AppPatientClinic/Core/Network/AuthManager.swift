//
//  AuthManager.swift
//  AppPatientClinic
//

import Foundation
import Combine

@MainActor
final class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isAuthenticated: Bool = false
    @Published var currentPatient: PatientInfo? = nil
    
    private let tokenKey = "patient_access_token"
    private let refreshTokenKey = "patient_refresh_token"
    private let patientInfoKey = "patient_profile_cache"
    
    private init() {
        if let token = UserDefaults.standard.string(forKey: tokenKey), !token.isEmpty {
            self.isAuthenticated = true
            if let data = UserDefaults.standard.data(forKey: patientInfoKey),
               let patient = try? JSONDecoder().decode(PatientInfo.self, from: data) {
                self.currentPatient = patient
            }
        }
    }
    
    var accessToken: String? {
        UserDefaults.standard.string(forKey: tokenKey)
    }
    
    var refreshToken: String? {
        UserDefaults.standard.string(forKey: refreshTokenKey)
    }
    
    func saveAuth(response: PatientAuthResponse) {
        setSession(
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            patient: response.patient
        )
    }
    
    func setSession(accessToken: String, refreshToken: String, patient: PatientInfo) {
        UserDefaults.standard.setValue(accessToken, forKey: tokenKey)
        UserDefaults.standard.setValue(refreshToken, forKey: refreshTokenKey)
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
        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: refreshTokenKey)
        UserDefaults.standard.removeObject(forKey: patientInfoKey)
        self.currentPatient = nil
        self.isAuthenticated = false
    }
}
