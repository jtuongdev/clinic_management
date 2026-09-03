# ClinicManagement - Hien trang backend

## 1. Tang Domain

### LuotKham

Entity `LuotKham` quan ly mot lan kham cua benh nhan. Cac du lieu chinh:

- benh nhan, bac si, co so, khoa, phong kham;
- ngay kham, so thu tu;
- ly do kham;
- thoi gian bat dau va ket thuc;
- trang thai luot kham;
- danh sach chuan doan, sinh hieu, chi dinh dich vu, don thuoc.

Domain method dang co:

- `StartExam()`: `CHO_KHAM -> DANG_KHAM`.
- `CompleteExam()`: `DANG_KHAM -> HOAN_THANH`.
- `CancelExam()`.
- `AssignDoctor()`.
- `SetLyDoKham()`.
- `AddSinhHieu()`.
- `AddChanDoan()`.

### BenhNhan va tien su

`BenhNhan` co collection `TienSuBenhs` va method `AddTienSu()`. Enum `LoaiTienSu` gom:

- `BENH_NEN`;
- `DI_UNG`;
- `PHAU_THUAT`;
- `TIEN_SU_GIA_DINH`;
- `THOI_QUEN_SINH_HOAT`.

### ChanDoan va ICD

`ChanDoan` lien ket `LuotKham` va `ICD`. Database co unique index cho ma ICD va filtered unique index de moi luot chi co mot chuan doan chinh.

### ChiDinhDichVu

Entity lien ket luot kham, danh muc dich vu, nguoi chi dinh va nguoi thuc hien. Co trang thai tiep nhan, cho ket qua, co ket qua va huy.

### DonThuoc va ton kho

Domain co `DonThuoc`, `ChiTietDonThuoc`, `Item`, `TonKho`. Don thuoc co cac trang thai tam, da duyet, da xuat het va huy. Ton kho co thao tac cong/tru so luong.

## 2. Tang Application

### Command dang co

- Bat dau kham.
- Luu thong tin kham ban dau.
- Tao benh nhan.
- Cac command khac cua module benh nhan, dich vu va thong ke tuy pham vi.

### Command con thieu cho tab Xu tri

- Them/sua/xoa chuan doan.
- Tra cuu ICD.
- Them/xoa chi dinh dich vu.
- Tiep nhan chi dinh.
- Ghi/phat hanh ket qua xet nghiem.
- Tao/sua/duyet/huy don thuoc.
- Cap phat thuoc va tru ton kho.
- Hoan tat hoac huy luot kham.

## 3. Tang Infrastructure

`LuotKhamRepository.GetDetailByIdAsync()` da include cac navigation quan trong:

```text
BenhNhan
BacSi / Khoa / CoSo / PhongKham
ChanDoans -> ICD
SinhHieus
ChiDinhDichVus -> DanhMucDichVu -> ChiTietKetQuaXetNghiems
DonThuocs -> ChiTietDonThuocs -> Item
```

`ClinicDbContext` da co DbSet cho cac nhom du lieu nay va migration da tao bang tuong ung.

## 4. Tang API dang co

```text
GET  /api/LuotKham/{id}
GET  /api/LuotKham/hang-doi
POST /api/LuotKham/{id}/start-exam
POST /api/LuotKham/{id}/examination
GET  /api/LuotKham/danh-sach-chi-dinh
GET  /api/LuotKham/thong-ke-chi-dinh
GET  /api/LuotKham/danh-sach-donthuoc
GET  /api/LuotKham/thong-ke-donthuoc
GET  /api/BenhNhan/{id}/tiensu
GET  /api/BenhNhan/loai-tien-su
```

## 5. Ranh gioi va rui ro hien tai

### Trang thai

`CompleteExam()` co trong Domain nhung chua co command, handler va endpoint. Handler luu kham can kiem tra trang thai `DANG_KHAM`, khong nen cho ghi vao luot da huy hoac da hoan tat.

### Phan quyen

Can ap dung `[Authorize]` va policy theo role. Bac si, ky thuat vien CLS va duoc si khong nen dung chung quyen. `CreatedBy`, bac si chi dinh va nguoi thuc hien nen lay tu JWT, khong tin body client.

### Tracking

Repository chi tiet dang dung `AsNoTracking()`. Neu update ca graph bang `_luotKhamRepo.Update(luotKham)`, EF co the danh dau nhieu navigation la modified. Nen tai entity can update rieng hoac dung command update theo Id.

### Transaction

Cac flow cap phat thuoc, tao chi dinh kem hoa don va hoan tat luot kham can transaction ro rang. EF transaction ngam cua mot lan `SaveChanges` khong thay the transaction cho workflow nhieu buoc.

## 6. Ket luan

Backend co nen tang Domain/DB tot, nhung Application/API moi hoan chinh mot phan. UI chi nen dung cac contract da co; phan con lai can xay dung command, validation, authorization, transaction va integration test truoc khi dua vao su dung that.
