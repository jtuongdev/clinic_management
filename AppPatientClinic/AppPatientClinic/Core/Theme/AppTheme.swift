//
//  AppTheme.swift
//  AppPatientClinic
//

import SwiftUI

enum AppTheme {
    // MARK: - Colors
    static let primary = Color(red: 2/255, green: 132/255, blue: 199/255) // #0284C7 Sky Blue
    static let primaryDark = Color(red: 3/255, green: 105/255, blue: 161/255) // #0369A1
    static let primaryLight = Color(red: 224/255, green: 242/255, blue: 254/255) // #E0F2FE
    
    static let secondary = Color(red: 14/255, green: 165/255, blue: 233/255)
    static let emerald = Color(red: 5/255, green: 150/255, blue: 105/255) // #059669
    static let emeraldLight = Color(red: 209/255, green: 250/255, blue: 229/255)
    
    static let amber = Color(red: 217/255, green: 119/255, blue: 6/255) // #D97706
    static let amberLight = Color(red: 254/255, green: 243/255, blue: 199/255)
    
    static let rose = Color(red: 225/255, green: 29/255, blue: 72/255) // #E11D48
    static let roseLight = Color(red: 255/255, green: 228/255, blue: 230/255)
    
    static let background = Color(red: 248/255, green: 250/255, blue: 252/255) // #F8FAFC
    static let cardBackground = Color.white
    
    static let textPrimary = Color(red: 15/255, green: 23/255, blue: 42/255) // #0F172A
    static let textSecondary = Color(red: 100/255, green: 116/255, blue: 139/255) // #64748B
    static let border = Color(red: 226/255, green: 232/255, blue: 240/255) // #E2E8F0
}

extension Color {
    static let appPrimary = AppTheme.primary
    static let appPrimaryDark = AppTheme.primaryDark
    static let appPrimaryLight = AppTheme.primaryLight
    static let appSecondary = AppTheme.emerald
    static let appSecondaryLight = AppTheme.emeraldLight
    static let appBackground = AppTheme.background
    static let appCardBackground = AppTheme.cardBackground
    static let appTextPrimary = AppTheme.textPrimary
    static let appTextSecondary = AppTheme.textSecondary
    static let appBorder = AppTheme.border
    
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

struct CardModifier: ViewModifier {
    var padding: CGFloat = 16
    var cornerRadius: CGFloat = 16
    
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(AppTheme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 3)
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(AppTheme.border, lineWidth: 1)
            )
    }
}

extension View {
    func appCard(padding: CGFloat = 16, cornerRadius: CGFloat = 16) -> some View {
        self.modifier(CardModifier(padding: padding, cornerRadius: cornerRadius))
    }
}
