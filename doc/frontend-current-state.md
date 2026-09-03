# DoctorUI - Hien trang frontend

## 1. Cau truc `src/examination`

```text
src/examination/
  api/
    examination.api.ts
    patientWorkspace.api.ts
  components/
    ActionToolbar.tsx
    ExamPanel.tsx
    ExamSidebar.tsx
    workspaces/
      PatientWorkspace.tsx
      ExaminationWorkspace.tsx
      TreatmentWorkspace.tsx
      ElectronicRecordWorkspace.tsx
  hooks/
    useExam.ts
    useExaminationForm.ts
    usePatientWorkspace.ts
    useQueueExamination.ts
  types/
    examination.types.ts
    index.ts
    queue.examination.type.ts
    patientWorkspace.type.ts
```

## 2. Da hoan thien

- Hang doi bac si da goi API.
- Form kham ban dau da goi API.
- Form kham co che do `Sua`, `Huy`, `Luu`.
- Payload kham gom ly do, sinh hieu va tien su.
- Type/interface da gom vao `types/examination.types.ts`.

## 3. Tab Xu tri hien tai

`TreatmentWorkspace.tsx` da co khung hien thi cho:

- chuan doan;
- danh sach dich vu;
- don thuoc;
- ket qua xet nghiem;
- thong tin tong hop luot kham.

Nhung du lieu dang phu thuoc vao `mockExamDetail` trong `useExam.ts`. Khi chon benh nhan, DoctorUI chua map day du `GET /api/LuotKham/{id}` vao `ExamDetail`.

## 4. Van de model

Backend tra ve cac nhom:

```text
ChanDoans
ChiDinhDichVus
DonThuocs
KetQuaChiTiet
```

UI dang mong doi:

```text
treatment.diagnosis
treatment.diagnosisList
treatment.services
treatment.drugs
treatment.results
```

Can co ham mapping ro rang hoac tao type `DoctorTreatmentDetail` moi thay vi ep kieu truc tiep.

## 5. Thu tu lam UI

1. Them API lay chi tiet luot kham.
2. Map DTO backend sang `ExamDetail`.
3. Bo mock khoi luong that.
4. Lam CRUD chuan doan.
5. Lam chi dinh dich vu.
6. Lam ke don.
7. Hien thi ket qua CLS that.
8. Them nut hoan tat goi backend.

## 6. Quy tac giao dien

- Chi hien nut thao tac khi trang thai cho phep.
- Disabled cac control khi luot da hoan tat/huy.
- Hien loading/error rieng cho tung nhom neu can.
- Sau moi thao tac thanh cong, tai lai chi tiet luot kham.
- Khong hien du lieu mock trong moi truong that.
