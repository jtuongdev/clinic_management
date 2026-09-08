# Phân tích Backend và Flow khám bệnh để triển khai UI

**Ngày cập nhật:** 2026-09-08  
**Phạm vi:** Luồng khám ngoại trú từ tiếp nhận lượt khám đến chẩn đoán, chỉ định dịch vụ, kê đơn, hoàn tất và Billing.

## 1. Mục tiêu UI

UI cần hỗ trợ bác sĩ và nhân viên y tế theo đúng vòng đời của `LuotKham`:

```text
CHO_KHAM
   │
   ├─ Bắt đầu khám
   ▼
DANG_KHAM
   │
   ├─ Khám ban đầu
   ├─ Ghi sinh hiệu
   ├─ Ghi tiền sử
   ├─ Ghi chẩn đoán
   ├─ Chỉ định dịch vụ/CLS
   ├─ Kê đơn thuốc
   └─ Hoàn tất
   ▼
HOAN_THANH
   │
   └─ Tạo hóa đơn + công nợ nếu có khoản phải thu
```

Các trạng thái khác:

- `DA_HUY`: lượt khám đã hủy, không cho tiếp tục chỉnh sửa.
- `HOAN_THANH`: chỉ đọc các dữ liệu khám; không cho thêm phát sinh mới theo flow hiện tại.

## 2. Domain và dữ liệu chính

### 2.1. `LuotKham`

Entity trung tâm của phiên khám:

| Trường | Ý nghĩa |
|---|---|
| `Id` | ID lượt khám |
| `MaBenhNhan` | Bệnh nhân |
| `MaBacSi` | Bác sĩ phụ trách |
| `MaCoSo` | Cơ sở |
| `MaKhoa` | Khoa |
| `MaPhongKham` | Phòng |
| `NgayKham` | Ngày khám |
| `LyDoKham` | Lý do khám |
| `TrangThai` | Trạng thái vòng đời |
| `ThoiGianBatDauKham` | Thời điểm bắt đầu |
| `ThoiGianKetThucKham` | Thời điểm hoàn tất |

Quan hệ cần tải cho màn hình chi tiết:

- `BenhNhan`
- `BacSi`, `Khoa`, `CoSo`, `PhongKham`
- `ChanDoans`
- `SinhHieus`
- `ChiDinhDichVus`
- `DonThuocs`
- `HoaDons`

### 2.2. Dữ liệu lâm sàng

- `SinhHieu`: nhiệt độ, mạch, huyết áp, SpO2, cân nặng, chiều cao.
- `TienSuBenh`: bệnh nền, dị ứng, phẫu thuật, tiền sử gia đình, thói quen sinh hoạt.
- `ChanDoan`: mã ICD, tên chẩn đoán, chẩn đoán chính/phụ, ghi chú.

### 2.3. Dữ liệu điều trị

- `ChiDinhDichVu`: dịch vụ/CLS được chỉ định, người chỉ định, người thực hiện, kết quả và trạng thái.
- `DonThuoc`: đơn thuốc gắn với lượt khám.
- `ChiTietDonThuoc`: mặt hàng, số lượng kê, liều dùng, tần suất, số ngày, hướng dẫn và đơn giá kê.

## 3. Quyền và nguồn dữ liệu tin cậy

UI không tự gửi các trường audit hoặc người thao tác từ form:

- `CreatedBy`
- `UpdatedBy`
- `DeletedBy`
- `MaBacSiChiDinh`
- `MaNguoiThucHien`

Backend phải lấy người dùng từ JWT (`CurrentUserId`) hoặc kiểm tra quyền theo vai trò. UI chỉ gửi dữ liệu nghiệp vụ cần nhập.

Vai trò đề xuất:

| Vai trò | Quyền |
|---|---|
| Bác sĩ | Bắt đầu khám, khám ban đầu, chẩn đoán, chỉ định, kê đơn, hoàn tất |
| Kỹ thuật viên CLS | Tiếp nhận/chạy dịch vụ và cập nhật kết quả |
| Dược sĩ | Duyệt/cấp phát đơn theo flow kho |
| Thu ngân | Xem hóa đơn, ghi nhận thanh toán |

## 4. API hiện có cho UI

### 4.1. Danh sách và chi tiết lượt khám

```http
GET /api/LuotKham
GET /api/LuotKham/{id}
GET /api/LuotKham/{id}/summary
GET /api/LuotKham/hang-doi
GET /api/LuotKham/dang-xu-ly
```

Query danh sách:

```text
pageIndex
pageSize
maBenhNhan
maBacSi
maKhoa
trangThai
fromDate
toDate
```

UI cần dùng server pagination, không tải toàn bộ dữ liệu rồi lọc thủ công khi số lượng lớn.

### 4.2. Bắt đầu khám

```http
POST /api/LuotKham/{id}/start-exam
```

Body không cần gửi `MaBacSi`; controller lấy `CurrentUserId` làm bác sĩ hiện tại.

Điều kiện:

```text
CHO_KHAM -> DANG_KHAM
```

Lỗi cần hiển thị:

- `404`: không tìm thấy lượt khám.
- `400`: trạng thái không hợp lệ hoặc không xác định bác sĩ.
- `409`: lượt khám đang được khám.

UI sau thành công phải cập nhật:

- trạng thái;
- thời gian bắt đầu;
- người phụ trách;
- quyền chỉnh sửa các tab.

### 4.3. Lấy/lưu khám ban đầu

```http
GET  /api/LuotKham/{id}/examination
POST /api/LuotKham/{id}/examination
```

Request:

```json
{
  "lyDoKham": "Đau họng 3 ngày",
  "ghiChuTienSu": "Có tiền sử dị ứng penicillin",
  "tienSuBenhs": [
    {
      "id": null,
      "loaiTienSu": "DI_UNG",
      "ten": "Dị ứng penicillin",
      "ghiChu": "Nổi mẩn"
    }
  ],
  "sinhHieu": {
    "id": null,
    "nhietDo": 37.5,
    "mach": 86,
    "huyetApTamThu": 120,
    "huyetApTamTruong": 80,
    "spO2": 98,
    "canNang": 62,
    "chieuCao": 170
  }
}
```

Quy tắc `id`:

- `id = null`: tạo bản ghi mới.
- Có `id`: cập nhật bản ghi hiện có.
- Không gửi tiền sử trống cả `Ten` và `GhiChu`.

UI nên chia thành các nhóm:

1. Lý do khám.
2. Sinh hiệu.
3. Tiền sử bệnh.
4. Nút lưu nháp.

Backend hiện lưu `LyDoKham`, sinh hiệu và tiền sử. `GhiChuTienSu` được nhận/trả trong DTO nhưng cần xác nhận nơi lưu riêng nếu muốn giữ lâu dài.

### 4.4. Chẩn đoán và ICD

```http
GET    /api/LuotKham/icd?keyword={keyword}
GET    /api/LuotKham/{id}/diagnoses
POST   /api/LuotKham/{id}/diagnoses
PUT    /api/LuotKham/{id}/diagnoses/{diagnosisId}
DELETE /api/LuotKham/{id}/diagnoses/{diagnosisId}
```

Request:

```json
{
  "maICD": "J06.9",
  "tenChanDoan": "Nhiễm trùng đường hô hấp trên",
  "laChanDoanChinh": true,
  "ghiChu": "Theo dõi sốt"
}
```

Quy tắc UI:

- Cho phép tìm ICD theo keyword.
- Chỉ có một chẩn đoán chính trong một lượt khám.
- Khi backend trả `409`, hiển thị lỗi nghiệp vụ, không tự retry.
- Xóa là soft delete theo backend.

### 4.5. Chỉ định dịch vụ/CLS

```http
GET    /api/LuotKham/{id}/chi-dinh-dich-vu
POST   /api/LuotKham/{id}/chi-dinh-dich-vu
PUT    /api/LuotKham/{id}/chi-dinh-dich-vu/{serviceId}
DELETE /api/LuotKham/{id}/chi-dinh-dich-vu/{serviceId}
GET    /api/LuotKham/danh-sach-chi-dinh
GET    /api/LuotKham/thong-ke-chi-dinh
```

Request:

```json
{
  "maDanhMuc": 10,
  "maBacSiChiDinh": 25,
  "maNguoiThucHien": null,
  "trangThai": "DaChiDinh",
  "ketLuan": null,
  "urlKetQua": null,
  "ngayChiDinh": null,
  "ngayThucHien": null,
  "ngayCoKetQua": null
}
```

UI cần hiển thị trạng thái:

```text
DaChiDinh -> DaTiepNhan -> DaCoKetQua
                         └-> DaHuy
```

Các trường kết quả chỉ được mở khi dịch vụ đã được tiếp nhận/thực hiện theo quyền của kỹ thuật viên.

### 4.6. Đơn thuốc

API đọc hiện có:

```http
GET /api/LuotKham/danh-sach-donthuoc
GET /api/LuotKham/thong-ke-donthuoc
```

Các endpoint kê đơn/duyệt/hủy cần được UI gọi theo contract thực tế của module đơn thuốc. Không tự suy đoán route từ tên component.

Dữ liệu chi tiết cần hiển thị:

- mặt hàng;
- số lượng kê;
- đơn giá kê;
- liều dùng;
- tần suất;
- số ngày;
- hướng dẫn;
- số lượng đã xuất;
- số lượng còn lại.

Vòng đời đơn thuốc:

```text
TAM -> DA_DUYET -> DA_XUAT_HET
  └──────────────-> HUY
```

Chỉ đơn `DA_DUYET` mới được chuyển sang flow cấp phát thuốc.

### 4.7. Hoàn tất khám và tạo Billing

```http
POST /api/LuotKham/{id}/complete
```

Backend:

1. Đọc lượt khám cùng dịch vụ, đơn thuốc và hóa đơn hiện có.
2. Nếu có hóa đơn chưa hủy thì trả hóa đơn cũ, không tạo trùng.
3. Gọi `CompleteExam()`.
4. Tạo `HoaDon`.
5. Tạo `ChiTietHoaDon` từ dịch vụ và thuốc.
6. Nếu tổng tiền bằng 0, chỉ hoàn tất lượt khám.
7. Nếu có tiền, tạo `CongNoBenhNhan` hạn 30 ngày.

UI phải hỏi xác nhận trước khi gọi API:

```text
Hoàn tất lượt khám và tạo hóa đơn?
```

Sau thành công:

- khóa form chỉnh sửa;
- tải lại chi tiết lượt khám;
- tải lại danh sách;
- hiển thị hóa đơn/công nợ;
- cung cấp nút chuyển sang Billing để thu tiền.

## 5. Thiết kế màn hình UI đề xuất

### 5.1. Màn hình danh sách lượt khám

Thành phần:

- bộ lọc ngày, cơ sở, khoa, trạng thái;
- tìm bệnh nhân;
- bảng lượt khám;
- thao tác xem, bắt đầu khám, hủy, hoàn tất;
- phân trang server;
- trạng thái loading/error/empty.

Nút theo trạng thái:

| Trạng thái | Nút |
|---|---|
| `CHO_KHAM` | Bắt đầu khám |
| `DANG_KHAM` | Mở hồ sơ, Hoàn tất |
| `HOAN_THANH` | Xem hồ sơ, Xem Billing |
| `DA_HUY` | Chỉ xem |

### 5.2. Màn hình hồ sơ khám

Đề xuất dùng tab:

1. **Tổng quan**
   - bệnh nhân, bác sĩ, khoa, phòng, trạng thái, thời gian.
2. **Khám ban đầu**
   - lý do khám, tiền sử, sinh hiệu.
3. **Chẩn đoán**
   - tìm ICD, danh sách chẩn đoán, đánh dấu chính.
4. **Dịch vụ/CLS**
   - chỉ định, trạng thái, kết quả.
5. **Đơn thuốc**
   - thuốc, liều dùng, duyệt đơn.
6. **Billing**
   - hóa đơn, BHYT, đã thu, công nợ.

### 5.3. Quy tắc khóa/mở form

```text
CHO_KHAM:
  chỉ xem thông tin tiếp nhận, cho phép bắt đầu khám

DANG_KHAM:
  cho phép chỉnh sửa dữ liệu khám

HOAN_THANH:
  chỉ đọc dữ liệu khám
  cho phép xem Billing và thanh toán

DA_HUY:
  chỉ đọc
```

## 6. State management và gọi API

Mỗi tab nên có trạng thái riêng:

```typescript
type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
```

Khi đổi `visitId`:

1. Hủy hoặc bỏ qua request cũ.
2. Reset dữ liệu của lượt trước.
3. Tải detail, examination, diagnosis, services và prescriptions.
4. Chỉ hiển thị form sau khi đã xác định trạng thái lượt khám.

Sau mỗi mutation:

- cập nhật cache/dữ liệu tab liên quan;
- không reload toàn bộ ứng dụng;
- hiển thị lỗi từ `message` hoặc `notification` dùng `App.useApp()`.

## 7. Contract response chung

Các API đang dùng wrapper:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Danh sách phân trang:

```json
{
  "success": true,
  "data": {
    "items": [],
    "totalCount": 0,
    "pageIndex": 1,
    "pageSize": 20
  }
}
```

UI không được coi `HTTP 200` là nghiệp vụ thành công nếu `success = false`.

## 8. Xử lý lỗi trên UI

| HTTP | Ý nghĩa | UI |
|---|---|---|
| `400` | Dữ liệu request/trạng thái không hợp lệ | Hiển thị lỗi validation |
| `401` | Token thiếu/hết hạn | Đưa về đăng nhập hoặc refresh token |
| `403` | Không đủ quyền | Hiển thị không có quyền |
| `404` | Không tìm thấy lượt khám/bản ghi | Tải lại danh sách hoặc báo đã bị xóa |
| `409` | Xung đột nghiệp vụ/trùng dữ liệu | Hiển thị lỗi, không retry tự động |
| `500` | Lỗi server/database | Hiển thị mã request/log, cho phép thử lại có kiểm soát |

Không dùng fallback dữ liệu giả như “Bệnh nhân Test” khi API lỗi hoặc trả rỗng.

## 9. Trình tự triển khai UI

### Giai đoạn 1: Danh sách và chi tiết

- Chuẩn hóa type `LuotKham`.
- Kết nối danh sách, bộ lọc, phân trang.
- Kết nối `GET /api/LuotKham/{id}`.
- Hiển thị đúng trạng thái.

### Giai đoạn 2: Khám ban đầu

- Form lý do khám.
- Form sinh hiệu.
- Danh sách/thêm/sửa tiền sử.
- Lưu và tải lại dữ liệu.

### Giai đoạn 3: Chẩn đoán

- Tìm ICD.
- Thêm/sửa/xóa chẩn đoán.
- Ràng buộc chẩn đoán chính.

### Giai đoạn 4: Dịch vụ/CLS

- Chọn danh mục dịch vụ.
- Tạo chỉ định.
- Hiển thị trạng thái.
- Tách quyền bác sĩ/kỹ thuật viên.

### Giai đoạn 5: Đơn thuốc

- Hiển thị đơn thuốc.
- Form kê thuốc.
- Duyệt/hủy.
- Liên kết sang cấp phát kho.

### Giai đoạn 6: Hoàn tất và Billing

- Nút hoàn tất.
- Confirmation modal.
- Gọi API tạo hóa đơn/công nợ.
- Hiển thị kết quả Billing.
- Liên kết thanh toán.

## 10. Các điểm backend cần hoàn thiện trước production UI

1. Áp dụng `[Authorize]` và policy theo vai trò cho các endpoint khám bệnh.
2. Không cho `SaveExamination`, chẩn đoán và chỉ định sửa lượt đã `HOAN_THANH`/`DA_HUY`.
3. Tách update graph khỏi `Update(luotKham)` để tránh EF đánh dấu navigation không chủ ý.
4. Bổ sung transaction rõ ràng cho hoàn tất lượt khám + Billing.
5. Bổ sung API command đầy đủ cho kê/duyệt/hủy đơn thuốc nếu UI cần thao tác trực tiếp.
6. Dùng tên thuốc thật bằng cách include `ChiTietDonThuoc.Item` khi tạo Billing.
7. Đồng bộ công nợ khi áp dụng BHYT sau khi hóa đơn đã tạo.
8. Bổ sung test tích hợp cho:
   - bắt đầu khám;
   - lưu khám ban đầu;
   - chẩn đoán chính trùng;
   - hoàn tất tạo hóa đơn;
   - gọi hoàn tất lặp lại;
   - lượt khám không có khoản thu.

## 11. Kịch bản kiểm thử UI

### Kịch bản A: Khám thông thường

1. Chọn lượt `CHO_KHAM`.
2. Bấm bắt đầu khám.
3. Nhập lý do, sinh hiệu, tiền sử.
4. Lưu.
5. Thêm chẩn đoán chính.
6. Thêm dịch vụ.
7. Bấm hoàn tất.
8. Kiểm tra hóa đơn và công nợ.

### Kịch bản B: Có đơn thuốc

1. Bắt đầu lượt khám.
2. Kê đơn và duyệt đơn.
3. Hoàn tất lượt khám.
4. Kiểm tra chi tiết hóa đơn có dòng thuốc.
5. Kiểm tra đơn xuất hiện ở module cấp phát.

### Kịch bản C: Gọi lại hoàn tất

Gọi lại thao tác hoàn tất cùng lượt khám. Kết quả phải dùng hóa đơn cũ, không tăng số lượng hóa đơn.

### Kịch bản D: Không có khoản thu

Hoàn tất lượt không có dịch vụ/thuốc có giá. Lượt khám hoàn tất nhưng không tạo hóa đơn rỗng.

### Kịch bản E: Lỗi quyền

Đăng nhập bằng vai trò không phù hợp. UI phải xử lý `403` và không hiển thị nút thao tác trái quyền.

## 12. File backend/UI liên quan

- [LuotKham.cs](../ClinicManagement.Domain/Examination/LuotKham/LuotKham.cs)
- [SaveExaminationCommandHandler.cs](../ClinicManagement.Application/Features/LuotKham/Commands/SaveExamination/SaveExaminationCommandHandler.cs)
- [StartExamCommandHandler.cs](../ClinicManagement.Application/Features/LuotKham/Commands/StartExam/StartExamCommandHandler.cs)
- [CompleteExamCommandHandler.cs](../ClinicManagement.Application/Features/LuotKham/Commands/CompleteExam/CompleteExamCommandHandler.cs)
- [LuotKhamController.cs](../ClinicManagement.API/Controllers/LuotKham/LuotKhamController.cs)
- [MedicalRecord.LuotKhamController.cs](../ClinicManagement.API/Controllers/LuotKham/MedicalRecord.LuotKhamController.cs)
- [ChanDoan.LuotKhamController.cs](../ClinicManagement.API/Controllers/LuotKham/ChanDoan.LuotKhamController.cs)
- [ChiDinhDichVu.LuotKhamController.cs](../ClinicManagement.API/Controllers/LuotKham/ChiDinhDichVu.LuotKhamController.cs)
- [DonThuoc.LuotKhamController.cs](../ClinicManagement.API/Controllers/LuotKham/DonThuoc.LuotKhamController.cs)
- [ExaminationList.tsx](../ClinicManagement.AdminUI/src/examination/components/ExaminationList.tsx)
- [examination.api.ts](../ClinicManagement.AdminUI/src/examination/api/examination.api.ts)

