# Hướng dẫn thêm danh mục dịch vụ vào SQL

## 1. Mục đích

Tài liệu này hướng dẫn thêm dữ liệu vào danh mục dịch vụ của
`ClinicManagement` để các flow khám bệnh, chỉ định dịch vụ, cận lâm sàng và
viện phí có thể sử dụng đúng dữ liệu thật trong database.

Phạm vi của tài liệu:

- Bảng `DanhMucDichVu`.
- Quan hệ với `ChiDinhDichVu`.
- Cách danh mục dịch vụ được đưa vào `HoaDon`.
- Cách kiểm tra dữ liệu qua API và flow nghiệp vụ.
- Dữ liệu mẫu phù hợp với database development hiện tại.

Không thêm dữ liệu trực tiếp vào `ChiDinhDichVu` nếu chưa có `LuotKham` và
`NhanVien` hợp lệ. Danh mục là dữ liệu dùng chung; chỉ định dịch vụ mới là dữ
liệu phát sinh theo từng lượt khám.

## 2. Phân tích domain hiện tại

### 2.1. Entity danh mục dịch vụ

Entity [DanhMucDichVu.cs](../../ClinicManagement.Domain/Service/DanhMucDichVu.cs)
có các thuộc tính:

| Trường C# | Cột SQL | Kiểu SQL | Bắt buộc | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `Id` | `int identity` | Hệ thống sinh | Khóa chính |
| `LoaiDichVu` | `LoaiDichVu` | `nvarchar(20)` | Có | Nhóm nghiệp vụ của dịch vụ |
| `Ma` | `Ma` | `nvarchar(50)` | Có | Mã dịch vụ nghiệp vụ |
| `Ten` | `Ten` | `nvarchar(255)` | Có | Tên hiển thị |
| `DonViTinh` | `DonViTinh` | `nvarchar(50)` | Có | Đơn vị tính, thông thường là `Lần` |
| `Gia` | `Gia` | `decimal(18,2)` | Có | Đơn giá niêm yết |
| `CreatedAt` | `CreatedAt` | `datetime2` | Có | Thời điểm tạo |
| `CreatedBy` | `CreatedBy` | `int null` | Không | Người tạo, nếu có |
| `UpdatedAt` | `UpdatedAt` | `datetime2 null` | Không | Thời điểm cập nhật |
| `UpdatedBy` | `UpdatedBy` | `int null` | Không | Người cập nhật |
| `IsDeleted` | `IsDeleted` | `bit` | Có | Xóa mềm |
| `DeletedAt` | `DeletedAt` | `datetime2 null` | Không | Thời điểm xóa mềm |
| `DeletedBy` | `DeletedBy` | `int null` | Không | Người xóa mềm |

Migration `InitialCreate` và
[DanhMucDichVuConfiguration.cs](../../ClinicManagement.Infrastructure/Persistence/Configurations/DanhMucDichVuConfiguration.cs)
đang định nghĩa:

- `LoaiDichVu` lưu tên enum dạng chuỗi, không lưu số `1`, `2`, `3`, `4`.
- Khóa duy nhất trên cặp `(LoaiDichVu, Ma)`.
- Index tìm kiếm trên `Ten`.
- `Gia` là `decimal(18,2)`.

Do khóa duy nhất không loại trừ bản ghi `IsDeleted = 1`, không được tạo lại
cùng mã trong cùng loại sau khi xóa mềm. Hãy khôi phục bản ghi cũ hoặc dùng mã
mới.

### 2.2. Giá trị hợp lệ của `LoaiDichVu`

Enum
[LoaiDichVu.cs](../../ClinicManagement.Domain/Common/Enums/LoaiDichVu.cs)
hiện có bốn giá trị:

| Giá trị lưu trong SQL | Ý nghĩa | Ví dụ |
|---|---|---|
| `Kham` | Khám | Khám nội tổng quát |
| `XetNghiem` | Xét nghiệm | Công thức máu |
| `ChanDoanHinhAnh` | Chẩn đoán hình ảnh | Siêu âm ổ bụng |
| `DichVuKyThuat` | Dịch vụ kỹ thuật | Nội soi tiêu hóa |

Phải dùng đúng chữ và đúng cách viết trên. Không dùng các giá trị tự đặt như
`CLS`, `XN`, `CDHA`, `Khac` vì query hiện tại parse chuỗi bằng
`Enum.TryParse<LoaiDichVu>()`.

### 2.3. Quan hệ với chỉ định dịch vụ

`ChiDinhDichVu.MaDanhMuc` là khóa ngoại tới `DanhMucDichVu.Id`.

Flow đúng:

```text
DanhMucDichVu
    ↓ chọn dịch vụ
LuotKham
    ↓ tạo chỉ định
ChiDinhDichVu
    ↓ hoàn thành và có kết luận
HoaDon
    ↓ lấy Ten + Gia từ DanhMucDichVu
ChiTietHoaDon
```

Controller đọc danh mục hiện tại là:

```http
GET /api/LuotKham/danh-muc-dich-vu
GET /api/LuotKham/danh-muc-dich-vu?loaiDichVu=XetNghiem
```

Endpoint trả các trường:

```json
{
  "id": 2,
  "ma": "XN-CBC",
  "ten": "Công thức máu",
  "loaiDichVu": "XetNghiem",
  "donViTinh": "Lần",
  "gia": 120000.00
}
```

### 2.4. Quy tắc đưa vào hóa đơn

Khi tạo hóa đơn từ lượt khám, hệ thống dùng tương đương:

```csharp
invoice.AddServiceOrDrug(
    "DICH_VU",
    service.MaDanhMuc,
    service.DanhMucDichVu.Ten,
    1,
    service.DanhMucDichVu.Gia);
```

Vì vậy:

- `Gia` phải là giá dương và đúng đơn vị tiền Việt Nam.
- Tên dịch vụ không được để trống.
- Một chỉ định dịch vụ hiện được tính số lượng `1`.
- Không nên sửa giá danh mục tùy tiện sau khi đã phát sinh hóa đơn; hóa đơn
  phải giữ giá trị lịch sử tại thời điểm lập.
- Chỉ định có trạng thái `DaHuy` không được tính vào hóa đơn theo flow hiện
  tại.

## 3. Chuẩn bị trước khi chạy SQL

1. Chọn đúng database development `ClinicManagementDb`.
2. Kiểm tra migration đã được áp dụng:

```sql
SELECT MigrationId
FROM dbo.__EFMigrationsHistory
ORDER BY MigrationId;
```

3. Kiểm tra bảng tồn tại:

```sql
SELECT OBJECT_ID(N'dbo.DanhMucDichVu', N'U') AS DanhMucDichVuObjectId;
```

4. Không chạy script trên production nếu chưa có phê duyệt bảng giá và quy
   trình kiểm soát thay đổi.
5. Không tự chèn `Id`; để SQL Server tự sinh identity, trừ khi có yêu cầu
   migration/khôi phục dữ liệu đặc biệt.

## 4. Script thêm danh mục dịch vụ mẫu

Script dưới đây an toàn khi chạy lặp lại. Nó chỉ thêm mã chưa tồn tại trong
cùng loại dịch vụ và không sửa giá của bản ghi đã có.

```sql
SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @Now datetime2 = SYSUTCDATETIME();

DECLARE @Services TABLE
(
    LoaiDichVu nvarchar(20) NOT NULL,
    Ma nvarchar(50) NOT NULL,
    Ten nvarchar(255) NOT NULL,
    DonViTinh nvarchar(50) NOT NULL,
    Gia decimal(18,2) NOT NULL
);

INSERT INTO @Services (LoaiDichVu, Ma, Ten, DonViTinh, Gia)
VALUES
    (N'Kham',               N'K-NOI-TQ',  N'Khám nội tổng quát',       N'Lần', 150000.00),
    (N'Kham',               N'K-NGOAI',   N'Khám ngoại khoa',           N'Lần', 180000.00),
    (N'Kham',               N'K-NHI',     N'Khám nhi khoa',             N'Lần', 160000.00),
    (N'XetNghiem',          N'XN-CBC',    N'Công thức máu',             N'Lần', 120000.00),
    (N'XetNghiem',          N'XN-GLU',    N'Đường huyết',                N'Lần',  60000.00),
    (N'XetNghiem',          N'XN-LIVER',  N'Chức năng gan',              N'Lần', 250000.00),
    (N'XetNghiem',          N'XN-URINE',  N'Tổng phân tích nước tiểu',   N'Lần',  80000.00),
    (N'ChanDoanHinhAnh',    N'CDHA-SIAB', N'Siêu âm ổ bụng',             N'Lần', 220000.00),
    (N'ChanDoanHinhAnh',    N'CDHA-XQ',   N'X-quang ngực thẳng',         N'Lần', 180000.00),
    (N'ChanDoanHinhAnh',    N'CDHA-CT',   N'Chụp CT sọ não không cản quang', N'Lần', 1200000.00),
    (N'DichVuKyThuat',      N'KT-DT',     N'Điện tim thường',             N'Lần', 100000.00),
    (N'DichVuKyThuat',      N'KT-NSDD',   N'Nội soi dạ dày',              N'Lần', 850000.00);

IF EXISTS
(
    SELECT 1
    FROM @Services
    WHERE Gia <= 0
       OR LTRIM(RTRIM(Ma)) = N''
       OR LTRIM(RTRIM(Ten)) = N''
       OR LTRIM(RTRIM(DonViTinh)) = N''
)
    THROW 51000, N'Dữ liệu danh mục dịch vụ không hợp lệ.', 1;

INSERT INTO dbo.DanhMucDichVu
(
    LoaiDichVu,
    Ma,
    Ten,
    DonViTinh,
    Gia,
    CreatedAt,
    CreatedBy,
    UpdatedAt,
    UpdatedBy,
    IsDeleted,
    DeletedAt,
    DeletedBy
)
SELECT
    s.LoaiDichVu,
    s.Ma,
    s.Ten,
    s.DonViTinh,
    s.Gia,
    @Now,
    NULL,
    NULL,
    NULL,
    0,
    NULL,
    NULL
FROM @Services AS s
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.DanhMucDichVu AS d
    WHERE d.LoaiDichVu = s.LoaiDichVu
      AND d.Ma = s.Ma
);

COMMIT TRANSACTION;
```

`CreatedBy = NULL` phù hợp với script seed kỹ thuật khi chưa có người dùng
nghiệp vụ. Khi dữ liệu được tạo qua API hoặc giao diện quản trị, nên ghi ID
người dùng thực tế.

## 5. Kiểm tra sau khi insert

### 5.1. Kiểm tra số lượng theo loại

```sql
SELECT
    LoaiDichVu,
    COUNT(*) AS SoLuong,
    MIN(Gia) AS GiaThapNhat,
    MAX(Gia) AS GiaCaoNhat
FROM dbo.DanhMucDichVu
WHERE IsDeleted = 0
GROUP BY LoaiDichVu
ORDER BY LoaiDichVu;
```

### 5.2. Kiểm tra mã trùng

```sql
SELECT LoaiDichVu, Ma, COUNT(*) AS SoDong
FROM dbo.DanhMucDichVu
GROUP BY LoaiDichVu, Ma
HAVING COUNT(*) > 1;
```

Kết quả đúng phải không có dòng nào.

### 5.3. Kiểm tra dữ liệu không hợp lệ

```sql
SELECT Id, LoaiDichVu, Ma, Ten, DonViTinh, Gia, IsDeleted
FROM dbo.DanhMucDichVu
WHERE ISNULL(LTRIM(RTRIM(Ma)), N'') = N''
   OR ISNULL(LTRIM(RTRIM(Ten)), N'') = N''
   OR ISNULL(LTRIM(RTRIM(DonViTinh)), N'') = N''
   OR Gia <= 0
   OR LoaiDichVu NOT IN
      (N'Kham', N'XetNghiem', N'ChanDoanHinhAnh', N'DichVuKyThuat');
```

Kết quả đúng phải không có dòng nào.

### 5.4. Kiểm tra API danh mục

```http
GET https://localhost:7081/api/LuotKham/danh-muc-dich-vu
Authorization: Bearer <access-token>
```

Lọc theo loại:

```http
GET https://localhost:7081/api/LuotKham/danh-muc-dich-vu?loaiDichVu=XetNghiem
Authorization: Bearer <access-token>
```

Nếu API trả `403`, kiểm tra quyền `examination / XEM` và phạm vi dữ liệu của
user. Nếu trả `200` nhưng danh sách rỗng, kiểm tra `IsDeleted` và chính tả
`LoaiDichVu`.

## 6. Kiểm thử theo flow nghiệp vụ

### Ca 1: Chỉ đọc danh mục

1. Gọi API danh mục không truyền filter.
2. Xác nhận có đủ bốn nhóm dịch vụ.
3. Xác nhận `gia` là số, không phải chuỗi.
4. Xác nhận `id` là ID thực tế trong SQL.

### Ca 2: Lọc danh mục xét nghiệm

```http
GET /api/LuotKham/danh-muc-dich-vu?loaiDichVu=XetNghiem
```

Kết quả chỉ được chứa các dòng có:

```text
LoaiDichVu = XetNghiem
```

### Ca 3: Tạo chỉ định cho lượt khám

Điều kiện trước:

- Có `LuotKham` hợp lệ.
- Có bác sĩ tồn tại trong `NhanVien`.
- `MaDanhMuc` trỏ tới dòng không bị xóa mềm.

Request minh họa:

```http
POST /api/LuotKham/{luotKhamId}/chi-dinh-dich-vu
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "maDanhMuc": 4,
  "maBacSiChiDinh": 1,
  "maNguoiThucHien": null,
  "trangThai": "DaChiDinh",
  "ketLuan": null,
  "urlKetQua": null,
  "ngayThucHien": null,
  "ngayCoKetQua": null
}
```

Không dùng `maDanhMuc` cố định `4` trong môi trường khác; lấy ID từ kết quả
API hoặc câu SQL:

```sql
SELECT TOP (1) Id
FROM dbo.DanhMucDichVu
WHERE Ma = N'XN-CBC'
  AND LoaiDichVu = N'XetNghiem'
  AND IsDeleted = 0;
```

### Ca 4: Tiếp nhận và hoàn thành dịch vụ

Trạng thái hợp lệ:

```text
DaChiDinh → DaTiepNhan → DaCoKetQua
```

Khi hoàn thành phải có:

- `MaNguoiThucHien` là nhân viên hợp lệ.
- `KetLuan` không rỗng.
- Thời điểm thực hiện và có kết quả do domain cập nhật.

Không chuyển thẳng sang `DaCoKetQua` bằng SQL nếu muốn kiểm thử đúng business
rule của entity `ChiDinhDichVu`.

### Ca 5: Tạo hóa đơn từ lượt khám

Khi tạo hóa đơn, hệ thống lấy:

```text
ChiDinhDichVu.MaDanhMuc
DanhMucDichVu.Ten
DanhMucDichVu.Gia
```

Một dịch vụ được tính:

```text
Số lượng = 1
Đơn giá = DanhMucDichVu.Gia
Thành tiền = 1 × Gia
```

Sau khi tạo hóa đơn, kiểm tra:

```sql
SELECT
    hd.Id,
    hd.SoHoaDon,
    ct.LoaiDoiTuong,
    ct.MaDoiTuong,
    ct.MoTa,
    ct.SoLuong,
    ct.DonGia,
    ct.ThanhTien
FROM dbo.HoaDon AS hd
JOIN dbo.ChiTietHoaDon AS ct ON ct.MaHoaDon = hd.Id
WHERE ct.LoaiDoiTuong = N'DICH_VU'
ORDER BY hd.Id DESC;
```

Tên bảng/cột chi tiết hóa đơn phải được đối chiếu lại với migration đang chạy
trước khi sử dụng câu truy vấn kiểm tra trên. Logic domain hiện tại dùng
`LoaiDoiTuong = "DICH_VU"`.

## 7. Dữ liệu không nên thêm vào bảng này

Không đưa các dữ liệu sau vào `DanhMucDichVu`:

| Dữ liệu | Bảng/flow đúng |
|---|---|
| Tồn kho thuốc | `Item`, `TonKho` |
| Vật tư tiêu hao của dịch vụ | `DinhMucVatTuDichVu` |
| Lượt bệnh nhân sử dụng dịch vụ | `ChiDinhDichVu` |
| Kết quả xét nghiệm | `ChiTietKetQuaXetNghiem` |
| Giá đã thanh toán | `HoaDon`, `ChiTietHoaDon`, `PhieuThu` |
| Khoa thực hiện | Quan hệ `LuotKham`/`Khoa` và nhân sự thực hiện |

Nếu dịch vụ cần trừ vật tư, sau khi danh mục tồn tại mới thêm định mức vào
`DinhMucVatTuDichVu`. Không tạo tồn kho giả chỉ để làm cho danh mục xuất hiện.

## 8. Cập nhật giá và xóa dịch vụ

### Cập nhật giá

Chỉ cập nhật giá cho giao dịch tương lai và phải ghi nhận người cập nhật:

```sql
UPDATE dbo.DanhMucDichVu
SET Gia = 135000.00,
    UpdatedAt = SYSUTCDATETIME(),
    UpdatedBy = 1
WHERE Ma = N'XN-CBC'
  AND LoaiDichVu = N'XetNghiem'
  AND IsDeleted = 0;
```

Không cập nhật `Gia` của `ChiTietHoaDon` cũ theo giá mới.

### Xóa mềm

```sql
UPDATE dbo.DanhMucDichVu
SET IsDeleted = 1,
    DeletedAt = SYSUTCDATETIME(),
    DeletedBy = 1
WHERE Ma = N'KT-NSDD'
  AND LoaiDichVu = N'DichVuKyThuat'
  AND IsDeleted = 0;
```

Sau khi xóa mềm:

- Endpoint danh mục không trả dòng đó.
- Chỉ định cũ vẫn giữ được khóa ngoại.
- Không được tạo lại cùng `(LoaiDichVu, Ma)` vì unique index vẫn còn hiệu lực.

## 9. Checklist nghiệm thu

- [ ] Đã chạy đúng database và đúng môi trường.
- [ ] Migration `DanhMucDichVu` đã tồn tại.
- [ ] `LoaiDichVu` dùng đúng tên enum dạng chuỗi.
- [ ] `Ma` không trùng trong cùng loại.
- [ ] `Ten` và `DonViTinh` không rỗng.
- [ ] `Gia > 0` và không vượt giới hạn nghiệp vụ.
- [ ] `IsDeleted = 0` cho danh mục đang sử dụng.
- [ ] API không filter trả được danh mục.
- [ ] API filter `XetNghiem` chỉ trả đúng nhóm.
- [ ] Tạo được `ChiDinhDichVu` với ID thực tế.
- [ ] Flow `DaChiDinh → DaTiepNhan → DaCoKetQua` hoạt động.
- [ ] Hóa đơn lấy đúng tên và giá danh mục.
- [ ] Không sửa ngược giá của hóa đơn cũ.
- [ ] Dữ liệu cũ của hóa đơn vẫn tra cứu được sau khi danh mục bị xóa mềm.

## 10. Lưu ý triển khai

Hiện backend đã có endpoint đọc danh mục dịch vụ và flow sử dụng danh mục,
nhưng tài liệu này không giả định đã có endpoint CRUD quản trị danh mục. Nếu
AdminUI cần thêm/sửa/xóa danh mục qua giao diện, cần bổ sung API quản trị riêng
với:

- Request DTO có validation mã, tên, loại, đơn giá.
- Kiểm tra trùng `(LoaiDichVu, Ma)`.
- Xóa mềm thay vì xóa vật lý.
- Audit log cho thay đổi bảng giá.
- Quyền riêng cho module danh mục dịch vụ.

Cho đến khi API quản trị được triển khai, dùng script SQL trong tài liệu này
chỉ ở môi trường development/test hoặc theo quy trình DBA được phê duyệt.
