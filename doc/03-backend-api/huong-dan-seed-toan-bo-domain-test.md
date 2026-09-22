# Huong dan seed toan bo Domain de test

## 1. Trang thai database sau khi lam sach

Database development da duoc lam sach vao `2026-09-16`.

- Database: `ClinicManagementDb`.
- Server: SQL Server development container.
- Schema va migration duoc giu nguyen.
- Bang `__EFMigrationsHistory` duoc giu nguyen.
- Tat ca bang nghiep vu con `0` ban ghi.
- Tong so migration da ap dung: `25`.

Khong chay bo seed nay tren production. Tat ca du lieu ben duoi la du lieu gia
lap, khong dung thong tin benh nhan that.

## 2. Nguyen tac seed

Seed theo quan he domain, tu aggregate root den transaction:

```text
He thong
  -> Co so/Khoa/Phong
  -> Nhan vien/Vai tro/Quyen
  -> Benh nhan/Bao hiem/Tien su
  -> Danh muc dich vu/ICD/Thuoc
  -> Kho/Nhap kho/Ton kho
  -> Lich hen/Luot kham/Sinh hieu
  -> Kham benh/Chan doan/Chi dinh
  -> Don thuoc/Cấp phat
  -> Hoa don/Phieu thu/Cong no
  -> Lich lam viec/Cham cong/Bang luong
  -> Audit/Integration/Role Matrix
```

Quy tac bat buoc:

1. Luu ban ghi cha truoc, lay `Id` tra ve tu API.
2. Dung `Id` vua tao cho request tiep theo; khong gia dinh `Id = 1`.
3. Moi request phai gui JWT phu hop.
4. Tao role va gan role cho nhan vien truoc khi test endpoint co `ClinicalAuthorize`.
5. Ghi lai cac ID test vao mot file rieng ngoai repository:

```text
coSoId
khoaId
phongKhamId
nhanVienAdminId
nhanVienBacSiId
benhNhanId
luotKhamId
itemThuocId
hoaDonId
```

## 3. Chuan bi

```bash
dotnet ef database update \
  --project ClinicManagement.Infrastructure \
  --startup-project ClinicManagement.API

dotnet run --project ClinicManagement.API
```

Khai bao trong REST Client:

```http
@baseUrl = https://localhost:7081/api
@token = thay-bang-jwt-development
@auth = Bearer {{token}}
```

Neu chua co user/Auth seed, can tao user theo module Auth hien co cua project
hoac dung tai khoan development da duoc cap. Khong commit token vao repository.

## 4. Domain 1 - He thong va co cau to chuc

### 4.1. Co so

Tao mot co so test:

```text
Ma: CS-TEST
Ten: Co so test ClinicManagement
Trang thai: ACTIVE
```

Luu lai `coSoId`.

### 4.2. Khoa phong va phong kham

Tao toi thieu:

| Du lieu | Ma test | Muc dich |
|---|---|---|
| Khoa Noi | NOI-TEST | Test luot kham noi khoa |
| Khoa Duoc | DUOC-TEST | Test kho va cap phat |
| Khoa Tai chinh | TC-TEST | Test hoa don va thu tien |
| Phong kham Noi | PK-NOI-01 | Test queue |

Gan phong kham vao khoa va co so theo DTO cua API. Luu `khoaNoiId`,
`khoaDuocId`, `phongKhamId`.

## 5. Domain 2 - Nhan vien, role va quyen

### 5.1. Nhan vien test

Tao toi thieu:

| Vai tro nghiep vu | Ma test | Khoa |
|---|---|---|
| Admin | NV-ADMIN-TEST | Khoa Tai chinh |
| Bac si | NV-BS-TEST | Khoa Noi |
| Dieu duong | NV-DD-TEST | Khoa Noi |
| Duoc si | NV-DS-TEST | Khoa Duoc |
| Thu ngan | NV-TN-TEST | Khoa Tai chinh |

Gan nhan vien vao `NhanVienKhoa`. Luu ID nhan vien de doi chieu audit
va token `sub`.

### 5.2. Role legacy va RolePermissionMatrix

Bang `Quyen` legacy co the giu cac quyen:

```text
QuanLyNhanVien
XemBenhNhan
TaoLichHen
SuaLichHen
XoaLichHen
KhamBenh
KeDonThuoc
XemHoaDon
TaoHoaDon
ThuTien
QuanLyKho
QuanLyTaiChinh
```

Tuy nhien authorization moi doc:

```text
NhanVien -> NhanVienVaiTro -> VaiTro -> RolePermissionMatrix
```

Role Admin test can co toi thieu:

```text
settings + VIEW   + ALL_FACILITIES
settings + EDIT   + ALL_FACILITIES
audit    + VIEW   + ALL_FACILITIES
audit    + CREATE + ALL_FACILITIES
patient  + VIEW   + ALL_FACILITIES
examination + VIEW/CREATE/EDIT + ALL_FACILITIES
billing  + VIEW/CREATE/APPROVE + ALL_FACILITIES
inventory + VIEW/CREATE/EDIT/APPROVE + ALL_FACILITIES
```

Dung script `RolePermissionMatrix` trong:

[huong-dan-tao-du-lieu-mau-test-module.md](./huong-dan-tao-du-lieu-mau-test-module.md)

Luu y `Action` va `DataScope` duoc luu bang chuoi, khong phai so:

```text
VIEW, CREATE, EDIT, DELETE, APPROVE
ALL_FACILITIES, FACILITY_ONLY, DEPARTMENT_ONLY, BRANCH
```

## 6. Domain 3 - Benh nhan va bao hiem

Tao toi thieu ba benh nhan:

| Ma test | Muc dich |
|---|---|
| BN-TEST-001 | Ca kham binh thuong |
| BN-TEST-002 | Ca co tien su di ung |
| BN-TEST-003 | Ca BHYT va phat sinh cong no |

Voi moi benh nhan:

1. Tao thong tin hanh chinh.
2. Gan co so qua `BenhNhanCoSo`.
3. Tao bao hiem cho `BN-TEST-003`.
4. Tao tien su di ung cho `BN-TEST-002`, vi du:

```text
Penicillin
Amoxicillin
```

Khong dung CCCD/so dien thoai that. Dung chuoi test rieng cua moi truong.

## 7. Domain 4 - Danh muc lam sang

### 7.1. ICD

Can co toi thieu:

```text
J06.9 - Nhiem trung duong ho hap cap, khong dac hieu
I10   - Tang huyet ap vo can
```

Dung API tim kiem ICD de lay ID, sau do dung ID do khi tao chan doan.

### 7.2. Dich vu

Tao toi thieu:

| Ma | Ten | Gia |
|---|---|---:|
| DV-KHAM | Kham noi tong quat | 150000 |
| DV-XN-CBC | Cong thuc mau | 120000 |
| DV-SA | Sieu am tong quat | 250000 |
| DV-ECG | Dien tim | 100000 |

Gia chi la du lieu test va phai phu hop DTO `DanhMucDichVu`.

## 8. Domain 5 - Thuoc, vat tu va kho

### 8.1. Danh muc Item

Tao toi thieu:

| Ma | Ten | Hoat chat | BHYT | Ton toi thieu |
|---|---|---|---|---:|
| THUOC-PEN | Penicillin test | Penicillin | 100% | 20 |
| THUOC-AMO | Amoxicillin test | Amoxicillin | 80% | 20 |
| THUOC-PARA | Paracetamol test | Paracetamol | 80% | 30 |
| VAT-TU-01 | Gang tay test | N/A | 0% | 100 |

Phai dien cac field da mo rong:

```text
HoatChat
SoDangKy
DuongDung
MaBHYT
TyLeBHYT
SafetyStockLevel
```

### 8.2. Kho va nhap kho

1. Tao kho `KHO-DUOC-TEST`.
2. Tao phieu nhap.
3. Tao chi tiet nhap cho tung item.
4. Xac nhan phieu nhap theo API hien co.
5. Kiem tra `TonKho` lon hon 0.

Can co hai muc ton:

```text
Paracetamol: ton du, cho phep ke don
Amoxicillin: ton thap, tao canh bao safety stock
```

## 9. Domain 6 - Lich hen va queue

Tao ba lich hen gan `BN-TEST-001`, `BN-TEST-002`, `BN-TEST-003` vao
`PK-NOI-01`:

| Benh nhan | Uu tien | Trang thai |
|---|---|---|
| BN-TEST-001 | NORMAL | Dang cho |
| BN-TEST-002 | URGENT | Dang cho |
| BN-TEST-003 | EMERGENCY | Dang cho |

Kiem tra queue phai sap xep:

```text
EMERGENCY -> URGENT -> NORMAL
```

Kiem tra hover vitals sau khi tao `SinhHieu` cho moi luot kham:

```text
Mach, huyet ap, SpO2, can nang, chieu cao, BMI
```

## 10. Domain 7 - Luot kham va EMR

Tao ba luot kham voi cac case:

### Case A - Dang xu ly

- Co ly do kham.
- Co sinh hieu.
- Chua co chan doan.
- Trang thai dang kham.

Muc dich: test queue va giao dien kham.

### Case B - Co the hoan tat

- Co ly do kham.
- Co it nhat mot chan doan chinh ICD-10.
- Co the tao don va dich vu.

Goi:

```http
POST /api/luotkham/{id}/complete
```

Ket qua mong doi:

- Trang thai `COMPLETED`.
- Co the sinh hoa don neu flow billing yeu cau.
- Khong cho complete neu thieu ly do kham hoac chan doan chinh.

### Case C - Da khoa EMR

Sau khi complete, goi:

```http
POST /api/luotkham/{id}/emr/lock
```

Payload dung contract hien tai:

```json
{
  "lyDo": "Khoa ho so test sau khi hoan tat kham",
  "chuKySo": "SIG_TEST_20260916"
}
```

Ket qua mong doi:

- `EmrLocked = true`.
- Co `EmrLockedAt`.
- Co `EmrLockedBy`.
- Co `EmrSignature`.
- Cac thao tac sua/xoa EMR sau do bi chan.

## 11. Domain 8 - Chan doan, dich vu va ket qua

Voi Case B:

1. Tao chan doan chinh `J06.9`.
2. Tao chan doan phu neu can.
3. Tao chi dinh `DV-XN-CBC`.
4. Tao ket qua xet nghiem.
5. Kiem tra khong cho sua neu EMR da khoa.

Case loi can test:

- Tao chan doan voi ICD khong ton tai.
- Tao diagnosis khong phai chan doan chinh.
- Sua ket qua tren luot kham da khoa.

## 12. Domain 9 - Don thuoc va an toan di ung

### Case an toan

Ke `Paracetamol` cho `BN-TEST-001`.

Ket qua:

```text
SAFE
```

### Case canh bao nghiem trong

Ke `Penicillin` hoac `Amoxicillin` cho `BN-TEST-002`, benh nhan co tien su
di ung tuong ung.

Ket qua mong doi:

```text
CRITICAL
```

Request kiem tra:

```http
POST /api/ai/drug-interaction-check
```

```json
{
  "patientId": 2,
  "medicineIds": [1],
  "note": "Test canh bao di ung"
}
```

Khong dung ID `2` va `1` co dinh trong moi database; thay bang ID that da luu.

## 13. Domain 10 - Hoa don, phieu thu va cong no

Tao hoa don cho cac case da complete:

| Hoa don | Thanh toan | Muc dich |
|---|---|---|
| HD-TEST-PAID | 100% | Test da thu |
| HD-TEST-PARTIAL | Mot phan | Test con no |
| HD-TEST-UNPAID | 0% | Test chua thu |

Tao `PhieuThu` cho hai hoa don dau. Tao `CongNoBenhNhan` cho hoa don
partial/unpaid, dat han thanh toan trong qua khu de test `QUA_HAN`.

Kiem tra:

```http
GET /api/admin/dashboard/finance?facilityId={coSoId}&fromDate=2026-09-01&toDate=2026-09-16
```

Can thay:

- Tong doanh thu.
- Da thu.
- Chua thu.
- BHYT chi tra.
- So hoa don.
- Cong no qua han.

## 14. Domain 11 - Lich lam viec, cham cong va payroll

Tao:

1. `LoaiCa`: ca sang, ca chieu.
2. `CaTruc`: ca test gan co so/khoa.
3. `LichLamViec`: lich cua bac si va dieu duong.
4. `ChamCong`: mot ngay dung, mot ngay nghi.
5. `KyChamCong`: ky test.
6. `KyLuong`, `BangLuong`, `ChiTietBangLuong`.

Muc dich:

- Kiem tra danh sach nhan vien truc.
- Kiem tra tinh cong.
- Kiem tra tinh luong.
- Kiem tra dashboard HR.

Neu chua co quan he phong/ca day du, UI duoc phep hien thi `--`, khong duoc
tu gan phong/ca gia.

## 15. Domain 12 - Integration Settings

Tao cac setting test:

| Category | Code | Value |
|---|---|---|
| LIS | HL7_PORT | 12575 |
| LIS | ENCODING | UTF-8 |
| PACS | AE_TITLE | PACS_TEST |
| PACS | HOST | 127.0.0.1 |
| PACS | PORT | 11112 |
| PACS | VIEWER_URL | http://localhost:8080/viewer |
| BHYT | FACILITY_CODE | TEST-CSKCB |
| BHYT | FORMAT | 4210 |

Kiem tra:

```http
GET /api/admin/integration-config?category=LIS
```

Goi POST lai cung `Category + Code` de kiem tra upsert, khong tao dong trung.

## 16. Domain 13 - Audit Trail

Ghi audit cho cac hanh vi:

```text
VIEW
SIGN
PRESCRIBE
BILLING
DISPENSE
EXPORT
```

Moi log phai tham chieu dung:

```text
PatientId
RecordId
UserId
Action
Module
IpAddress
Timestamp
Details
Status
```

Kiem tra:

```http
GET /api/admin/audit-logs?patientId={benhNhanId}&pageIndex=1&pageSize=20
GET /api/admin/audit-logs?action=PRESCRIBE&module=EMR
GET /api/admin/audit-logs/export?patientId={benhNhanId}
```

## 17. Domain 14 - Dashboard va bao cao

Sau khi seed xong cac domain tren, goi:

```http
GET /api/admin/dashboard/overview?facilityId={coSoId}&date=2026-09-16
GET /api/admin/dashboard/finance?facilityId={coSoId}&fromDate=2026-09-01&toDate=2026-09-16
GET /api/admin/dashboard/staff?facilityId={coSoId}
GET /api/admin/dashboard/reports?facilityId={coSoId}&fromDate=2026-09-01&toDate=2026-09-16
GET /api/admin/dashboard/reports/export?facilityId={coSoId}&fromDate=2026-09-01&toDate=2026-09-16
```

Doi chieu:

| API | Nguon chinh |
|---|---|
| Overview | BenhNhan, LuotKham, HoaDon, CongNo, AuditLog |
| Finance | HoaDon, PhieuThu, CongNo |
| Staff | NhanVien, NhanVienKhoa, Khoa |
| Reports | HoaDon, LuotKham, Khoa, NhanVien |

## 18. Ma tran cac truong hop can test

| Nhom | Case thanh cong | Case loi |
|---|---|---|
| Authorization | User co role va matrix | Thieu matrix -> `403` |
| Scope | `ALL_FACILITIES` doc du lieu | `DEPARTMENT_ONLY` truy cap sai khoa |
| Queue | Emergency duoc uu tien | Queue thieu phong kham |
| EMR | Complete co ly do + ICD | Complete thieu chan doan |
| EMR lock | Khoa va sinh chu ky | Sua sau khi khoa |
| Di ung | Thuoc an toan | Trung hoat chat -> `CRITICAL` |
| Kho | Ton kho > 0 | Ton kho = 0 |
| Hoa don | Paid/Partial/Unpaid | Thu vuot so tien |
| Audit | Ghi va export | Filter sai khoang ngay |
| Integration | Upsert theo category/code | Tao trung cau hinh |
| Payroll | Tinh cong/tinh luong | Ky cham cong chua dong |

## 19. Thu tu kiem tra nhanh tren AdminUI

```text
1. Dang nhap user Admin test
2. Role Management
3. Integration Settings
4. Audit Log
5. Dashboard
6. Finance
7. HR
8. Reports
9. Export CSV
```

Neu AdminUI tra `403`, quay lai kiem tra:

```text
NhanVienVaiTro
VaiTro
RolePermissionMatrix
sub/userId trong JWT
```

## 20. Don dep du lieu test

Khong xoa bang va khong xoa `__EFMigrationsHistory`. Khi can reset lai
development, dung quy trinh database reset duoc phe duyet, sau do chay lai
migration va bo seed theo tai lieu nay.

Khong dung `DELETE` tuy tien tren production. Moi lan reset phai:

1. Xac nhan dung database development.
2. Backup neu can giu lai du lieu.
3. Lam sach trong transaction.
4. Kiem tra so dong bang nghiep vu ve `0`.
5. Kiem tra migration van con day du.

## 21. Tieu chi hoan thanh

- [ ] Co so, khoa, phong kham tao thanh cong.
- [ ] Nhan vien da gan khoa va role.
- [ ] User test co matrix `settings` va `audit`.
- [ ] Benh nhan co bao hiem va tien su di ung.
- [ ] Thuoc co hoat chat, BHYT va ton kho.
- [ ] Queue co du ba muc uu tien.
- [ ] Luot kham co ca dang xu ly, hoan tat va da khoa.
- [ ] Chan doan, chi dinh va ket qua hoat dong.
- [ ] Drug safety tra dung `SAFE` va `CRITICAL`.
- [ ] Hoa don co `PAID`, `PARTIAL`, `UNPAID`.
- [ ] Cong no qua han xuat hien tren dashboard.
- [ ] Lich lam viec/payroll co du lieu test.
- [ ] Integration config upsert va filter thanh cong.
- [ ] Audit log filter, pagination va export thanh cong.
- [ ] Dashboard/Finance/HR/Reports co du lieu.
- [ ] CSV export co dong du lieu, khong chi co header.

## 22. Data dictionary - cach doc kieu du lieu

Phan nay ghi theo entity thuc te trong `ClinicManagement.Domain`. Ten cot trong
database thuong dung PascalCase tieng Viet; ten property trong JSON phu thuoc
DTO va thuong duoc serialize thanh camelCase.

Quy uoc:

| Ky hieu | Y nghia |
|---|---|
| `int` | So nguyen, dung cho ID va khoa ngoai |
| `decimal` | Tien, so luong, ty le; khong gui chuoi co dau phay |
| `DateTime` | ISO-8601, vi du `2026-09-16T08:00:00Z` |
| `DateTime?` | Co the bo trong/null |
| `bool` | `true`/`false` trong JSON, `1`/`0` trong SQL |
| `enum` | Gui dung ten enum ma project khai bao, khong gui so |
| `string` | Chuoi; phan bat buoc khong duoc rong |
| `Id` | Do database tao; khong tu y gan khi POST tao moi |

Moi entity ke thua `BaseEntity<int>`, gom cac cot he thong:

```text
Id          int, identity, database tu tao
CreatedAt   DateTime, he thong tu gan
CreatedBy   int?, user tao ban ghi
UpdatedAt   DateTime?, he thong tu gan khi sua
UpdatedBy   int?, user sua
IsDeleted   bool, mac dinh false, dung soft-delete
DeletedAt   DateTime?
DeletedBy   int?
```

Khong gui cac cot tren trong request tao moi neu DTO khong yeu cau. Navigation
nhu `BenhNhan`, `Khoa`, `LuotKham` la object lien ket, khong insert object long
vao entity; hay gui khoa `int` tuong ung.

## 23. Bang CoSo, Khoa, PhongKham

### 23.1. `CoSo`

| Truong | Kieu | Bat buoc | Vi du | Ghi chu |
|---|---|---:|---|---|
| `LoaiCoSo` | enum `LoaiCoSo` | Co | `BENH_VIEN` | Xem enum trong Domain |
| `Ma` | string | Co | `CS-TEST` | Ma duy nhat |
| `Ten` | string | Co | `Co so test` | Ten hien thi |
| `DiaChi` | string | Co | `Dia chi gia lap` | Khong dung dia chi that |
| `DienThoai` | string | Co | `0900000000` | So test |
| `Email` | string | Co | `test@example.local` | Email test |
| `TrangThai` | string | Co | `HoatDong` | Theo convention module |

### 23.2. `Khoa`

| Truong | Kieu | Bat buoc | Vi du | Ghi chu |
|---|---|---:|---|---|
| `MaCoSo` | int | Co | `{coSoId}` | FK `CoSo.Id` |
| `MaKhoaCha` | int? | Khong | `null` | Khoa cha neu co |
| `Ma` | string | Co | `NOI-TEST` | Ma khoa |
| `Ten` | string | Co | `Khoa Noi test` | Ten khoa |

### 23.3. `PhongKham`

| Truong | Kieu | Bat buoc | Vi du | Ghi chu |
|---|---|---:|---|---|
| `MaKhoa` | int | Co | `{khoaId}` | FK `Khoa.Id` |
| `Ma` | string | Co | `PK-NOI-01` | Ma phong |
| `Ten` | string | Co | `Phong Noi 01` | Ten phong |
| `TrangThai` | string | Co | `HoatDong` | Mac dinh `HoatDong` |

## 24. Bang NhanVien va phan quyen legacy

### 24.1. `NhanVien`

| Truong | Kieu | Bat buoc | Vi du | Ghi chu |
|---|---|---:|---|---|
| `Username` | string | Co | `admin.test` | Duy nhat |
| `PasswordHash` | string | Co | `$2a$...` | Phai la hash, khong gui plaintext |
| `HoTen` | string | Co | `Admin Test` | Ten gia lap |
| `NgaySinh` | DateTime? | Khong | `1990-01-01` | ISO date |
| `GioiTinh` | enum `GioiTinh` | Co | `NAM` | Dung ten enum |
| `Email` | string | Co | `admin@example.local` | Email test |
| `DienThoai` | string | Co | `0900000001` | So test |
| `MaChucVu` | int? | Khong | `{chucVuId}` | FK neu co |
| `ChuyenKhoa` | string | Khong | `Noi tong quat` | Bac si |
| `SoHanhNghe` | string | Khong | `HNT-TEST-001` | So gia lap |
| `IsActive` | bool | Co | `true` | Tao moi mac dinh true |
| `LuongCoBan` | decimal | Co | `15000000.00` | Khong am |
| `PhuCapCoDinh` | decimal | Co | `1000000.00` | Khong am |
| `TyLeBaoHiem` | decimal | Co | `10.5` | Khoang 0-100 |
| `LastLogin` | DateTime? | Khong | `null` | He thong cap nhat |

### 24.2. `VaiTro`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `TenVaiTro` | string | Co | `ADMIN_TEST` |
| `MoTa` | string | Khong | `Role test toan quyen` |

### 24.3. `Quyen` va `VaiTroQuyen`

`Quyen` legacy:

| Truong | Kieu | Vi du |
|---|---|---|
| `TenQuyen` | string | `KhamBenh` |
| `MoTa` | string | `Khám bệnh` |

`VaiTroQuyen`:

| Truong | Kieu | Vi du |
|---|---|---|
| `MaVaiTro` | int | `{roleId}` |
| `MaQuyen` | int | `{permissionId}` |

### 24.4. `NhanVienVaiTro`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaNhanVien` | int | Co | `{adminId}` |
| `MaVaiTro` | int | Co | `{roleId}` |
| `NgayBatDau` | DateTime | Co | `2026-09-16` |
| `NgayKetThuc` | DateTime? | Khong | `null` |

### 24.5. `NhanVienKhoa`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaNhanVien` | int | Co | `{doctorId}` |
| `MaKhoa` | int | Co | `{khoaId}` |
| `TuNgay` | DateTime | Co | `2026-09-16` |
| `DenNgay` | DateTime? | Khong | `null` |
| `LaKhoaChinh` | bool | Co | `true` |

### 24.6. `PhanQuyenCoSo`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaNhanVien` | int | Co | `{adminId}` |
| `MaVaiTro` | int | Co | `{roleId}` |
| `MaCoSo` | int | Co | `{coSoId}` |
| `DataScope` | enum | Co | `ALL_FACILITIES` |

## 25. Bang RolePermissionMatrix

| Truong | Kieu SQL/C# | Bat buoc | Vi du |
|---|---|---:|---|
| `RoleId` | int | Co | `{roleId}` |
| `Module` | string | Co | `settings` |
| `Action` | enum/string | Co | `VIEW` |
| `DataScope` | enum/string | Co | `ALL_FACILITIES` |
| `IsAllowed` | bool/bit | Co | `true` |

Gia tri `Action` hop le:

```text
VIEW, CREATE, EDIT, DELETE, APPROVE
```

Gia tri `DataScope` hop le:

```text
ALL_FACILITIES, FACILITY_ONLY, DEPARTMENT_ONLY, BRANCH
```

Unique key cua bang la `RoleId + Module + Action`; khong tao trung bo ba nay.

## 26. Bang BenhNhan, BaoHiem, TienSuBenh

### 26.1. `BenhNhan`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `Ho` | string | Co | `Nguyen` |
| `Ten` | string | Co | `Test` |
| `NgaySinh` | DateTime | Co | `1995-05-20` |
| `GioiTinh` | enum `GioiTinh` | Co | `NU` |
| `DienThoai` | string | Co | `0900000010` |
| `Email` | string | Co | `bn001@example.local` |
| `SoCCCD` | string | Co | `TEST-CCCD-001` |
| `DiaChi` | string | Co | `Dia chi test` |
| `NguoiLienHeTen` | string | Co | `Nguoi lien he test` |
| `NguoiLienHeDienThoai` | string | Co | `0900000099` |
| `Username` | string | Co | `bn.test.001` |
| `PasswordHash` | string | Co | `HASH_TEST` |

`CreatedBy` phai la ID user hop le theo constructor/entity policy.

### 26.2. `BaoHiem`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaBenhNhan` | int | Co | `{benhNhanId}` |
| `LoaiBaoHiem` | enum `LoaiBaoHiem` | Co | `BHYT` |
| `TenNhaCungCap` | string | Co | `BHYT Test` |
| `SoThe` | string | Co | `TE-TEST-001` |
| `NgayBatDau` | DateTime | Co | `2026-01-01` |
| `NgayKetThuc` | DateTime | Co | `2026-12-31` |
| `MucHuong` | decimal | Co | `80.00` |

`NgayBatDau <= ngay hien tai <= NgayKetThuc` de `IsValid()` tra true.

### 26.3. `TienSuBenh`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaBenhNhan` | int | Co | `{benhNhanId}` |
| `LoaiTienSu` | enum `LoaiTienSu` | Co | `DI_UNG` |
| `Ten` | string | Co | `Amoxicillin` |
| `GhiChu` | string | Khong | `Phan ung da noi man` |
| `NgayGhiNhan` | DateTime | Co | `2026-09-16` |

## 27. Bang ICD, LuotKham, SinhHieu, ChanDoan

### 27.1. `ICD`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaICD` | string | Co | `J06.9` |
| `TenICD` | string | Co | `Nhiem trung ho hap cap` |
| `Chuong` | string | Khong | `Chuong X` |

### 27.2. `LuotKham`

| Truong | Kieu | Bat buoc | Vi du | Ghi chu |
|---|---|---:|---|---|
| `MaBenhNhan` | int | Co | `{benhNhanId}` | FK |
| `MaBacSi` | int? | Khong | `{doctorId}` | FK nhan vien |
| `MaLichHen` | int? | Khong | `{lichHenId}` | FK |
| `MaCoSo` | int | Co | `{coSoId}` | FK |
| `MaKhoa` | int | Co | `{khoaId}` | FK |
| `HinhThucDieuTri` | enum | Co | `NGOAI_TRU` | Dung enum |
| `TrangThai` | enum | Co | `CHO_KHAM` | Constructor tu gan |
| `SoThuTu` | int? | Khong | `1` | Queue number |
| `NgayKham` | DateTime | Co | `2026-09-16` | Constructor tu gan hien tai |
| `ThoiGianBatDauKham` | DateTime? | Khong | `null` | StartExam gan |
| `ThoiGianKetThucKham` | DateTime? | Khong | `null` | CompleteExam gan |
| `LyDoKham` | string | Co ve nghiep vu | `Ho sot` | Can khi complete |
| `MaPhongKham` | int? | Khong | `{phongKhamId}` | Queue |
| `EmrLocked` | bool | Co | `false` | He thong quan ly |
| `EmrSignature` | string? | Khong | `null` | Sinh khi lock |
| `EmrLockedAt` | DateTime? | Khong | `null` | Sinh khi lock |
| `EmrLockedBy` | int? | Khong | `null` | Sinh khi lock |

`MaBenhNhan`, `MaCoSo`, `MaKhoa`, `SoThuTu` duoc truyen vao constructor
`LuotKham`, khong set truc tiep vi property co `private set`.

### 27.3. `SinhHieu`

| Truong | Kieu | Vi du |
|---|---|---|
| `MaLuotKham` | int | `{luotKhamId}` |
| `ThoiDiemDo` | DateTime | `2026-09-16T08:30:00Z` |
| `HuyetApTamThu` | int? | `120` |
| `HuyetApTamTruong` | int? | `80` |
| `Mach` | int? | `78` |
| `NhietDo` | decimal? | `36.8` |
| `CanNang` | decimal? | `65.5` |
| `ChieuCao` | decimal? | `170` |
| `SpO2` | decimal? | `98` |

BMI duoc tinh tu can nang/chieu cao theo logic response, khong luu cot BMI
truc tiep trong entity hien tai.

### 27.4. `ChanDoan`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaLuotKham` | int | Co | `{luotKhamId}` |
| `MaICD` | string | Co | `J06.9` |
| `TenChanDoan` | string | Co | `Nhiem trung ho hap cap` |
| `LaChanDoanChinh` | bool | Co | `true` |
| `GhiChu` | string | Khong | `Theo doi` |
| `CreatedBy` | int? | Khong | `{doctorId}` |

Complete EMR can it nhat mot dong `LaChanDoanChinh = true`.

## 28. Bang Item, Kho, Nhap kho, TonKho

### 28.1. `Item`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `LoaiItem` | enum `LoaiItem` | Co | `THUOC` |
| `Ma` | string | Co | `THUOC-PARA-TEST` |
| `Ten` | string | Co | `Paracetamol test` |
| `TenGoc` | string | Khong | `Paracetamol` |
| `DangBaoChe` | string | Khong | `Vien nen` |
| `HamLuong` | string | Khong | `500mg` |
| `HoatChat` | string | Co voi thuoc | `Paracetamol` |
| `SoDangKy` | string | Khong | `VD-TEST-001` |
| `DuongDung` | string | Khong | `Uong` |
| `MaBHYT` | string | Khong | `PARA-4210` |
| `TyLeBHYT` | decimal | Co | `80.00` |
| `DonViTinhCoBan` | string | Co | `Vien` |
| `GiaBanLe` | decimal | Co | `1500.00` |
| `CanKeDon` | bool | Co | `true` |
| `IsActive` | bool | Co | `true` |
| `TonToiThieu` | decimal | Co | `20` |

### 28.2. `Kho`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaCoSo` | int | Co | `{coSoId}` |
| `MaKhoa` | int? | Khong | `{khoaDuocId}` |
| `TenKho` | string | Co | `KHO-DUOC-TEST` |
| `LoaiKho` | enum `LoaiKho` | Co | `DUOC` |
| `MaNguoiPhuTrach` | int? | Khong | `{duocSiId}` |
| `DiaChi` | string | Khong | `Tang 1` |
| `TrangThai` | enum `TrangThaiKho` | Co | `HoatDong` |

### 28.3. `NhaCungCap`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `Ma` | string | Co | `NCC-TEST` |
| `Ten` | string | Co | `Nha cung cap test` |
| `DiaChi` | string | Khong | `Dia chi test` |
| `DienThoai` | string | Khong | `0900000020` |
| `Email` | string | Khong | `ncc@example.local` |
| `MaSoThue` | string | Khong | `MST-TEST` |
| `TrangThai` | enum | Co | `HoatDong` |

### 28.4. `PhieuNhapKho`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaPhieu` | string | Co | `PN-TEST-001` |
| `MaCoSo` | int | Co | `{coSoId}` |
| `MaKho` | int | Co | `{khoId}` |
| `MaNhaCungCap` | int | Co | `{nccId}` |
| `NgayNhap` | DateTime | Co | `2026-09-16` |
| `TongTien` | decimal | Co | `1000000.00` |
| `TrangThai` | enum | Co | `CHO_DUYET` |
| `MaNguoiNhap` | int | Co | `{duocSiId}` |
| `GhiChu` | string | Khong | `Nhap du lieu test` |

### 28.5. `ChiTietNhapKho`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaPhieuNhap` | int | Co | `{phieuNhapId}` |
| `MaItem` | int | Co | `{itemId}` |
| `MaQuyDoi` | int? | Khong | `null` |
| `SoLuong` | decimal | Co | `100` |
| `DonGiaNhap` | decimal | Co | `1000.00` |
| `SoLo` | string | Khong | `LO-TEST-001` |
| `HanSuDung` | DateTime? | Khong | `2027-09-16` |
| `ViTri` | string | Khong | `KE-A-01` |

`SoLuong > 0`, `DonGiaNhap >= 0`. Duyet phieu nhap de cap nhat `TonKho`.

### 28.6. `TonKho`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaKho` | int | Co | `{khoId}` |
| `MaItem` | int | Co | `{itemId}` |
| `MaChiTietNhap` | int | Co | `{chiTietNhapId}` |
| `SoLuongTon` | decimal | Co | `100` |
| `NgayCapNhatCuoi` | DateTime | Co | `2026-09-16T08:00:00Z` |
| `Version` | int | He thong | `0` |

Khong tao `TonKho` roi bo qua transaction nhap kho neu flow API da co service
cap nhat ton; uu tien tao qua phieu nhap va approve.

## 29. Bang DonThuoc va ChiTietDonThuoc

### 29.1. `DonThuoc`

| Truong | Kieu | Bat buoc | Vi du | Ghi chu |
|---|---|---:|---|---|
| `MaLuotKham` | int | Co | `{luotKhamId}` | FK |
| `MaBacSi` | int | Co | `{doctorId}` | FK |
| `MaCoSo` | int | Co | `{coSoId}` | FK |
| `NgayKe` | DateTime | He thong | hien tai | Constructor gan |
| `TrangThai` | enum | He thong | `TAM` | Tao moi mac dinh |
| `GhiChu` | string | Khong | `Uong sau an` | |
| `NgayCapThuoc` | DateTime? | He thong | `null` | Gan khi dispense |
| `MaNguoiCapThuoc` | int? | Khong | `{duocSiId}` | Gan khi dispense |

### 29.2. `ChiTietDonThuoc`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaDonThuoc` | int | Co | `{donThuocId}` |
| `MaItem` | int | Co | `{itemId}` |
| `SoLuongKe` | decimal | Co | `10` |
| `SoLuongDaXuat` | decimal | He thong | `0` |
| `LieuDung` | string | Khong | `1 vien` |
| `TanSuat` | string | Khong | `2 lan/ngay` |
| `SoNgay` | int? | Khong | `5` |
| `HuongDan` | string | Khong | `Uong sau an` |
| `DonGiaKe` | decimal | Co | `1500.00` |

`SoLuongKe > 0`, `DonGiaKe >= 0`; khong cho `SoLuongDaXuat > SoLuongKe`.

## 30. Bang HoaDon, ChiTietHoaDon, PhieuThu, CongNo

### 30.1. `HoaDon`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `SoHoaDon` | string | Co | `HD-TEST-001` |
| `MaLuotKham` | int | Co | `{luotKhamId}` |
| `MaBenhNhan` | int | Co | `{benhNhanId}` |
| `MaCoSo` | int | Co | `{coSoId}` |
| `NgayLap` | DateTime | He thong | hien tai |
| `TongTien` | decimal | He thong | tinh tu chi tiet |
| `SoTienBaoHiemChiTra` | decimal | He thong/API | `80000.00` |
| `SoTienBenhNhanChiTra` | decimal | He thong | `TongTien - BHYT` |
| `DaThanhToan` | decimal | He thong | tong phieu thu |
| `TrangThai` | enum | He thong | `CHO_THANH_TOAN` |
| `GhiChu` | string | Khong | `Hoa don test` |

Them dich vu/thuoc qua `AddServiceOrDrug`, khong tu set `TongTien`.

### 30.2. `ChiTietHoaDon`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaHoaDon` | int | Co | `{hoaDonId}` |
| `LoaiDoiTuong` | string | Co | `DICH_VU` hoặc `THUOC` |
| `MaDoiTuong` | int | Co | `{serviceId}` |
| `MoTa` | string | Co | `Kham noi tong quat` |
| `SoLuong` | decimal | Co | `1` |
| `DonGia` | decimal | Co | `150000.00` |

### 30.3. `PhieuThu`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `SoPhieuThu` | string | Co | `PT-TEST-001` |
| `MaBenhNhan` | int | Co | `{benhNhanId}` |
| `MaLuotKham` | int? | Khong | `{luotKhamId}` |
| `MaHoaDon` | int | Co | `{hoaDonId}` |
| `SoTien` | decimal | Co | `100000.00` |
| `NgayThu` | DateTime | Co | `2026-09-16` |
| `PhuongThuc` | enum | Co | `TIEN_MAT` |
| `MaNguoiThu` | int | Co | `{cashierId}` |
| `GhiChu` | string | Khong | `Thu mot phan` |

### 30.4. `CongNoBenhNhan`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaBenhNhan` | int | Co | `{benhNhanId}` |
| `MaHoaDon` | int | Co | `{hoaDonId}` |
| `SoTienNo` | decimal | Co | `50000.00` |
| `SoTienDaTra` | decimal | Co | `0` |
| `HanThanhToan` | DateTime? | Khong | `2026-09-01` |
| `TrangThai` | enum | Co | `QUA_HAN` |

## 31. Bang Audit va Integration

### 31.1. `EmrAuditLog`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `PatientId` | int | Co | `{benhNhanId}` |
| `RecordId` | int | Co | `{luotKhamId}` |
| `UserId` | int | Co | `{doctorId}` |
| `Action` | string | Co | `VIEW` |
| `Module` | string | Co | `EMR` |
| `IpAddress` | string | Co | `127.0.0.1` |
| `Timestamp` | DateTime | He thong | UTC |
| `Details` | string | Co | `Test xem ho so` |
| `Status` | string | Co | `SUCCESS` |

### 31.2. `IntegrationSetting`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `Category` | string | Co | `LIS` |
| `Code` | string | Co | `HL7_PORT` |
| `Name` | string | Co | `Cong MLLP HL7 test` |
| `Value` | string | Co | `12575` |
| `Description` | string? | Khong | `Cau hinh test` |
| `IsEncrypted` | bool | Co | `false` |
| `UpdatedBy` | int? | He thong/request | `{adminId}` |
| `UpdatedAt` | DateTime | He thong | UTC |

`Category + Code` la cap logic de upsert; khong tao trung cau hinh.

## 32. Bang LichHen

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaBenhNhan` | int | Co | `{benhNhanId}` |
| `MaBacSi` | int | Co | `{doctorId}` |
| `MaCoSo` | int | Co | `{coSoId}` |
| `MaKhoa` | int? | Khong | `{khoaId}` |
| `ThoiGianBatDau` | DateTime | Co | `2026-09-16T08:00:00Z` |
| `ThoiGianKetThuc` | DateTime | Co | `2026-09-16T08:30:00Z` |
| `TrangThai` | enum | Co | `DA_XAC_NHAN` |
| `LyDo` | string | Co | `Kham tong quat` |
| `NguonDat` | string | Co | `LE_TAN` |

`ThoiGianBatDau < ThoiGianKetThuc`; cac status dung enum
`TrangThaiLichHen`.

## 33. Bang DichVu va ChiDinhDichVu

### 33.1. `DanhMucDichVu`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `LoaiDichVu` | enum `LoaiDichVu` | Co | `KHAM_BENH` |
| `Ma` | string | Co | `DV-KHAM-TEST` |
| `Ten` | string | Co | `Kham noi tong quat` |
| `DonViTinh` | string | Co | `Lan` |
| `Gia` | decimal | Co | `150000.00` |

### 33.2. `ChiDinhDichVu`

| Truong | Kieu | Bat buoc | Vi du |
|---|---|---:|---|
| `MaLuotKham` | int | Co | `{luotKhamId}` |
| `MaBacSiChiDinh` | int | Co | `{doctorId}` |
| `MaDanhMuc` | int | Co | `{dichVuId}` |
| `TrangThai` | enum | He thong | `DaChiDinh` |
| `NgayChiDinh` | DateTime | He thong | UTC |
| `NgayTiepNhan` | DateTime? | Khong | `null` |
| `NgayThucHien` | DateTime? | Khong | `null` |
| `NgayCoKetQua` | DateTime? | Khong | `null` |
| `MaNguoiThucHien` | int? | Khong | `{technicianId}` |
| `KetLuan` | string | Khong | `Ket qua binh thuong` |
| `UrlKetQua` | string | Khong | `/files/test-result.pdf` |

Flow trang thai:

```text
DaChiDinh -> DaTiepNhan -> DaCoKetQua
```

Khi `DaCoKetQua`, `KetLuan` khong duoc rong.

## 34. Bang lich lam viec va payroll

Nhung entity nay co nhieu field phu thuoc migration schedule/payroll. Khi seed,
luon doc DTO/controller tuong ung thay vi insert thang neu chua ro workflow.

| Bang | Khoa nghiep vu chinh can co |
|---|---|
| `LoaiCa` | ten ca, gio bat dau, gio ket thuc, trang thai |
| `CaTruc` | ca, co so/khoa, ngay ap dung, trang thai |
| `LichLamViec` | nhan vien, ca, ngay lam, khoa/phong, trang thai |
| `LichLamViecCoDinh` | nhan vien, thu trong tuan, ca, tu ngay, den ngay |
| `LichLamViecDieuChinh` | lich, ly do dieu chinh, nguoi duyet, trang thai |
| `ChamCong` | nhan vien, ngay, gio vao, gio ra, trang thai |
| `DieuChinhChamCong` | cham cong, ly do, gia tri truoc/sau, nguoi duyet |
| `KyChamCong` | ky, tu ngay, den ngay, trang thai |
| `KyLuong` | ky luong, tu ngay, den ngay, trang thai |
| `BangLuong` | ky luong, nhan vien, luong co ban, phu cap, khau tru, thuc linh |
| `ChiTietBangLuong` | bang luong, khoan muc, so tien, ghi chu |

Khong dung gia tri enum bang so. Vi du status phai dung ten trong cac enum
`TrangThaiChamCong`, `TrangThaiLichLamViec`, `TrangThaiNghiPhep`,
`TrangThaiKho`, `TrangThaiKiemKe`.

## 35. Mau JSON co ID dong

Mau ben duoi minh hoa cach lap request sau khi da co cac ID thuc:

```json
{
  "maBenhNhan": 101,
  "maCoSo": 1,
  "maKhoa": 2,
  "soThuTu": 3,
  "maBacSi": 11,
  "maLichHen": 21,
  "maPhongKham": 4,
  "lyDoKham": "Ho sot 2 ngay"
}
```

Trong do `101`, `1`, `2`, `3`, `11`, `21`, `4` chi la vi du. Khi test phai
thay bang ID response that.

Khong gui cac navigation object nhu sau:

```json
{
  "benhNhan": {},
  "khoa": {},
  "bacSi": {}
}
```

Hay gui khoa ngoai:

```json
{
  "maBenhNhan": 101,
  "maKhoa": 2,
  "maBacSi": 11
}
```

## 36. Quy trinh doi chieu truoc khi ket luan loi

Khi request fail, kiem tra theo thu tu:

1. Kieu enum co dung ten project khong.
2. ID co ton tai va `IsDeleted = 0` khong.
3. User trong JWT co ton tai trong `NhanVien` khong.
4. User co `NhanVienVaiTro` khong.
5. Role co `RolePermissionMatrix` dung module/action/scope khong.
6. Parent record da luu truoc child record chua.
7. EMR da khoa hay chua.
8. Ton kho co du so luong khong.
9. Hoa don con o trang thai cho thanh toan khong.
10. Khoang ngay dashboard co bao gom `NgayKham`/`NgayLap` khong.

Khong sua database bang cach doi enum sang so hoac bo qua foreign key. Neu
contract thuc te khac tai lieu, cap nhat DTO/service/migration bang migration
moi, sau do cap nhat lai data dictionary nay.
