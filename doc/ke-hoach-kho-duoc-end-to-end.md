# Kế hoạch và trạng thái triển khai kho dược phòng khám đa khoa (Mô hình 1 kho tập trung)

## 1. Mục tiêu và phạm vi

Tài liệu này mô tả blueprint quản lý kho dược tinh gọn cho phòng khám đa khoa, vận hành theo mô hình **1 kho vật lý duy nhất** (kho nhà thuốc kiêm quầy cấp phát ngoại trú và cấp vật tư thủ thuật).

Phạm vi chính:

```text
Dữ liệu nền
→ Nhập kho (theo lô, hạn dùng)
→ Tồn kho theo lô
→ Kê đơn thuốc tại phòng khám
→ Cấp phát 1 chạm theo FEFO
→ Xuất thuốc bán lẻ / Xuất dùng thủ thuật
→ Trả NCC / Xuất hủy
→ Kiểm kê và điều chỉnh
→ Báo cáo / Sổ cái giao dịch
Loại bỏ toàn bộ nghiệp vụ điều chuyển kho nội bộ phức tạp để tối ưu tốc độ vận hành cho phòng khám.

## 2. Hiện trạng và định hướng điều chỉnh
Đã có các entity:
Item: thuốc, vật tư y tế.
TonKho: tồn gắn với lô và hạn dùng.
PhieuNhapKho, ChiTietNhapKho.
PhieuXuatKho, ChiTietXuatKho.
DonThuoc, ChiTietDonThuoc.
### 2.1. Các điểm tinh chỉnh quan trọng
Gom kho: Hệ thống mặc định sử dụng 1 kho trung tâm (DefaultWarehouseId = 1), lược bỏ tham số chọn kho ở các màn hình tác nghiệp thông thường.
Quy trình nhập rút gọn: Cho phép Dược sĩ trưởng nhập hàng, đối soát và duyệt tăng tồn ngay trong 1 bước nếu có quyền.
Cấp phát 1 chạm: Tích hợp preview và phân bổ FEFO tự động vào transaction cấp phát, tự sinh phiếu xuất và trừ tồn ngay.
Đa dạng hình thức xuất: Hỗ trợ 3 luồng xuất trên cùng một kho: cấp theo đơn, bán lẻ trực tiếp và xuất dùng tại phòng thủ thuật (tiểu phẫu, tai mũi họng, răng hàm mặt).
Khóa chống tranh chấp (Concurrency): Bắt buộc kiểm tra phiên bản/khóa dòng khi trừ lô theo FEFO.
Kho mặc định chỉ là cấu hình nghiệp vụ, không hardcode `DefaultWarehouseId = 1`. ID kho phải được lấy từ `SystemSettings` hoặc `FacilitySettings`; API nghiệp vụ thông thường không cần cho người dùng chọn kho.

## 3. Nguyên tắc nghiệp vụ
3.1. Tồn kho theo lô
Khóa nghiệp vụ xác định một dòng tồn là:
```text
MaItem + MaChiTietNhap (hoặc MaItem + SoLo + HanSuDung)
```
Mỗi dòng lưu trữ: số lô, hạn sử dụng, số lượng tồn thực tế và giá nhập gốc. Tồn tổng của thuốc là tổng các dòng tồn còn hạn dùng.
### 3.2. Không cho tồn âm
Mọi thao tác xuất kho (cấp đơn, bán lẻ, hao hụt) đều kiểm tra số lượng tồn tại thời điểm commit transaction. Thiếu tồn là rollback toàn bộ, không xuất một phần thiếu kiểm soát.
### 3.3. FEFO mặc định
Hệ thống tự động quét và trừ từ lô có hạn dùng gần nhất (HanSuDung nhỏ nhất) còn hiệu lực. Tuyệt đối không phân bổ lô đã hết hạn (HanSuDung < NgàyHiệnTại).
### 3.4. Giao dịch bất biến (Immutable Audit Ledger)
Không cập nhật số dư bằng câu lệnh trần. Mọi biến động tăng/giảm số lượng đều phải ghi vào bảng InventoryTransaction gồm:
```text
Loại giao dịch (NHAP, XUAT_DON, XUAT_BAN_LE, XUAT_THU_THUAT, DIEU_CHINH, HUY),
Item, Lô, Số lượng trước/sau, Người thực hiện, Mã chứng từ tham chiếu.
```
### 3.5. Đơn vị quy đổi

Tồn kho luôn lưu theo `baseUnit`. Người dùng có thể nhập, bán hoặc xuất theo đơn vị quy đổi, nhưng Application phải chuyển về đơn vị cơ bản trước khi kiểm tra và cập nhật tồn.

```text
1 HOP = 100 VIEN
Nhập 2 HOP → tăng 200 VIEN
Xuất 5 VIEN → giảm 5 VIEN
```

Không được thay đổi hệ số quy đổi sau khi item đã phát sinh giao dịch kho; nếu cần thay đổi phải tạo phiên bản đơn vị mới.

### 3.6. Hạn sử dụng

- Thuốc bắt buộc có hạn sử dụng.
- Vật tư có hạn sử dụng bắt buộc có `expiryDate`.
- Vật tư không có hạn sử dụng được phép để `expiryDate = null`.
- Lô hết hạn không được FEFO phân bổ.

### 3.7. Idempotency và concurrency

Các API làm thay đổi tồn phải nhận `idempotencyKey`. Cùng một key chỉ được xử lý thành công một lần, tránh tạo phiếu trùng khi frontend retry.

Các request cập nhật chứng từ/tồn nên nhận `expectedVersion`. Nếu phiên bản đã thay đổi, trả lỗi `CONCURRENCY_CONFLICT` và không cập nhật một phần.

## 4. Trạng thái và chuyển trạng thái
### 4.1. Phiếu nhập
```text
TAM ──> DA_NHAP
 │        ▲
 └──> CHO_DUYET ──┘
Dược sĩ thường: TAM → CHO_DUYET → Quản lý bấm DA_NHAP.
Dược sĩ trưởng/Chủ phòng khám: Tạo và bấm DA_NHAP trực tiếp để tăng tồn ngay.
```
### 4.2. Phiếu xuất
```text
DA_XUAT (sinh tự động và trừ tồn ngay khi bấm Hoàn tất / Cấp phát)
Đối với bán lẻ và cấp đơn, phiếu xuất sinh ra ở trạng thái DA_XUAT ngay trong transaction bán hàng/cấp phát. Không duy trì trạng thái chờ duyệt để tránh ách tắc tại quầy.
```
### 4.3. Đơn thuốc
```text
CHO_CAP_PHAT ──> DA_XUAT_HET
              ↘ DANG_CAP_PHAT (nếu cho phép cấp thiếu dòng)
```
## 5. API contract chung
Base path: /api/inventory.
Định dạng JSON camelCase, ID số nguyên, chuẩn thời gian ISO-8601 UTC.
Xác thực qua JWT Bearer token.
Response chuẩn:
JSON
{
  "success": true,
  "data": {},
  "message": "Thao tác thành công",
  "traceId": "..."
}
Response lỗi chuẩn:
JSON
{
  "success": false,
  "status": 409,
  "code": "INSUFFICIENT_STOCK",
  "message": "Thuốc [PARA500] không đủ tồn kho theo lô khả dụng",
  "errors": [],
  "traceId": "..."
}
6. API danh mục thuốc và vật tư
HTTP
GET    /api/inventory/items?keyword=para&itemType=THUOC&isActive=true&pageIndex=1&pageSize=20
POST   /api/inventory/items
PUT    /api/inventory/items/{id}
POST   /api/inventory/items/{id}/toggle-status
Body tạo/cập nhật thuốc:
JSON
{
  "code": "PARA500",
  "name": "Paracetamol 500mg",
  "itemType": "THUOC",
  "baseUnit": "VIEN",
  "dosageForm": "VIEN_NEN",
  "strength": "500mg",
  "salePrice": 1500,
  "minimumStock": 100,
  "conversions": [
    { "unit": "VI", "factor": 10 },
    { "unit": "HOP", "factor": 100 }
  ]
}
7. API nhập kho
7.1. Tạo và duyệt nhập kho
Hỗ trợ cả chế độ lưu nháp (saveDraft = true) và duyệt trực tiếp (saveDraft = false).
HTTP
POST /api/inventory/import-receipts
Input:
JSON
{
  "supplierId": 5,
  "receivedAt": "2026-09-07T04:00:00Z",
  "note": "Nhập hàng đầu tuần",
  "saveDraft": false,
  "items": [
    {
      "itemId": 12,
      "quantity": 500,
      "purchasePrice": 900,
      "batchNumber": "LOT-2026-09",
      "expiryDate": "2028-09-30T00:00:00Z"
    }
  ]
}
Nếu saveDraft: false: Hệ thống tự động kiểm tra, ghi bản ghi TonKho, ghi sổ cái InventoryTransaction và trả về trạng thái DA_NHAP.
7.2. Duyệt phiếu nháp (nếu dùng quy trình 2 bước)
HTTP
POST /api/inventory/import-receipts/{id}/approve
8. API theo dõi tồn kho
8.1. Danh sách tồn khả dụng
HTTP
GET /api/inventory/stock?keyword=para&lowStockOnly=false&pageIndex=1&pageSize=20
Response:
JSON
{
  "data": {
    "items": [
      {
        "itemId": 12,
        "itemCode": "PARA500",
        "itemName": "Paracetamol 500mg",
        "baseUnit": "VIEN",
        "totalStock": 500,
        "minimumStock": 100,
        "isLowStock": false,
        "batches": [
          {
            "stockId": 101,
            "batchNumber": "LOT-2026-09",
            "expiryDate": "2028-09-30T00:00:00Z",
            "quantity": 500,
            "daysToExpiry": 753
          }
        ]
      }
    ],
    "total": 1
  }
}
8.2. Cảnh báo hết hạn và sắp hết hàng
HTTP
GET /api/inventory/stock/alerts?expiringWithinDays=60
9. API cấp phát thuốc theo đơn (FEFO 1 chạm)
9.1. Lấy danh sách đơn thuốc chờ cấp phát
HTTP
GET /api/inventory/prescriptions/pending?pageIndex=1&pageSize=20
9.2. Cấp phát thuốc theo đơn
Dược sĩ bấm "Cấp thuốc", hệ thống tự động phân bổ FEFO từ các lô còn hạn, sinh phiếu xuất và trừ tồn trong cùng 1 transaction.
HTTP
POST /api/inventory/prescriptions/{prescriptionId}/dispense
Input:
JSON
{
  "note": "Cấp thuốc cho bệnh nhân"
}
Transaction thực hiện:
Plaintext
1. Đọc đơn thuốc, kiểm tra trạng thái != DA_XUAT_HET.
2. Với từng loại thuốc trong đơn:
   - Truy vấn các dòng TonKho có HanSuDung > Hiện tại, sắp xếp HanSuDung ASC (FEFO).
   - Kiểm tra tổng khả dụng >= số lượng kê. Nếu thiếu: ROLLBACK và báo lỗi.
   - Khóa dòng (pessimistic lock hoặc check version) và trừ số lượng theo từng lô.
3. Tạo PhieuXuatKho (loại BAN_THEO_DON) và ChiTietXuatKho gắn mã lô cụ thể.
4. Cập nhật SoLuongDaXuat trên ChiTietDonThuoc và đổi trạng thái đơn.
5. Ghi InventoryTransaction (XUAT_DON).
6. Commit.
Response:
JSON
{
  "data": {
    "prescriptionId": 9001,
    "exportReceiptId": 201,
    "prescriptionStatus": "DA_XUAT_HET",
    "dispensedItems": [
      {
        "itemId": 12,
        "itemName": "Paracetamol 500mg",
        "quantity": 20,
        "allocations": [
          { "batchNumber": "LOT-2026-09", "quantity": 20 }
        ]
      }
    ]
  }
}
10. API xuất thuốc bán lẻ và xuất dùng thủ thuật
10.1. Bán lẻ tại quầy (không qua đơn khám)
HTTP
POST /api/inventory/exports/retail
Input:
JSON
{
  "customerName": "Khách vãng lai",
  "note": "Bán lẻ",
  "items": [
    { "itemId": 12, "quantity": 10 }
  ]
}
Hệ thống tự động trừ lô theo FEFO và in hóa đơn/phiếu xuất bán lẻ.
10.2. Xuất dùng phòng thủ thuật / vật tư tiêu hao
Bác sĩ hoặc điều dưỡng lĩnh cồn, gạc, thuốc tê phục vụ thủ thuật:
HTTP
POST /api/inventory/exports/internal-use
Input:
JSON
{
  "department": "PHONG_TIEU_PHAU",
  "receiverName": "BS. Nam",
  "note": "Xuất gạc và cồn tuần 36",
  "items": [
    { "itemId": 45, "quantity": 5 }
  ]
}
11. Trả hàng và xuất hủy
11.1. Trả hàng cho nhà cung cấp
HTTP
POST /api/inventory/returns
Input:
JSON
{
  "supplierId": 5,
  "stockId": 101,
  "quantity": 20,
  "reason": "Bao bì rách hỏng"
}
11.2. Xuất hủy thuốc hết hạn, vỡ hỏng
HTTP
POST /api/inventory/write-offs
Input:
JSON
{
  "stockId": 101,
  "quantity": 5,
  "reason": "Hết hạn sử dụng theo biên bản kiểm kê"
}
12. Kiểm kê và điều chỉnh kho
12.1. Lập đợt kiểm kê
HTTP
POST /api/inventory/stocktakes
Input:
JSON
{
  "note": "Kiểm kê định kỳ cuối tuần"
}
12.2. Nhập số liệu thực tế và chốt cân kho
HTTP
POST /api/inventory/stocktakes/{id}/finalize
Input:
JSON
{
  "counts": [
    {
      "stockId": 101,
      "actualQuantity": 475,
      "reason": "Lệch 5 viên do làm rơi vỡ"
    }
  ]
}
Hệ thống tính toán chênh lệch, tự động sinh giao dịch điều chỉnh tăng/giảm tương ứng trong InventoryTransaction.
13. Sổ cái giao dịch và audit
HTTP
GET /api/inventory/audit-transactions?itemId=12&fromDate=2026-09-01&toDate=2026-09-07&pageIndex=1&pageSize=50
Response:
JSON
{
  "data": [
    {
      "id": 8801,
      "createdAt": "2026-09-07T05:30:00Z",
      "transactionType": "XUAT_DON",
      "referenceCode": "PX-20260907-0012",
      "itemId": 12,
      "batchNumber": "LOT-2026-09",
      "quantityBefore": 500,
      "quantityChange": -20,
      "quantityAfter": 480,
      "performer": "pharmacist_lan"
    }
  ]
}
14. Phân quyền tinh gọn
Mã quyền	Mô tả nghiệp vụ
inventory.item.manage	Thêm, sửa danh mục thuốc, vật tư, đơn vị quy đổi
inventory.stock.view	Xem tồn kho, cảnh báo hết hạn
inventory.import	Nhập kho thuốc từ nhà cung cấp
inventory.dispense	Cấp phát thuốc theo đơn khám và bán lẻ
inventory.internal_export	Xuất vật tư cho các phòng thủ thuật
inventory.stocktake	Kiểm kê và cân chỉnh kho
inventory.report	Xem báo cáo xuất nhập tồn và sổ cái giao dịch
15. Lộ trình triển khai kỹ thuật tinh gọn
Phase 1: Nền tảng dữ liệu và Nhập kho
Bổ sung bảng TonKho (theo lô + hạn dùng) và InventoryTransaction.
Viết API danh mục thuốc kèm đơn vị quy đổi (baseUnit).
Hoàn thiện API Nhập kho (saveDraft = false để duyệt thẳng tăng tồn).
Viết Unit Test cho transaction nhập kho và audit log.
Phase 2: Cấp phát đơn thuốc và Bán lẻ
Thuật toán trừ lô FEFO kèm khóa dòng (SELECT FOR UPDATE hoặc check concurrency).
API Cấp phát 1 chạm từ DonThuoc → sinh PhieuXuatKho → trừ TonKho.
API Bán lẻ trực tiếp tại quầy.
Tích hợp giao diện màn hình cấp phát cho Dược sĩ.
Phase 3: Quản trị và Cân kho
API Xuất vật tư dùng cho phòng thủ thuật.
Quy trình Kiểm kê và chốt số lượng thực tế.
Báo cáo tồn kho, cảnh báo cận date và sổ cái truy nguyên giao dịch.

## 16. Quy tắc contract bổ sung

### 16.1. Idempotency

Các API có thể tạo chứng từ hoặc thay đổi tồn phải nhận `idempotencyKey`:

```http
POST /api/inventory/import-receipts
POST /api/inventory/prescriptions/{prescriptionId}/dispense
POST /api/inventory/exports/retail
POST /api/inventory/exports/internal-use
POST /api/inventory/stocktakes/{id}/finalize
```

Cùng một key phải trả lại kết quả của lần xử lý đầu tiên, không tạo thêm phiếu xuất hoặc giao dịch tồn khi frontend retry.

### 16.2. Đơn vị quy đổi

Request có thể nhận `unit` và `quantity`, nhưng service phải chuyển về `baseUnit` trước khi kiểm tra tồn:

```json
{
  "itemId": 12,
  "quantity": 2,
  "unit": "HOP"
}
```

Nếu `1 HOP = 100 VIEN`, số lượng ghi sổ là `200 VIEN`. Không cho sửa hệ số quy đổi sau khi item đã phát sinh giao dịch.

### 16.3. Hạn sử dụng

- Thuốc bắt buộc có `expiryDate`.
- Vật tư có hạn dùng bắt buộc có `expiryDate`.
- Vật tư không có hạn dùng được phép để `expiryDate = null`.
- Lô hết hạn bị loại khỏi FEFO và không được xuất bán/cấp phát.

### 16.4. Concurrency

Request duyệt/cấp phát có thể nhận `expectedVersion`. Nếu dữ liệu đã thay đổi, trả HTTP 409 với mã `CONCURRENCY_CONFLICT` và không cập nhật một phần.

## 17. Hoàn trả thuốc từ bệnh nhân

```http
POST /api/inventory/returns/patient
```

Input:

```json
{
  "prescriptionId": 9001,
  "items": [
    {
      "itemId": 12,
      "batchNumber": "LOT-2026-09",
      "quantity": 5,
      "condition": "SEALED"
    }
  ],
  "reason": "Bệnh nhân trả phần thuốc chưa sử dụng"
}
```

Chỉ nhập lại kho khi xác định được đúng lô và thuốc còn nguyên niêm phong. Nếu bao bì đã mở hoặc không xác định được điều kiện bảo quản, phải ghi giao dịch `HUY`, không cộng tồn.

## 18. Bán lẻ và thanh toán

API bán lẻ cần ghi nhận phương thức thanh toán và giá thực tế:

```json
{
  "idempotencyKey": "retail-20260907-0001",
  "customerName": "Khách vãng lai",
  "paymentMethod": "CASH",
  "items": [
    {
      "itemId": 12,
      "quantity": 10,
      "unit": "VIEN",
      "unitPrice": 1500
    }
  ]
}
```

`unitPrice` mặc định lấy từ danh mục. Chỉ người có quyền mới được sửa giá tại quầy; mọi thay đổi phải ghi audit. Không được trừ tồn thành công nhưng để giao dịch thanh toán ở trạng thái thất bại.

## 19. Kiểm kê tách thành nhiều bước

Đề xuất tách API:

```http
POST /api/inventory/stocktakes
PUT  /api/inventory/stocktakes/{id}/count
POST /api/inventory/stocktakes/{id}/submit
POST /api/inventory/stocktakes/{id}/approve
```

- `count`: lưu số thực tế, chưa thay đổi tồn.
- `submit`: khóa nội dung kiểm kê, chờ duyệt.
- `approve`: sinh giao dịch `DIEU_CHINH` tăng/giảm và ghi audit.

Chỉ quyền `inventory.stocktake.approve` mới được duyệt chênh lệch.

## 20. Transaction boundary

Các transaction cập nhật tồn phải commit đồng thời:

```text
Chứng từ nghiệp vụ
→ TonKho
→ InventoryTransaction
→ Audit
```

Nếu một bước lỗi, rollback toàn bộ. Thanh toán ngoài hệ thống phải có trạng thái và cơ chế đối soát riêng, không giữ database transaction trong lúc gọi cổng thanh toán.

## 21. Mapping enum Domain và API

API không được dùng tên enum chưa tồn tại trong Domain mà không có mapping rõ ràng:

| API nghiệp vụ | Domain đề xuất |
|---|---|
| `XUAT_DON` | Bổ sung vào `LoaiXuatKho` |
| `XUAT_BAN_LE` | `BAN_THUOC` hoặc enum riêng |
| `XUAT_THU_THUAT` | Bổ sung vào `LoaiXuatKho` |
| `CHO_CAP_PHAT` | Mapping từ `DA_DUYET` hoặc bổ sung trạng thái |
| `DANG_CAP_PHAT` | Bổ sung nếu cho phép cấp một phần |

Trước khi code API, cần chốt enum cuối cùng và migration tương ứng để tránh contract lệch với Domain.

## 22. Quy tắc Soft Delete

`BaseEntity` của toàn hệ thống đã có cờ `IsDeleted` (soft delete). Các quy tắc bắt buộc khi áp dụng vào nghiệp vụ kho:

- **Item bị soft-delete** không được xuất hiện trong truy vấn FEFO và không được chọn khi tạo phiếu nhập / xuất / đơn thuốc mới.
- **TonKho bị soft-delete** không được tính vào tồn tổng của item và không được phân bổ bởi FEFO.
- **Chứng từ kho** (PhieuNhapKho, PhieuXuatKho, DonThuoc) **không được soft-delete** sau khi đã ở trạng thái `DA_NHAP` / `DA_XUAT` / `DA_XUAT_HET`. Chỉ được hủy thông qua nghiệp vụ `Cancel()` và ghi `InventoryTransaction` tương ứng.
- **InventoryTransaction tuyệt đối không được soft-delete** — đây là sổ cái bất biến, chỉ được bổ sung bản ghi đảo chiều khi cần điều chỉnh.

## 23. Quy tắc Enum Deprecated — `CHUYEN_KHO`

`LoaiXuatKho` hiện có giá trị `CHUYEN_KHO = 5` được tạo từ thiết kế cũ (đa kho). Kế hoạch hiện tại đã loại bỏ nghiệp vụ điều chuyển kho nội bộ.

- `CHUYEN_KHO` bị **deprecated** — không được expose trong API, không cho phép tạo PhieuXuatKho mới với loại này.
- Nếu tồn tại dữ liệu lịch sử dùng `CHUYEN_KHO`, giữ nguyên để đảm bảo tính audit; không migrate sang loại khác.
- Toàn bộ logic FEFO, trừ tồn, và báo cáo phải **bỏ qua** (filter out) các giao dịch `CHUYEN_KHO` khi tính số liệu hiển thị.
- Ghi rõ trong comment code và migration note: `// DEPRECATED: CHUYEN_KHO - không sử dụng trong mô hình 1 kho tập trung`.

## 24. Mapping Trạng Thái `TrangThaiDonThuoc` — Domain vs Nghiệp vụ

Domain hiện tại có `DA_DUYET = 2` nhưng plan nghiệp vụ dùng khái niệm `CHO_CAP_PHAT`. Cần chốt một trong hai hướng và áp dụng nhất quán:

**Hướng A — Map ngữ nghĩa (không thêm state mới):**

| Domain value | Ý nghĩa nghiệp vụ | Hiển thị API |
|---|---|---|
| `TAM = 1` | Bác sĩ đang soạn đơn | `TAM` |
| `DA_DUYET = 2` | Bác sĩ đã xác nhận, chờ dược sĩ cấp | `CHO_CAP_PHAT` |
| `DA_XUAT_HET = 3` | Đã cấp phát đủ toàn bộ | `DA_XUAT_HET` |
| `HUY = 4` | Đã hủy | `HUY` |

API response trả về tên nghiệp vụ (`CHO_CAP_PHAT`), không trả về tên Domain (`DA_DUYET`). Mapping thực hiện ở Application layer.

**Hướng B — Thêm state mới vào Domain:**

Bổ sung `CHO_CAP_PHAT = 5` và `DANG_CAP_PHAT = 6` vào `TrangThaiDonThuoc`, kèm migration dữ liệu: `DA_DUYET → CHO_CAP_PHAT`.

> Cần chốt hướng trước khi code. Khuyến nghị **Hướng A** để tránh migration phức tạp.

## 25. Enum `TrangThaiNhaCungCap` — Thay thế String thô

`NhaCungCap.TrangThai` hiện đang lưu dưới dạng `string`. Cần chuyển sang enum để đảm bảo type safety và tránh lỗi dữ liệu:

```csharp
public enum TrangThaiNhaCungCap
{
    HoatDong = 1,
    NgungHopTac = 2
}
```

Quy tắc nghiệp vụ:

- NCC ở trạng thái `NgungHopTac` **không được chọn** khi tạo PhieuNhapKho mới. API trả lỗi `SUPPLIER_INACTIVE`.
- Cho phép xem lịch sử nhập kho từ NCC đã ngừng hợp tác (audit purposes).
- Migration: cập nhật cột `TrangThai` từ kiểu `nvarchar` sang `int`, map giá trị cũ tương ứng trước khi deploy.

## 26. Nghiệp Vụ Kê Đơn Thuốc — Tích Hợp Vào Flow Kho Dược

### 26.1. Vị trí trong luồng tổng thể

Kê đơn thuốc là **bước trung gian** kết nối luồng khám bệnh (LuotKham) với luồng cấp phát kho (InventoryDispense). Bác sĩ tạo DonThuoc trong quá trình khám; Dược sĩ cấp phát khi khám xong.

```
LuotKham [DANG_KHAM]
    │
    ├─ Bác sĩ nhập ChanDoan, SinhHieu
    ├─ Bác sĩ tạo DonThuoc [TAM]
    │       └─ AddItem(): từng dòng thuốc + liều dùng + tần suất
    ├─ Bác sĩ bấm Xác nhận → DonThuoc [DA_DUYET] (= CHO_CAP_PHAT)
    │
    └─ LuotKham [HOAN_THANH]
            │
            ▼
    Dược sĩ nhận hàng đợi [CHO_CAP_PHAT]
            │
            └─ POST /prescriptions/{id}/dispense → DonThuoc [DA_XUAT_HET]
```

### 26.2. Ràng buộc kê đơn theo trạng thái LuotKham

Dựa trên code hiện tại của `LuotKham.cs`, việc tạo và xác nhận đơn thuốc phải tuân theo trạng thái lượt khám:

| Hành động | Điều kiện LuotKham bắt buộc | Lý do |
|---|---|---|
| Tạo DonThuoc mới (TAM) | `DANG_KHAM` | Bác sĩ phải đang khám mới được kê |
| AddItem vào đơn | DonThuoc phải ở trạng thái `TAM` | Không cho sửa đơn đã duyệt |
| Approve() — Xác nhận đơn | DonThuoc `TAM` → `DA_DUYET` | Chỉ bác sĩ tạo đơn mới được xác nhận |
| Cancel() — Hủy đơn | DonThuoc != `DA_XUAT_HET` | Không hủy đơn đã cấp phát |
| Cấp phát (Dispense) | DonThuoc = `DA_DUYET`, Dược sĩ có quyền `inventory.dispense` | Kho không cấp đơn chưa duyệt |

> Đơn thuốc ở trạng thái `TAM` (bác sĩ đang soạn) **tuyệt đối không được phép cấp phát**, dù dược sĩ có quyền.

### 26.3. API kê đơn thuốc (cần bổ sung)

Hiện tại hệ thống chỉ có API đọc danh sách đơn thuốc (`GET danh-sach-donthuoc`). Cần bổ sung các API tạo và quản lý đơn:

```http
POST   /api/luot-kham/{luotKhamId}/don-thuoc
PUT    /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/items
POST   /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/approve
POST   /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/cancel
GET    /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}
```

**Body tạo đơn thuốc:**
```json
{
  "ghiChu": "Dị ứng Penicillin",
  "items": [
    {
      "itemId": 12,
      "soLuongKe": 20,
      "donViTinh": "VIEN",
      "donGiaKe": 1500,
      "lieuDung": "1 viên",
      "tanSuat": "3 lần/ngày",
      "soNgay": 7,
      "huongDan": "Uống sau ăn"
    }
  ]
}
```

> `donGiaKe` mặc định lấy từ `Item.GiaBanLe`. Chỉ người có quyền mới sửa được giá kê.

### 26.4. Quy tắc nghiệp vụ kê đơn

**Validation khi AddItem:**
- `soLuongKe > 0` và `donGiaKe >= 0` (code hiện tại đã enforce).
- Item phải `IsActive = true` và chưa bị soft-delete.
- Item có `CanKeDon = true` mới được kê theo đơn; nếu `CanKeDon = false` (thuốc OTC) chỉ được bán lẻ tại quầy.
- Không được kê hai dòng cùng một `itemId` trong cùng một đơn — phải gộp số lượng hoặc trả lỗi `DUPLICATE_ITEM_IN_PRESCRIPTION`.

**Validation khi Approve:**
- Đơn phải có ít nhất 1 dòng thuốc (không cho duyệt đơn rỗng).
- Bác sĩ kê đơn và bác sĩ duyệt phải cùng người (`MaBacSi`) — hoặc quy định rõ nếu cho phép ủy quyền.

**Sửa đơn sau khi duyệt:**
- Đơn `DA_DUYET` không được sửa nội dung (thêm/bớt thuốc).
- Muốn sửa phải hủy đơn cũ và tạo đơn mới — ghi audit rõ lý do hủy.

### 26.5. Một lượt khám có thể có nhiều đơn thuốc không?

Dựa vào `LuotKham` có `ICollection<DonThuoc>`, hệ thống hỗ trợ nhiều đơn trên 1 lượt khám. Cần chốt quy tắc:

| Trường hợp | Hành vi đề xuất |
|---|---|
| Bác sĩ tạo đơn thứ 2 khi đơn thứ 1 đang ở `TAM` | Cho phép — bác sĩ đang soạn thảo |
| Bác sĩ tạo đơn thứ 2 khi đơn thứ 1 đã `DA_DUYET` | ⚠️ Cần chốt: cho phép hay bắt buộc hủy đơn cũ trước? |
| Bác sĩ tạo đơn thứ 2 sau khi đơn thứ 1 `DA_XUAT_HET` | Cho phép — tái khám hoặc bổ sung thuốc |

> Khuyến nghị: tại 1 thời điểm chỉ cho phép tối đa 1 đơn ở trạng thái `DA_DUYET` (chờ cấp phát). Dược sĩ phải cấp phát hoặc hủy đơn đang chờ trước khi bác sĩ duyệt đơn mới.

### 26.6. Luồng đặc biệt — Bệnh nhân dị ứng / chống chỉ định

Hệ thống hiện tại không có module kiểm tra dị ứng thuốc tự động. Trong phạm vi kho dược:

- Trường `GhiChu` trên `DonThuoc` dùng để bác sĩ ghi thủ công các lưu ý dị ứng (ví dụ: "Dị ứng Penicillin").
- Dược sĩ có trách nhiệm đọc `GhiChu` trước khi cấp phát.
- **Không block** cấp phát ở tầng kho khi có ghi chú dị ứng — đây là trách nhiệm nghiệp vụ của bác sĩ, không phải validation kho.

### 26.7. Trạng thái đơn thuốc — Sơ đồ đầy đủ

```
                    Bác sĩ soạn đơn
                          │
                    [TAM = 1]
                    /        \
          Bác sĩ xác nhận   Bác sĩ/Admin hủy
                /                  \
        [DA_DUYET = 2]          [HUY = 4]
        (= CHO_CAP_PHAT)
              │
        Dược sĩ cấp phát
        (FEFO tự động)
              │
       [DA_XUAT_HET = 3]
```

Mapping ra API response (theo §24 — Hướng A):

```json
{
  "trangThai": "CHO_CAP_PHAT",
  "_internalNote": "Mapped from DA_DUYET=2 in Domain"
}
```

### 26.8. Tích hợp với Hóa đơn (HoaDon)

`LuotKham` đã có `ICollection<HoaDon>`. Cần xác định thời điểm sinh hóa đơn thuốc:

| Mô hình thanh toán | Thời điểm sinh HoaDon |
|---|---|
| Thanh toán sau khi cấp thuốc | Sau `DA_XUAT_HET` — tổng tiền = `SUM(SoLuongDaXuat × DonGiaKe)` |
| Thanh toán trước khi cấp | Không phù hợp — số lượng thực tế cấp có thể khác kê đơn |
| Tích hợp vào hóa đơn tổng lượt khám | Dịch vụ + thuốc gộp chung một HoaDon |

> Khuyến nghị: sinh `HoaDon` thuốc **sau khi** DonThuoc chuyển sang `DA_XUAT_HET`, lấy giá trị thực tế từ `ChiTietDonThuoc.SoLuongDaXuat × DonGiaKe`.

### 26.9. Điểm gap hiện tại của flow kê đơn

| Vấn đề | Hiện trạng | Cần làm |
|---|---|---|
| API tạo/duyệt đơn | ❌ Chưa có — chỉ có API đọc danh sách | Tạo `POST /don-thuoc`, `POST /approve` |
| Validate `CanKeDon` | ❌ Chưa enforce trong code | Thêm kiểm tra trong `AddItem()` |
| Validate không kê trùng item | ❌ Chưa có | Thêm guard trong `AddItem()` |
| Validate đơn rỗng khi Approve | ❌ Chưa có — `Approve()` không check | Thêm `ChiTietDonThuocs.Count > 0` |
| Giá kê mặc định từ `Item.GiaBanLe` | ❌ Chưa enforce — caller tự truyền | Application layer phải auto-fill |
| Audit khi hủy đơn đã duyệt | ❌ Chưa có | Ghi `InventoryTransaction` hoặc event log |

---

## 27. Trạng thái triển khai thực tế

Phần này ghi nhận những gì đã được triển khai trong source code theo từng flow của tài liệu. Các mục
được đánh dấu **Đã làm** đã có code và đã được kiểm tra build. Các mục **Một phần** đã có endpoint
hoặc nền tảng nhưng chưa hoàn thiện toàn bộ nghiệp vụ vận hành.

### 27.1. Domain và dữ liệu nền

**Đã làm:**

- Bổ sung `TonToiThieu` cho `Item` để tính cảnh báo tồn thấp.
- Bổ sung `Version` cho `TonKho`; tăng version khi cộng/trừ tồn và cấu hình là concurrency token.
- Bổ sung enum `LoaiGiaoDichKho` cho sổ cái: `NHAP`, `XUAT_DON`, `XUAT_BAN_LE`,
  `XUAT_THU_THUAT`, `DIEU_CHINH`, `HUY`.
- Bổ sung các loại xuất `XUAT_DON`, `XUAT_THU_THUAT`, `DIEU_CHINH`, `HUY` vào `LoaiXuatKho`.
- Bổ sung `TrangThaiNhaCungCap` thay cho trạng thái chuỗi thô.
- Bổ sung aggregate kiểm kê `Stocktake` và dòng kiểm kê `StocktakeCount`.
- Bổ sung `InventoryTransaction` và `IdempotencyRecord`.
- Bổ sung thao tác cập nhật ghi chú đơn thuốc ở tầng domain.

**File đã thay đổi/thêm:**

- `ClinicManagement.Domain/Inventory/Item.cs`
- `ClinicManagement.Domain/Inventory/TonKho.cs`
- `ClinicManagement.Domain/Inventory/NhaCungCap.cs`
- `ClinicManagement.Domain/Inventory/InventoryTransaction.cs`
- `ClinicManagement.Domain/Inventory/IdempotencyRecord.cs`
- `ClinicManagement.Domain/Inventory/Stocktake.cs`
- `ClinicManagement.Domain/Inventory/StocktakeCount.cs`
- `ClinicManagement.Domain/Prescription/DonThuoc/DonThuoc.cs`
- `ClinicManagement.Domain/Common/Enums/LoaiXuatKho.cs`
- `ClinicManagement.Domain/Common/Enums/LoaiGiaoDichKho.cs`
- `ClinicManagement.Domain/Common/Enums/TrangThaiKiemKe.cs`
- `ClinicManagement.Domain/Common/Enums/TrangThaiNhaCungCap.cs`

### 27.2. Flow danh mục thuốc/vật tư

**Đã làm:**

- `GET /api/inventory/items`: tìm kiếm, lọc loại hàng/trạng thái và phân trang.
- `POST /api/inventory/items`: tạo item và đơn vị quy đổi, tự thêm đơn vị cơ bản hệ số `1`.
- `PUT /api/inventory/items/{id}`: cập nhật thông tin item; chặn thay đổi sau khi item đã có
  giao dịch kho.
- `POST /api/inventory/items/{id}/toggle-status`: bật/tắt sử dụng.
- Kiểm tra item active trước khi nhập, xuất hoặc kê đơn.

**File:** `ClinicManagement.API/Controllers/InventoryController.cs`,
`ClinicManagement.API/Controllers/Kho/DanhMuc.InventoryController.cs`,
`ClinicManagement.Application/Features/Kho/Queries/LayDanhSachMatHang/LayDanhSachMatHangQueryHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/TaoMatHang/TaoMatHangCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/CapNhatMatHang/CapNhatMatHangCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/CatalogStock.KhoService.cs`.

**Chưa hoàn thiện:** chưa có màn hình AdminUI riêng cho CRUD danh mục; quyền
`inventory.item.manage` chưa được gắn bằng policy/attribute.

### 27.3. Flow nhập kho

**Đã làm:**

- `POST /api/inventory/import-receipts` hỗ trợ `saveDraft`.
- Kiểm tra NCC tồn tại và đang `HoatDong`.
- Chuyển số lượng từ đơn vị nhập về `baseUnit`.
- Bắt buộc hạn dùng cho thuốc.
- Khi `saveDraft = false`, tạo phiếu nhập, tạo `TonKho` theo lô và ghi `InventoryTransaction.NHAP`
  trong cùng transaction.
- `POST /api/inventory/import-receipts/{id}/approve` duyệt phiếu chờ duyệt và tăng tồn.
- Có `idempotencyKey` và lưu kết quả replay.

**File:** `ClinicManagement.API/Controllers/InventoryController.cs`,
`ClinicManagement.API/Controllers/Kho/NhapKho.InventoryController.cs`,
`ClinicManagement.Application/Features/Kho/Commands/TaoPhieuNhap/TaoPhieuNhapCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/DuyetPhieuNhap/DuyetPhieuNhapCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/ImportDispensing.KhoService.cs`,
`ClinicManagement.Domain/Inventory/PhieuNhapKho/PhieuNhapKho.cs`,
`ClinicManagement.Infrastructure/Persistence/Configurations/PhieuNhapKhoConfiguration.cs`.

**Chưa hoàn thiện:** kho/cơ sở mặc định đang đọc kho từ `Inventory:DefaultWarehouseId`, nhưng cơ sở
trên phiếu nhập vẫn đang dùng giá trị mặc định trong controller; cần đưa cả cấu hình cơ sở vào
`SystemSettings`/`FacilitySettings`.

### 27.4. Flow xem tồn và cảnh báo hạn dùng

**Đã làm:**

- `GET /api/inventory/stock`: tổng hợp tồn theo item và chi tiết từng lô.
- Loại lô hết hạn khỏi tồn khả dụng.
- `lowStockOnly` lọc theo `TonToiThieu`.
- `GET /api/inventory/stock/alerts`: trả các lô sắp/hết hạn theo số ngày cấu hình.
- FEFO dùng hạn dùng tăng dần; lô không có hạn dùng được xếp sau lô có hạn dùng.

**File:** `ClinicManagement.API/Controllers/InventoryController.cs`,
`ClinicManagement.API/Controllers/Kho/TonKho.InventoryController.cs`,
`ClinicManagement.Application/Features/Kho/Queries/LayTonKho/LayTonKhoQueryHandler.cs`,
`ClinicManagement.Application/Features/Kho/Queries/LayCanhBaoKho/LayCanhBaoKhoQueryHandler.cs`,
`ClinicManagement.Application/Features/Kho/CatalogStock.KhoService.cs`,
`ClinicManagement.Domain/Inventory/TonKho.cs`,
`ClinicManagement.Infrastructure/Persistence/Configurations/TonKhoConfiguration.cs`.

### 27.5. Flow kê đơn thuốc

**Đã làm:**

- `POST /api/luot-kham/{luotKhamId}/don-thuoc`.
- `PUT /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/items`.
- `POST /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/approve`.
- `POST /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/cancel`.
- `GET /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}`.
- Chỉ kê khi `LuotKham = DANG_KHAM`.
- Chỉ item `IsActive` và `CanKeDon` mới được kê.
- Chặn item trùng trong một đơn.
- Tự lấy `Item.GiaBanLe` nếu không truyền `donGiaKe`.
- Map `DA_DUYET` trong Domain ra `CHO_CAP_PHAT` ở response API.
- Chặn nhiều đơn cùng lượt khám ở trạng thái chờ cấp phát.

**File:** `ClinicManagement.API/Controllers/PrescriptionController.cs`,
`ClinicManagement.Domain/Prescription/DonThuoc/DonThuoc.cs`,
`ClinicManagement.AdminUI/src/examination/api/examination.api.ts`.

**Chưa hoàn thiện:** chưa ghi audit ledger riêng khi hủy đơn; kiểm tra người duyệt hiện dựa trên
user ID và cần hoàn thiện cơ chế ủy quyền nếu nghiệp vụ cho phép.

### 27.6. Flow cấp phát thuốc theo đơn (FEFO)

**Đã làm:**

- `GET /api/inventory/prescriptions/pending`.
- `POST /api/inventory/prescriptions/{prescriptionId}/dispense`.
- Chỉ cấp đơn `DA_DUYET`.
- Tự phân bổ các lô còn hạn theo FEFO.
- Không xuất một phần nếu tổng tồn không đủ.
- Trừ `TonKho`, tạo `PhieuXuatKho` loại `XUAT_DON`, cập nhật `SoLuongDaXuat`,
  chuyển đơn sang `DA_XUAT_HET` và ghi giao dịch `XUAT_DON`.
- Các thao tác chính nằm trong một database transaction.

**File:** `ClinicManagement.API/Controllers/InventoryController.cs`,
`ClinicManagement.API/Controllers/Kho/CapPhat.InventoryController.cs`,
`ClinicManagement.Application/Features/Kho/Queries/LayDonChoCapPhat/LayDonChoCapPhatQueryHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/CapPhatDon/CapPhatDonCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/ImportDispensing.KhoService.cs`,
`ClinicManagement.Domain/Inventory/PhieuXuatKho/PhieuXuatKho.cs`,
`ClinicManagement.Domain/Prescription/DonThuoc/ChiTietDonThuoc.cs`.

**Chưa hoàn thiện:** `expectedVersion` mới được kiểm tra ở request cấp phát nhưng chưa triển khai
đầy đủ cho mọi lô đã khóa; cần bổ sung xử lý `DbUpdateConcurrencyException` thành mã
`CONCURRENCY_CONFLICT`.

### 27.7. Flow bán lẻ và xuất dùng thủ thuật

**Đã làm:**

- `POST /api/inventory/exports/retail`.
- `POST /api/inventory/exports/internal-use`.
- Dùng chung thuật toán FEFO, kiểm tra đủ tồn và ghi phiếu xuất/giao dịch.
- Hỗ trợ đơn vị quy đổi và giá bán thực tế ở request bán lẻ.
- Bắt buộc `VisitId` và đơn thuốc đã duyệt; không hỗ trợ bán cho khách vãng lai.
- Tạo `HoaDon`, chi tiết hóa đơn và `PhieuThu` khi có thanh toán trong cùng transaction.
- Có `idempotencyKey`.

**File:** `ClinicManagement.API/Controllers/InventoryController.cs`,
`ClinicManagement.API/Controllers/Kho/XuatKho.InventoryController.cs`,
`ClinicManagement.Application/Features/Kho/Commands/BanLe/BanLeCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/XuatNoiBo/XuatNoiBoCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/RetailExports.KhoService.cs`,
`ClinicManagement.Domain/Billing/HoaDon/HoaDon.cs`.

**Chưa hoàn thiện:** chưa tích hợp cổng thanh toán bên ngoài; thanh toán hiện được ghi nhận
trực tiếp qua nghiệp vụ hóa đơn/phiếu thu. Chưa có bước phân quyền riêng cho sửa giá bán.

### 27.8. Flow trả hàng, xuất hủy và hoàn thuốc bệnh nhân

**Đã làm:**

- `POST /api/inventory/returns`.
- `POST /api/inventory/write-offs`.
- `POST /api/inventory/returns/patient`.
- Kiểm tra lô tồn và không cho số lượng âm/vượt tồn.
- Hoàn bệnh nhân chỉ cộng tồn khi `condition = SEALED`; trường hợp khác ghi giao dịch `HUY`.
- Ghi giao dịch audit cho các biến động tồn.

**File:** `ClinicManagement.API/Controllers/InventoryController.cs`,
`ClinicManagement.API/Controllers/Kho/XuatKho.InventoryController.cs`,
`ClinicManagement.API/Controllers/Kho/HoanTra.InventoryController.cs`,
`ClinicManagement.Application/Features/Kho/Commands/TraNhaCungCap/TraNhaCungCapCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/HuyTon/HuyTonCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/HoanThuocBenhNhan/HoanThuocBenhNhanCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/MutationsReturns.KhoService.cs`.

**Chưa hoàn thiện:** trả NCC hiện mới trừ tồn và ghi ledger, chưa tạo đầy đủ `PhieuXuatKho` cùng
thông tin NCC; cần bổ sung chứng từ trả NCC trước khi đưa vào vận hành chính thức.

### 27.9. Flow kiểm kê và điều chỉnh

**Đã làm:**

- `POST /api/inventory/stocktakes`.
- `PUT /api/inventory/stocktakes/{id}/count`.
- `POST /api/inventory/stocktakes/{id}/submit`.
- `POST /api/inventory/stocktakes/{id}/approve`.
- `POST /api/inventory/stocktakes/{id}/finalize` dùng cùng logic approve để tương thích contract cũ.
- Tính chênh lệch giữa số hệ thống và số thực tế.
- Sinh giao dịch `DIEU_CHINH` tăng/giảm và cập nhật tồn trong transaction.

**File:** `ClinicManagement.API/Controllers/InventoryController.cs`,
`ClinicManagement.API/Controllers/Kho/KiemKe.InventoryController.cs`,
`ClinicManagement.Application/Features/Kho/Commands/TaoKiemKe/TaoKiemKeCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/GhiNhanKiemKe/GhiNhanKiemKeCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/TrinhDuyetKiemKe/TrinhDuyetKiemKeCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/DuyetKiemKe/DuyetKiemKeCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/Commands/ChotKiemKe/ChotKiemKeCommandHandler.cs`,
`ClinicManagement.Application/Features/Kho/StocktakeAudit.KhoService.cs`,
`ClinicManagement.Domain/Inventory/Stocktake.cs`,
`ClinicManagement.Domain/Inventory/StocktakeCount.cs`.

**Chưa hoàn thiện:** chưa gắn policy `inventory.stocktake.approve`; cần ngăn việc gửi đồng thời
hai request approve cùng một đợt kiểm kê bằng concurrency/idempotency ở mức database.

### 27.10. Flow sổ cái giao dịch và idempotency

**Đã làm:**

- `GET /api/inventory/audit-transactions`.
- Lưu item, lô, số lượng trước/thay đổi/sau, chứng từ, người thực hiện và thời điểm.
- `InventoryTransaction` có query filter soft-delete kế thừa từ `BaseEntity`; không cung cấp API xóa.
- `IdempotencyRecord` lưu response để trả lại kết quả khi frontend retry.
- Các flow nhập, cấp phát, bán/xuất, kiểm kê và hoàn bệnh nhân nhận `idempotencyKey`.

**File:** `ClinicManagement.Domain/Inventory/InventoryTransaction.cs`,
`ClinicManagement.Domain/Inventory/IdempotencyRecord.cs`,
`ClinicManagement.Infrastructure/Persistence/Configurations/InventoryTransactionConfiguration.cs`,
`ClinicManagement.Infrastructure/Persistence/Configurations/IdempotencyRecordConfiguration.cs`,
`ClinicManagement.API/Controllers/InventoryController.cs`,
`ClinicManagement.API/Controllers/Kho/Audit.InventoryController.cs`,
`ClinicManagement.Application/Features/Kho/Queries/TraCuuGiaoDichKho/TraCuuGiaoDichKhoQueryHandler.cs`,
`ClinicManagement.Application/Features/Kho/SharedHelpers.KhoService.cs`.

**Chưa hoàn thiện:** cần bổ sung cơ chế claim key nguyên tử (unique insert/lock) để chống hai request
đồng thời cùng key trước khi triển khai production; cần ghi thêm `AuditLog` cho thay đổi giá, hủy
đơn và thay đổi danh mục.

### 27.11. Database và migration

**Đã làm:**

- Đăng ký các `DbSet` mới trong `ClinicDbContext`.
- Thêm EF configurations cho giao dịch, idempotency và kiểm kê.
- Tạo migration `20260907054037_AddPharmacyInventoryFlow`.
- Cập nhật model snapshot.
- Cấu hình kho mặc định qua `Inventory:DefaultWarehouseId`.

**File:**

- `ClinicManagement.Infrastructure/Persistence/ClinicDbContext.cs`
- `ClinicManagement.Infrastructure/Persistence/Configurations/InventoryTransactionConfiguration.cs`
- `ClinicManagement.Infrastructure/Persistence/Configurations/IdempotencyRecordConfiguration.cs`
- `ClinicManagement.Infrastructure/Persistence/Configurations/StocktakeConfiguration.cs`
- `ClinicManagement.Infrastructure/Migrations/20260907054037_AddPharmacyInventoryFlow.cs`
- `ClinicManagement.Infrastructure/Migrations/20260907054037_AddPharmacyInventoryFlow.Designer.cs`
- `ClinicManagement.Infrastructure/Migrations/ClinicDbContextModelSnapshot.cs`
- `ClinicManagement.API/appsettings.json`

### 27.12. Refactor Application layer

Đã tách `InventoryController` thành lớp adapter HTTP mỏng và các partial controller theo
nhóm hành vi. Controller chỉ bind request, gọi MediatR và chuyển `InventoryResult` thành
HTTP response; logic xử lý flow nằm trong Application.

Application sử dụng command/query handler, DTO typed và `IKhoService`. `KhoService` được
tách thành các partial file theo nghiệp vụ. Application chỉ phụ thuộc `IKhoRepository`;
Infrastructure cung cấp `KhoRepository`, transaction adapter và đăng ký DI với
`ClinicDbContext`.

**File:**

- `ClinicManagement.API/Controllers/InventoryController.cs`
- `ClinicManagement.API/Controllers/Kho/`
- `ClinicManagement.Application/Features/Kho/Commands/`
- `ClinicManagement.Application/Features/Kho/Queries/`
- `ClinicManagement.Application/Features/Kho/KhoService.cs`
- `ClinicManagement.Application/Features/Kho/CatalogStock.KhoService.cs`
- `ClinicManagement.Application/Features/Kho/ImportDispensing.KhoService.cs`
- `ClinicManagement.Application/Features/Kho/RetailExports.KhoService.cs`
- `ClinicManagement.Application/Features/Kho/MutationsReturns.KhoService.cs`
- `ClinicManagement.Application/Features/Kho/StocktakeAudit.KhoService.cs`
- `ClinicManagement.Application/Features/Kho/SharedHelpers.KhoService.cs`
- `ClinicManagement.Application/Common/Interfaces/IKhoService.cs`
- `ClinicManagement.Domain/Repositories/IKhoRepository.cs`
- `ClinicManagement.Infrastructure/Persistence/Repositories/KhoRepository.cs`
- `ClinicManagement.Infrastructure/DependencyInjection.cs`

Đã kiểm tra bằng `dotnet build ClinicManagement.slnx --no-restore`: build thành công,
không có warning hoặc error.

**Trạng thái:** migration đã tạo nhưng chưa chạy `dotnet ef database update`.

### 27.12. AdminUI

**Đã làm:**

- Màn hình pharmacy gọi API thật cho duyệt đơn, cấp phát và hủy đơn.
- Sau thao tác thành công, tải lại danh sách đơn.
- Cấp phát gửi `idempotencyKey`.

**File:**

- `ClinicManagement.AdminUI/src/examination/api/examination.api.ts`
- `ClinicManagement.AdminUI/src/examination/components/ExaminationPharmacy.tsx`

**Chưa hoàn thiện:** chưa có UI cho nhập kho, tồn kho theo lô, bán lẻ, xuất thủ thuật, trả hàng,
kiểm kê và audit ledger; các nút lỗi cũng cần bổ sung thông báo chuẩn theo response API.

### 27.13. Validation đã thực hiện

- `dotnet build ClinicManagement.slnx --no-restore`: **thành công**, còn warning có sẵn ngoài phạm vi
  kho dược.
- `cd ClinicManagement.AdminUI && npm run build`: **thành công**.
- Kiểm tra Problems cho các controller mới: **không có lỗi compile**.
- `git diff --check`: **không còn lỗi whitespace**.

### 27.14. Việc cần làm trước khi production

1. Chạy migration trên database đúng môi trường và kiểm tra dữ liệu NCC cũ khi chuyển kiểu trạng thái.
2. Đưa cả `DefaultWarehouseId` và `DefaultFacilityId` vào cấu hình nghiệp vụ.
3. Hoàn thiện claim idempotency nguyên tử và xử lý concurrency 409.
4. Bổ sung authorization policy theo các quyền trong mục 14.
5. Tạo `HoaDon`/`PhieuThu` cho bán lẻ và quy trình đối soát thanh toán.
6. Tạo chứng từ trả NCC đầy đủ.
7. Bổ sung unit/integration tests cho FEFO, rollback, retry cùng key, hết hạn, thiếu tồn và kiểm kê.
8. Hoàn thiện các màn hình AdminUI còn thiếu.