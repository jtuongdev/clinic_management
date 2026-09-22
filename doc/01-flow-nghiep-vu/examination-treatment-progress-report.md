# Bao cao tien do module Examination va tab Xu tri

Ngay lap bao cao: 30/08/2026

## 1. Pham vi da thuc hien

Phan da hoan thanh tap trung vao `ClinicManagement.DoctorUI/src/examination` va module dau tien cua tab `Xu tri`: **Chuan doan**.

Nguyen tac da ap dung:

- Tach type/interface vao thu muc `types`.
- Tach logic form thanh custom hook.
- Domain aggregate `LuotKham` quan ly cac chuan doan cua mot luot kham.
- Application dung CQRS + MediatR.
- API dung request/response rieng.
- UI chi thao tac theo `luotKhamId` va `Id` ban ghi.
- Xoa chuan doan dung xoa mem qua `BaseEntity.SoftDelete()`.

## 2. Cac thay doi trong Examination

### 2.1. Form kham ban dau

Da co form luu cac du lieu:

- ly do kham;
- sinh hieu;
- loai tien su;
- ten tien su.

Endpoint dang dung:

```http
POST /api/LuotKham/{luotKhamId}/examination
```

Form co che do:

- chi xem mac dinh;
- bam `Sua` de mo khoa form;
- bam `Luu` de cap nhat;
- bam `Huy` de khoi phuc du lieu ban dau.

### 2.2. Sua du lieu kham

Request da ho tro `Id` cho:

- sinh hieu;
- tien su benh.

Neu request co `Id`, backend cap nhat ban ghi cu. Neu khong co `Id`, backend tao ban ghi moi.

### 2.3. Font Awesome

DoctorUI da cai Font Awesome local:

```text
@fortawesome/fontawesome-free
```

CSS duoc nap global trong `src/index.css`, do do cac icon `fa-solid` duoc bundle truc tiep vao frontend.

### 2.4. To chuc type

Type/interface cua examination da duoc gom vao:

```text
ClinicManagement.DoctorUI/src/examination/types/examination.types.ts
```

Cac file type cu giu vai tro re-export de khong pha cac import hien tai:

- `types/index.ts`;
- `types/queue.examination.type.ts`;
- `types/patientWorkspace.type.ts`.

## 3. Module Chuan doan da hoan thanh

### 3.1. Domain

Entity chinh:

```text
ClinicManagement.Domain/Examination/LuotKham/ChanDoan.cs
```

Da bo sung method:

```text
Update(maICD, tenChanDoan, laChanDoanChinh, ghiChu)
```

`LuotKham` la aggregate root so huu collection `ChanDoans`. Database da co:

- foreign key `ChanDoan.MaICD -> ICD.MaICD`;
- unique `ICD.MaICD`;
- filtered unique index moi luot chi co mot chuan doan chinh;
- soft delete qua `BaseEntity`.

### 3.2. DTO

Thu muc:

```text
ClinicManagement.Application/DTOs/LuotKham/ChanDoan/
```

File da tao:

- `ChanDoanRequest.cs`: request them/sua.
- `ChanDoanDto.cs`: response chuan doan.
- `ICDOptionDto`: ket qua tra cuu ICD.

Payload them/sua:

```json
{
  "id": 12,
  "maICD": "J06.9",
  "tenChanDoan": "Nhiem trung duong ho hap cap",
  "laChanDoanChinh": true,
  "ghiChu": "Ho, sot, kho tho"
}
```

`id` la tuy chon:

- khong co `id`: them moi;
- co `id`: cap nhat.

### 3.3. Command va Handler

Thu muc:

```text
ClinicManagement.Application/Features/LuotKham/Commands/ChanDoan/
```

Da tao:

- `SaveChanDoan/SaveChanDoanCommand.cs`.
- `SaveChanDoan/SaveChanDoanCommandHandler.cs`.
- `DeleteChanDoan/DeleteChanDoanCommand.cs`.
- `DeleteChanDoan/DeleteChanDoanCommandHandler.cs`.

`SaveChanDoanCommandHandler` da xu ly:

1. Kiem tra `luotKhamId`.
2. Kiem tra ma ICD va ten chan doan.
3. Lay aggregate `LuotKham`.
4. Chi cho phep thao tac khi trang thai la `DANG_KHAM`.
5. Khong cho trung ma ICD trong cung luot.
6. Khong cho co hai chuan doan chinh.
7. Co `Id` thi update.
8. Khong co `Id` thi add.
9. Save database.

`DeleteChanDoanCommandHandler` da xu ly:

1. Kiem tra luot kham va chuan doan.
2. Chi cho phep xoa khi `DANG_KHAM`.
3. Goi `SoftDelete()`.
4. Save database.

### 3.4. Query tra cuu ICD

Thu muc:

```text
ClinicManagement.Application/Features/LuotKham/Queries/ChanDoan/SearchICD/
```

Da tao:

- `SearchICDQuery.cs`.
- `SearchICDQueryHandler.cs`.

Query tim theo:

- ma ICD;
- ten ICD.

Ket qua gioi han 50 dong va sap xep theo ma ICD.

### 3.5. Controller

File:

```text
ClinicManagement.API/Controllers/LuotKham/ChanDoan.LuotKhamController.cs
```

Endpoint da tao:

```http
GET    /api/LuotKham/icd?keyword=ho
POST   /api/LuotKham/{id}/diagnoses
DELETE /api/LuotKham/{id}/diagnoses/{diagnosisId}
```

`POST /diagnoses` dung chung cho them va sua thong qua truong `id` trong body.

### 3.6. DoctorUI API client

File:

```text
ClinicManagement.DoctorUI/src/examination/api/examination.api.ts
```

Da bo sung:

- `searchICD()`.
- `saveDiagnosis()`.
- `deleteDiagnosis()`.

### 3.7. Hook quan ly chuan doan

File:

```text
ClinicManagement.DoctorUI/src/examination/hooks/useDiagnosisManagement.ts
```

Hook dang quan ly:

- danh sach chuan doan;
- form them/sua;
- tim ICD;
- chon ICD;
- loading;
- error/success;
- them;
- sua;
- xoa.

### 3.8. UI da tich hop

File:

```text
ClinicManagement.DoctorUI/src/examination/components/workspaces/TreatmentWorkspace.tsx
```

Cac nut da co handler:

- `Tra cuu ICD-10`;
- tim ICD;
- `Chon` ICD;
- `Them chuan doan`;
- sua theo dong;
- xoa theo dong;
- `Luu chuan doan`;
- `Huy`.

Khi chua chon benh nhan:

- khong hien du lieu chan doan mau;
- danh sach rong;
- cac nut thao tac bi khoa.

## 4. Ket qua kiem tra

Da chay:

```bash
dotnet build ClinicManagement.slnx --no-restore -v:q
npm run build
```

Ket qua:

- Backend build thanh cong.
- Frontend build thanh cong.
- Khong co loi TypeScript moi trong module chuan doan.
- Font Awesome duoc bundle thanh cong.

Lint van con mot loi cu ngoai module chuan doan:

```text
PatientWorkspace.tsx: React Hook usePatientWorkspace is called conditionally
```

Day la viec can sua rieng trong module PatientWorkspace, khong phai loi cua module Chuan doan.

## 5. Cac diem can luu y hien tai

### 5.1. Du lieu chi tiet luot kham chua duoc map day du vao UI

`TreatmentWorkspace` da co logic chuan doan that, nhung luong `ExamPanel/useExam` van con phu thuoc vao model mock o mot so cho.

Can lam tiep:

```http
GET /api/LuotKham/{id}
```

Sau do map `LuotKhamDetailDto` thanh view model cua DoctorUI.

### 5.2. Tra cuu ICD hien tai tra truc tiep tu repository luot kham

Cach nay dang chay duoc, nhung ve kien truc co the tach thanh `IICDRepository` rieng neu module ICD duoc mo rong nhieu noi.

### 5.3. Authorization chua hoan chinh

Can bo sung:

- `[Authorize]` cho controller.
- policy role bac si.
- kiem tra bac si co duoc phan cong tren luot kham khong.
- lay `CreatedBy` tu JWT.
- khoa thao tac khi luot da `HOAN_THANH` hoac `DA_HUY`.

### 5.4. Update aggregate dang dung graph load

`GetDetailByIdAsync()` dang dung `AsNoTracking()` va handler goi update aggregate. Khi mo rong nhieu navigation, nen can nhac update truc tiep entity can sua de tranh EF danh dau thua entity trong graph.

## 6. Ke hoach cac module con cua tab Xu tri

## Giai doan 1 - Du lieu that va trang thai

### Module 1: Load chi tiet luot kham

Muc tieu:

- bo du lieu mock;
- tai du lieu theo `luotKhamId`;
- map DTO backend sang `ExamDetail`;
- refresh sau khi them/sua/xoa.

API:

```http
GET /api/LuotKham/{id}
```

Thanh phan can tao:

- `GetDoctorTreatmentDetailQuery` neu DTO hien tai chua phu hop.
- `DoctorTreatmentDetailDto`.
- `mapLuotKhamDetailToExamDetail()`.
- `useTreatmentWorkspace()` hoac cap nhat `useExam()`.

### Module 2: Hoan tat luot kham

API de xuat:

```http
POST /api/LuotKham/{id}/complete
POST /api/LuotKham/{id}/cancel
```

Can tao:

- `CompleteExamCommand`.
- `CompleteExamCommandHandler`.
- `CancelExamCommand`.
- `CancelExamCommandHandler`.
- controller endpoint.
- API client.

Dieu kien can kiem tra:

- trang thai hien tai la `DANG_KHAM`;
- co chuan doan chinh;
- bac si co quyen;
- dich vu va don thuoc dang o trang thai hop le;
- chinh sach doi voi CLS dang cho ket qua.

## Giai doan 2 - Chuan doan nang cao

Module Chuan doan hien da co CRUD co ban. Co the bo sung:

- phan trang/loc ICD;
- loc chuan doan theo trang thai;
- bat buoc ten ICD lay tu server thay vi cho nhap tuy y;
- lich su thay doi chuan doan;
- khoa sua sau khi hoan tat;
- test integration cho duplicate ICD va duplicate chuan doan chinh.

## Giai doan 3 - Chi dinh dich vu

### Module 3: Danh muc dich vu

API:

```http
GET /api/DanhMucDichVu?keyword=&loaiDichVu=
```

Can tra ve:

- ma dich vu;
- ten dich vu;
- loai dich vu;
- don gia;
- trang thai hoat dong;
- co yeu cau ket qua xet nghiem hay khong.

### Module 4: Tao/xoa chi dinh

API:

```http
POST   /api/LuotKham/{id}/service-orders
DELETE /api/LuotKham/{id}/service-orders/{orderId}
```

DTO de xuat:

```text
CreateServiceOrderRequest
ServiceOrderDto
```

Command/Handler:

```text
CreateServiceOrderCommand
CreateServiceOrderCommandHandler
CancelServiceOrderCommand
CancelServiceOrderCommandHandler
```

Quy tac:

- luot phai dang `DANG_KHAM`;
- dich vu phai ton tai va dang hoat dong;
- so luong > 0;
- khong xoa sau khi da tiep nhan;
- nguoi chi dinh lay tu JWT;
- neu co vien phi thi tao chi phi trong cung transaction.

### Module 5: Tiep nhan va ket qua CLS

API de xuat:

```http
POST /api/service-orders/{id}/receive
POST /api/service-orders/{id}/result
```

Can tao:

- `ReceiveServiceOrderCommand`.
- `SaveLabResultCommand`.
- `CompleteLabResultCommand`.
- DTO chi tiet ket qua.
- phan quyen ky thuat vien CLS.

DoctorUI chi nen hien thi ket qua da phat hanh.

## Giai doan 4 - Don thuoc

### Module 6: Tra cuu thuoc

API:

```http
GET /api/Items/medicines?keyword=
GET /api/Items/{id}/inventory
```

DTO:

```text
MedicineOptionDto
InventoryAvailabilityDto
```

Can loc:

- item dang hoat dong;
- loai item la thuoc;
- duoc phep ke don;
- don vi tinh;
- ton kha dung.

### Module 7: Tao/sua don thuoc

API:

```http
POST /api/LuotKham/{id}/prescriptions
PUT  /api/DonThuoc/{id}
```

Can tao:

- `CreatePrescriptionCommand`.
- `UpdatePrescriptionCommand`.
- `PrescriptionRequest`.
- `PrescriptionDto`.

Validation:

- thuoc ton tai;
- so luong > 0;
- co lieu dung;
- co tan suat;
- co so ngay;
- kiem tra di ung;
- khong cho sua don da duyet.

### Module 8: Duyet va cap phat

API:

```http
POST /api/DonThuoc/{id}/approve
POST /api/DonThuoc/{id}/cancel
POST /api/DonThuoc/{id}/dispense
```

Can tao:

- `ApprovePrescriptionCommand`.
- `CancelPrescriptionCommand`.
- `DispensePrescriptionCommand`.
- repository don thuoc.
- repository kho.

Cap phat phai transaction:

```text
Kiem tra ton
-> tru ton
-> cap nhat so luong da xuat
-> tao phieu xuat
-> cap nhat trang thai don
-> commit
```

## Giai doan 5 - An toan va van hanh

### Module 9: Canh bao di ung va tuong tac

- Lay tien su di ung cua benh nhan.
- So sanh voi thuoc dang ke.
- Canh bao truoc khi duyet don.
- Cho phep bac si xac nhan override neu nghiep vu cho phep.

### Module 10: Phan quyen va audit

- Bac si: chuan doan, chi dinh, ke don, hoan tat.
- Ky thuat vien CLS: tiep nhan va phat hanh ket qua.
- Duoc si: duyet cap phat va tru kho.
- Quan tri: xem, dieu chinh theo policy.
- Audit thay doi chuan doan, dich vu, don thuoc va trang thai luot kham.

### Module 11: Concurrency va transaction

- RowVersion/concurrency token cho kho va don thuoc.
- Transaction cho cap phat.
- Transaction cho chi dinh kem vien phi.
- Transaction cho hoan tat.
- Integration test cho hai request cap phat dong thoi.

## 7. Thu tu uu tien de tiep tuc

```text
P0. Load chi tiet luot kham that va bo mock
P1. Hoan tat luot kham
P2. Danh muc va tao chi dinh dich vu
P3. CRUD don thuoc
P4. Ket qua CLS
P5. Duyet/cap phat va ton kho
P6. Di ung, authorization, audit, concurrency
```

## 8. Trang thai tong ket

| Module | Domain | Database | Application/API | DoctorUI |
|---|---|---|---|---|
| Kham ban dau | Ho tro | Ho tro | Da co | Da tich hop |
| Sua sinh hieu/tien su | Da co method update | Ho tro | Da co | Da tich hop |
| Chuan doan co ban | Ho tro | Ho tro | Da co | Da tich hop |
| Tra cuu ICD | Ho tro | Ho tro | Da co query/API | Da tich hop |
| Load chi tiet that | Ho tro | Ho tro | Co query detail | Chua map day du |
| Hoan tat luot kham | Co `CompleteExam()` | Ho tro | Chua co command/API | Chua co |
| Chi dinh dich vu | Ho tro | Ho tro | Chua co command ghi | Chua co |
| Ket qua CLS | Co entity | Ho tro | Chua co workflow | Dang mock |
| Don thuoc | Co entity/method co ban | Ho tro | Chua co command ghi day du | Dang mock |
| Ton kho/cap phat | Co entity/method co ban | Ho tro | Chua co transaction workflow | Chua co |
| Di ung/tuong tac | Co tien su | Ho tro mot phan | Chua co validation thuoc | Canh bao tinh |

## 9. Ket luan

Module Chuan doan da hoan thanh vong CRUD co ban va co the lam mau cho cac module tiep theo. Buoc tiep theo co rui ro cao nhat la **load chi tiet luot kham that**, vi neu khong lam buoc nay thi UI Xu tri van co nguy co hien du lieu mock hoac du lieu sai benh nhan.

Sau khi map du lieu that, tiep tuc theo thu tu:

```text
Hoan tat luot kham
-> Chi dinh dich vu
-> Don thuoc
-> Ket qua CLS
-> Cap phat ton kho
-> Phan quyen/audit/concurrency
```
