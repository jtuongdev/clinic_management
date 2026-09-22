# Hướng Dẫn Thêm Đơn Vị Quy Đổi & Chuẩn Hoá Danh Mục Thuốc - Vật Tư

Tài liệu này phân tích chi tiết dữ liệu hiện tại của bảng `Item`, chỉ rõ các điểm chưa khớp với ngữ cảnh hệ thống và cung cấp kịch bản SQL hoàn chỉnh để chuẩn hoá bảng `Item` và nạp dữ liệu đầy đủ vào bảng `DonViTinhQuyDoi`.

---

## 1. Đánh Giá Hiện Trạng Dữ Liệu Bảng `Item`

Đối chiếu dữ liệu bạn đã cung cấp với Entity Framework Core và Domain Logic của hệ thống:

### 1.1. LỖI NGHIÊM TRỌNG: Cột `LoaiItem` chưa khớp với Value Converter của Backend
- **Thực tế trong database**:
  - Các dòng thuốc (ID 1 -> 50, mã `THUOC026` -> `THUOC075`): `LoaiItem` đang lưu giá trị `'1'` (số 1).
  - Các dòng vật tư (ID 1003 -> 1024, mã `VT001` -> `VT022`): `LoaiItem` đang lưu chuỗi `'VatTu'`.
- **Cấu hình Backend (`ItemConfiguration.cs`)**:
  ```csharp
  builder.Property(i => i.LoaiItem)
      .HasConversion(
          v => v.ToString(), // Khi Enum sang String lưu DB: LoaiItem.THUOC -> "THUOC", LoaiItem.VA_TU -> "VA_TU"
          s => s.Equals("VatTu", StringComparison.OrdinalIgnoreCase) ||
               s.Equals("VAT_TU", StringComparison.OrdinalIgnoreCase) ||
               s.Equals("VA_TU", StringComparison.OrdinalIgnoreCase)
                  ? LoaiItem.VA_TU
                  : LoaiItem.THUOC)
      .HasMaxLength(20);
  ```
- **Hệ quả nếu không chuẩn hoá**:
  - Khi giao diện gọi API lọc danh mục: `GET /api/inventory/items?itemType=THUOC`, EF Core sẽ sinh câu lệnh SQL:
    ```sql
    WHERE [i].[LoaiItem] = N'THUOC'
    ```
    Do trong DB đang lưu là `'1'`, câu query sẽ **trả về danh sách rỗng (không thấy thuốc nào)**.
  - Tương tự khi gọi lọc vật tư: `GET /api/inventory/items?itemType=VA_TU`, EF Core sinh `WHERE [i].[LoaiItem] = N'VA_TU'`. Giá trị `'VatTu'` sẽ **không khớp với `'VA_TU'`**.
- **Giải pháp**: Cần chạy script cập nhật đồng bộ về hai giá trị chuẩn: `'THUOC'` và `'VA_TU'`.

---

### 1.2. Đánh giá cột `DonViTinhCoBan` (Đơn vị tính cơ bản)
- Dữ liệu đã chọn đúng đơn vị tính nhỏ nhất để quản lý tồn kho và kê đơn (ví dụ: `Viên`, `Ống`, `Gói`, `Chai`, `Cái`, `Lọ`, `Đôi`...).
- **Lưu ý đặc biệt cho Hao phí định mức Cận lâm sàng (CLS)**:
  - Một số vật tư như `Cồn 70 độ` (đang có ĐVT cơ bản là `Chai`), `Gel siêu âm` (`Can`), `Giấy in nhiệt ECG` (`Cuộn`) được sử dụng trong định mức CLS với đơn vị sử dụng lẻ là `ml` (5ml cồn, 25ml gel) hoặc `Mét` (1.5 mét giấy).
  - Do đó, trong bảng `DonViTinhQuyDoi`, ngoài các đơn vị đóng gói lớn để nhập kho (`Thùng`, `Hộp`), ta **bổ sung thêm đơn vị quy đổi sử dụng (`ml`, `Mét`)** với hệ số tương ứng ($1\text{ ml} = 0.002\text{ Chai 500ml}$, $1\text{ ml} = 0.0002\text{ Can 5L}$, $1\text{ Mét} = 0.05\text{ Cuộn 20m}$). Nhờ vậy, engine khấu trừ định mức CLS tự động tra cứu chuẩn xác 100%.

---

### 1.3. Đánh giá cột `CanKeDon` (Quyền kê đơn)
- Bác sĩ chỉ được kê đơn ngoại trú đối với các mặt hàng có `CanKeDon = 1`.
- Dữ liệu hiện tại:
  - Thuốc điều trị chuyên khoa/kháng sinh (`Zinnat`, `Avelox`, `Cravit`, `Klacid`, `Singulair`, `Pariet`, `Coversyl`...): `CanKeDon = 1` $\rightarrow$ **Rất chính xác**.
  - Sản phẩm súc họng, nước biển sâu, OTC (`Betadine Gargle`, `Xisat`, `Boganic`...): `CanKeDon = 0` $\rightarrow$ Đúng chuẩn OTC / mua ngoài không bắt buộc kê đơn.
  - Toàn bộ vật tư tiêu hao (`VT001` -> `VT022`): `CanKeDon = 0` $\rightarrow$ **Hoàn toàn chính xác** (vật tư không dùng kê đơn thuốc mà xuất theo chỉ định CLS hoặc thủ thuật).

---

### 1.4. Lỗi hiển thị ký tự tiếng Việt (Encoding)
Một số bản ghi bị lỗi font do import không có tiền tố `N''`:
- `THUOC026`: `27.5mcg/li?u` $\rightarrow$ cần sửa thành `27.5mcg/liều`.
- `THUOC027`: `50mcg/li?u (60 li?u)` $\rightarrow$ cần sửa thành `50mcg/liều (60 liều)`.
- `THUOC056`: `Cao du?c li?u` $\rightarrow$ cần sửa thành `Cao dược liệu`.

---

## 2. Nguyên Tắc Cấu Trúc Bảng `DonViTinhQuyDoi`

Bảng `DonViTinhQuyDoi` liên kết với bảng `Item` theo quan hệ $1 - N$:
1. **Dòng đơn vị cơ bản (IsBase = 1)**: Mỗi Item **BẮT BUỘC** phải có 1 dòng ghi nhận chính đơn vị cơ bản của nó với `HeSo = 1.00000` và `IsBase = 1`.
2. **Dòng đơn vị quy đổi (IsBase = 0)**: Lưu quy cách đóng gói thương mại khi nhập kho (`Vỉ`, `Hộp`, `Thùng`, `Kiện`, `Túi`...) với `HeSo` là số lượng đơn vị cơ bản quy ra ($1\ \text{DonVi} = \text{HeSo} \times \text{DonViTinhCoBan}$).
3. **Ràng buộc duy nhất**: Cặp `(MaItem, DonVi)` là duy nhất (Unique Index `IX_DonViTinhQuyDoi_MaItem_DonVi`).

---

## 3. Script SQL Hoàn Chỉnh Thực Thi

Dưới đây là toàn bộ mã T-SQL được bọc trong `TRANSACTION`, kiểm tra an toàn chống trùng lặp, có thể chạy trực tiếp trên SQL Server Management Studio (SSMS), Azure Data Studio hoặc DBeaver.

```sql
-- ==============================================================================
-- KỊCH BẢN CHUẨN HOÁ DANH MỤC ITEM VÀ NẠP BẢNG ĐƠN VỊ QUY ĐỔI (DonViTinhQuyDoi)
-- Hệ thống: ClinicManagement (Module Dược - Kho - Bệnh viện GPP)
-- Ngày thực hiện: 2026-09-21
-- ==============================================================================

SET NOCOUNT ON;
BEGIN TRANSACTION;

BEGIN TRY

    PRINT N'>>> BƯỚC 1: Chuẩn hoá giá trị LoaiItem và encoding bảng Item...';

    -- 1. Chuẩn hoá LoaiItem cho Thuốc ('THUOC')
    UPDATE Item
    SET LoaiItem = 'THUOC'
    WHERE LoaiItem = '1' 
       OR LoaiItem LIKE '%THUOC%'
       OR (Ma LIKE 'THUOC%');

    -- 2. Chuẩn hoá LoaiItem cho Vật tư y tế ('VA_TU')
    UPDATE Item
    SET LoaiItem = 'VA_TU'
    WHERE LoaiItem = '2' 
       OR LoaiItem = 'VatTu'
       OR LoaiItem = 'VAT_TU'
       OR LoaiItem LIKE '%VA%TU%'
       OR (Ma LIKE 'VT%');

    -- 3. Khắc phục lỗi encoding ký tự dấu hỏi (?)
    UPDATE Item SET HamLuong = N'27.5mcg/liều' WHERE Ma = 'THUOC026';
    UPDATE Item SET HamLuong = N'50mcg/liều (60 liều)' WHERE Ma = 'THUOC027';
    UPDATE Item SET HamLuong = N'Cao dược liệu' WHERE Ma = 'THUOC056';

    PRINT N'    -> Đã cập nhật chuẩn hoá bảng Item.';


    PRINT N'>>> BƯỚC 2: Tự động khởi tạo dòng Đơn vị cơ bản (IsBase = 1, HeSo = 1) cho tất cả Item...';

    INSERT INTO DonViTinhQuyDoi (MaItem, DonVi, HeSo, IsBase, CreatedAt, IsDeleted)
    SELECT 
        i.Id,
        LTRIM(RTRIM(i.DonViTinhCoBan)),
        1.00000,
        1,
        GETUTCDATE(),
        0
    FROM Item i
    WHERE NOT EXISTS (
        SELECT 1 
        FROM DonViTinhQuyDoi q 
        WHERE q.MaItem = i.Id 
          AND q.DonVi = LTRIM(RTRIM(i.DonViTinhCoBan))
    );

    PRINT N'    -> Đã đồng bộ các dòng đơn vị cơ bản (IsBase = 1).';


    PRINT N'>>> BƯỚC 3: Nạp bảng đơn vị quy đổi thương mại (Hộp, Vỉ, Thùng...) cho từng mặt hàng...';

    -- Tạo bảng tạm chứa dữ liệu quy đổi chuẩn GPP
    CREATE TABLE #TempConversions (
        MaItemCode NVARCHAR(50),
        DonVi NVARCHAR(20),
        HeSo DECIMAL(12, 5)
    );

    -- --------------------------------------------------------------------------
    -- 3.1. DANH MỤC THUỐC TÂN DƯỢC (THUOC026 - THUOC075)
    -- --------------------------------------------------------------------------
    INSERT INTO #TempConversions (MaItemCode, DonVi, HeSo) VALUES
    -- Thuốc xịt / nhỏ tai / súc họng
    ('THUOC026', N'Hộp', 1.00000),      ('THUOC026', N'Thùng', 50.00000),   -- Avamys: Chai -> Hộp, Thùng 50 chai
    ('THUOC027', N'Hộp', 1.00000),      ('THUOC027', N'Thùng', 50.00000),   -- Nasonex: Chai -> Hộp, Thùng 50 chai
    ('THUOC028', N'Hộp', 1.00000),      ('THUOC028', N'Thùng', 100.00000),  -- Ciprodex: Lọ -> Hộp, Thùng 100 lọ
    ('THUOC029', N'Hộp', 1.00000),      ('THUOC029', N'Thùng', 40.00000),   -- Betadine súc họng: Chai -> Thùng 40 chai
    ('THUOC035', N'Hộp', 1.00000),      ('THUOC035', N'Thùng', 50.00000),   -- Xisat 75ml: Chai -> Thùng 50 chai
    ('THUOC046', N'Hộp', 1.00000),      ('THUOC046', N'Thùng', 40.00000),   -- Siro Prospan 100ml: Chai -> Thùng 40 chai

    -- Thuốc viên hô hấp, dị ứng & kháng sinh
    ('THUOC030', N'Vỉ', 7.00000),       ('THUOC030', N'Hộp', 28.00000),     -- Singulair 10mg: Hộp 4 vỉ x 7 viên
    ('THUOC031', N'Vỉ', 7.00000),       ('THUOC031', N'Hộp', 28.00000),     -- Singulair 4mg: Hộp 4 vỉ x 7 viên
    ('THUOC032', N'Vỉ', 10.00000),      ('THUOC032', N'Hộp', 30.00000),     -- Aerius 5mg: Hộp 3 vỉ x 10 viên
    ('THUOC033', N'Vỉ', 10.00000),      ('THUOC033', N'Hộp', 50.00000),     -- Xyzal 5mg: Hộp 5 vỉ x 10 viên
    ('THUOC034', N'Vỉ', 10.00000),      ('THUOC034', N'Hộp', 20.00000),     -- Dorithricin: Hộp 2 vỉ x 10 viên
    ('THUOC036', N'Vỉ', 10.00000),      ('THUOC036', N'Hộp', 14.00000),     -- Zinnat 500mg: Hộp 14 viên (hoặc vỉ 10 viên)
    ('THUOC037', N'Vỉ', 10.00000),      ('THUOC037', N'Hộp', 20.00000),     -- Cefixim 200mg: Hộp 2 vỉ x 10 viên
    ('THUOC038', N'Vỉ', 5.00000),       ('THUOC038', N'Hộp', 5.00000),      -- Avelox 400mg: Hộp 1 vỉ x 5 viên
    ('THUOC039', N'Vỉ', 10.00000),      ('THUOC039', N'Hộp', 10.00000),     -- Cravit 500mg: Hộp 1 vỉ x 10 viên
    ('THUOC040', N'Vỉ', 7.00000),       ('THUOC040', N'Hộp', 14.00000),     -- Klacid 500mg: Hộp 2 vỉ x 7 viên
    ('THUOC041', N'Vỉ', 10.00000),      ('THUOC041', N'Hộp', 100.00000),    -- Doxycyclin 100mg: Hộp 10 vỉ x 10 viên
    ('THUOC042', N'Vỉ', 10.00000),      ('THUOC042', N'Hộp', 20.00000),     -- Bactrim Forte: Hộp 2 vỉ x 10 viên

    -- Thuốc khí dung (Ống)
    ('THUOC043', N'Túi', 5.00000),      ('THUOC043', N'Hộp', 20.00000),     -- Pulmicort: Ống -> Túi 5 ống, Hộp 20 ống
    ('THUOC044', N'Túi', 5.00000),      ('THUOC044', N'Hộp', 30.00000),     -- Ventolin Nebules: Túi 5 ống, Hộp 30 ống
    ('THUOC045', N'Túi', 5.00000),      ('THUOC045', N'Hộp', 20.00000),     -- Combivent: Túi 5 ống, Hộp 20 ống

    -- Thuốc hô hấp & tiêu hóa
    ('THUOC047', N'Vỉ', 15.00000),      ('THUOC047', N'Hộp', 30.00000),     -- Eurespal 80mg: Hộp 2 vỉ x 15 viên
    ('THUOC048', N'Vỉ', 10.00000),      ('THUOC048', N'Hộp', 20.00000),     -- Halixol 30mg: Hộp 2 vỉ x 10 viên
    ('THUOC049', N'Vỉ', 14.00000),      ('THUOC049', N'Hộp', 14.00000),     -- Pariet 20mg: Hộp 1 vỉ x 14 viên
    ('THUOC050', N'Vỉ', 14.00000),      ('THUOC050', N'Hộp', 14.00000),     -- Pantoloc 40mg: Hộp 1 vỉ x 14 viên
    ('THUOC051', N'Vỉ', 10.00000),      ('THUOC051', N'Hộp', 100.00000),    -- Motilium-M 10mg: Hộp 10 vỉ x 10 viên
    ('THUOC052', N'Vỉ', 15.00000),      ('THUOC052', N'Hộp', 50.00000),     -- Duspatalin 135mg: Hộp 50 viên
    ('THUOC053', N'Hộp', 30.00000),     ('THUOC053', N'Thùng', 900.00000),  -- Smecta: Gói -> Hộp 30 gói, Thùng 30 hộp
    ('THUOC054', N'Hộp', 20.00000),     ('THUOC054', N'Thùng', 600.00000),  -- Duphalac: Gói -> Hộp 20 gói
    ('THUOC055', N'Hộp', 4.00000),      ('THUOC055', N'Thùng', 120.00000),  -- Fortrans: Gói -> Hộp 4 gói
    ('THUOC056', N'Vỉ', 10.00000),      ('THUOC056', N'Hộp', 50.00000),     -- Boganic Forte: Hộp 5 vỉ x 10 viên
    ('THUOC057', N'Vỉ', 20.00000),      ('THUOC057', N'Hộp', 100.00000),    -- Ursofalk 250mg: Hộp 5 vỉ x 20 viên
    ('THUOC058', N'Vỉ', 10.00000),      ('THUOC058', N'Hộp', 100.00000),    -- Ciprofloxacin 500mg: Hộp 10 vỉ x 10 viên

    -- Thuốc tim mạch & huyết áp
    ('THUOC059', N'Vỉ', 10.00000),      ('THUOC059', N'Hộp', 30.00000),     -- Concor 5mg: Hộp 3 vỉ x 10 viên
    ('THUOC060', N'Vỉ', 14.00000),      ('THUOC060', N'Hộp', 28.00000),     -- Betaloc ZOK 50mg: Hộp 2 vỉ x 14 viên
    ('THUOC061', N'Lọ', 30.00000),      ('THUOC061', N'Hộp', 30.00000),     -- Coversyl 5mg: Lọ 30 viên
    ('THUOC062', N'Lọ', 30.00000),      ('THUOC062', N'Hộp', 30.00000),     -- Coveram 5/5mg: Lọ 30 viên
    ('THUOC063', N'Vỉ', 15.00000),      ('THUOC063', N'Hộp', 30.00000),     -- Natrilix SR 1.5mg: Hộp 2 vỉ x 15 viên
    ('THUOC064', N'Vỉ', 14.00000),      ('THUOC064', N'Hộp', 28.00000),     -- Plavix 75mg: Hộp 2 vỉ x 14 viên
    ('THUOC065', N'Vỉ', 10.00000),      ('THUOC065', N'Hộp', 100.00000),    -- Aspirin pH8: Hộp 10 vỉ x 10 viên

    -- Thuốc đái tháo đường & mỡ máu
    ('THUOC066', N'Vỉ', 15.00000),      ('THUOC066', N'Hộp', 30.00000),     -- Diamicron MR 60mg: Hộp 2 vỉ x 15 viên
    ('THUOC067', N'Vỉ', 14.00000),      ('THUOC067', N'Hộp', 28.00000),     -- Januvia 100mg: Hộp 2 vỉ x 14 viên
    ('THUOC068', N'Vỉ', 14.00000),      ('THUOC068', N'Hộp', 56.00000),     -- Janumet 50/1000mg: Hộp 4 vỉ x 14 viên
    ('THUOC069', N'Vỉ', 14.00000),      ('THUOC069', N'Hộp', 28.00000),     -- Crestor 10mg: Hộp 2 vỉ x 14 viên
    ('THUOC070', N'Vỉ', 10.00000),      ('THUOC070', N'Hộp', 30.00000),     -- Lipanthyl 200M: Hộp 3 vỉ x 10 viên

    -- Thuốc cơ xương khớp & Gút
    ('THUOC071', N'Vỉ', 10.00000),      ('THUOC071', N'Hộp', 30.00000),     -- Celebrex 200mg: Hộp 3 vỉ x 10 viên
    ('THUOC072', N'Vỉ', 10.00000),      ('THUOC072', N'Hộp', 30.00000),     -- Arcoxia 60mg: Hộp 3 vỉ x 10 viên
    ('THUOC073', N'Vỉ', 20.00000),      ('THUOC073', N'Hộp', 20.00000),     -- Colchicin 1mg: Hộp 1 vỉ x 20 viên
    ('THUOC074', N'Vỉ', 10.00000),      ('THUOC074', N'Hộp', 30.00000),     -- Allopurinol 300mg: Hộp 3 vỉ x 10 viên
    ('THUOC075', N'Vỉ', 10.00000),      ('THUOC075', N'Hộp', 30.00000),     -- Myonal 50mg: Hộp 3 vỉ x 10 viên

    -- --------------------------------------------------------------------------
    -- 3.2. DANH MỤC VẬT TƯ Y TẾ TIÊU HAO (VT001 - VT022)
    -- --------------------------------------------------------------------------
    -- Bơm tiêm & Kim lấy máu
    ('VT001', N'Hộp', 100.00000),       ('VT001', N'Thùng', 2000.00000),    -- Bơm tiêm 5ml: Cái -> Hộp 100 cái, Thùng 2000 cái
    ('VT002', N'Hộp', 100.00000),       ('VT002', N'Thùng', 1600.00000),    -- Bơm tiêm 10ml: Cái -> Hộp 100 cái, Thùng 1600 cái
    ('VT003', N'Hộp', 100.00000),       ('VT003', N'Thùng', 2000.00000),    -- Bơm tiêm 1ml: Cái -> Hộp 100 cái, Thùng 2000 cái
    ('VT004', N'Hộp', 100.00000),       ('VT004', N'Thùng', 5000.00000),    -- Kim 2 đầu 22G: Cái -> Hộp 100 cái, Thùng 5000 cái

    -- Ống nghiệm & Lọ bệnh phẩm
    ('VT005', N'Khay', 100.00000),      ('VT005', N'Thùng', 1200.00000),    -- Ống EDTA nắp tím: Ống -> Khay 100 ống, Thùng 1200 ống
    ('VT006', N'Khay', 100.00000),      ('VT006', N'Thùng', 1200.00000),    -- Ống Serum Gel nắp vàng: Ống -> Khay 100 ống, Thùng 1200 ống
    ('VT007', N'Khay', 100.00000),      ('VT007', N'Thùng', 1200.00000),    -- Ống Heparin nắp xanh: Ống -> Khay 100 ống, Thùng 1200 ống
    ('VT008', N'Bịch', 50.00000),       ('VT008', N'Thùng', 500.00000),     -- Lọ nước tiểu 50ml: Lọ -> Bịch 50 lọ, Thùng 500 lọ

    -- Khám tai mũi họng & dụng cụ thở
    ('VT009', N'Hộp', 100.00000),       ('VT009', N'Thùng', 5000.00000),    -- Đè lưỡi gỗ: Cái -> Hộp 100 cái, Thùng 5000 cái
    ('VT010', N'Túi', 50.00000),        ('VT010', N'Hộp', 250.00000),       -- Loa soi tai: Cái -> Túi 50 cái, Hộp 250 cái
    ('VT011', N'Túi', 10.00000),        ('VT011', N'Thùng', 100.00000),     -- Dây oxy 2 nhánh: Sợi -> Túi 10 sợi, Thùng 100 sợi
    ('VT012', N'Túi', 1.00000),         ('VT012', N'Thùng', 50.00000),      -- Bầu xông khí dung: Bộ -> Thùng 50 bộ

    -- Băng bông gạc & sát khuẩn
    ('VT013', N'Bao', 20.00000),        ('VT013', N'Thùng', 20.00000),      -- Bông Bạch Tuyết 500g: Cuộn -> Bao 20 cuộn
    ('VT014', N'Hộp', 10.00000),        ('VT014', N'Thùng', 100.00000),     -- Gạc 10x10cm (Gói 10m): Gói -> Hộp 10 gói, Thùng 100 gói
    ('VT015', N'Hộp', 100.00000),       ('VT015', N'Thùng', 5000.00000),    -- Băng dính Urgo: Miếng -> Hộp 100 miếng, Thùng 5000 miếng
    ('VT016', N'Hộp', 24.00000),        ('VT016', N'Thùng', 288.00000),     -- Băng keo lụa Urgopore: Cuộn -> Hộp 24 cuộn, Thùng 288 cuộn
    
    -- Dung dịch sát khuẩn & Cồn (Kèm quy đổi ra ml để tính định mức CLS siêu chính xác)
    ('VT017', N'Thùng', 20.00000),      ('VT017', N'ml', 0.00200),          -- Cồn 70 độ 500ml: Chai -> Thùng 20 chai; 1 ml = 0.002 Chai
    ('VT018', N'Thùng', 20.00000),      ('VT018', N'ml', 0.00200),          -- Cồn đỏ Povidine 500ml: Chai -> Thùng 20 chai; 1 ml = 0.002 Chai

    -- Đồ bảo hộ
    ('VT019', N'Hộp', 50.00000),        ('VT019', N'Thùng', 500.00000),     -- Găng tay Vglove (ĐVT cơ bản: Đôi): 1 Hộp 100 chiếc = 50 Đôi, Thùng = 10 Hộp = 500 Đôi
    ('VT019', N'Chiếc', 0.50000),                                            -- 1 Chiếc = 0.5 Đôi
    ('VT020', N'Hộp', 50.00000),        ('VT020', N'Thùng', 2500.00000),    -- Khẩu trang y tế 4 lớp: Cái -> Hộp 50 cái, Thùng 50 hộp = 2500 cái

    -- Gel siêu âm & Giấy in điện tim (Kèm quy đổi ml, Mét cho định mức CLS)
    ('VT021', N'Thùng', 4.00000),       ('VT021', N'ml', 0.00020),          -- Gel siêu âm Can 5L (5000ml): Can -> Thùng 4 can; 1 ml = 0.0002 Can
    ('VT022', N'Tập', 5.00000),         ('VT022', N'Thùng', 50.00000),      -- Giấy điện tim ECG 80mmx20m: Cuộn -> Tập 5 cuộn, Thùng 50 cuộn
    ('VT022', N'Mét', 0.05000);                                              -- 1 Mét giấy ECG = 0.05 Cuộn (20m)

    -- Thực hiện INSERT vào bảng DonViTinhQuyDoi (tránh trùng lặp)
    INSERT INTO DonViTinhQuyDoi (MaItem, DonVi, HeSo, IsBase, CreatedAt, IsDeleted)
    SELECT 
        i.Id,
        t.DonVi,
        t.HeSo,
        0, -- Không phải đơn vị cơ bản
        GETUTCDATE(),
        0
    FROM #TempConversions t
    JOIN Item i ON i.Ma = t.MaItemCode
    WHERE NOT EXISTS (
        SELECT 1 
        FROM DonViTinhQuyDoi q 
        WHERE q.MaItem = i.Id 
          AND q.DonVi = t.DonVi
    );

    DROP TABLE #TempConversions;

    PRINT N'    -> Đã nạp thành công toàn bộ đơn vị quy đổi thương mại.';

    COMMIT TRANSACTION;
    PRINT N'==============================================================================';
    PRINT N'>>> HOÀN TẤT THÀNH CÔNG! Danh mục thuốc/vật tư và bảng quy đổi đã đồng bộ.';
    PRINT N'==============================================================================';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    PRINT N'>>> LỖI KHI THỰC HIỆN: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
```

---

## 4. Cách Kiểm Tra Xác Nhận Sau Khi Chạy Script

Sau khi chạy script trên, bạn có thể thực hiện kiểm tra nhanh qua 3 câu query SQL:

### 4.1. Kiểm tra phân loại `LoaiItem`
```sql
SELECT LoaiItem, COUNT(*) AS SoLuongItem
FROM Item
GROUP BY LoaiItem;
```
*Kết quả chuẩn phải là*:
- `THUOC`: 50 mặt hàng
- `VA_TU`: 22 mặt hàng
*(Không còn bất kỳ bản ghi nào mang giá trị `'1'`, `'2'` hay `'VatTu'`)*.

### 4.2. Kiểm tra số lượng đơn vị quy đổi đã nạp
```sql
SELECT 
    i.Ma,
    i.Ten,
    i.LoaiItem,
    i.DonViTinhCoBan,
    COUNT(q.Id) AS SoLuongDonViQuyDoi,
    STRING_AGG(CONCAT(q.DonVi, ' (x', CAST(q.HeSo AS FLOAT), CASE WHEN q.IsBase = 1 THEN ' - Base' ELSE '' END, ')'), ', ') AS DanhSachDonVi
FROM Item i
LEFT JOIN DonViTinhQuyDoi q ON q.MaItem = i.Id AND q.IsDeleted = 0
GROUP BY i.Id, i.Ma, i.Ten, i.LoaiItem, i.DonViTinhCoBan
ORDER BY i.Id;
```

### 4.3. Kiểm tra trên Giao diện Web (Frontend)
1. Mở màn hình **Tạo phiếu nhập kho Dược** (`/inventory/import`):
   - Chọn một mặt hàng (ví dụ: `Singulair 10mg`).
   - Kiểm tra ô chọn **Đơn vị nhập**: dropdown sẽ hiển thị đầy đủ cả 3 đơn vị: `Viên`, `Vỉ`, `Hộp`.
   - Bấm vào tag `Hộp` hoặc `Vỉ` ở thanh chọn nhanh bên dưới, hệ thống sẽ tự động tính đúng tỷ lệ quy đổi và giá trị thành tiền.
2. Kiểm tra duyệt kết quả Cận lâm sàng (CLS):
   - Duyệt xét nghiệm có định mức cồn `5 ml` hoặc siêu âm `25 ml` gel: Backend sẽ đọc đúng hệ số quy đổi trong bảng `DonViTinhQuyDoi` và xuất trừ kho chuẩn xác, không gặp lỗi lệch đơn vị.
