# Hướng dẫn thêm dữ liệu mẫu Billing để test UI

Tài liệu này dùng để tạo nhanh dữ liệu mẫu cho module **Quản lý Tài chính & Viện phí** trên SQL Server, sau đó kiểm tra các tab:

- **Hóa đơn viện phí**: danh sách, lọc trạng thái, xem chi tiết, in hóa đơn.
- **Phiếu thu tiền**: tra cứu phiếu thu theo `Id` hóa đơn.
- **Quản lý công nợ**: công nợ quá hạn và công nợ theo bệnh nhân.

> Chỉ sử dụng script này cho môi trường local/dev. Không chạy trên production.

## 1. Điều kiện trước khi chạy

1. Đã chạy migration mới nhất cho database `ClinicManagementDb`.
2. Đã có sẵn ít nhất:
   - 01 bản ghi trong `CoSo`, thường là `Id = 1`.
   - 03 bệnh nhân trong `BenhNhan`.
   - 03 lượt khám trong `LuotKham`, thuộc cùng cơ sở và có bệnh nhân hợp lệ.
   - 01 nhân viên trong `NhanVien`, dùng làm người tạo và người thu.
3. API đang chạy đúng database mà script sẽ cập nhật.
4. Tài khoản đăng nhập UI có quyền truy cập Billing và token còn hạn.

UI hiện gọi danh sách hóa đơn với `facilityId = 1`. Nếu dữ liệu được tạo ở cơ sở khác, cần đổi `@MaCoSo` trong script và cập nhật cách chọn cơ sở của UI trước khi test.

## 2. Trạng thái và công thức nghiệp vụ

Các giá trị enum được lưu dạng chuỗi:

| Bảng | Trạng thái |
|---|---|
| `HoaDon` | `CHO_THANH_TOAN`, `THANH_TOAN_MOT_PHAN`, `DA_THANH_TOAN`, `DA_HUY` |
| `CongNoBenhNhan` | `DANG_NO`, `DA_TAT_TOAN`, `QUA_HAN` |
| `PhieuThu.PhuongThuc` | `TIEN_MAT`, `CHUYEN_KHOAN`, `THE`, `BAO_HIEM` |

Các số tiền phải khớp:

```text
TongTien = tổng ThanhTien của ChiTietHoaDon
SoTienBenhNhanChiTra = TongTien - SoTienBaoHiemChiTra
SoTienConLai = SoTienBenhNhanChiTra - DaThanhToan
CongNo.SoTienNo = SoTienBenhNhanChiTra
CongNo.SoTienDaTra = DaThanhToan
```

Không nhập `SoTienConLai` vào database vì đây là giá trị tính toán từ domain/DTO.

## 3. Script tạo đầy đủ kịch bản mẫu

Script dưới đây lấy bảy lượt khám khác nhau trong cơ sở `1` và tạo:

| Kịch bản | Hóa đơn | BHYT | Đã thu | Công nợ |
|---|---|---:|---:|---|
| 1 | Chờ thanh toán | 100.000 | 0 | Quá hạn |
| 2 | Thanh toán một phần | 200.000 | 250.000 | Quá hạn |
| 3 | Đã thanh toán | 0 | Đủ số tiền bệnh nhân trả | Đã tất toán |
| 4 | Chờ thanh toán | 0 (áp dụng qua UI) | 0 | Chưa quá hạn |
| 5 | Đã thanh toán | 300.000 | 0 | Đã tất toán nhờ BHYT toàn phần |
| 6 | Thanh toán một phần | 0 | 300.000 qua 2 phiếu thu | Đang nợ, chưa quá hạn |
| 7 | Đã hủy | 0 | 0 | Không còn công nợ phải thu |

Nếu database không có đủ bảy lượt khám hợp lệ, script sẽ dừng và báo lỗi.

```sql
USE ClinicManagementDb;
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @MaCoSo int = 1;
DECLARE @MaNguoiThucHien int;
DECLARE @Now datetime2 = SYSUTCDATETIME();

SELECT TOP (1) @MaNguoiThucHien = Id
FROM NhanVien
WHERE IsDeleted = 0
ORDER BY Id;

IF @MaNguoiThucHien IS NULL
    THROW 51000, N'Không tìm thấy nhân viên để gán CreatedBy/MaNguoiThu.', 1;

IF NOT EXISTS (SELECT 1 FROM CoSo WHERE Id = @MaCoSo)
    THROW 51001, N'Không tìm thấy cơ sở được chọn.', 1;

DECLARE @Visits TABLE
(
    ScenarioNo int NOT NULL PRIMARY KEY,
    MaLuotKham int NOT NULL,
    MaBenhNhan int NOT NULL
);

INSERT INTO @Visits (ScenarioNo, MaLuotKham, MaBenhNhan)
SELECT
    ROW_NUMBER() OVER (ORDER BY l.Id),
    l.Id,
    l.MaBenhNhan
FROM LuotKham l
WHERE l.MaCoSo = @MaCoSo
  AND l.IsDeleted = 0
  AND EXISTS
  (
      SELECT 1
      FROM BenhNhan bn
      WHERE bn.Id = l.MaBenhNhan
        AND bn.IsDeleted = 0
  )
  AND NOT EXISTS
  (
      SELECT 1
      FROM HoaDon hd
      WHERE hd.MaLuotKham = l.Id
        AND hd.IsDeleted = 0
  );

IF (SELECT COUNT(*) FROM @Visits) < 7
    THROW 51002, N'Cần ít nhất 7 lượt khám chưa có hóa đơn trong cơ sở đã chọn.', 1;

DECLARE @ScenarioNo int = 1;
DECLARE @MaLuotKham int;
DECLARE @MaBenhNhan int;
DECLARE @HoaDonId int;
DECLARE @SoHoaDon nvarchar(50);
DECLARE @TongTien decimal(18,2);
DECLARE @BHYT decimal(18,2);
DECLARE @DaThanhToan decimal(18,2);
DECLARE @TrangThai nvarchar(20);
DECLARE @TrangThaiCongNo nvarchar(30);
DECLARE @HanThanhToan datetime2;

WHILE @ScenarioNo <= 7
BEGIN
    SELECT
        @MaLuotKham = MaLuotKham,
        @MaBenhNhan = MaBenhNhan
    FROM @Visits
    WHERE ScenarioNo = @ScenarioNo;

    SET @TongTien =
        CASE @ScenarioNo
            WHEN 1 THEN 650000
            WHEN 2 THEN 900000
            WHEN 3 THEN 420000
            WHEN 4 THEN 700000
            WHEN 5 THEN 300000
            WHEN 6 THEN 800000
            ELSE 500000
        END;

    SET @BHYT =
        CASE @ScenarioNo
            WHEN 1 THEN 100000
            WHEN 2 THEN 200000
            WHEN 3 THEN 0
            WHEN 4 THEN 0
            WHEN 5 THEN 300000
            ELSE 0
        END;

    SET @DaThanhToan =
        CASE @ScenarioNo
            WHEN 1 THEN 0
            WHEN 2 THEN 250000
            WHEN 3 THEN @TongTien - @BHYT
            WHEN 4 THEN 0
            WHEN 5 THEN 0
            WHEN 6 THEN 300000
            ELSE 0
        END;

    SET @TrangThai =
        CASE @ScenarioNo
            WHEN 1 THEN N'CHO_THANH_TOAN'
            WHEN 2 THEN N'THANH_TOAN_MOT_PHAN'
            WHEN 3 THEN N'DA_THANH_TOAN'
            WHEN 4 THEN N'CHO_THANH_TOAN'
            WHEN 5 THEN N'DA_THANH_TOAN'
            WHEN 6 THEN N'THANH_TOAN_MOT_PHAN'
            ELSE N'DA_HUY'
        END;

    SET @TrangThaiCongNo =
        CASE @ScenarioNo
            WHEN 1 THEN N'QUA_HAN'
            WHEN 2 THEN N'QUA_HAN'
            WHEN 3 THEN N'DA_TAT_TOAN'
            WHEN 4 THEN N'DANG_NO'
            WHEN 5 THEN N'DA_TAT_TOAN'
            WHEN 6 THEN N'DANG_NO'
            ELSE N'DA_TAT_TOAN'
        END;

    SET @HanThanhToan =
        CASE @ScenarioNo
            WHEN 1 THEN DATEADD(DAY, -1, @Now)
            WHEN 2 THEN DATEADD(DAY, -7, @Now)
            ELSE DATEADD(DAY, 30, @Now)
        END;

    SET @SoHoaDon = CONCAT(
        N'HD-UI-', CONVERT(char(8), GETUTCDATE(), 112), N'-', @ScenarioNo, N'-',
        RIGHT(CONVERT(varchar(36), NEWID()), 6));

    INSERT INTO HoaDon
    (
        SoHoaDon, MaLuotKham, MaBenhNhan, MaCoSo, NgayLap,
        TongTien, SoTienBaoHiemChiTra, SoTienBenhNhanChiTra,
        DaThanhToan, TrangThai, GhiChu, CreatedBy, CreatedAt,
        IsDeleted
    )
    VALUES
    (
        @SoHoaDon, @MaLuotKham, @MaBenhNhan, @MaCoSo, @Now,
        @TongTien, @BHYT, @TongTien - @BHYT,
        @DaThanhToan, @TrangThai,
        CONCAT(N'Dữ liệu mẫu Billing UI - kịch bản ', @ScenarioNo),
        @MaNguoiThucHien, @Now, 0
    );

    SET @HoaDonId = CONVERT(int, SCOPE_IDENTITY());

    INSERT INTO ChiTietHoaDon
    (
        MaHoaDon, LoaiDoiTuong, MaDoiTuong, MoTa,
        SoLuong, DonGia, CreatedBy, CreatedAt, IsDeleted
    )
    VALUES
    (@HoaDonId, N'DICH_VU', 9001, N'Khám và tư vấn tổng quát', 1, @TongTien * 0.4,
     @MaNguoiThucHien, @Now, 0),
    (@HoaDonId, N'THUOC', 9002, N'Thuốc mẫu phục vụ kiểm thử Billing', 1, @TongTien * 0.6,
     @MaNguoiThucHien, @Now, 0);

    INSERT INTO CongNoBenhNhan
    (
        MaBenhNhan, MaHoaDon, SoTienNo, SoTienDaTra,
        HanThanhToan, TrangThai, CreatedBy, CreatedAt, IsDeleted
    )
    VALUES
    (
        @MaBenhNhan, @HoaDonId,
        CASE WHEN @ScenarioNo = 7 THEN 0 ELSE @TongTien - @BHYT END,
        @DaThanhToan,
        @HanThanhToan, @TrangThaiCongNo, @MaNguoiThucHien, @Now, 0
    );

    IF @DaThanhToan > 0
    BEGIN
        INSERT INTO PhieuThu
        (
            SoPhieuThu, MaBenhNhan, MaLuotKham, MaHoaDon, SoTien,
            NgayThu, PhuongThuc, MaNguoiThu, GhiChu,
            CreatedBy, CreatedAt, IsDeleted
        )
        VALUES
        (
            CONCAT(N'PT-UI-', CONVERT(char(8), GETUTCDATE(), 112), N'-', @ScenarioNo, N'-',
                   RIGHT(CONVERT(varchar(36), NEWID()), 6)),
            @MaBenhNhan, @MaLuotKham, @HoaDonId,
            CASE WHEN @ScenarioNo = 6 THEN 150000 ELSE @DaThanhToan END,
            @Now, CASE @ScenarioNo WHEN 2 THEN N'CHUYEN_KHOAN' ELSE N'TIEN_MAT' END,
            @MaNguoiThucHien, N'Phiếu thu mẫu để kiểm thử UI',
            @MaNguoiThucHien, @Now, 0
        );

        IF @ScenarioNo = 6
        BEGIN
            INSERT INTO PhieuThu
            (
                SoPhieuThu, MaBenhNhan, MaLuotKham, MaHoaDon, SoTien,
                NgayThu, PhuongThuc, MaNguoiThu, GhiChu,
                CreatedBy, CreatedAt, IsDeleted
            )
            VALUES
            (
                CONCAT(N'PT-UI-', CONVERT(char(8), GETUTCDATE(), 112), N'-6B-',
                       RIGHT(CONVERT(varchar(36), NEWID()), 6)),
                @MaBenhNhan, @MaLuotKham, @HoaDonId, 150000,
                DATEADD(MINUTE, 5, @Now), N'TIEN_MAT', @MaNguoiThucHien,
                N'Phiếu thu mẫu lần 2 để kiểm thử thanh toán nhiều lần',
                @MaNguoiThucHien, @Now, 0
            );
        END;
    END;

    SELECT @ScenarioNo = @ScenarioNo + 1;
END;

COMMIT TRANSACTION;
GO
```

## 4. Kiểm tra dữ liệu sau khi chạy

Chạy truy vấn sau để lấy các hóa đơn mẫu:

```sql
SELECT
    hd.Id,
    hd.SoHoaDon,
    hd.MaLuotKham,
    hd.MaBenhNhan,
    hd.TongTien,
    hd.SoTienBaoHiemChiTra,
    hd.SoTienBenhNhanChiTra,
    hd.DaThanhToan,
    hd.TrangThai,
    hd.CreatedAt
FROM HoaDon hd
WHERE hd.GhiChu LIKE N'Dữ liệu mẫu Billing UI%'
  AND hd.IsDeleted = 0
ORDER BY hd.Id DESC;
```

Kiểm tra chi tiết, công nợ và phiếu thu:

```sql
SELECT * FROM ChiTietHoaDon
WHERE MaHoaDon IN
(
    SELECT Id FROM HoaDon
    WHERE GhiChu LIKE N'Dữ liệu mẫu Billing UI%' AND IsDeleted = 0
);

SELECT * FROM CongNoBenhNhan
WHERE MaHoaDon IN
(
    SELECT Id FROM HoaDon
    WHERE GhiChu LIKE N'Dữ liệu mẫu Billing UI%' AND IsDeleted = 0
);

SELECT * FROM PhieuThu
WHERE MaHoaDon IN
(
    SELECT Id FROM HoaDon
    WHERE GhiChu LIKE N'Dữ liệu mẫu Billing UI%' AND IsDeleted = 0
);
```

## 5. Cách kiểm thử trên UI

### Tab Hóa đơn viện phí

1. Đăng nhập lại để lấy token mới.
2. Mở `/invoices` hoặc menu **Quản lý Tài chính & Viện phí**.
3. Kiểm tra có bảy hóa đơn mẫu.
4. Lọc lần lượt:
   - `CHO_THANH_TOAN`: kiểm tra hóa đơn kịch bản 1.
   - `THANH_TOAN_MOT_PHAN`: kiểm tra kịch bản 2.
   - `DA_THANH_TOAN`: kiểm tra kịch bản 3.
   - `DA_HUY`: kiểm tra kịch bản 7.
5. Mở chi tiết:
   - Tổng chi phí.
   - BHYT chi trả.
   - Số tiền bệnh nhân phải trả.
   - Đã thanh toán.
   - Còn nợ.
   - Hai dòng dịch vụ/thuốc.
6. Bấm **In hóa đơn** để kiểm tra modal in.
7. Kiểm tra thêm:
   - Kịch bản 4 còn nợ nhưng chưa xuất hiện trong danh sách quá hạn; dùng kịch bản này để thử **Áp dụng BHYT**.
   - Kịch bản 5 đã thanh toán dù bệnh nhân không phải trả tiền do BHYT toàn phần.
   - Kịch bản 6 có hai phiếu thu, tổng cộng 300.000 đồng.
   - Kịch bản 7 không cho phép thu tiền và hiển thị trạng thái đã hủy.

### Tab Phiếu thu tiền

1. Lấy `Id` của hóa đơn kịch bản 2, 3 hoặc 6 từ truy vấn kiểm tra.
2. Nhập `Id` vào ô tìm kiếm.
3. Kiểm tra số phiếu, ngày thu, phương thức và số tiền.
4. Hóa đơn kịch bản 1, 4, 5 và 7 không có phiếu thu, nên kết quả rỗng là đúng.

### Tab Quản lý công nợ

1. Chọn **Công nợ quá hạn**.
2. Kiểm tra kịch bản 1 và 2 xuất hiện vì hạn thanh toán đã qua.
3. Kịch bản 4 và 6 không được xuất hiện vì chưa quá hạn; kịch bản 5 đã tất toán và kịch bản 7 đã hủy.
4. Chọn **Theo bệnh nhân**, nhập `MaBenhNhan` của một hóa đơn mẫu.
5. Kiểm tra số tiền nợ, đã trả, còn lại và trạng thái.

### Các thao tác ghi dữ liệu

Thực hiện theo thứ tự dưới đây để kiểm tra các command của Billing:

1. **Áp dụng BHYT**: mở kịch bản 4, áp dụng `150000`; xác nhận `soTienBaoHiemChiTra`,
   `soTienBenhNhanChiTra` và số tiền còn nợ giảm tương ứng.
2. **Thanh toán một phần**: mở kịch bản 1, thu một phần bằng tiền mặt; xác nhận hóa đơn
   chuyển sang `THANH_TOAN_MOT_PHAN`, phát sinh một phiếu thu và còn nợ đúng số tiền.
3. **Thanh toán nhiều lần**: mở kịch bản 6; xác nhận đã có hai phiếu thu, sau đó thu tiếp
   phần còn lại và kiểm tra trạng thái chuyển sang `DA_THANH_TOAN`.
4. **Không cho thanh toán vượt mức**: thử thu lớn hơn số tiền còn nợ ở kịch bản 2;
   UI phải hiển thị lỗi và không tạo thêm phiếu thu.
5. **Hủy hóa đơn**: mở kịch bản 4 (trước khi thanh toán), hủy với lý do; kiểm tra trạng thái
   `DA_HUY`, không thể thu tiền và hóa đơn vẫn xem/in được.
6. **Không cho hủy hóa đơn đã thu**: thử hủy kịch bản 2 hoặc 6; UI phải hiển thị lỗi.

Nếu sau thao tác BHYT, số dư `CongNoBenhNhan` không giảm theo số BHYT mới,
đó là lỗi đồng bộ backend cần ghi nhận, không phải lỗi dữ liệu mẫu.

## 6. Kiểm thử API tương ứng

Thay `{id}` bằng `HoaDon.Id`, `{patientId}` bằng `MaBenhNhan` và dùng Bearer token mới:

```text
GET  https://localhost:7081/api/billing/invoices?facilityId=1&pageIndex=1&pageSize=20
GET  https://localhost:7081/api/billing/invoices/{id}
GET  https://localhost:7081/api/billing/invoices/{id}/payments
GET  https://localhost:7081/api/billing/debts/by-patient/{patientId}
GET  https://localhost:7081/api/billing/debts/overdue?facilityId=1
POST https://localhost:7081/api/billing/invoices/{id}/insurance
POST https://localhost:7081/api/billing/invoices/{id}/payments
POST https://localhost:7081/api/billing/invoices/{id}/cancel
```

Response danh sách phải có `totalCount`, `items` và mỗi item phải có `soTienConLai`.

Payload mẫu:

```json
// Áp dụng BHYT
{ "soTienBaoHiem": 150000 }

// Thu tiền
{ "soTien": 100000, "phuongThuc": "TIEN_MAT", "ghiChu": "Thu lần 1" }

// Hủy hóa đơn
{ "lyDoHuy": "Dữ liệu test UI" }
```

## 7. Dọn dữ liệu mẫu

Chỉ xóa các bản ghi do script tạo, theo thứ tự bảng con trước bảng cha:

```sql
USE ClinicManagementDb;
GO

BEGIN TRANSACTION;

DELETE FROM PhieuThu
WHERE GhiChu = N'Phiếu thu mẫu để kiểm thử UI'
  AND MaHoaDon IN
  (
      SELECT Id FROM HoaDon
      WHERE GhiChu LIKE N'Dữ liệu mẫu Billing UI%'
  );

DELETE FROM CongNoBenhNhan
WHERE MaHoaDon IN
(
    SELECT Id FROM HoaDon
    WHERE GhiChu LIKE N'Dữ liệu mẫu Billing UI%'
);

DELETE FROM ChiTietHoaDon
WHERE MaHoaDon IN
(
    SELECT Id FROM HoaDon
    WHERE GhiChu LIKE N'Dữ liệu mẫu Billing UI%'
);

DELETE FROM HoaDon
WHERE GhiChu LIKE N'Dữ liệu mẫu Billing UI%';

COMMIT TRANSACTION;
GO
```

Không xóa `BenhNhan`, `LuotKham`, `NhanVien` hoặc `CoSo` dùng làm dữ liệu nền.

## 8. Lưu ý quan trọng

- Script tạo trực tiếp dữ liệu SQL để phục vụ test UI; nghiệp vụ thực tế nên tạo hóa đơn qua application command/API khi flow tạo hóa đơn gộp được triển khai.
- Không dùng cùng một `MaLuotKham` cho nhiều hóa đơn mẫu trong cùng lần chạy.
- Không đặt `CreatedBy` hoặc `MaNguoiThu` là `NULL`; các cột này liên kết với nhân viên và có thể gây lỗi insert.
- Nếu API trả `401`, token đã hết hạn hoặc frontend đang dùng token cũ; đăng xuất và đăng nhập lại.
- Nếu API trả rỗng, kiểm tra `facilityId`, `IsDeleted = 0`, cơ sở của lượt khám và trạng thái dữ liệu.
