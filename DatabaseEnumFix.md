# Hướng Dẫn Khắc Phục Lỗi Enum Cơ Sở Dữ Liệu

Trong quá trình test API, tôi đã phát hiện một số dữ liệu trong SQL Server đang sử dụng các chuỗi (string) không tồn tại trong tập hợp Enum được định nghĩa ở Backend (C#). Khi Entity Framework Core cố gắng map các chuỗi này sang C#, nó sẽ ném ra lỗi nổ API (`500 Internal Server Error`).

Dưới đây là danh sách các Bảng (Table), Cột (Column) bị lỗi, cùng với các giá trị **Sai** hiện có trong SQL và các giá trị **Đúng** mà C# Backend đang hỗ trợ. Bạn hãy chạy các lệnh UPDATE tương ứng trong SQL Server để sửa lỗi.

---

### 1. Bảng `CoSo` (Cơ Sở)
- **Cột bị lỗi:** `LoaiCoSo`
- **Dữ liệu sai đang có trong SQL:** `'BENH_VIEN'`
- **Giá trị chuẩn bên C#:**
  - `'PhongKhamDaKhoa'` (Tương ứng với `LoaiCoSo.PhongKhamDaKhoa`)

**Lệnh SQL khắc phục:**
```sql
UPDATE [CoSo]
SET [LoaiCoSo] = 'PhongKhamDaKhoa'
WHERE [LoaiCoSo] = 'BENH_VIEN';
```

---

### 2. Bảng `HoaDon` (Hóa Đơn)
- **Cột bị lỗi:** `TrangThai`
- **Dữ liệu sai đang có trong SQL:** `'UNPAID'`, `'PARTIAL'`, `'PAID'`
- **Giá trị chuẩn bên C# (TrangThaiHoaDon):**
  - `'CHO_THANH_TOAN'` (Tương đương UNPAID)
  - `'THANH_TOAN_MOT_PHAN'` (Tương đương PARTIAL)
  - `'DA_THANH_TOAN'` (Tương đương PAID)
  - `'DA_HUY'`

**Lệnh SQL khắc phục:**
```sql
UPDATE [HoaDon] SET [TrangThai] = 'CHO_THANH_TOAN' WHERE [TrangThai] = 'UNPAID';
UPDATE [HoaDon] SET [TrangThai] = 'THANH_TOAN_MOT_PHAN' WHERE [TrangThai] = 'PARTIAL';
UPDATE [HoaDon] SET [TrangThai] = 'DA_THANH_TOAN' WHERE [TrangThai] = 'PAID';
```

---

### 3. Bảng `DonThuoc` (Đơn Thuốc)
- **Cột bị lỗi:** `TrangThai`
- **Dữ liệu sai đang có trong SQL:** `'HOAN_THANH'`
- **Giá trị chuẩn bên C# (TrangThaiDonThuoc):**
  - `'TAM'`
  - `'DA_DUYET'`
  - `'DA_XUAT_HET'` (Tương đương HOAN_THANH)
  - `'HUY'`

**Lệnh SQL khắc phục:**
```sql
UPDATE [DonThuoc]
SET [TrangThai] = 'DA_XUAT_HET'
WHERE [TrangThai] = 'HOAN_THANH';
```

---
*Lưu ý: Sau khi bạn update SQL xong, hãy chạy thử lại ứng dụng, lỗi 500 nổ API ở các trang Danh Sách (Dashboard, Hóa Đơn, Đơn Thuốc, Lượt Khám) sẽ hoàn toàn biến mất.*
