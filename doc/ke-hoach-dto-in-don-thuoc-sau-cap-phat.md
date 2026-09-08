# Kế hoạch DTO in đơn thuốc sau cấp phát

## 1. Mục tiêu

Sau khi cấp phát thuốc thành công, hệ thống phải tạo được một model/DTO đầy đủ để:

- Hiển thị lại đơn thuốc trên AdminUI.
- In đơn thuốc cho bệnh nhân.
- Lưu hoặc tải bản in dưới dạng PDF ở bước triển khai sau.
- Đối chiếu được đơn thuốc, người bệnh, lượt khám, bác sĩ kê, người cấp phát và các lô thuốc đã xuất.

DTO in là **read model**, không phải entity mới và không thay thế `DonThuoc`.
Không lưu DTO in thành một bảng riêng ở giai đoạn đầu. Dữ liệu được dựng từ
entity và quan hệ hiện có sau khi giao dịch cấp phát hoàn tất.

## 2. Flow nghiệp vụ cần triển khai

```text
Đơn thuốc TAM
  -> bác sĩ duyệt
  -> DonThuoc.DA_DUYET
  -> kho lấy đơn chờ cấp phát
  -> nhân viên kho cấp phát
  -> trừ tồn theo FEFO
  -> tạo PhieuXuatKho loại XUAT_DON
  -> tạo ChiTietXuatKho theo từng lô
  -> cập nhật ChiTietDonThuoc.SoLuongDaXuat
  -> DonThuoc.DA_XUAT_HET
  -> ghi NgayCapThuoc, MaNguoiCapThuoc
  -> trả DTO in đơn thuốc
```

Endpoint cấp phát hiện tại:

```http
POST /api/inventory/prescriptions/{prescriptionId}/dispense
```

Response hiện tại trả:

```json
{
  "prescriptionId": 1004,
  "exportReceiptId": 2004,
  "prescriptionStatus": "DA_XUAT_HET",
  "dispensedItems": []
}
```

## 12. Trạng thái triển khai backend

Mẫu JSON ở trên đã được dùng làm read model cho backend. API trả về đúng các
nhóm dữ liệu `header`, `benhNhan`, `chanDoan`, `danhSachThuoc`, `loiDan`,
`xacNhan` và `ghiChuChanTrang`. Backend không lưu thêm entity giấy in; dữ liệu
được dựng từ đơn thuốc, lượt khám, bệnh nhân, cơ sở, nhân viên cấp phát, phiếu
xuất và các lô nhập thực tế.

### 12.1. Lấy dữ liệu để in lại

```http
GET /api/inventory/prescriptions/{prescriptionId}/print-data
Authorization: Bearer {token}
```

Response thành công dùng envelope chung của API:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "header": {
      "soYTe": "SỞ Y TẾ TP. HỒ CHÍ MINH",
      "coSo": {
        "ten": "PHÒNG KHÁM ĐA KHOA ABC",
        "diaChi": "123 Nguyễn Văn Linh, Q.1, TP.HCM",
        "hotline": "028.1234.5678"
      },
      "maDonThuoc": "DT-2026-00042",
      "maLuotKham": "LK-102",
      "maBenhNhan": "BN-00892",
      "tieuDe": "ĐƠN THUỐC",
      "phuDe": "Kèm thông tin xuất kho cấp phát"
    },
    "benhNhan": {
      "hoTen": "NGUYỄN VĂN KHANG",
      "tuoi": 31,
      "gioiTinh": "Nam",
      "soCccdBhyt": "079092001234",
      "dienThoai": "0912 345 678",
      "diaChi": "456 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM"
    },
    "chanDoan": {
      "maICD": "J06.9",
      "tenChanDoan": "Nhiễm trùng đường hô hấp trên cấp tính, không đặc hiệu"
    },
    "danhSachThuoc": [
      {
        "stt": 1,
        "maThuoc": "PARA500",
        "tenThuoc": "Paracetamol 500mg",
        "dangBaoChe": "Viên nén",
        "soLuong": 10,
        "soLuongChu": "Mười",
        "donViTinh": "viên",
        "loHang": [
          {
            "soLo": "PARA-2026-01",
            "hanSuDung": "2028-12-31T00:00:00Z",
            "soLuong": 10
          }
        ],
        "cachDung": "Uống 1 viên/lần, ngày 2 lần sau ăn"
      }
    ],
    "loiDan": [],
    "xacNhan": {
      "ngayKe": "2026-09-07T13:16:38Z",
      "bacSiKeDon": {
        "hoTen": "Trần Thị B",
        "maCCHN": "012345/HCM"
      },
      "duocSiPhatThuoc": {
        "hoTen": "Lê Hoàng Nam",
        "trangThaiCapPhat": "ĐÃ CẤP PHÁT"
      }
    },
    "ghiChuChanTrang": [
      "Khám lại xin mang theo đơn này.",
      "Thuốc đã xuất khỏi quầy xin vui lòng kiểm tra kỹ trước khi rời đi."
    ]
  }
}
```

`loHang` là danh sách, không phải một object đơn, vì một thuốc có thể được
chia từ nhiều lô theo FEFO. `soLuong` là số lượng đã cấp thực tế
(`SoLuongDaXuat`), còn `cachDung` được ghép từ `LieuDung`, `TanSuat`,
`SoNgay` và `HuongDan`.

### 12.2. Response sau khi cấp phát

`POST /api/inventory/prescriptions/{id}/dispense` vẫn giữ các field cũ và bổ
sung `printData` cùng contract với API đọc lại:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "prescriptionId": 1006,
    "exportReceiptId": 25,
    "prescriptionStatus": "DA_XUAT_HET",
    "dispensedItems": [],
    "printData": {
      "header": {},
      "benhNhan": {},
      "chanDoan": {},
      "danhSachThuoc": [],
      "loiDan": [],
      "xacNhan": {},
      "ghiChuChanTrang": []
    }
  }
}
```

`printData` chỉ được trả sau khi lưu thành công phiếu xuất và các dòng xuất.
Nếu đơn chưa ở trạng thái `DA_XUAT_HET`, thiếu người cấp phát, thiếu phiếu
xuất hoặc phiếu xuất không có dòng, API trả `409`.

### 12.3. Quy ước để code UI

- Dùng `data.printData` trực tiếp sau thao tác cấp phát để mở modal/in.
- Khi mở lại lịch sử, gọi `GET .../print-data`.
- Hiển thị thuốc từ `danhSachThuoc`; hiển thị từng lô từ `loHang`.
- Không dùng danh sách `prescriptions/pending` để dựng giấy in.
- Format ngày, tiền và số lượng ở UI/PDF renderer; backend chỉ trả dữ liệu
  nguyên bản.

Response này đủ để xác nhận cấp phát nhưng chưa đủ để in, vì còn thiếu thông
tin bệnh nhân, chẩn đoán, hướng dẫn dùng thuốc, cơ sở, bác sĩ, người cấp phát,
giá trị đơn và chi tiết hạn dùng.

## 3. Entity domain làm nguồn dữ liệu

### 3.1. `DonThuoc`

File: `ClinicManagement.Domain/Prescription/DonThuoc/DonThuoc.cs`

Các field dùng cho DTO:

| Field | Ý nghĩa |
|---|---|
| `Id` | Mã đơn thuốc |
| `MaLuotKham` | Khóa liên kết lượt khám |
| `MaBacSi` | Bác sĩ kê đơn |
| `MaCoSo` | Cơ sở kê đơn |
| `NgayKe` | Thời điểm kê |
| `TrangThai` | Trạng thái đơn |
| `GhiChu` | Ghi chú đơn thuốc |
| `NgayCapThuoc` | Thời điểm hoàn tất cấp phát |
| `MaNguoiCapThuoc` | Nhân viên thực hiện cấp phát |
| `ChiTietDonThuocs` | Danh sách thuốc kê |

Quy tắc domain hiện có:

- Chỉ đơn `DA_DUYET` mới được cấp phát.
- `CompleteDispense()` chuyển đơn sang `DA_XUAT_HET`.
- `CompleteDispense()` ghi `NgayCapThuoc` và `MaNguoiCapThuoc`.

### 3.2. `ChiTietDonThuoc`

File: `ClinicManagement.Domain/Prescription/DonThuoc/ChiTietDonThuoc.cs`

Các field in trên đơn:

| Field | Ý nghĩa |
|---|---|
| `MaItem` | Mặt hàng/thuốc |
| `SoLuongKe` | Số lượng bác sĩ kê |
| `SoLuongDaXuat` | Số lượng đã cấp |
| `LieuDung` | Liều dùng |
| `TanSuat` | Tần suất dùng |
| `SoNgay` | Số ngày dùng |
| `HuongDan` | Hướng dẫn bổ sung |
| `DonGiaKe` | Đơn giá tại thời điểm kê |
| `Item` | Tên, mã, đơn vị và thông tin thuốc |

Không lấy hướng dẫn sử dụng từ dữ liệu tồn kho. Hướng dẫn phải lấy từ
`ChiTietDonThuoc`, vì đây là chỉ định của bác sĩ.

### 3.3. `LuotKham`

File: `ClinicManagement.Domain/Examination/LuotKham/LuotKham.cs`

Quan hệ cần Include:

```text
DonThuoc.MaLuotKham -> LuotKham.Id
LuotKham.BenhNhan
LuotKham.BacSi
LuotKham.CoSo
LuotKham.ChanDoans
```

Các thông tin dùng để in:

- Mã lượt khám.
- Ngày khám.
- Lý do khám.
- Bệnh nhân.
- Bác sĩ khám.
- Cơ sở/phòng khám.
- Chẩn đoán chính và các chẩn đoán liên quan nếu nghiệp vụ yêu cầu.

### 3.4. `BenhNhan`

File: `ClinicManagement.Domain/Patient/BenhNhan/BenhNhan.cs`

Thông tin được phép đưa vào bản in:

- Họ và tên, ghép từ `Ho` và `Ten`.
- Ngày sinh.
- Giới tính.
- Số điện thoại.
- Địa chỉ.
- Số CCCD nếu mẫu in bắt buộc.

Không đưa `Username` hoặc `PasswordHash` vào bất kỳ DTO in nào.

### 3.5. `PhieuXuatKho`

File: `ClinicManagement.Domain/Inventory/PhieuXuatKho/PhieuXuatKho.cs`

Khi cấp phát đơn, service hiện tạo:

- `MaPhieu`: mã phiếu xuất.
- `LoaiXuat = XUAT_DON`.
- `MaKhoXuat`.
- `MaDonThuoc`.
- `NgayXuat`.
- `MaNguoiXuat`.
- `GhiChu`.
- `ChiTietXuatKhos`.

Đây là chứng từ kho dùng để xác nhận thuốc thực tế đã cấp. DTO in cần tham
chiếu `MaPhieu`, `NgayXuat` và kho xuất nhưng không dùng `PhieuXuatKho` để
thay thế thông tin kê đơn.

### 3.6. `ChiTietXuatKho` và `ChiTietNhapKho`

Files:

- `ClinicManagement.Domain/Inventory/PhieuXuatKho/ChiTietXuatKho.cs`
- `ClinicManagement.Domain/Inventory/PhieuNhapKho/ChiTietNhapKho.cs`

Chuỗi liên kết:

```text
ChiTietXuatKho
  -> ChiTietNhapKho
  -> Item
  -> SoLo, HanSuDung, DonGiaNhap
```

Các field dùng cho phần xác nhận cấp phát:

- Số lô thực tế đã cấp.
- Hạn sử dụng.
- Số lượng xuất theo lô.
- Đơn giá xuất nếu cần in phiếu kho.

Một dòng thuốc có thể được cấp từ nhiều lô. DTO không được thiết kế chỉ có
một `lotNumber`; phải có danh sách `allocations`.

## 4. DTO đề xuất

Nên đặt tại:

```text
ClinicManagement.Application/DTOs/Kho/CapPhat/PrescriptionPrintDto.cs
```

Đề xuất contract:

```csharp
public sealed record PrescriptionPrintDto(
    int PrescriptionId,
    string PrescriptionCode,
    string Status,
    DateTime PrescribedAt,
    DateTime? DispensedAt,
    string Note,
    PatientPrintDto Patient,
    VisitPrintDto Visit,
    DoctorPrintDto Prescriber,
    FacilityPrintDto Facility,
    DispenserPrintDto? Dispenser,
    ExportReceiptPrintDto ExportReceipt,
    IReadOnlyList<PrescriptionPrintLineDto> Items,
    decimal TotalAmount);
```

Các DTO con:

```csharp
public sealed record PatientPrintDto(
    int Id,
    string FullName,
    DateTime DateOfBirth,
    string Gender,
    string Phone,
    string Address);

public sealed record VisitPrintDto(
    int Id,
    DateTime ExamDate,
    string Reason,
    IReadOnlyList<DiagnosisPrintDto> Diagnoses);

public sealed record DiagnosisPrintDto(
    string IcdCode,
    string Name,
    bool IsPrimary);

public sealed record DoctorPrintDto(
    int Id,
    string FullName);

public sealed record FacilityPrintDto(
    int Id,
    string Name);

public sealed record DispenserPrintDto(
    int Id,
    string FullName);

public sealed record ExportReceiptPrintDto(
    int Id,
    string ReferenceCode,
    DateTime ExportedAt,
    string WarehouseName);

public sealed record PrescriptionPrintLineDto(
    int ItemId,
    string ItemCode,
    string ItemName,
    string Unit,
    decimal PrescribedQuantity,
    decimal DispensedQuantity,
    string Dosage,
    string Frequency,
    int? DurationDays,
    string Instructions,
    decimal UnitPrice,
    decimal LineAmount,
    IReadOnlyList<DispensedBatchPrintDto> Batches);

public sealed record DispensedBatchPrintDto(
    string BatchNumber,
    DateTime? ExpiryDate,
    decimal Quantity);
```

Tên field có thể đổi theo convention DTO hiện tại, nhưng phải giữ nguyên ý
nghĩa và không trộn tên domain Việt với tên UI trong cùng một contract.

## 5. Quy tắc tính toán DTO

### 5.1. Số lượng

- `PrescribedQuantity = ChiTietDonThuoc.SoLuongKe`.
- `DispensedQuantity = ChiTietDonThuoc.SoLuongDaXuat`.
- `LineAmount = DispensedQuantity * DonGiaKe` hoặc dùng số lượng kê theo
  quy định tài chính. Cần chốt với nghiệp vụ trước khi in hóa đơn.
- `TotalAmount = tổng LineAmount`.

Không tự động làm tròn số lượng hoặc tiền trong Application. Việc format
`vi-VN`, tiền tệ và ngày tháng thuộc UI/PDF renderer.

### 5.2. Trạng thái

DTO in chỉ được phát hành sau khi:

```text
DonThuoc.TrangThai = DA_XUAT_HET
NgayCapThuoc != null
MaNguoiCapThuoc != null
PhieuXuatKho tồn tại với MaDonThuoc tương ứng
```

Nếu gọi xem trước khi cấp phát, API phải trả `409` hoặc một DTO preview riêng,
không trả nhầm dữ liệu như đã cấp.

### 5.3. Nhiều lô cho một dòng

`PrescriptionPrintLineDto.Batches` lấy từ các `ChiTietXuatKho` có cùng thuốc
và cùng phiếu xuất. Không dùng `First()` để lấy một lô duy nhất.

### 5.4. Snapshot thông tin in

Giai đoạn đầu có thể dựng DTO từ dữ liệu hiện tại. Nếu yêu cầu pháp lý cần bản
in không thay đổi theo thời gian, cần bổ sung snapshot tại thời điểm cấp phát:

- Tên bệnh nhân.
- Tên thuốc.
- Hướng dẫn dùng.
- Tên bác sĩ.
- Tên cơ sở.

Khi đó cân nhắc lưu `PrescriptionPrintSnapshot` hoặc JSON snapshot gắn với
`PhieuXuatKho`. Không triển khai snapshot nếu chưa có yêu cầu lưu trữ chính
thức.

## 6. API cần bổ sung

### 6.1. Trả DTO in ngay sau cấp phát

Thay response của:

```http
POST /api/inventory/prescriptions/{id}/dispense
```

thành:

```json
{
  "success": true,
  "data": {
    "prescription": { "...": "..." },
    "printData": { "...": "..." }
  }
}
```

Ưu điểm: UI có ngay dữ liệu để mở modal xem/in, không cần gọi thêm API.

### 6.2. API lấy lại DTO in

Bổ sung:

```http
GET /api/inventory/prescriptions/{id}/print-data
```

API này phục vụ:

- In lại đơn cũ.
- Refresh trang sau khi cấp phát.
- Mở từ lịch sử cấp phát.

API chỉ cho phép lấy đơn đã `DA_XUAT_HET`, trừ khi có quyền preview riêng.

### 6.3. Application query

Tạo feature:

```text
ClinicManagement.Application/Features/Kho/Queries/
  GetPrescriptionPrintData/
    GetPrescriptionPrintDataQuery.cs
    GetPrescriptionPrintDataQueryHandler.cs
```

Handler cần:

1. Kiểm tra `prescriptionId`.
2. Load `DonThuoc` với `ChiTietDonThuocs.Item`, `LuotKham.BenhNhan`,
   `LuotKham.ChanDoans`, `BacSi`, `CoSo`.
3. Load `PhieuXuatKho` theo `MaDonThuoc`, `LoaiXuat = XUAT_DON`,
   Include `ChiTietXuatKhos.ChiTietNhapKho`.
4. Load `MaNguoiCapThuoc`.
5. Map sang `PrescriptionPrintDto`.
6. Trả lỗi rõ ràng nếu thiếu chứng từ xuất hoặc dữ liệu liên quan.

Không đặt query EF trực tiếp trong controller.

## 7. Thay đổi service cấp phát

Trong `ImportDispensing.KhoService.cs`, sau đoạn:

```csharp
prescription.CompleteDispense(UserId);
await db.SaveChangesAsync();
```

phải đảm bảo:

- Phiếu xuất đã được lưu và có `Id`.
- Các dòng xuất đã liên kết đúng với `ChiTietNhapKho`.
- Replay idempotency lưu cả response DTO in, không chỉ response rút gọn.

Nếu sử dụng transaction, chỉ trả DTO sau khi transaction commit thành công.
Không trả dữ liệu in nếu `SaveChangesAsync` hoặc commit thất bại.

## 8. UI sau cấp phát

Trong `DispensePanel.tsx`:

1. Nhận `printData` từ response cấp phát.
2. Hiển thị modal xác nhận gồm:
   - Người bệnh.
   - Mã đơn.
   - Bác sĩ.
   - Ngày kê/cấp.
   - Danh sách thuốc và hướng dẫn.
   - Lô/hạn dùng đã cấp.
3. Có nút `In đơn thuốc`.
4. Có nút `Tải PDF` ở bước tích hợp renderer.
5. Sau khi in, vẫn giữ trạng thái đơn đã cấp phát.

Không dùng lại danh sách `pending` làm dữ liệu in vì danh sách pending chỉ
chứa thông tin ngắn để chọn đơn.

## 9. Kiểm thử bắt buộc

### Trường hợp thành công

- Đơn một thuốc, một lô.
- Đơn nhiều thuốc, nhiều lô.
- Một thuốc được tách qua hai lô FEFO.
- Có đầy đủ bệnh nhân, bác sĩ, cơ sở và người cấp phát.

### Trường hợp lỗi

- Đơn chưa duyệt.
- Đơn đã cấp phát gọi lại.
- Không tồn tại phiếu xuất.
- Thiếu chi tiết xuất.
- Đơn có thuốc đã hủy hoặc không còn hoạt động.
- Cấp phát thất bại do thiếu tồn.
- Gọi lại cùng `IdempotencyKey` phải trả cùng DTO, không tạo phiếu xuất mới.

### Kiểm tra dữ liệu

```sql
SELECT Id, MaLuotKham, MaBacSi, MaCoSo, TrangThai,
       NgayKe, NgayCapThuoc, MaNguoiCapThuoc
FROM DonThuoc
WHERE Id = @PrescriptionId;

SELECT Id, MaPhieu, MaDonThuoc, LoaiXuat, NgayXuat, MaNguoiXuat
FROM PhieuXuatKho
WHERE MaDonThuoc = @PrescriptionId;

SELECT ct.MaItem, ct.SoLuongKe, ct.SoLuongDaXuat,
       xk.SoLuongXuat, nk.SoLo, nk.HanSuDung
FROM ChiTietDonThuoc ct
LEFT JOIN PhieuXuatKho px ON px.MaDonThuoc = ct.MaDonThuoc
LEFT JOIN ChiTietXuatKho xk ON xk.MaPhieuXuat = px.Id
LEFT JOIN ChiTietNhapKho nk ON nk.Id = xk.MaChiTietNhap
WHERE ct.MaDonThuoc = @PrescriptionId;
```

## 10. Thứ tự triển khai

1. Chốt mẫu in và các field bắt buộc với nghiệp vụ.
2. Tạo `PrescriptionPrintDto` và các DTO con trong Application.
3. Tạo mapper/query lấy đủ navigation từ domain.
4. Tách helper dựng DTO để dùng chung cho response cấp phát và API in lại.
5. Mở rộng response cấp phát nhưng giữ các field cũ để không phá UI hiện tại.
6. Thêm `GET /print-data`.
7. Cập nhật `inventory.types.ts` và `inventory.api.ts`.
8. Cập nhật `DispensePanel` hiển thị modal và nút in.
9. Bổ sung test cho cấp phát, idempotency, nhiều lô và thiếu dữ liệu.
10. Tích hợp PDF/print renderer sau khi DTO được nghiệm thu.

## 11. Các điểm không được làm

- Không tạo entity mới chỉ để chứa DTO.
- Không lấy `SoLuongDaXuat` làm số lượng kê.
- Không bỏ qua các lô khi một dòng được cấp từ nhiều lô.
- Không cho phép in như đã cấp phát nếu chưa có `PhieuXuatKho`.
- Không đưa thông tin đăng nhập bệnh nhân vào DTO.
- Không tạo phiếu xuất mới khi người dùng bấm in lại.
- Không đặt truy vấn EF và mapping phức tạp trong controller.



json mô hinh
{
  "header": {
    "soYTe": "SỞ Y TẾ TP. HỒ CHÍ MINH",
    "coSo": {
      "ten": "PHÒNG KHÁM ĐA KHOA ABC",
      "diaChi": "123 Nguyễn Văn Linh, Q.1, TP.HCM",
      "hotline": "028.1234.5678"
    },
    "maDonThuoc": "DT-2026-00042",
    "maLuotKham": "LK-102",
    "maBenhNhan": "BN-00892",
    "tieuDe": "ĐƠN THUỐC",
    "phuDe": "Kèm thông tin xuất kho cấp phát"
  },
  "benhNhan": {
    "hoTen": "NGUYỄN VĂN KHANG",
    "tuoi": 31,
    "gioiTinh": "Nam",
    "soCccdBhyt": "079092001234",
    "dienThoai": "0912 345 678",
    "diaChi": "456 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM"
  },
  "chanDoan": {
    "maICD": "J06.9",
    "tenChanDoan": "Nhiễm trùng đường hô hấp trên cấp tính, không đặc hiệu"
  },
  "danhSachThuoc": [
    {
      "stt": 1,
      "maThuoc": "PARA500",
      "tenThuoc": "Paracetamol 500mg",
      "dangBaoChe": "Viên nén",
      "soLuong": 10,
      "soLuongChu": "Mười",
      "donViTinh": "viên",
      "soLo": "PARA-2026-01",
      "hanSuDung": "2028-12-31",
      "cachDung": "Uống 1 viên/lần, ngày 2 lần sau ăn khi sốt trên 38.5°C."
    },
    {
      "stt": 2,
      "maThuoc": "AMOX500",
      "tenThuoc": "Amoxicillin 500mg",
      "dangBaoChe": "Viên nang",
      "soLuong": 10,
      "soLuongChu": "Mười",
      "donViTinh": "viên",
      "soLo": "AMOX-2026-02",
      "hanSuDung": "2026-10-07",
      "cachDung": "Uống 1 viên/lần, ngày 2 lần sau ăn (sáng - tối cách nhau 12 giờ)."
    }
  ],
  "loiDan": [
    "Uống thuốc đủ liều, đúng giờ, uống nhiều nước ấm.",
    "Tái khám sau 5 ngày hoặc khi có dấu hiệu sốt cao li bì, khó thở."
  ],
  "xacNhan": {
    "ngayKe": "2026-09-07",
    "bacSiKeDon": {
      "hoTen": "Trần Thị B",
      "maCCHN": "012345/HCM"
    },
    "duocSiPhatThuoc": {
      "hoTen": "Lê Hoàng Nam",
      "trangThaiCapPhat": "ĐÃ CẤP PHÁT"
    }
  },
  "ghiChuChanTrang": [
    "Khám lại xin mang theo đơn này.",
    "Thuốc đã xuất khỏi quầy xin vui lòng kiểm tra kỹ trước khi rời đi."
  ]
}