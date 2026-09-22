# Kịch Bản Phân Tích & Sinh Dữ Liệu Thử Nghiệm (Mock Data) Toàn Hệ Thống

Dựa trên phân tích toàn bộ kiến trúc `Domain` và hệ thống `Enums` của hệ thống **Clinic Management**, dưới đây là kịch bản chuẩn để sinh dữ liệu (seeding) nhằm phục vụ việc kiểm thử tích hợp toàn bộ các luồng nghiệp vụ.

Kịch bản này bao phủ toàn bộ vòng đời của Phòng Khám: Từ cấu hình hệ thống, quản lý nhân sự, quản lý kho, đến hành trình khám bệnh của bệnh nhân và thanh toán.

---

## 1. Cấu Hình Cơ Sở & Dịch Vụ (System & Facility)
Hệ thống cần các dữ liệu gốc để vận hành.
* **Cơ Sở (`CoSo`)**: Tạo 1 cơ sở chuẩn với `LoaiCoSo.PhongKhamDaKhoa`.
* **Khoa Phòng (`Khoa`)**: 
  * Khoa Khám Bệnh, Khoa Chẩn Đoán Hình Ảnh, Khoa Dược.
* **Dịch vụ (`DichVu` / `LoaiDichVu`)**:
  * Khám bệnh: Khám nội tổng quát (`LoaiDichVu.Kham`).
  * Cận lâm sàng: Siêu âm ổ bụng (`LoaiDichVu.ChanDoanHinhAnh`), Xét nghiệm sinh hóa máu (`LoaiDichVu.XetNghiem`).

## 2. Nhân Sự & Phân Quyền (Identity & Payroll)
Thiết lập người dùng và lịch làm việc.
* **Vai trò (`VaiTro`)**: Bác sĩ, Dược sĩ, Lễ tân, Thu ngân, Admin.
* **Nhân viên (`NhanVien`)**: 
  * 1 Lễ tân (tiếp đón).
  * 2 Bác sĩ (chỉ định, khám, kết luận).
  * 1 Dược sĩ (quản lý kho, xuất thuốc).
  * 1 Thu ngân (thanh toán).
* **Chấm công (`ChamCong` / `BangLuong`)**: Tạo các bản ghi `TrangThaiChamCong.DI_DUNG_GIO` và `TrangThaiChamCong.DI_MUON` để test bảng lương và `TrangThaiDieuChinhChamCong`.

## 3. Quản Lý Kho & Vật Tư (Inventory)
Cần có thuốc và vật tư để kê đơn và sử dụng trong quá trình khám.
* **Kho (`Kho`)**: Tạo Kho Thuốc (`LoaiKho.THUOC`, `TrangThaiKho.HoatDong`).
* **Sản phẩm (`Item`)**:
  * Paracetamol 500mg (`LoaiItem.THUOC`).
  * Băng gạc y tế (`LoaiItem.VAT_TU`).
* **Nhập kho (`PhieuNhap`)**:
  * Tạo một phiếu nhập từ Nhà Cung Cấp (`TrangThaiNhaCungCap.HoatDong`).
  * Trạng thái phiếu: `TrangThaiPhieuNhap.TAM` ➡️ `TrangThaiPhieuNhap.CHO_DUYET` ➡️ `TrangThaiPhieuNhap.DA_NHAP`.
  * **Hệ quả**: Hệ thống tự động tạo `TonKho` và ghi log `GiaoDichKho` (Loại `NHAP`).

## 4. Bệnh Nhân & Đặt Lịch (Patient & Appointment)
Hành trình bệnh nhân bắt đầu từ việc đăng ký và hẹn khám.
* **Bệnh nhân (`BenhNhan`)**: 
  * Tạo "Nguyễn Văn A" (`GioiTinh.M`).
  * Thêm bảo hiểm y tế (`LoaiBaoHiem.BHYT`).
  * Ghi nhận tiền sử bệnh (`LoaiTienSu.DI_UNG` - Dị ứng Penicillin).
* **Lịch hẹn (`LichHen`)**:
  * Trạng thái chạy từ: `TrangThaiLichHen.CHO_XAC_NHAN` ➡️ `TrangThaiLichHen.DA_XAC_NHAN` ➡️ `TrangThaiLichHen.DA_DEN`.

## 5. Tiếp Nhận & Khám Bệnh (Examination & Service)
Đây là luồng phức tạp nhất với nhiều trạng thái.
* **Lượt Khám (`LuotKham`)**:
  1. Lễ tân tiếp nhận: Lượt khám ở trạng thái `TrangThaiLuotKham.CHO_KHAM`. Hình thức `HinhThucDieuTri.NGOAI_TRU`.
  2. Bác sĩ gọi vào phòng: Chuyển sang `TrangThaiLuotKham.DANG_KHAM`.
  3. Bác sĩ thấy cần làm xét nghiệm: Chuyển sang `TrangThaiLuotKham.CHO_CLS`.
* **Chỉ Định Dịch Vụ (`ChiDinhDichVu`)**:
  * Chỉ định Siêu âm. Trạng thái: `TrangThaiChiDinhDichVu.DaChiDinh` ➡️ Kỹ thuật viên tiếp nhận: `DaTiepNhan` ➡️ Nhập kết quả: `DaCoKetQua`.
* **Kết Luận**: Sau khi có kết quả CLS, bác sĩ chẩn đoán và chuyển Lượt Khám sang `TrangThaiLuotKham.KET_LUAN`.

## 6. Kê Đơn & Xuất Thuốc (Prescription & Pharmacy)
* **Đơn thuốc (`DonThuoc`)**:
  * Bác sĩ kê Paracetamol. Trạng thái ban đầu: `TrangThaiDonThuoc.TAM` ➡️ Hoàn tất kê đơn: `TrangThaiDonThuoc.DA_DUYET`.
* **Xuất thuốc**:
  * Dược sĩ tiếp nhận đơn, phát thuốc cho bệnh nhân. Đổi trạng thái thành `TrangThaiDonThuoc.DA_XUAT_HET`.
  * **Hệ quả**: Tồn kho (`TonKho`) giảm đi tương ứng, hệ thống ghi nhận `LoaiGiaoDichKho.XUAT_DON` / `LoaiXuatKho.XUAT_DON`.

## 7. Thanh Toán & Công Nợ (Billing)
Tích hợp chi phí từ Dịch vụ khám, Dịch vụ CLS và Tiền thuốc.
* **Hóa đơn (`HoaDon`)**:
  * Trạng thái khởi tạo: `TrangThaiHoaDon.CHO_THANH_TOAN`.
* **Thu tiền (`PhieuThu` & `PhuongThucThanhToan`)**:
  * Kịch bản 1 (Thanh toán đủ): Bệnh nhân trả tiền mặt (`PhuongThucThanhToan.TIEN_MAT`). Hóa đơn chuyển `TrangThaiHoaDon.DA_THANH_TOAN`.
  * Kịch bản 2 (Ghi nợ): Bệnh nhân trả một nửa. 
    * Hóa đơn chuyển `TrangThaiHoaDon.THANH_TOAN_MOT_PHAN`.
    * Sinh ra công nợ (`CongNoBenhNhan`) trạng thái `TrangThaiCongNo.DANG_NO`.
    * Sau đó bệnh nhân chuyển khoản (`PhuongThucThanhToan.CHUYEN_KHOAN`) phần còn lại: Công nợ ➡️ `TrangThaiCongNo.DA_TAT_TOAN`.

## 8. Kết Thúc Quy Trình
* Chuyển trạng thái lượt khám (`LuotKham`) sang `TrangThaiLuotKham.HOAN_THANH`.

---

## 🎯 Hướng Dẫn Kỹ Thuật (Cho Developer/QA/Tester)

Để test toàn bộ hệ thống bằng DB script hoặc API (Postman/Swagger), hãy insert/gọi theo đúng trình tự nghiệp vụ trên. 

Đặc biệt lưu ý việc **ánh xạ (mapping) chuỗi String sang Enum**:
* Các giá trị gửi qua API hoặc insert vào Database dạng JSON/String phải khớp CHÍNH XÁC với tên Enum được định nghĩa trong mã nguồn C#.
* **Ví dụ Kho**: Không truyền `1`, hãy truyền `"THUOC"` hoặc `"VAT_TU"`. 
* **Ví dụ Hóa Đơn**: Sử dụng `"CHO_THANH_TOAN"`, `"THANH_TOAN_MOT_PHAN"`, v.v. Không sử dụng các thuật ngữ tùy biến như `"UNPAID"` để tránh lỗi API `500 Internal Server Error`.

---

## 9. Danh Sách Các Bảng Dữ Liệu (Tables Summary - For Agents & Devs)
Dưới đây là danh sách các Bảng (Tables) tương ứng trong SQL Server / Entity Framework để một Agent khác có thể dễ dàng map và sinh code Seeding (C# hoặc SQL `INSERT INTO`). Các Enum phải được insert dưới dạng chuỗi (String) khớp với tên định nghĩa.

### Nhóm Cấu Hình & Cơ Sở (Facility & Catalog)
1. **`CoSo`**: 
   * Cột quan trọng: `Id`, `Ten`, `LoaiCoSo` (Enum: `'PhongKhamDaKhoa'`).
2. **`Khoa`**: 
   * Cột quan trọng: `Id`, `Ten`, `MaCoSo` (FK).
3. **`DichVu`**: 
   * Cột quan trọng: `Id`, `Ten`, `LoaiDichVu` (Enum: `'Kham'`, `'XetNghiem'`, `'ChanDoanHinhAnh'`, `'DichVuKyThuat'`).

### Nhóm Phân Quyền & Nhân Sự (Identity & HR)
4. **`VaiTro`**: 
   * Cột quan trọng: `Id`, `TenVaiTro`.
5. **`NhanVien`**: 
   * Cột quan trọng: `Id`, `Username`, `HoTen`, `MaKhoa` (FK).
6. **`NhanVienVaiTro`**: 
   * Cột quan trọng: `MaNhanVien` (FK), `MaVaiTro` (FK).
7. **`ChamCong`**: 
   * Cột quan trọng: `Id`, `MaNhanVien` (FK), `TrangThaiChamCong` (Enum: `'DI_DUNG_GIO'`, `'DI_MUON'`, `'VE_SOM'`, ...).

### Nhóm Quản Lý Kho (Inventory)
8. **`Kho`**: 
   * Cột quan trọng: `Id`, `Ten`, `LoaiKho` (Enum: `'THUOC'`, `'VA_TU'`), `TrangThaiKho` (Enum: `'HoatDong'`).
9. **`Item`**: 
   * Cột quan trọng: `Id`, `Ten`, `LoaiItem` (Enum: `'THUOC'`, `'VAT_TU'`).
10. **`TonKho`**: 
    * Cột quan trọng: `MaKho` (FK), `MaItem` (FK), `SoLuongTon`.
11. **`PhieuNhap`**: 
    * Cột quan trọng: `Id`, `TrangThaiPhieuNhap` (Enum: `'DA_NHAP'`).
12. **`GiaoDichKho`**: 
    * Cột quan trọng: `Id`, `MaItem` (FK), `MaKho` (FK), `LoaiGiaoDichKho` (Enum: `'NHAP'`, `'XUAT_DON'`).

### Nhóm Bệnh Nhân & Lịch Hẹn (Patient & Appointment)
13. **`BenhNhan`**: 
    * Cột quan trọng: `Id`, `HoTen`, `GioiTinh` (Enum: `'M'`, `'F'`, `'O'`).
14. **`BaoHiem`**: 
    * Cột quan trọng: `Id`, `MaBenhNhan` (FK), `LoaiBaoHiem` (Enum: `'BHYT'`, `'KHAC'`).
15. **`TienSuBenh`**: 
    * Cột quan trọng: `Id`, `MaBenhNhan` (FK), `LoaiTienSu` (Enum: `'BENH_NEN'`, `'DI_UNG'`, ...).
16. **`LichHen`**: 
    * Cột quan trọng: `Id`, `MaBenhNhan` (FK), `MaBacSi` (FK), `TrangThai` (Enum: `'CHO_XAC_NHAN'`, `'DA_DEN'`).

### Nhóm Tiếp Nhận & Khám Bệnh (Examination - Core)
17. **`LuotKham`**: 
    * Cột quan trọng: `Id`, `MaBenhNhan` (FK), `MaBacSi` (FK), `TrangThai` (Enum: `'CHO_KHAM'`, `'DANG_KHAM'`, `'CHO_CLS'`, `'KET_LUAN'`, `'HOAN_THANH'`).
18. **`ChiDinhDichVu`**: 
    * Cột quan trọng: `Id`, `MaLuotKham` (FK), `MaDichVu` (FK), `TrangThai` (Enum: `'DaChiDinh'`, `'DaTiepNhan'`, `'DaCoKetQua'`).

### Nhóm Đơn Thuốc (Prescription)
19. **`DonThuoc`**: 
    * Cột quan trọng: `Id`, `MaLuotKham` (FK), `TrangThai` (Enum: `'TAM'`, `'DA_DUYET'`, `'DA_XUAT_HET'`).
20. **`ChiTietDonThuoc`**: 
    * Cột quan trọng: `Id`, `MaDonThuoc` (FK), `MaItem` (FK), `SoLuongKe`, `SoLuongDaXuat`.

### Nhóm Thanh Toán & Công Nợ (Billing)
21. **`HoaDon`**: 
    * Cột quan trọng: `Id`, `MaLuotKham` (FK), `TrangThai` (Enum: `'CHO_THANH_TOAN'`, `'THANH_TOAN_MOT_PHAN'`, `'DA_THANH_TOAN'`).
22. **`PhieuThu`**: 
    * Cột quan trọng: `Id`, `MaHoaDon` (FK), `PhuongThucThanhToan` (Enum: `'TIEN_MAT'`, `'CHUYEN_KHOAN'`, `'THE'`, `'BAO_HIEM'`).
23. **`CongNoBenhNhan`**: 
    * Cột quan trọng: `Id`, `MaBenhNhan` (FK), `MaHoaDon` (FK), `TrangThai` (Enum: `'DANG_NO'`, `'DA_TAT_TOAN'`, `'QUA_HAN'`).
