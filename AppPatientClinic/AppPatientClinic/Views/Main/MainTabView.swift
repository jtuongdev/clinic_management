import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(selectedTab: $selectedTab)
                .tabItem {
                    Label("Trang chủ", systemImage: selectedTab == 0 ? "house.fill" : "house")
                }
                .tag(0)
            
            BookingFlowView()
                .tabItem {
                    Label("Đặt khám", systemImage: selectedTab == 1 ? "calendar.badge.plus" : "calendar")
                }
                .tag(1)
            
            AppointmentsListView()
                .tabItem {
                    Label("Lịch hẹn", systemImage: selectedTab == 2 ? "clock.badge.checkmark.fill" : "clock")
                }
                .tag(2)
            
            HealthRecordsView()
                .tabItem {
                    Label("Sổ y bạ", systemImage: selectedTab == 3 ? "doc.text.image.fill" : "doc.text.image")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Label("Cá nhân", systemImage: selectedTab == 4 ? "person.crop.circle.fill" : "person.crop.circle")
                }
                .tag(4)
        }
        .tint(Color.appPrimary)
    }
}
