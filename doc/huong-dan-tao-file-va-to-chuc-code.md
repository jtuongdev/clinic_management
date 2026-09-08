# Huong dan tao file va to chuc code

Tai lieu nay quy dinh cach tao file moi trong solution `ClinicManagement`, cach nhom code theo hanh vi va cach giu dung kien truc Domain - Application - Infrastructure - API.

## 1. Nguyen tac chung

- Dat file trong dung layer, khong dat logic nghiep vu vao Infrastructure.
- Ten thu muc va file dung tieng Viet khong dau, viet PascalCase.
- Moi file nen co mot muc dich ro rang.
- Khong gom nhieu hanh vi khac nhau vao mot file lon.
- Giua cac file cung mot class su dung `partial` va dat hau to theo ten class.
- Khong doi namespace khi chi di chuyen file trong cung module.
- Truoc khi tao class moi, tim implementation tuong tu de tai su dung convention hien co.

## 2. Cau truc cac layer

```text
ClinicManagement.Domain/
  Entity, ValueObject, Enum
  Repositories/                 # interface repository

ClinicManagement.Application/
  DTOs/                         # request/response DTO
  Common/Interfaces/            # interface application dung chung
  Features/
    TenModule/
      HanhVi/
        Commands/
        Queries/

ClinicManagement.Infrastructure/
  Persistence/
    Repositories/               # implementation repository
    Configurations/             # EF Core mapping

ClinicManagement.API/
  Controllers/
```

## 3. Tao mot feature moi

Vi du them hanh vi `TaoMatHang` cho module `Kho`:

```text
Application/Features/Kho/
  Commands/
    TaoMatHang/
      TaoMatHangCommand.cs
      TaoMatHangCommandHandler.cs
  DTOs/Kho/MatHang/
    ItemRequest.cs
```

### Command

```csharp
public sealed record TaoMatHangCommand(ItemRequest Data)
    : IRequest<InventoryResult>;
```

### Handler

```csharp
public sealed class TaoMatHangCommandHandler(
    IKhoService service)
    : IRequestHandler<TaoMatHangCommand, InventoryResult>
{
    public Task<InventoryResult> Handle(
        TaoMatHangCommand request,
        CancellationToken cancellationToken)
    {
        return service.CreateItem(request.Data);
    }
}
```

Handler chi dieu phoi request. Logic nghiep vu dat trong application service hoac domain entity.

## 4. Dat DTO

DTO request/response dat trong:

```text
ClinicManagement.Application/DTOs/<Module>/<NhomNghiepVu>/
```

Vi du:

```text
DTOs/Kho/
  MatHang/ItemRequest.cs
  NhapKho/ImportRequest.cs
  CapPhat/DispenseRequest.cs
  KiemKe/StocktakeCreateRequest.cs
```

DTO la hop dong cua Application/API, khong dung entity Domain lam request truc tiep.

Chi dung `record` khi DTO la du lieu bat bien, khong bi gan lai sau khi binding. Neu DTO co danh sach khoi tao mac dinh, inheritance, hoac duoc cap nhat tung buoc thi giu dang `class` voi `{ get; set; }` de khong doi hanh vi.

## 5. Nhom file theo hanh vi

Khi module co nhieu hanh vi, tao thu muc con:

```text
Features/LichLamViec/
  LichLamViec/
    Commands/
    Queries/
  LichLamViecCoDinh/
  ChamCong/
  NghiPhep/
```

Quy tac goi y:

- `Commands/`: tao, cap nhat, xoa, duyet, khoa, chot.
- `Queries/`: danh sach, chi tiet, thong ke, tra cuu.
- Thu muc hanh vi dat theo nghiep vu: `ChamCong`, `NghiPhep`, `KiemKe`.
- Neu dung `partial`, dat ten file theo mau:

```text
CatalogStock.KhoService.cs
ImportDispensing.KhoService.cs
StocktakeAudit.KhoService.cs
```

Khong dat cac file partial nhu `Part1.cs`, `Helper.cs` neu ten khong cho biet pham vi xu ly.

## 6. Repository va Infrastructure

Interface repository dat trong Domain:

```text
Domain/Repositories/IKhoRepository.cs
```

Implementation dat trong Infrastructure:

```text
Infrastructure/Persistence/Repositories/KhoRepository.cs
```

Application chi phu thuoc interface:

```csharp
public sealed class KhoService(IKhoRepository repository)
```

Khong inject `ClinicDbContext`, `DbSet<T>` hoac `DatabaseFacade` vao Application. Transaction EF Core phai duoc bao boi abstraction Domain/Application va implement o Infrastructure.

## 7. Controller

Controller chi nhan request, gui command/query va tra response:

```text
API/Controllers/
  Kho/
    DanhMuc.InventoryController.cs
    NhapKho.InventoryController.cs
    KiemKe.InventoryController.cs
```

Khi tach controller bang `partial`:

- File goc giu route, constructor va helper dung chung.
- File partial chi chua endpoint cung nhom hanh vi.
- Tat ca file dung cung namespace va cung ten class.
- Khong dua truy van EF Core vao controller.

## 8. Quy trinh tao file moi

1. Xac dinh hanh vi thuoc module nao.
2. Tim module tuong tu, uu tien `BenhNhan`, `LichLamViec` hoac `Kho`.
3. Tao DTO trong `Application/DTOs`.
4. Tao command/query va handler trong `Application/Features`.
5. Neu can truy cap du lieu, them interface vao `Domain/Repositories`.
6. Them implementation vao `Infrastructure/Persistence/Repositories`.
7. Dang ky DI trong `Infrastructure/DependencyInjection.cs`.
8. Them endpoint vao controller phu hop.
9. Cap nhat tai lieu neu thay doi flow/API.
10. Chay build va kiem tra format.

## 9. Cach tao thu muc va file tren UI

UI su dung React/Vite va to chuc theo tung module nghiep vu. Moi module nen gom API client, page va component rieng, khong dat tat ca code vao `App.jsx`.

### Cau truc module UI

```text
ClinicManagement.AdminUI/src/
  <module>/
    api/                    # ham goi API
    components/             # component tai su dung trong module
    pages/                  # man hinh/chuc nang
    types/                  # kieu du lieu neu module can
    hooks/                  # custom hook neu co
    <module>.css            # style rieng cua module neu can
```

Vi du module lich lam viec hien co:

```text
src/employee/schedule/
  api/
    schedule.api.ts
  pages/
    ScheduleManagement.jsx
    FixedScheduleManagement.jsx
    AttendanceManagement.jsx
    LeaveManagement.jsx
  components/
  ...
```

### Tao module UI moi

1. Xac dinh module nghiep vu, vi du `inventory` hoac `employee/schedule`.
2. Tao thu muc module trong `ClinicManagement.AdminUI/src`.
3. Tao `api/` de chua ham goi endpoint.
4. Tao `pages/` cho man hinh cap module.
5. Tao `components/` cho bang, form, filter, modal va panel.
6. Tao `types/` neu co model dung lap lai.
7. Them route/menu trong file dang quan ly dieu huong hien co.
8. Tai page, goi API qua file trong `api/`, khong goi Axios truc tiep trong nhieu component.

### Quy tac dat ten file UI

- Page: `ScheduleManagement.jsx`, `LeaveManagement.jsx`.
- Component React: `PatientTable.tsx`, `ExaminationPharmacy.tsx`.
- API client: `schedule.api.ts`, `examination.api.ts`.
- Hook: `useSchedule.ts`.
- Kieu du lieu: `schedule.types.ts`.
- Style: dat cung module, vi du `ScheduleManagement.css`.
- Ten thu muc module dung chu thuong theo convention hien co: `employee`, `patient`, `examination`.

### Tao file API client

```ts
// src/employee/schedule/api/schedule.api.ts
import api from "../../../shared/api/axios.api";

export async function getSchedules(params) {
  const response = await api.get("/lich-lam-viec", { params });
  return response.data;
}
```

API client chi chiu trach nhiem:

- Chuan bi URL, query va request body.
- Goi instance Axios dung chung.
- Tra ve du lieu cho page/component.
- Khong chua logic hien thi hoac state cua giao dien.

### Tao page va component

```jsx
// src/employee/schedule/pages/ScheduleManagement.jsx
import { useEffect, useState } from "react";
import { getSchedules } from "../api/schedule.api";
import ScheduleTable from "../components/ScheduleTable";

export default function ScheduleManagement() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getSchedules().then((data) => setItems(data.items ?? []));
  }, []);

  return <ScheduleTable items={items} />;
}
```

```jsx
// src/employee/schedule/components/ScheduleTable.jsx
export default function ScheduleTable({ items }) {
  return (
    <table>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.tenNhanVien}</td>
            <td>{item.ngayLam}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Page quan ly state va flow cua man hinh; component chi hien thi va nhan props. Khi component co logic lon, tach logic goi API/state thanh hook rieng.

### Khi them form hoac modal

- Tao component rieng trong `components/`.
- Form state phai co gia tri mac dinh ro rang.
- Dung cung ten field voi DTO/API backend.
- Hien thi loading, validation va loi API.
- Sau khi them/sua/xoa thanh cong, cap nhat lai state hoac tai lai du lieu.
- Khong viet lai cung mot API client trong nhieu component.

### Ket noi UI voi API backend

```text
Page
  -> component/hook
  -> module/api/*.api.ts
  -> shared/api/axios.api.ts
  -> API Controller
```

Khi them endpoint moi, can kiem tra dong thoi:

- Route backend.
- Ten field request/response.
- Kieu du lieu va gia tri null.
- Ma loi va thong bao loi.
- Quy tac phan quyen/token.

Khong thay doi ten field API chi de phu hop ten bien UI; neu can doi phai cap nhat ca DTO backend va tai lieu contract.

### Checklist rieng cho UI

- [ ] File nam dung module va dung thu muc `api`, `pages`, `components` hoac `types`.
- [ ] Page khong chua URL API truc tiep.
- [ ] API client dung Axios instance dung chung.
- [ ] Component khong lap lai logic goi API.
- [ ] Co `key` on dinh khi render danh sach.
- [ ] Co xu ly loading, empty state va error state.
- [ ] Khong lam thay doi route hoac API contract hien tai.

## 10. Checklist truoc khi ket thuc

- [ ] File nam dung layer va dung thu muc hanh vi.
- [ ] Ten file mo ta ro class/feature.
- [ ] DTO khong dung entity Domain lam request.
- [ ] Application khong tham chieu `DbContext`/`DbSet`.
- [ ] Repository interface nam trong Domain.
- [ ] Repository implementation nam trong Infrastructure.
- [ ] DI da dang ky dependency moi.
- [ ] API contract va hanh vi cu khong bi thay doi.
- [ ] `dotnet build ClinicManagement.slnx --no-restore` thanh cong.
- [ ] `git diff --check` khong co loi.
