# Flow tạo Billing từ lượt khám hoàn tất

**Ngày cập nhật:** 2026-09-08  
**Phạm vi:** Tạo hóa đơn và công nợ tự động từ một lượt khám, không cần nhập SQL thủ công.

## 1. Mục tiêu

Khi nhân viên hoàn tất một lượt khám, hệ thống tự động:

1. Chuyển lượt khám sang `HOAN_THANH`.
2. Tổng hợp dịch vụ và thuốc phát sinh.
3. Tạo một hóa đơn Billing cho lượt khám.
4. Tạo các dòng chi tiết hóa đơn.
5. Tạo công nợ bệnh nhân với hạn thanh toán 30 ngày.
6. Trả hóa đơn về UI để hiển thị hoặc tiếp tục thu tiền.

Flow này độc lập với flow xuất thuốc bán lẻ. Flow bán lẻ vẫn có thể tự tạo hóa đơn riêng trong `RetailExports.KhoService`.

## 2. Điều kiện nghiệp vụ

| Điều kiện | Kết quả |
|---|---|
| Lượt khám tồn tại và chưa bị xóa | Được xử lý |
| Trạng thái lượt khám là `DANG_KHAM` | Có thể hoàn tất |
| Lượt khám đã có hóa đơn chưa hủy | Trả lại hóa đơn hiện có, không tạo trùng |
| Không có dịch vụ/thuốc có giá trị | Chỉ hoàn tất lượt khám, không tạo hóa đơn rỗng |
| Có dịch vụ hoặc thuốc hợp lệ | Tạo hóa đơn và công nợ |
| Lượt khám `CHO_KHAM`, `HOAN_THANH`, `DA_HUY` | Domain từ chối nếu chưa có hóa đơn hiện hữu phù hợp |

## 3. Các bảng tham gia

### Bảng đọc

- `LuotKham`: bệnh nhân, cơ sở, trạng thái và bác sĩ.
- `ChiDinhDichVu`: dịch vụ đã chỉ định.
- `DanhMucDichVu`: tên và giá dịch vụ.
- `DonThuoc`: đơn thuốc của lượt khám.
- `ChiTietDonThuoc`: mặt hàng, số lượng kê và đơn giá kê.
- `HoaDon`: kiểm tra hóa đơn đang hoạt động để chống tạo trùng.

### Bảng tạo

- `HoaDon`
- `ChiTietHoaDon`
- `CongNoBenhNhan`

`PhieuThu` **chưa được tạo** trong bước hoàn tất lượt khám. Phiếu thu chỉ được tạo khi nhân viên thực hiện thao tác thanh toán.

## 4. API

```http
POST /api/LuotKham/{visitId}/complete
Authorization: Bearer <token>
```

Ví dụ:

```bash
curl -k -X POST \
  https://localhost:7081/api/LuotKham/3006/complete \
  -H "Authorization: Bearer <token>"
```

API sử dụng `CurrentUserId` từ token làm người tạo hóa đơn và công nợ.

Response thành công có dạng:

```json
{
  "success": true,
  "message": "Hoàn thành lượt khám và tạo hóa đơn thành công",
  "data": {
    "id": 123,
    "soHoaDon": "HD-20260908210000123",
    "maLuotKham": 3006,
    "maBenhNhan": 1002,
    "tongTien": 850000,
    "soTienBaoHiemChiTra": 0,
    "soTienBenhNhanChiTra": 850000,
    "daThanhToan": 0,
    "trangThai": "CHO_THANH_TOAN",
    "chiTiet": [],
    "congNo": {
      "id": 456,
      "maBenhNhan": 1002,
      "maHoaDon": 123,
      "soTienNo": 850000,
      "soTienDaTra": 0,
      "soTienConLai": 850000,
      "trangThai": "DANG_NO",
      "hanThanhToan": "2026-10-08T00:00:00Z"
    }
  }
}
```

Nếu lượt khám không có khoản thu:

```json
{
  "success": true,
  "data": null
}
```

## 5. Flow xử lý backend

### Bước 1: Tải dữ liệu lượt khám

`LuotKhamRepository.GetForCompletionAsync()` tải:

- `HoaDons`
- `DonThuocs.ChiTietDonThuocs`
- `ChiDinhDichVus.DanhMucDichVu`

Lượt khám không tồn tại hoặc đã xóa sẽ trả lỗi `404`/`KeyNotFoundException` theo middleware hiện tại.

### Bước 2: Kiểm tra chống tạo trùng

Handler tìm hóa đơn có trạng thái khác `DA_HUY`:

```csharp
var existing = visit.HoaDons
    .FirstOrDefault(h => h.TrangThai != TrangThaiHoaDon.DA_HUY);
```

Nếu tìm thấy, handler map và trả lại hóa đơn đó. Không thêm hóa đơn, chi tiết hoặc công nợ mới.

### Bước 3: Hoàn tất lượt khám

Domain gọi:

```csharp
visit.CompleteExam();
```

Điều kiện của domain:

```text
DANG_KHAM -> HOAN_THANH
```

Thời điểm kết thúc được ghi vào `ThoiGianKetThucKham`.

### Bước 4: Tạo hóa đơn

Hóa đơn được tạo bằng:

```csharp
new HoaDon(
    visit.Id,
    visit.MaBenhNhan,
    visit.MaCoSo,
    soHoaDon,
    currentUserId);
```

Các trường liên kết:

| Trường | Nguồn |
|---|---|
| `MaLuotKham` | `LuotKham.Id` |
| `MaBenhNhan` | `LuotKham.MaBenhNhan` |
| `MaCoSo` | `LuotKham.MaCoSo` |
| `CreatedBy` | User ID trong token |
| `NgayLap` | `DateTime.UtcNow` |
| `TrangThai` | `CHO_THANH_TOAN` |

### Bước 5: Thêm dịch vụ

Các chỉ định có trạng thái khác `DaHuy` được đưa vào hóa đơn:

```csharp
invoice.AddServiceOrDrug(
    "DICH_VU",
    service.MaDanhMuc,
    service.DanhMucDichVu.Ten,
    1,
    service.DanhMucDichVu.Gia);
```

Mỗi dịch vụ hiện được tính số lượng là `1`.

### Bước 6: Thêm thuốc

Mỗi dòng thuốc trong đơn được đưa vào hóa đơn:

```csharp
invoice.AddServiceOrDrug(
    "THUOC",
    line.MaItem,
    $"Thuốc {line.MaItem}",
    line.SoLuongKe,
    line.DonGiaKe);
```

Tổng tiền được tính trong Domain:

```text
ThanhTien = SoLuong × DonGia
TongTien = tổng ThanhTien
SoTienBenhNhanChiTra = TongTien - SoTienBaoHiemChiTra
```

### Bước 7: Không tạo hóa đơn rỗng

Nếu:

```text
TongTien <= 0
```

Handler chỉ lưu trạng thái `HOAN_THANH` của lượt khám và trả `data = null`.

### Bước 8: Tạo công nợ

Nếu hóa đơn có giá trị:

```csharp
invoice.CongNoBenhNhan = new CongNoBenhNhan
{
    MaBenhNhan = visit.MaBenhNhan,
    SoTienNo = invoice.SoTienBenhNhanChiTra,
    SoTienDaTra = 0,
    HanThanhToan = DateTime.UtcNow.Date.AddDays(30),
    TrangThai = TrangThaiCongNo.DANG_NO,
    CreatedBy = currentUserId
};
```

Quan hệ:

```text
HoaDon 1 ─── 0..1 CongNoBenhNhan
HoaDon 1 ─── n ChiTietHoaDon
```

### Bước 9: Lưu transaction

Handler thêm hóa đơn vào DbContext và gọi `SaveChangesAsync`.

Các thay đổi được lưu cùng lần:

- Trạng thái lượt khám.
- Hóa đơn.
- Chi tiết hóa đơn.
- Công nợ.

## 6. Flow trên giao diện

File API:

[examination.api.ts](../ClinicManagement.AdminUI/src/examination/api/examination.api.ts)

```typescript
completeExam: (visitId: number) =>
  api.post(`/LuotKham/${visitId}/complete`)
```

File giao diện:

[ExaminationList.tsx](../ClinicManagement.AdminUI/src/examination/components/ExaminationList.tsx)

Khi bản ghi có trạng thái `DANG_KHAM`, UI hiển thị nút:

```text
Hoàn tất và lập hóa đơn
```

Sau khi người dùng xác nhận:

1. Gọi API hoàn tất.
2. Hiển thị thông báo thành công.
3. Xóa bản ghi đang chọn.
4. Tải lại danh sách lượt khám.
5. Tải lại thống kê khám bệnh.

## 7. Các lỗi thường gặp

| Lỗi | Nguyên nhân |
|---|---|
| `404` | Không tìm thấy lượt khám hoặc lượt khám đã bị xóa |
| Không thể hoàn tất lượt khám | Trạng thái hiện tại không phải `DANG_KHAM` |
| Không tạo hóa đơn | Không có dịch vụ/thuốc có giá trị |
| Tạo lại nhưng không có bản ghi mới | Đây là hành vi chống tạo trùng |
| `401` | Token thiếu, hết hạn hoặc không hợp lệ |
| `500` khi lưu | Sai khóa ngoại, dữ liệu dịch vụ/đơn thuốc không hợp lệ hoặc database không kết nối |

## 8. Kiểm tra dữ liệu sau khi chạy

Thay `3006` bằng mã lượt khám thực tế:

```sql
SELECT *
FROM LuotKham
WHERE Id = 3006;

SELECT *
FROM HoaDon
WHERE MaLuotKham = 3006
ORDER BY Id DESC;

SELECT ct.*
FROM ChiTietHoaDon ct
JOIN HoaDon hd ON hd.Id = ct.MaHoaDon
WHERE hd.MaLuotKham = 3006;

SELECT cn.*
FROM CongNoBenhNhan cn
JOIN HoaDon hd ON hd.Id = cn.MaHoaDon
WHERE hd.MaLuotKham = 3006;
```

Kiểm tra không tạo trùng:

```sql
SELECT MaLuotKham, COUNT(*) AS SoHoaDonHoatDong
FROM HoaDon
WHERE MaLuotKham = 3006
  AND TrangThai <> N'DA_HUY'
GROUP BY MaLuotKham;
```

Kết quả đúng phải là tối đa `1`.

## 9. Kịch bản kiểm thử

### Kịch bản A: Có dịch vụ

1. Tạo lượt khám ở trạng thái `DANG_KHAM`.
2. Tạo chỉ định dịch vụ có `DanhMucDichVu.Gia > 0`.
3. Gọi API hoàn tất.
4. Kiểm tra có `HoaDon`, `ChiTietHoaDon`, `CongNoBenhNhan`.

### Kịch bản B: Có thuốc

1. Tạo đơn thuốc có chi tiết.
2. Đảm bảo `SoLuongKe > 0` và `DonGiaKe > 0`.
3. Gọi API hoàn tất.
4. Kiểm tra dòng `ChiTietHoaDon.LoaiDoiTuong = THUOC`.

### Kịch bản C: Dịch vụ và thuốc

Kiểm tra một hóa đơn có đủ hai loại chi tiết và tổng tiền bằng tổng các dòng.

### Kịch bản D: Gọi lại API

Gọi API lần hai với cùng `visitId`. Kết quả phải trả hóa đơn cũ và không tăng số lượng hóa đơn.

### Kịch bản E: Không có khoản thu

Hoàn tất lượt khám không có dịch vụ/thuốc có giá. Kết quả:

- Lượt khám chuyển `HOAN_THANH`.
- Không có hóa đơn rỗng.
- Không có công nợ.

### Kịch bản F: Thanh toán sau khi tạo Billing

Sau khi có `hoaDonId`, gọi API thanh toán Billing. Hệ thống tạo `PhieuThu`, cập nhật `DaThanhToan` và cập nhật công nợ.

## 10. Giới hạn hiện tại và phần cần mở rộng

- Bước hoàn tất chưa áp dụng số tiền BHYT tự động; mặc định `SoTienBaoHiemChiTra = 0`.
- Dịch vụ hiện dùng số lượng cố định `1`.
- Thuốc lấy `SoLuongKe` và `DonGiaKe`; chưa đối chiếu số lượng xuất kho thực tế trong flow này.
- Tên thuốc hiện dùng fallback `Thuốc {MaItem}`; có thể bổ sung `Include(line => line.Item)` để lấy tên thật.
- UI hiện có nút hoàn tất trong danh sách lượt khám; phần chi tiết hóa đơn được xem tại module Billing.
- Cần bổ sung test tích hợp transaction/concurrency nếu triển khai production ở môi trường nhiều người dùng.

## 11. Mã nguồn liên quan

- [CompleteExamCommand.cs](../ClinicManagement.Application/Features/LuotKham/Commands/CompleteExam/CompleteExamCommand.cs)
- [CompleteExamCommandHandler.cs](../ClinicManagement.Application/Features/LuotKham/Commands/CompleteExam/CompleteExamCommandHandler.cs)
- [LuotKhamController.cs](../ClinicManagement.API/Controllers/LuotKham/LuotKhamController.cs)
- [ILuotKhamRepository.cs](../ClinicManagement.Domain/Repositories/LuotKham/ILuotKhamRepository.cs)
- [LuotKhamRepository.cs](../ClinicManagement.Infrastructure/Persistence/Repositories/LuotKham/LuotKhamRepository.cs)
- [HoaDon.cs](../ClinicManagement.Domain/Billing/HoaDon/HoaDon.cs)
- [CongNoBenhNhan.cs](../ClinicManagement.Domain/Billing/HoaDon/CongNoBenhNhan.cs)
