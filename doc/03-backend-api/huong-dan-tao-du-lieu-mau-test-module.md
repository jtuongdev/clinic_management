# Huong dan tao du lieu mau de test cac module moi

Tai lieu nay huong dan tao du lieu mau cho cac module Backend/AdminUI vua trien khai:

- Dashboard van hanh.
- Tai chinh kham benh va bao cao.
- Role Matrix/Data Scope.
- EMR Audit Trail.
- Integration Settings.
- Du lieu nen cho luot kham, hoa don, cong no va ton kho.

Muc tieu la co mot bo du lieu nho, co quan he hop le va co the kiem tra duoc tu API, Swagger hoac AdminUI.

> **Canh bao:** Chi su dung du lieu mau tren development/staging. Khong chay payload mau tren production. Khong dung so dien thoai, CCCD, dia chi hoac du lieu suc khoe cua nguoi that.

## 1. Chuan bi moi truong

### 1.1. Kiem tra database va migration

Chay tu thu muc goc repository:

```bash
dotnet ef database update \
  --project ClinicManagement.Infrastructure \
  --startup-project ClinicManagement.API
```

Kiem tra model khong con thay doi chua tao migration:

```bash
dotnet ef migrations has-pending-model-changes \
  --project ClinicManagement.Infrastructure \
  --startup-project ClinicManagement.API
```

Khoi dong API:

```bash
dotnet run --project ClinicManagement.API
```

Mac dinh cac request ben duoi dung:

```text
https://localhost:7081/api
```

Neu API chay cong khac, thay gia tri `baseUrl` trong cac vi du.

### 1.2. Lay token test

Tat ca endpoint Admin deu yeu cau token va policy `ClinicalAuthorize`. Lay token tu flow Auth cua moi truong, sau do gan vao bien:

```http
@baseUrl = https://localhost:7081/api
@token = thay-bang-jwt-development
@auth = Bearer {{token}}
```

Khong commit token vao repository. File `backend-api-tests.http` chi nen dung placeholder.

Neu request tra `401`, token het han hoac chua gui header. Neu tra `403`, user test chua co quyen `settings`/`audit` va DataScope phu hop.

### 1.3. Trang thai migration va kieu du lieu quyen

Migration hien tai da khop voi project:

| Truong | Kieu SQL Server | Gia tri hop le |
|---|---|---|
| `RolePermissionMatrix.Action` | `nvarchar(20)` | `VIEW`, `CREATE`, `EDIT`, `DELETE`, `APPROVE` |
| `RolePermissionMatrix.DataScope` | `nvarchar(30)` | `ALL_FACILITIES`, `FACILITY_ONLY`, `DEPARTMENT_ONLY`, `BRANCH` |
| `RolePermissionMatrix.IsAllowed` | `bit` | `1` hoac `0` |

Ly do: `RolePermissionMatrixConfiguration` dang dung `HasConversion<string>()`
cho ca `PermissionAction` va `DataScope`. Khong insert enum bang so `1`, `2`, `3`,
`4` vao hai cot nay.

Lenh kiem tra da xac nhan:

```text
No changes have been made to the model since the last migration.
```

Khong sua truc tiep cac migration da ap dung. Neu thay doi entity/configuration,
tao migration moi bang `dotnet ef migrations add`, sau do chay `database update`.

### 1.4. Luu y ve bang `Quyen` hien tai

Danh sach quyen nhu `QuanLyNhanVien`, `XemBenhNhan`, `KhamBenh`, `KeDonThuoc`,
`ThuTien`... la **catalog quyen legacy**. Bang `Quyen` chi luu ten va mo ta,
khong phai ma tran ma `ClinicalAuthorizeFilter` dang doc.

Middleware moi kiem tra chuoi lien ket:

```text
User -> NhanVienVaiTro -> VaiTro -> RolePermissionMatrix
                                      -> Module + Action + DataScope
```

Vi vay, insert 12 dong vao `Quyen` chua du. User test con can role trong
`VaiTro`, lien ket `NhanVienVaiTro` va cac dong `RolePermissionMatrix`.

Mapping tham khao:

| Quyen legacy | Module moi | Action moi |
|---|---|---|
| `QuanLyNhanVien` | `employee` | `VIEW`, `CREATE`, `EDIT`, `DELETE` |
| `XemBenhNhan` | `patient` | `VIEW` |
| `TaoLichHen` / `SuaLichHen` / `XoaLichHen` | `appointment` | `CREATE` / `EDIT` / `DELETE` |
| `KhamBenh` | `examination` | `VIEW`, `CREATE`, `EDIT` |
| `KeDonThuoc` | `examination` | `CREATE` |
| `XemHoaDon` | `billing` | `VIEW` |
| `TaoHoaDon` | `billing` | `CREATE` |
| `ThuTien` | `billing` | `APPROVE` |
| `QuanLyKho` | `inventory` | `VIEW`, `CREATE`, `EDIT`, `DELETE`, `APPROVE` |
| `QuanLyTaiChinh` | `billing` | `VIEW`, `APPROVE` |

Role truy cap Admin Settings/Audit con phai co:

```text
settings + VIEW/EDIT + ALL_FACILITIES
audit    + VIEW/CREATE + ALL_FACILITIES
```

12 quyen legacy khong co `settings` va `audit`, nen user chi co danh sach nay
se bi `403 Forbidden` khi mo Role Management, Integration Settings hoac Audit Log.

### 1.5. Seed RolePermissionMatrix bang SQL an toan

Chi chay script nay tren development/staging sau khi da backup. Script khong
tao role moi va khong doan `Id`; script tim role theo `VaiTro.TenVaiTro`, sau do
them cac dong con thieu. Vi vay phai sua gia tri `@RoleName` cho dung du lieu
thuc te truoc khi chay.

```sql
SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @RoleName nvarchar(50) = N'ADMIN';
DECLARE @RoleId int = (
    SELECT TOP (1) Id
    FROM VaiTro
    WHERE TenVaiTro = @RoleName
      AND IsDeleted = 0
);

IF @RoleId IS NULL
    THROW 51000, 'Khong tim thay role trong VaiTro. Hay doi @RoleName.', 1;

DECLARE @Permissions TABLE (
    Module nvarchar(80) NOT NULL,
    Action nvarchar(20) NOT NULL,
    DataScope nvarchar(30) NOT NULL
);

INSERT INTO @Permissions (Module, Action, DataScope)
VALUES
    (N'patient',     N'VIEW',    N'ALL_FACILITIES'),
    (N'examination', N'VIEW',    N'ALL_FACILITIES'),
    (N'examination', N'CREATE',  N'ALL_FACILITIES'),
    (N'examination', N'EDIT',    N'ALL_FACILITIES'),
    (N'prescription',N'CREATE',  N'ALL_FACILITIES'),
    (N'inventory',   N'VIEW',    N'ALL_FACILITIES'),
    (N'inventory',   N'CREATE',  N'ALL_FACILITIES'),
    (N'inventory',   N'EDIT',    N'ALL_FACILITIES'),
    (N'inventory',   N'APPROVE', N'ALL_FACILITIES'),
    (N'billing',     N'VIEW',    N'ALL_FACILITIES'),
    (N'billing',     N'CREATE',  N'ALL_FACILITIES'),
    (N'billing',     N'APPROVE', N'ALL_FACILITIES'),
    (N'settings',    N'VIEW',    N'ALL_FACILITIES'),
    (N'settings',    N'EDIT',    N'ALL_FACILITIES'),
    (N'audit',       N'VIEW',    N'ALL_FACILITIES'),
    (N'audit',       N'CREATE',  N'ALL_FACILITIES');

INSERT INTO RolePermissionMatrix
    (RoleId, Module, Action, DataScope, IsAllowed,
     CreatedAt, CreatedBy, IsDeleted)
SELECT
    @RoleId, p.Module, p.Action, p.DataScope, 1,
    SYSUTCDATETIME(), NULL, 0
FROM @Permissions p
WHERE NOT EXISTS (
    SELECT 1
    FROM RolePermissionMatrix r
    WHERE r.RoleId = @RoleId
      AND r.Module = p.Module
      AND r.Action = p.Action
      AND r.IsDeleted = 0
);

COMMIT TRANSACTION;
```

Kiem tra ket qua:

```sql
SELECT r.RoleId, v.TenVaiTro, r.Module, r.Action, r.DataScope, r.IsAllowed
FROM RolePermissionMatrix r
JOIN VaiTro v ON v.Id = r.RoleId
WHERE v.TenVaiTro = N'ADMIN'
  AND r.IsDeleted = 0
ORDER BY r.Module, r.Action;
```

Neu role test khong phai `ADMIN`, chi doi `@RoleName` va dieu kien truy van
cuoi file. Neu muon phan quyen han che, thay `ALL_FACILITIES` bang
`FACILITY_ONLY` hoac `DEPARTMENT_ONLY`.

## 2. Thu tu tao du lieu khuyen nghi

Tao theo thu tu sau de tranh loi khoa ngoai va de dashboard co du lieu:

1. Co so, khoa phong, phong kham.
2. Nhan vien va tai khoan test.
3. Benh nhan va tien su benh.
4. Thuoc/vat tu va ton kho.
5. Luot kham, sinh hieu, chan doan.
6. Don thuoc va hoa don.
7. Cong no qua han.
8. Role Matrix.
9. Integration Settings.
10. EMR Audit Logs.
11. Goi cac endpoint dashboard de doi chieu.

Khong tao truc tiep ban ghi con neu chua co ban ghi cha. Vi du, khong tao `HoaDon` voi `LuotKhamId` khong ton tai va khong tao audit log voi `PatientId`/`RecordId` khong ton tai neu service dang bat validate quan he.

## 3. Du lieu Governance/Admin

### 3.1. Tao Role Matrix

Endpoint:

```http
POST {{baseUrl}}/admin/roles
Authorization: {{auth}}
Content-Type: application/json
```

Payload cap nhat ma tran cho role da ton tai:

```json
{
  "id": 4,
  "code": "DIEU_DUONG_TEST",
  "name": "Dieu duong test",
  "description": "Role mau dung de kiem tra ma tran quyen",
  "dataScope": "DEPARTMENT_ONLY",
  "permissions": {
    "patient": ["VIEW"],
    "examination": ["VIEW", "CREATE"],
    "cls": ["VIEW"],
    "inventory": [],
    "billing": ["VIEW"],
    "employee": [],
    "settings": []
  }
}
```

Kiem tra:

```http
GET {{baseUrl}}/admin/roles
Authorization: {{auth}}
```

Can kiem tra:

- Role `DIEU_DUONG_TEST` xuat hien trong danh sach.
- `dataScope` duoc luu dung.
- Moi module co dung danh sach action.
- Goi lai POST voi cung `code` de kiem tra hanh vi cap nhat, khong tao ban ghi trung.

### 3.2. Tao Integration Settings

Tao cau hinh LIS:

```http
POST {{baseUrl}}/admin/integration-config
Authorization: {{auth}}
Content-Type: application/json
```

```json
{
  "category": "LIS",
  "code": "HL7_PORT",
  "name": "Cong MLLP HL7 test",
  "value": "12575",
  "description": "Cong test ket noi LIS, khong dung cong production",
  "isEncrypted": false
}
```

Tao cau hinh PACS:

```json
{
  "category": "PACS",
  "code": "AE_TITLE",
  "name": "PACS AE Title test",
  "value": "PACS_TEST",
  "description": "AE Title cho moi truong test",
  "isEncrypted": false
}
```

```json
{
  "category": "PACS",
  "code": "HOST",
  "name": "PACS host test",
  "value": "127.0.0.1",
  "description": "Dia chi localhost cua PACS gia lap",
  "isEncrypted": false
}
```

Tao cau hinh BHYT:

```json
{
  "category": "BHYT",
  "code": "FORMAT",
  "name": "Dinh dang cong BHYT",
  "value": "4210",
  "description": "Dinh dang test du lieu BHYT",
  "isEncrypted": false
}
```

Doc theo category:

```http
GET {{baseUrl}}/admin/integration-config?category=LIS
Authorization: {{auth}}
```

Can kiem tra:

- `LIS`, `PACS`, `BHYT` loc dung category.
- POST lai cung `category` + `code` cap nhat value thay vi tao dong trung.
- Khong luu secret that vao `value` khi test.

## 4. Du lieu EMR Audit Trail

### 4.1. Tao audit log mau

```http
POST {{baseUrl}}/admin/audit-logs
Authorization: {{auth}}
Content-Type: application/json
```

```json
{
  "patientId": 1001,
  "recordId": 9001,
  "userId": 11,
  "action": "VIEW",
  "module": "EMR",
  "ipAddress": "127.0.0.1",
  "details": "Test VIEW ho so benh an trong moi truong development",
  "status": "SUCCESS"
}
```

Tao them cac action de kiem tra bo loc:

```json
{
  "patientId": 1001,
  "recordId": 9001,
  "userId": 11,
  "action": "PRESCRIBE",
  "module": "EMR",
  "ipAddress": "127.0.0.1",
  "details": "Test ke don thuoc cho luot kham mau",
  "status": "SUCCESS"
}
```

```json
{
  "patientId": 1001,
  "recordId": 9001,
  "userId": 12,
  "action": "EXPORT",
  "module": "EMR",
  "ipAddress": "127.0.0.1",
  "details": "Test xuat ho so benh an",
  "status": "WARNING"
}
```

### 4.2. Truy van va export

```http
GET {{baseUrl}}/admin/audit-logs?patientId=1001&pageIndex=1&pageSize=20
Authorization: {{auth}}
```

```http
GET {{baseUrl}}/admin/audit-logs?action=PRESCRIBE&module=EMR&pageIndex=1&pageSize=20
Authorization: {{auth}}
```

```http
GET {{baseUrl}}/admin/audit-logs/export?patientId=1001&module=EMR
Authorization: {{auth}}
```

Can kiem tra:

- Phan trang khong tra qua `pageSize`.
- Loc theo `patientId`, `action`, `module`, `from`, `to`.
- File CSV co header va cac dong vua tao.
- CSV escape dung khi `details` co dau phay hoac dau nhay kep.

## 5. Du lieu nen cho Dashboard, Finance va Reports

Dashboard khong co endpoint tao hang loat du lieu mau. Cac man hinh nay doc tong hop tu bang nghiep vu:

| Man hinh | Bang/nguon chinh | Du lieu toi thieu |
|---|---|---|
| Dashboard overview | `BenhNhan`, `LuotKham`, `HoaDon`, `CongNoBenhNhan`, `AuditLogs` | Benh nhan, luot kham trong ngay, hoa don, cong no qua han, audit log |
| Finance | `HoaDon`, `PhieuThu`, `CongNoBenhNhan` | Hoa don da thu, chua thu, BHYT chi tra |
| HR | `NhanVien`, `NhanVienKhoa` | Nhan vien gan khoa |
| Reports | `HoaDon`, `LuotKham`, `Khoa`, `NhanVien` | Hoa don va luot kham da hoan thanh |

### 5.1. Cach tao bang API

Su dung cac endpoint CRUD da co cua tung module trong Swagger. Với moi ban ghi:

1. Tao benh nhan test.
2. Tao luot kham test cho ngay hien tai `2026-09-16`.
3. Gan sinh hieu va chan doan.
4. Hoan tat luot kham bang endpoint:

```http
POST {{baseUrl}}/luotkham/{id}/complete
Authorization: {{auth}}
Content-Type: application/json

{}
```

5. Tao hoa don tu luot kham theo API billing.
6. Tao phieu thu thanh toan mot phan de tao ca `PAID`, `PARTIAL`, `UNPAID`.
7. Tao cong no co han thanh toan trong qua khu va trang thai `QUA_HAN`.
8. Goi dashboard:

```http
GET {{baseUrl}}/admin/dashboard/overview?facilityId=1&date=2026-09-16
Authorization: {{auth}}
```

```http
GET {{baseUrl}}/admin/dashboard/finance?facilityId=1&fromDate=2026-09-01&toDate=2026-09-16
Authorization: {{auth}}
```

```http
GET {{baseUrl}}/admin/dashboard/staff?facilityId=1
Authorization: {{auth}}
```

```http
GET {{baseUrl}}/admin/dashboard/reports?facilityId=1&fromDate=2026-09-01&toDate=2026-09-16
Authorization: {{auth}}
```

### 5.2. Ky vong khi test Dashboard

De co ket qua de quan sat, nen tao it nhat:

- 2 benh nhan test.
- 3 luot kham: mot dang cho, mot da hoan tat, mot da huy.
- 3 hoa don: da thanh toan, thanh toan mot phan, chua thanh toan.
- 1 cong no qua han.
- 2 nhan vien gan vao cung mot khoa.
- 3 audit log voi action khac nhau.

Neu dashboard tra so 0, kiem tra lai `facilityId`, khoang ngay va trang thai luot kham truoc khi ket luan API loi.

## 6. Kiem tra tu AdminUI

1. Dang nhap bang user test co quyen `settings` va `audit`.
2. Mo Role Management:
   - Xac nhan role mau hien thi.
   - Chinh sua mot action.
   - Refresh va xac nhan du lieu van con sau khi tai lai.
3. Mo Integration Settings:
   - Loc theo `LIS`, `PACS`, `BHYT`.
   - Sua `HL7_PORT`.
   - Refresh va xac nhan gia tri tu Backend.
4. Mo Audit Log:
   - Loc `VIEW`, `PRESCRIBE`, `EXPORT`.
   - Tim theo patient code/chi tiet.
   - Tai CSV va mo file kiem tra.
5. Mo Dashboard/Finance/Reports:
   - Chon ngay test.
   - Bam refresh.
   - Doi chieu KPI voi cac ban ghi vua tao.

## 7. Don dep sau khi test

Khong xoa nham du lieu that. Chi don dep theo ma test da dat:

- `DIEU_DUONG_TEST`.
- `HL7_PORT` trong category `LIS` neu day la cau hinh rieng cho test.
- Audit log co `details` bat dau bang `Test`.
- Benh nhan test co ma/ho ten theo quy uoc rieng cua moi truong.

Neu can xoa nhieu ban ghi, uu tien dung API soft-delete cua module. Chi dung SQL de don dep khi da backup va da xac dinh day du khoa ngoai.

## 8. Checklist ket qua

- [ ] Database da chay migration moi nhat.
- [ ] API chay va token test con han.
- [ ] User test du quyen `settings` va `audit`.
- [ ] Role Matrix tao va doc lai thanh cong.
- [ ] Integration Settings tao, loc va cap nhat thanh cong.
- [ ] Audit log tao, loc, phan trang va export thanh cong.
- [ ] Dashboard co du lieu theo dung `facilityId` va ngay test.
- [ ] Finance co it nhat ba trang thai hoa don.
- [ ] Reports co doanh thu va luot kham hoan tat.
- [ ] Da don dep du lieu test sau khi UAT.
