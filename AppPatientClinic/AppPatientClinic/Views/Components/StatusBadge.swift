//
//  StatusBadge.swift
//  AppPatientClinic
//

import SwiftUI

struct StatusBadge: View {
    let text: String
    var statusType: BadgeType = .info
    
    enum BadgeType {
        case success
        case warning
        case danger
        case info
        case neutral
        
        var fgColor: Color {
            switch self {
            case .success: return AppTheme.emerald
            case .warning: return AppTheme.amber
            case .danger: return AppTheme.rose
            case .info: return AppTheme.primary
            case .neutral: return AppTheme.textSecondary
            }
        }
        
        var bgColor: Color {
            switch self {
            case .success: return AppTheme.emeraldLight
            case .warning: return AppTheme.amberLight
            case .danger: return AppTheme.roseLight
            case .info: return AppTheme.primaryLight
            case .neutral: return AppTheme.background
            }
        }
    }
    
    init(text: String, statusType: BadgeType = .info) {
        self.text = text
        self.statusType = statusType
    }
    
    init(status: String) {
        switch status {
        case "CHO_KHAM", "SAP_TOI":
            self.text = "Sắp tới"
            self.statusType = .info
        case "DA_XAC_NHAN":
            self.text = "Đã xác nhận"
            self.statusType = .info
        case "DANG_KHAM":
            self.text = "Đang khám"
            self.statusType = .warning
        case "HOAN_THANH", "DA_KHAM":
            self.text = "Đã khám"
            self.statusType = .success
        case "DA_HUY":
            self.text = "Đã hủy"
            self.statusType = .danger
        default:
            self.text = status
            self.statusType = .neutral
        }
    }
    
    var body: some View {
        Text(text)
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(statusType.fgColor)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(statusType.bgColor)
            .clipShape(Capsule())
    }
}

struct AppButton: View {
    enum ButtonStyle {
        case primary
        case secondary
        case danger
        
        var bgColor: Color {
            switch self {
            case .primary: return AppTheme.primary
            case .secondary: return AppTheme.emerald
            case .danger: return AppTheme.rose
            }
        }
    }
    
    let title: String
    var icon: String? = nil
    var style: ButtonStyle = .primary
    var isLoading: Bool = false
    var action: () -> Void
    
    init(
        title: String,
        icon: String? = nil,
        style: ButtonStyle = .primary,
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.style = style
        self.isLoading = false
        self.isLoading = isLoading
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                            .font(.system(size: 16, weight: .semibold))
                    }
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(style.bgColor)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .shadow(color: style.bgColor.opacity(0.3), radius: 6, x: 0, y: 3)
        }
        .disabled(isLoading)
    }
}
