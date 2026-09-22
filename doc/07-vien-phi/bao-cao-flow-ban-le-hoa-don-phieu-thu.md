# Báo cáo flow bán lẻ thuốc: xuất kho, hóa đơn và phiếu thu

**Ngày lập:** 2026-09-07  
**Phạm vi:** Cấp thuốc cho bệnh nhân trong flow khám bệnh

## 1. Mục tiêu

Flow bán lẻ phải xử lý đồng bộ các nghiệp vụ:

1. Tiếp nhận yêu cầu cấp thuốc từ lượt khám hợp lệ.
2. Kiểm tra mặt hàng, đơn vị và giá bán.
3. Kiểm tra bệnh nhân, lượt khám và đơn thuốc.
4. Kiểm tra tồn kho theo từng lô.
5. Phân bổ và trừ tồn theo FEFO.
6. Tạo phiếu xuất kho và chi tiết xuất.
7. Ghi sổ giao dịch tồn kho.
8. Tạo hóa đơn và chi tiết hóa đơn gắn với lượt khám.
9. Ghi nhận thanh toán bằng phiếu thu.
10. Trả kết quả đầy đủ cho frontend.
11. Cho phép retry an toàn bằng `IdempotencyKey`.

Tất cả bước thay đổi dữ liệu phải chạy trong **một database transaction**.

## 2. Trạng thái hiện tại

API hiện có:

```http
POST /api/inventory/exports/retail
```

Đã thực hiện được:

- Nhận danh sách mặt hàng.
- Quy đổi số lượng về `baseUnit`.
- Kiểm tra tồn khả dụng.
- Phân bổ lô theo FEFO.
- Trừ `TonKho`.
- Tạo `PhieuXuatKho`.
- Tạo `InventoryTransaction`.
- Lưu và replay kết quả theo `IdempotencyKey`.

Đã triển khai backend:

- Bắt buộc `VisitId` và kiểm tra lượt khám hợp lệ.
- Chỉ cấp các mặt hàng thuộc đơn thuốc đã duyệt của lượt khám.
- Giới hạn số lượng cấp theo số lượng còn lại trên đơn.
- Tạo `HoaDon` và chi tiết hóa đơn trong transaction xuất kho.
- Ghi `PhieuThu` khi có `PaidAmount`.
- Trả mã phiếu xuất, hóa đơn, phiếu thu, tổng tiền và trạng thái thanh toán.
- Bắt lỗi concurrency và replay theo `IdempotencyKey`.
- Không hỗ trợ khách vãng lai và không tạo lượt khám giả.

Các phần còn cần hoàn thiện:

- Chưa có integration test tự động cho toàn bộ flow.
- Policy phân quyền sửa giá và cấp thuốc cần được cấu hình theo role/policy của hệ thống.
- Cần kiểm thử thực tế với dữ liệu migration/database hiện tại.

## 3. Entity billing hiện có

### 3.1. `HoaDon`

File:

`ClinicManagement.Domain/Billing/HoaDon/HoaDon.cs`

Thông tin chính:

- `SoHoaDon`
- `MaLuotKham`
- `MaBenhNhan`
- `MaCoSo`
- `TongTien`
- `SoTienBenhNhanChiTra`
- `DaThanhToan`
- `TrangThai`
- `ChiTietHoaDons`
- `PhieuThus`

Hành vi hiện có:

- `AddServiceOrDrug(...)`
- `ApplyInsurance(...)`
- `RecordPayment(...)`
- `HuyHoaDon()`
- `SoTienConNo()`

### 3.2. `ChiTietHoaDon`

File:

`ClinicManagement.Domain/Billing/HoaDon/ChiTietHoaDon.cs`

Dùng để lưu:

- Loại đối tượng: thuốc/vật tư.
- Mã item.
- Mô tả.
- Số lượng.
- Đơn giá.
- Thành tiền.

### 3.3. `PhieuThu`

File:

`ClinicManagement.Domain/Billing/HoaDon/PhieuThu.cs`

Dùng để lưu:

- Số phiếu thu.
- Hóa đơn liên quan.
- Số tiền thu.
- Phương thức thanh toán.
- Người thu.
- Thời điểm thu.

`HoaDon.RecordPayment(...)` hiện tự tạo `PhieuThu` và cập nhật trạng thái hóa đơn.

## 4. Request API đề xuất

Request bán lẻ cần bổ sung thông tin liên kết billing:

```csharp
public sealed record ExportRequest(
    string IdempotencyKey,
    int VisitId,
    string? Note,
    string? PaymentMethod,
    decimal PaidAmount,
    IEnumerable<ExportItem> Items);
```

Trong đó:

- `VisitId`: bắt buộc, là lượt khám phát sinh đơn thuốc.
- `PaymentMethod`: tiền mặt, chuyển khoản, thẻ hoặc phương thức được cấu hình.
- `PaidAmount`: số tiền thực thu; phải tuân theo chính sách thanh toán của cơ sở.
- `IdempotencyKey`: bắt buộc để chống tạo trùng khi retry.

## 5. Quy tắc khách hàng

### 5.1. Bệnh nhân và lượt khám bắt buộc

Mọi giao dịch cấp thuốc phải có `VisitId`. API phải:

1. Tìm lượt khám.
2. Kiểm tra lượt khám tồn tại và thuộc bệnh nhân hợp lệ.
3. Lấy `MaBenhNhan` và `MaCoSo` từ lượt khám, không nhận các giá trị này tùy ý từ client.
4. Kiểm tra lượt khám ở trạng thái cho phép cấp thuốc.
5. Kiểm tra đơn thuốc thuộc đúng lượt khám và đã được duyệt.
6. Gắn phiếu xuất, hóa đơn và phiếu thu vào đúng lượt khám/bệnh nhân.

Không tạo lượt khám giả, không tạo hóa đơn bán lẻ độc lập và không cấp thuốc cho khách
vãng lai ngoài flow khám bệnh.

## 6. Flow xử lý chi tiết

### Bước 1: Kiểm tra idempotency

Tìm `IdempotencyRecord` theo:

- `IdempotencyKey`.
- Tên nghiệp vụ `Retail`.

Nếu đã có kết quả thành công, trả lại response cũ và không trừ tồn, không tạo hóa đơn,
không tạo phiếu thu lần thứ hai.

Ở production cần claim key bằng unique insert hoặc cơ chế lock để hai request đồng thời
không cùng chạy nghiệp vụ.

### Bước 2: Kiểm tra request

Kiểm tra:

- Có ít nhất một dòng hàng.
- `Quantity > 0`.
- Item tồn tại và đang hoạt động.
- Đơn vị quy đổi hợp lệ.
- Giá bán không âm.
- Phương thức thanh toán hợp lệ.
- `PaidAmount >= 0`.
- `PaidAmount` không vượt số tiền phải thu.

### Bước 3: Tính giá trị đơn hàng

Với mỗi dòng:

```text
BaseQuantity = RequestedQuantity × ConversionFactor
LineAmount = BaseQuantity × EffectiveUnitPrice
```

`EffectiveUnitPrice` lấy từ `UnitPrice` của request nếu được phép override,
ngược lại lấy từ `Item.GiaBanLe`.

Nếu giá bán khác giá danh mục:

- Kiểm tra quyền sửa giá.
- Ghi audit về giá cũ, giá mới và người thực hiện.

### Bước 4: Kiểm tra và phân bổ tồn theo FEFO

Chỉ lấy các lô:

- Đúng kho.
- Đúng item.
- `SoLuongTon > 0`.
- Chưa hết hạn.

Sắp xếp:

1. Lô có hạn dùng gần nhất trước.
2. Lô không có hạn dùng xếp sau.

Nếu tổng tồn nhỏ hơn nhu cầu, trả lỗi và không được tạo dữ liệu dở dang.

### Bước 5: Tạo phiếu xuất kho

Tạo `PhieuXuatKho` với:

- Loại xuất: `BAN_THUOC`.
- Kho xuất.
- Người xuất.
- Khách hàng/người nhận.
- Ghi chú.

Tạo `ChiTietXuatKho` cho từng lô đã phân bổ, gồm:

- Lô nhập.
- Số lượng xuất.
- Đơn giá xuất.

### Bước 6: Cập nhật tồn và ledger

Với từng lô:

1. Lưu số lượng trước.
2. Trừ số lượng xuất.
3. Tăng `Version`.
4. Lưu số lượng sau.
5. Tạo `InventoryTransaction` loại `XUAT_BAN_LE`.

Nếu có concurrency conflict, rollback toàn bộ transaction và trả lỗi chuẩn:

```text
CONCURRENCY_CONFLICT
```

### Bước 7: Tạo hóa đơn

Tạo `HoaDon` gắn bắt buộc với:

- Số hóa đơn duy nhất.
- Bệnh nhân của lượt khám.
- Lượt khám.
- Cơ sở.
- Người lập.

Mỗi item bán tạo một `ChiTietHoaDon`:

```csharp
invoice.AddServiceOrDrug(
    "THUOC",
    itemId,
    itemName,
    quantity,
    unitPrice);
```

Không tạo hóa đơn nếu bước trừ tồn thất bại.

### Bước 8: Ghi nhận thanh toán

Nếu `PaidAmount > 0`:

```csharp
invoice.RecordPayment(
    paidAmount,
    paymentMethod,
    currentUserId);
```

Kết quả:

- Tạo `PhieuThu`.
- Cập nhật `DaThanhToan`.
- Cập nhật `TrangThaiHoaDon`.

Trạng thái đề xuất:

| Điều kiện | Trạng thái |
|---|---|
| Chưa thu tiền | `CHO_THANH_TOAN` |
| Thu một phần | `THANH_TOAN_MOT_PHAN` |
| Thu đủ | `DA_THANH_TOAN` |

### Bước 9: Lưu idempotency và commit

Response phải được serialize vào `IdempotencyRecord` trước khi commit.

Transaction bao gồm:

```text
TonKho
PhieuXuatKho
ChiTietXuatKho
InventoryTransaction
HoaDon
ChiTietHoaDon
PhieuThu
IdempotencyRecord
```

Nếu bất kỳ bước nào lỗi, rollback toàn bộ.

## 7. Response đề xuất

```json
{
  "exportReceiptId": 123,
  "exportReferenceCode": "PX-20260907132500123",
  "invoiceId": 456,
  "invoiceNumber": "HD-20260907132500123",
  "receiptId": 789,
  "receiptNumber": "PTA1B2C3D4",
  "totalAmount": 250000,
  "paidAmount": 250000,
  "remainingAmount": 0,
  "paymentStatus": "DA_THANH_TOAN",
  "allocations": [
    {
      "itemId": 10,
      "batchNumber": "LO-001",
      "quantity": 2,
      "unitPrice": 125000
    }
  ]
}
```

Nếu chưa thanh toán:

- `receiptId = null`.
- `paidAmount = 0`.
- `remainingAmount = totalAmount`.
- `paymentStatus = "CHO_THANH_TOAN"`.

## 8. Các file cần thay đổi

### Domain

- `ClinicManagement.Domain/Billing/HoaDon/HoaDon.cs`
- `ClinicManagement.Domain/Billing/HoaDon/ChiTietHoaDon.cs`
- `ClinicManagement.Domain/Billing/HoaDon/PhieuThu.cs`
- `ClinicManagement.Domain/Common/Enums/PhuongThucThanhToan.cs`

### Application/Infrastructure

- `ClinicManagement.Application/Common/Interfaces/IKhoService.cs`
- `ClinicManagement.Application/Features/Kho/KhoService.cs`
- `ClinicManagement.Application/Features/Kho/KhoService.cs`
- `ClinicManagement.Infrastructure/Persistence/ClinicDbContext.cs`
- Các billing configuration tương ứng.

### API/UI

- `ClinicManagement.API/Controllers/InventoryController.cs`
- API client bán lẻ trong AdminUI.
- Màn hình hiển thị hóa đơn, phiếu thu và trạng thái thanh toán.

### Database

- Bổ sung liên kết giữa phiếu xuất kho và hóa đơn nếu cần truy vết trực tiếp.

## 9. Mã lỗi cần chuẩn hóa

| Mã | Ý nghĩa |
|---|---|
| `INVALID_PAYMENT_METHOD` | Phương thức thanh toán không hợp lệ |
| `INVALID_PAID_AMOUNT` | Số tiền thanh toán không hợp lệ |
| `INSUFFICIENT_STOCK` | Không đủ tồn |
| `CONCURRENCY_CONFLICT` | Tồn đã thay đổi bởi request khác |
| `IDEMPOTENCY_REPLAY` | Request đã được xử lý trước đó |
| `INVOICE_CREATION_FAILED` | Không tạo được hóa đơn |
| `PAYMENT_FAILED` | Không ghi nhận được thanh toán |

## 10. Test bắt buộc

1. Bán đủ tồn và thanh toán đủ.
2. Bán đủ tồn nhưng chưa thanh toán.
3. Thanh toán một phần.
4. Không đủ tồn: không tạo phiếu xuất, hóa đơn hoặc phiếu thu.
5. Lỗi tạo hóa đơn: tồn kho phải rollback.
6. Lỗi tạo phiếu thu: tồn kho và hóa đơn phải rollback.
7. Retry cùng `IdempotencyKey`: không tạo chứng từ trùng.
8. Hai request đồng thời cùng lô: chỉ một request được trừ thành công.
9. Giá override không có quyền: bị từ chối.
10. Lô hết hạn: không được phân bổ.
11. Khách có lượt khám: hóa đơn liên kết đúng bệnh nhân/lượt khám.
12. Không có `VisitId`: request bị từ chối.
13. `VisitId` không tồn tại hoặc không có đơn đã duyệt: request bị từ chối.

## 11. Kết luận

Việc tích hợp cần thực hiện theo mô hình:

```text
Bán lẻ
  -> FEFO và trừ tồn
  -> Phiếu xuất kho
  -> InventoryTransaction
  -> Hóa đơn
  -> Chi tiết hóa đơn
  -> Phiếu thu
  -> Cập nhật trạng thái thanh toán
```

Tất cả phải nằm trong một transaction và có idempotency. Chỉ khi hoàn thành các bước
trên, API cấp thuốc mới đáp ứng đầy đủ flow khám bệnh, quản lý tồn, doanh thu và thanh toán.
