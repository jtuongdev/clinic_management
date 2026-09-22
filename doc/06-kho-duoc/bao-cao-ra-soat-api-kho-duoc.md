# Báo cáo rà soát API quản lý kho dược

**Thời điểm rà soát:** 2026-09-07  
**Phạm vi:** API inventory, API đơn thuốc, domain inventory, persistence và tài liệu flow

## 1. Kết luận tổng quan

API hiện đã bao phủ phần lớn flow vận hành kho dược cốt lõi:

- Danh mục thuốc/vật tư và đơn vị quy đổi.
- Nhập kho theo lô, hạn dùng và nhà cung cấp.
- Xem tồn, tồn thấp và cảnh báo hạn dùng.
- Kê đơn, duyệt/hủy đơn và danh sách đơn chờ cấp phát.
- Cấp phát theo FEFO.
- Bán lẻ và xuất dùng nội bộ/thủ thuật.
- Trả nhà cung cấp, xuất hủy và hoàn thuốc từ bệnh nhân.
- Kiểm kê, duyệt/điều chỉnh và audit giao dịch.

Tuy nhiên, **chưa thể kết luận là đã đúng đầy đủ flow production theo tài liệu**. Mức hoàn thiện hiện tại là:

| Nhóm nghiệp vụ | Đánh giá |
|---|---|
| API và domain flow chính | Đã có nền tảng và endpoint |
| Kiểm soát tồn theo lô/FEFO | Đã triển khai ở mức cơ bản |
| Audit/idempotency | Đã có nhưng còn giới hạn cạnh tranh đồng thời |
| Thanh toán bán lẻ/hóa đơn | Chưa tích hợp đầy đủ |
| Chứng từ trả nhà cung cấp | Chưa đầy đủ |
| Phân quyền theo nghiệp vụ | Chưa hoàn thiện |
| Concurrency production | Chưa hoàn thiện toàn bộ |
| AdminUI kho dược | Chưa có đầy đủ màn hình quản trị |

Vì vậy API hiện phù hợp cho **giai đoạn tích hợp và kiểm thử flow**, chưa nên xem là đã hoàn tất để vận hành production.

## 2. Danh sách endpoint hiện có

### 2.1. Danh mục

- `GET /api/inventory/items`
- `POST /api/inventory/items`
- `PUT /api/inventory/items/{id}`
- `POST /api/inventory/items/{id}/toggle-status`

Đáp ứng tìm kiếm, lọc loại hàng/trạng thái, phân trang, đơn vị cơ bản, đơn vị quy đổi,
giá bán, tồn tối thiểu và trạng thái sử dụng.

### 2.2. Tồn kho và cảnh báo

- `GET /api/inventory/stock`
- `GET /api/inventory/stock/alerts`

Đáp ứng xem tồn theo mặt hàng/lô, lọc tồn thấp và cảnh báo lô gần/hết hạn.

### 2.3. Nhập kho

- `POST /api/inventory/import-receipts`
- `POST /api/inventory/import-receipts/{id}/approve`

Đáp ứng tạo phiếu nhập nháp hoặc nhập chính thức, kiểm tra nhà cung cấp,
quy đổi về base unit, bắt buộc hạn dùng với thuốc, tạo tồn và ghi ledger.

### 2.4. Đơn thuốc và cấp phát

- `POST /api/luot-kham/{luotKhamId}/don-thuoc`
- `PUT /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/items`
- `POST /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/approve`
- `POST /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/cancel`
- `GET /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}`
- `GET /api/inventory/prescriptions/pending`
- `POST /api/inventory/prescriptions/{prescriptionId}/dispense`

Đáp ứng kê, sửa đơn tạm, duyệt, hủy, tra cứu và cấp phát theo FEFO.

### 2.5. Xuất, trả và hủy

- `POST /api/inventory/exports/retail`
- `POST /api/inventory/exports/internal-use`
- `POST /api/inventory/returns`
- `POST /api/inventory/write-offs`
- `POST /api/inventory/returns/patient`

Đáp ứng các biến động tồn chính và ghi giao dịch audit.

### 2.6. Kiểm kê và audit

- `POST /api/inventory/stocktakes`
- `PUT /api/inventory/stocktakes/{id}/count`
- `POST /api/inventory/stocktakes/{id}/submit`
- `POST /api/inventory/stocktakes/{id}/approve`
- `POST /api/inventory/stocktakes/{id}/finalize`
- `GET /api/inventory/audit-transactions`

Đáp ứng tạo đợt kiểm kê, nhập số đếm, submit, approve/finalize và xem sổ giao dịch.

## 3. Đối chiếu với flow nghiệp vụ

| Flow trong tài liệu | Trạng thái hiện tại | Nhận xét |
|---|---|---|
| Danh mục thuốc/vật tư | Đạt một phần | Có CRUD và quy đổi; thiếu policy phân quyền và UI quản trị đầy đủ |
| Nhập kho | Đạt một phần | Có draft/approve và tạo tồn; cơ sở mặc định chưa lấy từ cấu hình đầy đủ |
| Xem tồn/FEFO | Đạt một phần | Có theo lô và FEFO; cần kiểm thử concurrency khi nhiều request đồng thời |
| Kê đơn | Đạt một phần | Có create/edit/approve/cancel/get; audit khi hủy và authorization cần hoàn thiện |
| Cấp phát đơn | Đạt một phần | Có kiểm tồn, FEFO và transaction; `expectedVersion` chưa bảo vệ đầy đủ mọi lô |
| Bán lẻ | Chưa đạt đầy đủ | Có trừ tồn và nhận payment method; chưa tạo `HoaDon`/`PhieuThu` và đối soát |
| Xuất nội bộ/thủ thuật | Đạt một phần | Có xuất và ledger; cần hoàn thiện phân quyền và chứng từ nghiệp vụ liên quan |
| Trả nhà cung cấp | Chưa đạt đầy đủ | Đang giảm tồn và ghi ledger; chưa tạo chứng từ trả NCC đầy đủ |
| Xuất hủy | Đạt một phần | Có giảm tồn và lý do; cần policy, phê duyệt và audit nghiệp vụ đầy đủ |
| Hoàn thuốc bệnh nhân | Đạt một phần | Có phân biệt `SEALED`; cần ràng buộc chứng minh thuốc thuộc đơn đã cấp |
| Kiểm kê | Đạt một phần | Có vòng đời và điều chỉnh; cần kiểm thử rollback/concurrency và phân quyền |
| Audit/idempotency | Đạt một phần | Có ledger/replay; claim idempotency chưa nguyên tử tuyệt đối khi request đồng thời |

## 4. Những điểm chưa đáp ứng đầy đủ flow

### 4.1. Thanh toán và chứng từ bán lẻ

`POST /api/inventory/exports/retail` hiện nhận `paymentMethod` và trả thông tin phiếu xuất.
API chưa tạo hoặc liên kết đầy đủ:

- Hóa đơn bán lẻ.
- Phiếu thu.
- Trạng thái thanh toán.
- Đối soát và hoàn tiền.

### 4.2. Trả nhà cung cấp

`POST /api/inventory/returns` hiện xử lý giảm tồn và ghi `InventoryTransaction`.
Chưa có chứng từ trả nhà cung cấp chứa nhà cung cấp, danh sách dòng trả, lý do,
trạng thái duyệt và tổng giá trị trả.

### 4.3. Concurrency và idempotency

Đã có `Version` trên tồn kho và `IdempotencyRecord`, nhưng cần hoàn thiện:

- Bắt và chuẩn hóa `DbUpdateConcurrencyException`.
- Kiểm tra version cho tất cả lô bị thay đổi trong một nghiệp vụ.
- Claim idempotency key bằng insert unique/lock trước khi chạy nghiệp vụ.
- Đảm bảo replay record và biến động tồn cùng transaction.

### 4.4. Authorization

Các controller hiện có `[Authorize]`, nhưng chưa gắn policy riêng cho:

- Quản lý danh mục.
- Duyệt nhập kho.
- Cấp phát.
- Bán lẻ và sửa giá.
- Xuất hủy.
- Duyệt/finalize kiểm kê.

### 4.5. Tính toàn vẹn nghiệp vụ

Cần bổ sung hoặc xác nhận bằng test:

- Hoàn bệnh nhân chỉ áp dụng cho thuốc đã cấp từ đúng đơn.
- Không cho trả/hủy vượt số lượng đã xuất.
- Không cho thay đổi chứng từ đã hoàn tất.
- Không cho ghi ledger trùng khi retry hoặc hai request đồng thời.
- Audit riêng cho thay đổi giá, hủy đơn, thay đổi danh mục và phê duyệt.

## 5. Đánh giá response API

Response hiện đã có các dữ liệu chính để frontend thực hiện flow:

- Mã định danh bản ghi.
- Mã chứng từ hoặc reference code.
- Trạng thái nghiệp vụ.
- Số lượng và thông tin lô ở các API tồn.
- Danh sách item và phân trang ở các API truy vấn.
- Replay response cho các request có idempotency key.

Tuy nhiên response chưa thống nhất hoàn toàn giữa các flow. Một số điểm nên chuẩn hóa:

- Dùng cùng cấu trúc phân trang (`items`, `total`, `pageIndex`, `pageSize`).
- Dùng cùng tên field trạng thái nghiệp vụ.
- Trả mã lỗi nghiệp vụ ổn định, ví dụ `INSUFFICIENT_STOCK`,
  `CONCURRENCY_CONFLICT`, `IDEMPOTENCY_REPLAY`.
- Trả chi tiết allocation theo lô khi cấp phát/bán/xuất.
- Trả tổng tiền, trạng thái thanh toán và chứng từ khi bán lẻ.

## 6. File source đã đối chiếu

- `ClinicManagement.API/Controllers/InventoryController.cs`
- `ClinicManagement.API/Controllers/PrescriptionController.cs`
- `ClinicManagement.Application/Features/Kho/KhoService.cs`
- `ClinicManagement.Application/Common/Interfaces/IKhoService.cs`
- `ClinicManagement.Application/Features/Kho/KhoService.cs`
- `ClinicManagement.Domain/Inventory/InventoryTransaction.cs`
- `ClinicManagement.Domain/Inventory/IdempotencyRecord.cs`
- `ClinicManagement.Domain/Inventory/Stocktake.cs`
- `ClinicManagement.Domain/Inventory/StocktakeCount.cs`
- `ClinicManagement.Infrastructure/Persistence/ClinicDbContext.cs`
- `ClinicManagement.Infrastructure/DependencyInjection.cs`
- `doc/06-kho-duoc/ke-hoach-kho-duoc-end-to-end.md`

## 7. Kết luận và thứ tự hoàn thiện đề xuất

Để xác nhận flow kho dược hoàn chỉnh trước production, nên thực hiện theo thứ tự:

1. Bổ sung chứng từ trả nhà cung cấp.
2. Tích hợp hóa đơn, phiếu thu và trạng thái thanh toán bán lẻ.
3. Hoàn thiện concurrency và atomic idempotency.
4. Bổ sung authorization policy theo vai trò.
5. Chuẩn hóa response/error code.
6. Bổ sung test integration cho FEFO, rollback, retry, concurrency và kiểm kê.
7. Hoàn thiện màn hình AdminUI cho danh mục, nhập, tồn, kiểm kê và audit.

**Kết luận cuối:** API hiện đã bao phủ đúng hướng và phần lớn flow trong tài liệu,
nhưng vẫn là bản **đạt một phần**, chưa đủ toàn bộ nghiệp vụ quản lý kho dược production.
