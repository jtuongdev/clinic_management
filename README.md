# BÁO CÁO ĐỒ ÁN: HỆ THỐNG QUẢN LÝ PHÒNG KHÁM ĐA KHOA (CLINIC MANAGEMENT SYSTEM)

- Sinh viên thực hiện: Đặng Trọng Tường (J Tuong)
- Email: dangjtuong07@gmail.com
- Kho lưu trữ mã nguồn: https://github.com/jtuongdev/clinic_management
- Loại đề tài: Dự án cá nhân - Xây dựng hệ thống phần mềm y tế đa nền tảng (Web Enterprise + Mobile App + RESTful API)

---

## 1. GIỚI THIỆU ĐỀ TÀI VÀ MỤC TIÊU HỆ THỐNG

### 1.1. Bối cảnh và tính cấp thiết
Tại các cơ sở y tế và phòng khám đa khoa, việc quản lý thủ công hoặc sử dụng các phần mềm rời rạc thường dẫn đến tình trạng quá tải tại khâu tiếp đón, sai sót trong lưu chuyển hồ sơ bệnh án, khó khăn trong quản lý tồn kho dược phẩm và thiếu tính liên kết dữ liệu giữa các bộ phận: Bác sĩ khám - Dược sĩ cấp phát - Thu ngân viện phí - Bệnh nhân.

### 1.2. Mục tiêu nghiên cứu và phát triển
Đề tài tập trung thiết kế và triển khai một hệ thống quản lý tổng thể phòng khám (Clinic Management System) đồng bộ, đáp ứng tiêu chuẩn quản lý thông tin y tế thực tế, bao gồm:
- Chuẩn hóa quy trình tiếp đón, phân buồng khám và quản lý hàng đợi theo thời gian thực.
- Hỗ trợ công tác khám chữa bệnh của bác sĩ: Chẩn đoán theo mã bệnh quốc tế ICD-10, chỉ định cận lâm sàng, kê đơn thuốc điện tử, xử trí ra viện hoặc chuyển phòng.
- Tự động hóa quản trị vận hành: Quản lý nhân sự, phân ca trực, chấm công tự động, tính bảng lương, quản lý kho dược theo lô/hạn dùng và thu viện phí số hóa qua cổng VNPAY.
- Xây dựng kênh giao tiếp số cho người bệnh thông qua ứng dụng di động iOS (tra cứu bệnh án EMR, đặt lịch khám theo khung giờ).

---

## 2. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống được thiết kế theo mô hình Clean Architecture (Kiến trúc củ hành - Onion Architecture) kết hợp mẫu thiết kế CQRS (Command Query Responsibility Segregation) nhằm đảm bảo tính phân tách độc lập giữa logic nghiệp vụ, giao diện người dùng và cơ sở hạ tầng lưu trữ.

### 2.1. Phân tầng kiến trúc Backend (.NET 10 / C#)

1. Tầng Domain (ClinicManagement.Domain):
   - Là tầng trung tâm, độc lập hoàn toàn với các framework bên ngoài.
   - Chứa các thực thể cốt lõi (Entities), Aggregate Roots, kiểu dữ liệu giá trị (Value Objects), bảng mã danh mục (Enums) và giao diện định nghĩa Repository (IRepository).
   - Quản lý các quy tắc nghiệp vụ bất biến (Business Invariants) của từng phân vùng y tế.

2. Tầng Application (ClinicManagement.Application):
   - Chịu trách nhiệm điều phối luồng xử lý của hệ thống.
   - Áp dụng mẫu CQRS thông qua thư viện MediatR: Tách biệt rõ ràng giữa các tác vụ thay đổi trạng thái dữ liệu (Commands) và các tác vụ truy vấn dữ liệu (Queries).
   - Chứa DTO (Data Transfer Objects), AutoMapper profiles, logic kiểm tra dữ liệu đầu vào và các Service nghiệp vụ.

3. Tầng Infrastructure (ClinicManagement.Infrastructure):
   - Hiện thực hóa các giao diện Repository được khai báo ở tầng Domain.
   - Quản lý truy xuất dữ liệu thông qua Entity Framework Core 10 kết nối Microsoft SQL Server.
   - Triển khai cơ chế xác thực danh tính: JWT (JSON Web Token), mã hóa mật khẩu một chiều BCrypt.
   - Tích hợp dịch vụ bên thứ ba: Cổng thanh toán trực tuyến VNPAY Gateway (môi trường Sandbox), dịch vụ gửi thư điện tử thông báo tự động MailKit (SMTP).
   - Triển khai dịch vụ chạy nền (Background Service): AttendanceFinalizationWorker tự động chốt công nhân viên theo ca trực.

4. Tầng API / Presentation (ClinicManagement.API):
   - Điểm tiếp nhận yêu cầu từ các ứng dụng Client qua giao thức HTTPS.
   - Cung cấp hệ thống RESTful API được phân nhóm theo từng nghiệp vụ (Auth, Examination, HR, Inventory, Patients, Billing, Reports).
   - Triển khai máy chủ thời gian thực ASP.NET Core SignalR tại đường dẫn `/hubs/clinical` phục vụ đồng bộ hàng đợi khám bệnh.
   - Tự động phát sinh tài liệu kỹ thuật API thông qua chuẩn OpenAPI / Scalar Reference tại đường dẫn `/scalar/v1`.

### 2.2. Sơ đồ khối tổng thể

```
[Khach Hang 1: Web Admin (React 19)]
[Khach Hang 2: Web Bac Si (React 19)]    ---> [HTTPS / WSS SignalR] ---> [ClinicManagement.API (.NET 10)]
[Khach Hang 3: Mobile App iOS (SwiftUI)]                                            |
                                                                                    v
                                                                      [ClinicManagement.Application]
                                                                      (Commands / Queries / MediatR)
                                                                                    |
                                                                                    v
                                                                        [ClinicManagement.Domain]
                                                                      (Entities & Business Rules)
                                                                                    ^
                                                                                    |
                                                                    [ClinicManagement.Infrastructure]
                                                                    (EF Core 10 / SQL Server / VNPAY)
```

---

## 3. CHI TIẾT CÁC PHÂN HỆ VÀ CHỨC NĂNG

### 3.1. Phân hệ Quản trị Trung tâm (ClinicManagement.AdminUI)
- Công nghệ: React 19, TypeScript, Ant Design 6.x, Zustand, Axios, Vite.
- Đối tượng sử dụng: Ban quản trị phòng khám, Trưởng khoa, Bộ phận Nhân sự, Bộ phận Kế toán / Thu ngân.
- Chức năng:
  - Bảng điều khiển (Dashboard): Thống kê tổng quan số ca khám trong ngày, doanh thu viện phí, tình hình nhân sự đang trực và cảnh báo thuốc sắp hết hạn.
  - Quản lý Nhân sự: Hồ sơ bác sĩ, điều dưỡng, nhân viên hành chính; phân quyền theo chuyên khoa và chức danh.
  - Quản lý Ca trực và Chấm công: Thiết lập các loại ca làm việc, xếp lịch trực tuần/tháng, phê duyệt đơn xin nghỉ phép, theo dõi dữ liệu quẹt thẻ chấm công thực tế.
  - Quản lý Bảng lương (Payroll): Tự động tính toán bảng lương hàng tháng dựa trên số công chuẩn, công thực tế, phụ cấp trực và các khoản khấu trừ.
  - Quản trị Kho Dược và Vật tư Y tế:
    - Quản lý danh mục thuốc, hoạt chất, hàm lượng, đường dùng, đơn vị tính.
    - Quản lý nhập kho theo lô (Batch Number) và hạn sử dụng (Expiry Date).
    - Lập phiếu kiểm kê kho, phiếu xuất kho cấp phát cho các khoa phòng và phiếu trả hàng nhà cung cấp.
    - Theo dõi biến động tồn kho thông qua nhật ký kiểm toán (Audit Log).
  - Quản lý Viện phí: Thiết lập bảng giá dịch vụ y tế, tra cứu hóa đơn, theo dõi trạng thái thanh toán tiền mặt và chuyển khoản VNPAY.
  - Ma trận phân quyền (RBAC): Thiết lập quyền truy cập chi tiết theo từng chức năng cho từng nhóm vai trò (Admin, Bác sĩ, Điều dưỡng, Thu ngân, Dược sĩ).

### 3.2. Phân hệ Bàn khám Bác sĩ và Điều dưỡng (ClinicManagement.DoctorUI)
- Công nghệ: React 19, TypeScript, TailwindCSS v4, React Router v7, Vite.
- Đối tượng sử dụng: Bác sĩ chuyên khoa, Bác sĩ đa khoa, Điều dưỡng phòng khám.
- Chức năng:
  - Quản lý Hàng đợi bệnh nhân: Tiếp nhận danh sách bệnh nhân đang chờ khám tại phòng, cập nhật trạng thái tức thời qua SignalR.
  - Chẩn đoán lâm sàng: Ghi nhận quá trình bệnh lý, tiền sử bệnh, đo đạc chỉ số sinh tồn (mạch, nhiệt độ, huyết áp, nhịp thở, SpO2), gắn mã chẩn đoán quốc tế ICD-10 (bệnh chính và bệnh kèm theo).
  - Chỉ định Cận lâm sàng: Lập phiếu chỉ định các dịch vụ xét nghiệm (huyết học, hóa sinh) và chẩn đoán hình ảnh (X-quang, Siêu âm, Điện tim).
  - Kê đơn thuốc ngoại trú: Tìm kiếm thuốc trong kho theo tên thương mại hoặc hoạt chất, nhập liều lượng, cách dùng, số ngày dùng; tự động kiểm tra lượng tồn kho khả dụng.
  - Xử trí lâm sàng: Hỗ trợ 8 hình thức xử trí chuẩn: Cấp toa cho về, Chuyển phòng khám chuyên khoa khác, Điều trị ngoại trú, Nhập viện, Bỏ khám, Chuyển tuyến, Tử vong, Cấp giấy tờ.
  - Xuất và in ấn biểu mẫu y tế chuẩn:
    - Phiếu Khám Bệnh A6 có mã vạch (DT_001_A6_Phieukhambent.doc).
    - Phiếu Hẹn Tái Khám (K3_015_A1_PhuerienTaiKham.doc).
    - Phiếu Tóm Tắt Ra Viện (đầy đủ 6 khối diễn biến điều trị).
    - Bệnh Án Ngoại Trú chuẩn 13 mục hành chính y tế (BC11-MVJ17690).
    - Đơn Thuốc Ngoại Trú (BCS05 DONTHUOC2614).
    - Phiếu Chỉ Định Cận Lâm Sàng có chữ ký y lệnh (BC11-CDCLSC2223834).
  - Quản lý Lịch làm việc cá nhân: Theo dõi lịch trực và điểm danh ca trực hàng ngày.

### 3.3. Phân hệ Ứng dụng Di động Bệnh nhân (AppPatientClinic)
- Công nghệ: Swift 6, SwiftUI, URLSession Async/Await, Kiến trúc MVVM.
- Đối tượng sử dụng: Bệnh nhân và thân nhân người bệnh.
- Nền tảng: iOS (tương thích iPhone, iPad).
- Chức năng:
  - Đăng ký và Xác thực: Đăng ký tài khoản bằng số điện thoại, đăng nhập an toàn với Token, đổi mật khẩu.
  - Đặt lịch khám trực tuyến (Online Booking):
    - Chọn cơ sở y tế và khoa khám bệnh.
    - Chọn bác sĩ phụ trách chuyên khoa.
    - Chọn ngày khám và khung giờ còn trống (Time Slot).
    - Xác nhận và nhận mã số phiếu hẹn khám.
  - Hồ sơ sức khỏe điện tử cá nhân (Personal EMR):
    - Lưu trữ toàn bộ lịch sử các đợt khám bệnh.
    - Tra cứu chi tiết chẩn đoán của bác sĩ và các kết quả xét nghiệm liên quan.
    - Xem đơn thuốc điện tử kèm hướng dẫn cách sử dụng và liều lượng.
  - Quản lý thông tin tài khoản: Cập nhật thông tin hành chính, số thẻ BHYT, địa chỉ liên hệ và số điện thoại người thân trong trường hợp khẩn cấp.

---

## 4. MÔ HÌNH DỮ LIỆU CỐT LÕI (DATABASE SCHEMA)

Cơ sở dữ liệu được tổ chức trên hệ quản trị Microsoft SQL Server với hơn 40 bảng dữ liệu quan hệ, phân thành 9 nhóm bảng nghiệp vụ:

1. Nhóm Xác thực và Phân quyền (Identity & RBAC):
   - NguoiDung, VaiTro, PhanQuyen, NguoiDungVaiTro, MaTranPhanQuyen, NhanVien.
2. Nhóm Cơ sở và Danh mục (Facility & Catalog):
   - CoSo, Khoa, PhongKham, GiuongBenh, LoaiDichVu, DichVu.
3. Nhóm Hồ sơ Bệnh nhân (Patient Management):
   - BenhNhan, TheBHYT, NguoiGiamHo, HoSoBenhAn.
4. Nhóm Đặt hẹn và Hàng đợi (Appointment & Queue):
   - LichHen, CaKham, HangDoiKham, LuotKham.
5. Nhóm Khám bệnh và Xử trí (Clinical Examination):
   - ChanDoan, SinhHieu, ChiDinhDichVu, KetQuaCanLamSang, XuTriLamSang.
6. Nhóm Dược và Kho vật tư (Pharmacy & Warehouse):
   - Thuoc, HoatChat, Kho, LoThuoc, PhieuNhapKho, ChiTietNhapKho, PhieuXuatKho, ChiTietXuatKho, PhieuKiemKe, NhaCungCap, NhatKyKho (AuditLog).
7. Nhóm Đơn thuốc (Prescription):
   - DonThuoc, ChiTietDonThuoc, DinhMucVatTuDichVu.
8. Nhóm Viện phí và Thanh toán (Billing & Payment):
   - HoaDon, ChiTietHoaDon, GiaoDichVNPAY.
9. Nhóm Nhân sự và Tiền lương (HR & Payroll):
   - CaTruc, LoaiCa, LichLamViec, ChamCong, NghiPhep, BangLuong.

---

## 5. BẢNG TỔNG HỢP CÔNG NGHỆ VÀ THƯ VIỆN

| Phân hệ | Thành phần kỹ thuật | Phiên bản / Thư viện | Vai trò |
| :--- | :--- | :--- | :--- |
| Backend API | Ngôn ngữ lập trình | C# 13 / .NET 10 | Xử lý logic nghiệp vụ phía máy chủ |
| Backend API | Web Framework | ASP.NET Core Web API | Cung cấp chuẩn giao tiếp RESTful API |
| Backend API | ORM | Entity Framework Core 10 | Ánh xạ đối tượng quan hệ và thực thi truy vấn SQL |
| Backend API | Mẫu thiết kế | MediatR 14.x | Điều phối phân tách Command và Query (CQRS) |
| Backend API | Ánh xạ dữ liệu | AutoMapper 16.x | Chuyển đổi qua lại giữa Entity và DTO |
| Backend API | Cơ sở dữ liệu | Microsoft SQL Server | Hệ quản trị cơ sở dữ liệu quan hệ |
| Backend API | Thời gian thực | ASP.NET Core SignalR | Đẩy thông tin hàng đợi và trạng thái ca khám tức thì |
| Backend API | Bảo mật danh tính | JWT Bearer, BCrypt.Net | Xác thực người dùng và mã hóa mật khẩu an toàn |
| Backend API | Tài liệu API | Scalar Reference, OpenAPI 3.0 | Giao diện tài liệu API tương tác trực quan |
| Backend API | Cổng thanh toán | VNPAY SDK Integration | Tích hợp thu phí trực tuyến qua tài khoản ngân hàng |
| Backend API | Dịch vụ thư điện tử | MailKit 4.x, MimeKit | Gửi thông báo lịch hẹn, mã xác thực qua SMTP |
| Admin Web | Thư viện giao diện | React 19, TypeScript | Xây dựng giao diện ứng dụng quản trị trung tâm |
| Admin Web | Bộ thành phần UI | Ant Design 6.x | Hệ thống bảng biểu, form nhập liệu chuẩn doanh nghiệp |
| Admin Web | Quản lý trạng thái | Zustand | Lưu trữ và chia sẻ trạng thái ứng dụng |
| Doctor Web | Thư viện giao diện | React 19, TypeScript | Xây dựng giao diện bàn khám lâm sàng của bác sĩ |
| Doctor Web | Framework CSS | TailwindCSS v4 | Thiết kế giao diện phản hồi nhanh và tối ưu hiển thị |
| Mobile App | Ngôn ngữ & Framework | Swift 6, SwiftUI | Phát triển ứng dụng di động bản địa cho hệ điều hành iOS |
| Mobile App | Kiến trúc phần mềm | MVVM (Model-View-ViewModel) | Tách biệt giao diện hiển thị và logic nghiệp vụ di động |

---

## 6. HƯỚNG DẪN TRIỂN KHAI VÀ KHỞI CHẠY (QUICKSTART)

### 6.1. Yêu cầu môi trường tối thiểu
- .NET SDK phiên bản 10.0 (hoặc tương thích .NET 8 / 9).
- Node.js phiên bản từ 20.x trở lên, npm từ 10.x trở lên.
- Microsoft SQL Server 2019/2022 (hoặc Azure SQL Database).
- macOS với Xcode từ 16.x trở lên (đối với việc biên dịch ứng dụng iOS).

### 6.2. Khởi chạy Backend API
1. Cấu hình chuỗi kết nối cơ sở dữ liệu tại tệp `ClinicManagement.API/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=ClinicManagementDb;User Id=sa;Password=********;TrustServerCertificate=true;"
     }
   }
   ```
2. Thực thi cập nhật cơ sở dữ liệu (Migration):
   ```bash
   dotnet ef database update --project ClinicManagement.Infrastructure --startup-project ClinicManagement.API
   ```
3. Khởi chạy ứng dụng:
   ```bash
   dotnet run --project ClinicManagement.API
   ```
   - Cổng mặc định: `https://localhost:5001`
   - Tài liệu API: `https://localhost:5001/scalar/v1`

### 6.3. Khởi chạy Phân hệ Quản trị (AdminUI)
```bash
cd ClinicManagement.AdminUI
npm install
npm run dev
```
- Truy cập trình duyệt tại địa chỉ: `http://localhost:5173`

### 6.4. Khởi chạy Phân hệ Bác sĩ (DoctorUI)
```bash
cd ClinicManagement.DoctorUI
npm install
npm run dev
```
- Truy cập trình duyệt tại địa chỉ: `http://localhost:5174`

### 6.5. Khởi chạy Ứng dụng Di động Bệnh nhân (AppPatientClinic)
1. Khởi động phần mềm Xcode và mở tệp dự án: `AppPatientClinic/AppPatientClinic.xcodeproj`.
2. Kiểm tra địa chỉ máy chủ API trong tệp `AppPatientClinic/Core/Network/APIClient.swift`.
3. Lựa chọn thiết bị mô phỏng (ví dụ: iPhone 16 Pro) và thực hiện lệnh `Product > Run` (hoặc phím tắt `Cmd + R`).

---

## 7. KẾT QUẢ ĐẠT ĐƯỢC VÀ ĐÁNH GIÁ ĐỒ ÁN

### 7.1. Kết quả đạt được
1. Đã xây dựng hoàn chỉnh kiến trúc Clean Architecture cho Backend, phân tách rành mạch các trách nhiệm, mã nguồn có độ liên kết lỏng (loose coupling) và khả năng mở rộng cao.
2. Hoàn thiện toàn bộ các chu trình khám chữa bệnh ngoại trú mô phỏng chính xác nghiệp vụ thực tế tại bệnh viện: Từ phân ca trực, xếp lịch hẹn, hàng đợi tiếp đón, chẩn đoán ICD-10, chỉ định xét nghiệm, kê đơn thuốc đến in ấn biểu mẫu chuẩn.
3. Ứng dụng di động iOS hoạt động mượt mà, kết nối trực tiếp với Backend API qua cơ chế bất đồng bộ hiện đại (Async/Await).
4. Tích hợp thành công các dịch vụ hạ tầng thực tế: Cổng thanh toán VNPAY, gửi email thông báo tự động và máy chủ thời gian thực SignalR.

### 7.2. Hướng phát triển tiếp theo
- Xây dựng thêm phiên bản ứng dụng di động dành cho Bác sĩ (Doctor Mobile App).
- Mở rộng phân hệ điều trị nội trú (Inpatient Care): Quản lý chuyển khoa nội trú, sơ đồ giường bệnh thời gian thực.
- Tích hợp thêm các phương thức thanh toán ví điện tử phổ biến khác (MoMo, ZaloPay).
- Triển khai hệ thống lên hạ tầng điện toán đám mây thông qua Docker và Kubernetes.

---
Báo cáo kỹ thuật được tổng hợp và duy trì bởi Đặng Trọng Tường (J Tuong) - Kho lưu trữ mã nguồn mở: https://github.com/jtuongdev/clinic_management
