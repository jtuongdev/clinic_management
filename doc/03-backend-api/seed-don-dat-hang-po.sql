-- =========================================================================================
-- KỊCH BẢN SQL: KIỂM TRA SCHEMA & NẠP DỮ LIỆU MẪU ĐƠN ĐẶT HÀNG (PURCHASE ORDER - PO)
-- Hệ thống: HIS & Pharmacy ERP - Clinic Management
-- Mục đích: Nạp dữ liệu đơn đặt hàng đúng với danh mục Thuốc (THUOC) & Vật tư (VT) hiện tại
-- =========================================================================================

USE ClinicManagementDb;
GO

SET NOCOUNT ON;

PRINT N'=========================================================================';
PRINT N'BƯỚC 1: KIỂM TRA SCHEMA BẢNG VÀ CỘT MỚI TẠO TỪ MIGRATION';
PRINT N'=========================================================================';

-- 1.1. Kiểm tra tồn tại của bảng DonDatHang và ChiTietDonDatHang
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'DonDatHang')
    PRINT N'✅ Bảng DonDatHang: ĐÃ TỒN TẠI';
ELSE
    PRINT N'❌ Bảng DonDatHang: CHƯA TỒN TẠI (Vui lòng kiểm tra lại Migration)';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ChiTietDonDatHang')
    PRINT N'✅ Bảng ChiTietDonDatHang: ĐÃ TỒN TẠI';
ELSE
    PRINT N'❌ Bảng ChiTietDonDatHang: CHƯA TỒN TẠI (Vui lòng kiểm tra lại Migration)';

-- 1.2. Kiểm tra cột khóa ngoại trên PhieuNhapKho và ChiTietNhapKho
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.PhieuNhapKho') AND name = 'MaDonDatHang')
    PRINT N'✅ Cột PhieuNhapKho.MaDonDatHang: ĐÃ TỒN TẠI';
ELSE
    PRINT N'❌ Cột PhieuNhapKho.MaDonDatHang: CHƯA TỒN TẠI';

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ChiTietNhapKho') AND name = 'MaChiTietDonDatHang')
    PRINT N'✅ Cột ChiTietNhapKho.MaChiTietDonDatHang: ĐÃ TỒN TẠI';
ELSE
    PRINT N'❌ Cột ChiTietNhapKho.MaChiTietDonDatHang: CHƯA TỒN TẠI';

PRINT N'';
PRINT N'=========================================================================';
PRINT N'BƯỚC 2: XÁC ĐỊNH KHÓA NGOẠI THỰC TẾ TRONG HỆ THỐNG';
PRINT N'=========================================================================';

DECLARE @CoSoId INT, @KhoId INT, @NhanVienId INT;
DECLARE @NccDuocId INT, @NccVatTuId INT;

-- Lấy Cơ sở hoạt động
SELECT TOP 1 @CoSoId = Id FROM CoSo ORDER BY Id;

-- Lấy Kho tiếp nhận hoạt động
SELECT TOP 1 @KhoId = Id FROM Kho WHERE TrangThai = 1 ORDER BY Id;
IF @KhoId IS NULL SELECT TOP 1 @KhoId = Id FROM Kho ORDER BY Id;

-- Lấy Nhân viên tạo đơn (Dược sĩ / Trưởng kho)
SELECT TOP 1 @NhanVienId = Id FROM NhanVien ORDER BY Id;

-- Lấy Nhà cung cấp Dược
SELECT TOP 1 @NccDuocId = Id FROM NhaCungCap WHERE IsActive = 1 ORDER BY Id;

-- Lấy Nhà cung cấp Vật tư y tế (nếu có nhà cung cấp khác thì chọn, nếu không lấy cùng NCC)
SELECT TOP 1 @NccVatTuId = Id FROM NhaCungCap WHERE IsActive = 1 AND Id <> @NccDuocId ORDER BY Id;
IF @NccVatTuId IS NULL SET @NccVatTuId = @NccDuocId;

PRINT N'-> MaCoSo: ' + CAST(ISNULL(@CoSoId, 0) AS NVARCHAR(10));
PRINT N'-> MaKho: ' + CAST(ISNULL(@KhoId, 0) AS NVARCHAR(10));
PRINT N'-> MaNhanVien: ' + CAST(ISNULL(@NhanVienId, 0) AS NVARCHAR(10));
PRINT N'-> MaNCC Dược: ' + CAST(ISNULL(@NccDuocId, 0) AS NVARCHAR(10));
PRINT N'-> MaNCC Vật tư: ' + CAST(ISNULL(@NccVatTuId, 0) AS NVARCHAR(10));

IF @CoSoId IS NULL OR @KhoId IS NULL OR @NhanVienId IS NULL OR @NccDuocId IS NULL
BEGIN
    RAISERROR(N'Lỗi: Hệ thống chưa có đủ dữ liệu Cơ sở, Kho, Nhân viên hoặc Nhà cung cấp để nạp PO.', 16, 1);
    RETURN;
END

PRINT N'';
PRINT N'=========================================================================';
PRINT N'BƯỚC 3: DỌN DẸP DỮ LIỆU MẪU CŨ NẾU ĐÃ CHẠY TRƯỚC ĐÓ';
PRINT N'=========================================================================';

-- Xóa các đơn đặt hàng mẫu để đảm bảo script có thể chạy lại nhiều lần (idempotent)
DELETE FROM ChiTietDonDatHang WHERE MaDonDatHang IN (SELECT Id FROM DonDatHang WHERE MaDonDatHang IN ('PO-2026-001', 'PO-2026-002', 'PO-2026-003'));
DELETE FROM DonDatHang WHERE MaDonDatHang IN ('PO-2026-001', 'PO-2026-002', 'PO-2026-003');

PRINT N'';
PRINT N'=========================================================================';
PRINT N'BƯỚC 4: NẠP CÁC ĐƠN ĐẶT HÀNG (PO) CHUẨN NGỮ CẢNH HỆ THỐNG';
PRINT N'=========================================================================';

-- -----------------------------------------------------------------------------
-- ĐƠN 1: PO-2026-001 (Trạng thái: DA_DAT - Đã duyệt, gửi NCC, xe hàng chuẩn bị giao)
-- Danh mục: Kháng sinh & Giảm đau tiêu hóa thông dụng
-- -----------------------------------------------------------------------------
INSERT INTO DonDatHang (
    MaDonDatHang, MaCoSo, MaKho, MaNhaCungCap, 
    NgayDat, NgayDuKienGiao, TongTien, TrangThai, 
    MaNguoiDat, GhiChu, CreatedAt, IsDeleted
)
VALUES (
    'PO-2026-001', @CoSoId, @KhoId, @NccDuocId,
    DATEADD(day, -2, SYSUTCDATETIME()), DATEADD(day, 1, SYSUTCDATETIME()), 0, 'DA_DAT',
    @NhanVienId, N'Đơn đặt thuốc Kháng sinh & Giảm đau định kỳ đầu tuần', SYSUTCDATETIME(), 0
);

DECLARE @Po1Id INT = SCOPE_IDENTITY();

-- Nạp chi tiết PO 1 từ các mặt hàng thuốc có sẵn trong bảng Item
-- Ưu tiên các mã: THUOC031 (Augmentin), THUOC032 (Zinnat), THUOC041 (Nexium), THUOC048 (Panadol Extra)
INSERT INTO ChiTietDonDatHang (MaDonDatHang, MaItem, DonViTinh, SoLuongDat, SoLuongDaNhap, DonGiaDat, GhiChu, CreatedAt, IsDeleted)
SELECT 
    @Po1Id,
    Id,
    DonViTinhCoBan,
    CASE 
        WHEN Ma = 'THUOC031' THEN 500.000   -- Augmentin: Đặt 500 viên
        WHEN Ma = 'THUOC032' THEN 400.000   -- Zinnat: Đặt 400 viên
        WHEN Ma = 'THUOC041' THEN 300.000   -- Nexium: Đặt 300 viên
        WHEN Ma = 'THUOC048' THEN 1000.000  -- Panadol Extra: Đặt 1000 viên
        ELSE 200.000
    END,
    0.000, -- Số lượng đã nhập = 0 (chưa giao đợt nào)
    ISNULL(GiaBan, 25000.00) * 0.85, -- Đơn giá đặt hợp đồng = 85% giá bán lẻ
    N'Giá thầu theo hợp đồng cung ứng dược số 01/2026',
    SYSUTCDATETIME(),
    0
FROM Item
WHERE Ma IN ('THUOC031', 'THUOC032', 'THUOC041', 'THUOC048') AND IsActive = 1;

-- Fallback nếu không có các mã trên thì lấy 4 thuốc bất kỳ
IF @@ROWCOUNT = 0
BEGIN
    INSERT INTO ChiTietDonDatHang (MaDonDatHang, MaItem, DonViTinh, SoLuongDat, SoLuongDaNhap, DonGiaDat, GhiChu, CreatedAt, IsDeleted)
    SELECT TOP 4
        @Po1Id, Id, DonViTinhCoBan, 300.000, 0.000, ISNULL(GiaBan, 20000.00) * 0.85, N'Hợp đồng cung ứng dược', SYSUTCDATETIME(), 0
    FROM Item WHERE IsActive = 1 AND (LoaiItem = 'THUOC' OR LoaiItem = '1');
END

-- Cập nhật lại tổng tiền PO 1
UPDATE DonDatHang 
SET TongTien = ISNULL((SELECT SUM(SoLuongDat * DonGiaDat) FROM ChiTietDonDatHang WHERE MaDonDatHang = @Po1Id), 0)
WHERE Id = @Po1Id;

PRINT N'✅ Đã tạo PO-2026-001 (DA_DAT) với ID: ' + CAST(@Po1Id AS NVARCHAR(10));


-- -----------------------------------------------------------------------------
-- ĐƠN 2: PO-2026-002 (Trạng thái: GIAO_MOT_PHAN - Đang giao từng phần, ĐÃ NHẬP ĐỢT 1, CÒN THIẾU ĐỢT 2)
-- Rất thích hợp để thử nghiệm tính năng đối soát số lượng và Partial Delivery!
-- Danh mục: Vật tư y tế tiêu hao & Ống lấy máu CLS
-- -----------------------------------------------------------------------------
INSERT INTO DonDatHang (
    MaDonDatHang, MaCoSo, MaKho, MaNhaCungCap, 
    NgayDat, NgayDuKienGiao, TongTien, TrangThai, 
    MaNguoiDat, GhiChu, CreatedAt, IsDeleted
)
VALUES (
    'PO-2026-002', @CoSoId, @KhoId, @NccVatTuId,
    DATEADD(day, -5, SYSUTCDATETIME()), SYSUTCDATETIME(), 0, 'GIAO_MOT_PHAN',
    @NhanVienId, N'Đơn đặt bổ sung vật tư tiêu hao phòng xét nghiệm & thủ thuật (Giao đợt 2)', SYSUTCDATETIME(), 0
);

DECLARE @Po2Id INT = SCOPE_IDENTITY();

-- Nạp chi tiết PO 2 từ các mặt hàng vật tư y tế
-- Mã ưu tiên: VT001 (Bơm tiêm 5ml), VT004 (Kim 2 đầu), VT006 (Ống Serum Gel nắp vàng), VT015 (Urgo), VT019 (Găng tay Vglove)
INSERT INTO ChiTietDonDatHang (MaDonDatHang, MaItem, DonViTinh, SoLuongDat, SoLuongDaNhap, DonGiaDat, GhiChu, CreatedAt, IsDeleted)
SELECT 
    @Po2Id,
    Id,
    DonViTinhCoBan,
    CASE 
        WHEN Ma = 'VT001' THEN 1000.000  -- Đặt 1000 cái bơm tiêm
        WHEN Ma = 'VT004' THEN 1000.000  -- Đặt 1000 kim lấy máu
        WHEN Ma = 'VT006' THEN 800.000   -- Đặt 800 ống serum gel
        WHEN Ma = 'VT015' THEN 1500.000  -- Đặt 1500 miếng Urgo
        WHEN Ma = 'VT019' THEN 600.000   -- Đặt 600 đôi găng tay
        ELSE 500.000
    END,
    CASE 
        WHEN Ma = 'VT001' THEN 500.000   -- Đã giao 500 cái (còn thiếu 500)
        WHEN Ma = 'VT004' THEN 400.000   -- Đã giao 400 kim (còn thiếu 600)
        WHEN Ma = 'VT006' THEN 300.000   -- Đã giao 300 ống (còn thiếu 500)
        WHEN Ma = 'VT015' THEN 800.000   -- Đã giao 800 miếng (còn thiếu 700)
        WHEN Ma = 'VT019' THEN 200.000   -- Đã giao 200 đôi (còn thiếu 400)
        ELSE 200.000
    END,
    CASE 
        WHEN Ma = 'VT001' THEN 850.00
        WHEN Ma = 'VT004' THEN 1200.00
        WHEN Ma = 'VT006' THEN 2500.00
        WHEN Ma = 'VT015' THEN 450.00
        WHEN Ma = 'VT019' THEN 3200.00
        ELSE 1500.00
    END,
    N'Hợp đồng vật tư y tế số 02/2026 - Đang giao đợt 2',
    SYSUTCDATETIME(),
    0
FROM Item
WHERE Ma IN ('VT001', 'VT004', 'VT006', 'VT015', 'VT019') AND IsActive = 1;

-- Fallback nếu không có các mã VT trên thì lấy 4 vật tư bất kỳ
IF @@ROWCOUNT = 0
BEGIN
    INSERT INTO ChiTietDonDatHang (MaDonDatHang, MaItem, DonViTinh, SoLuongDat, SoLuongDaNhap, DonGiaDat, GhiChu, CreatedAt, IsDeleted)
    SELECT TOP 4
        @Po2Id, Id, DonViTinhCoBan, 500.000, 200.000, 2000.00, N'Hợp đồng vật tư y tế', SYSUTCDATETIME(), 0
    FROM Item WHERE IsActive = 1 AND (LoaiItem = 'VA_TU' OR LoaiItem = 'VatTu');
END

-- Cập nhật lại tổng tiền PO 2
UPDATE DonDatHang 
SET TongTien = ISNULL((SELECT SUM(SoLuongDat * DonGiaDat) FROM ChiTietDonDatHang WHERE MaDonDatHang = @Po2Id), 0)
WHERE Id = @Po2Id;

PRINT N'✅ Đã tạo PO-2026-002 (GIAO_MOT_PHAN) với ID: ' + CAST(@Po2Id AS NVARCHAR(10));


-- -----------------------------------------------------------------------------
-- ĐƠN 3: PO-2026-003 (Trạng thái: DA_DAT - Đã duyệt, gửi NCC)
-- Danh mục: Thuốc Tim mạch & Huyết áp mãn tính
-- -----------------------------------------------------------------------------
INSERT INTO DonDatHang (
    MaDonDatHang, MaCoSo, MaKho, MaNhaCungCap, 
    NgayDat, NgayDuKienGiao, TongTien, TrangThai, 
    MaNguoiDat, GhiChu, CreatedAt, IsDeleted
)
VALUES (
    'PO-2026-003', @CoSoId, @KhoId, @NccDuocId,
    DATEADD(day, -1, SYSUTCDATETIME()), DATEADD(day, 2, SYSUTCDATETIME()), 0, 'DA_DAT',
    @NhanVienId, N'Đơn đặt thuốc Tim mạch, Huyết áp & Mỡ máu định kỳ', SYSUTCDATETIME(), 0
);

DECLARE @Po3Id INT = SCOPE_IDENTITY();

-- Nạp chi tiết PO 3: THUOC059 (Concor), THUOC061 (Coversyl), THUOC064 (Plavix), THUOC069 (Crestor)
INSERT INTO ChiTietDonDatHang (MaDonDatHang, MaItem, DonViTinh, SoLuongDat, SoLuongDaNhap, DonGiaDat, GhiChu, CreatedAt, IsDeleted)
SELECT 
    @Po3Id,
    Id,
    DonViTinhCoBan,
    CASE 
        WHEN Ma = 'THUOC059' THEN 300.000   -- Concor: 300 viên
        WHEN Ma = 'THUOC061' THEN 300.000   -- Coversyl: 300 viên
        WHEN Ma = 'THUOC064' THEN 200.000   -- Plavix: 200 viên
        WHEN Ma = 'THUOC069' THEN 250.000   -- Crestor: 250 viên
        ELSE 200.000
    END,
    0.000, -- Số lượng đã nhập = 0
    ISNULL(GiaBan, 18000.00) * 0.82, -- Đơn giá hợp đồng = 82% giá bán
    N'Đơn hàng dược Tim mạch - Quý 3/2026',
    SYSUTCDATETIME(),
    0
FROM Item
WHERE Ma IN ('THUOC059', 'THUOC061', 'THUOC064', 'THUOC069') AND IsActive = 1;

-- Fallback nếu không khớp mã
IF @@ROWCOUNT = 0
BEGIN
    INSERT INTO ChiTietDonDatHang (MaDonDatHang, MaItem, DonViTinh, SoLuongDat, SoLuongDaNhap, DonGiaDat, GhiChu, CreatedAt, IsDeleted)
    SELECT TOP 3
        @Po3Id, Id, DonViTinhCoBan, 250.000, 0.000, ISNULL(GiaBan, 15000.00) * 0.85, N'Đơn hàng dược phẩm', SYSUTCDATETIME(), 0
    FROM Item WHERE IsActive = 1 AND Id NOT IN (SELECT MaItem FROM ChiTietDonDatHang WHERE MaDonDatHang = @Po1Id);
END

-- Cập nhật lại tổng tiền PO 3
UPDATE DonDatHang 
SET TongTien = ISNULL((SELECT SUM(SoLuongDat * DonGiaDat) FROM ChiTietDonDatHang WHERE MaDonDatHang = @Po3Id), 0)
WHERE Id = @Po3Id;

PRINT N'✅ Đã tạo PO-2026-003 (DA_DAT) với ID: ' + CAST(@Po3Id AS NVARCHAR(10));

PRINT N'';
PRINT N'=========================================================================';
PRINT N'BƯỚC 5: KIỂM TRA LẠI DỮ LIỆU ĐÃ TẠO';
PRINT N'=========================================================================';

-- 5.1. Bảng tổng hợp các Đơn đặt hàng
SELECT 
    ddh.Id,
    ddh.MaDonDatHang AS [Mã PO],
    ncc.Ten AS [Nhà Cung Cấp],
    k.TenKho AS [Kho Nhận],
    FORMAT(ddh.NgayDat, 'dd/MM/yyyy') AS [Ngày Đặt],
    FORMAT(ddh.NgayDuKienGiao, 'dd/MM/yyyy') AS [Dự Kiến Giao],
    FORMAT(ddh.TongTien, 'N0') + ' đ' AS [Tổng Tiền PO],
    ddh.TrangThai AS [Trạng Thái],
    COUNT(ct.Id) AS [Số Mặt Hàng],
    ddh.GhiChu
FROM DonDatHang ddh
JOIN NhaCungCap ncc ON ddh.MaNhaCungCap = ncc.Id
JOIN Kho k ON ddh.MaKho = k.Id
LEFT JOIN ChiTietDonDatHang ct ON ddh.Id = ct.MaDonDatHang
GROUP BY ddh.Id, ddh.MaDonDatHang, ncc.Ten, k.TenKho, ddh.NgayDat, ddh.NgayDuKienGiao, ddh.TongTien, ddh.TrangThai, ddh.GhiChu
ORDER BY ddh.Id;

-- 5.2. Bảng chi tiết các mặt hàng trên từng PO kèm số lượng còn lại cần nhập
SELECT 
    ddh.MaDonDatHang AS [Mã PO],
    i.Ma AS [Mã Thuốc/VT],
    i.Ten AS [Tên Thuốc / Vật Tư],
    ct.DonViTinh AS [ĐVT],
    FORMAT(ct.SoLuongDat, 'N0') AS [SL Đặt],
    FORMAT(ct.SoLuongDaNhap, 'N0') AS [Đã Nhận],
    FORMAT(ct.SoLuongDat - ct.SoLuongDaNhap, 'N0') AS [Còn Lại Cần Giao],
    FORMAT(ct.DonGiaDat, 'N0') + ' đ' AS [Đơn Giá PO],
    FORMAT((ct.SoLuongDat - ct.SoLuongDaNhap) * ct.DonGiaDat, 'N0') + ' đ' AS [Giá Trị Còn Lại]
FROM ChiTietDonDatHang ct
JOIN DonDatHang ddh ON ct.MaDonDatHang = ddh.Id
JOIN Item i ON ct.MaItem = i.Id
ORDER BY ddh.Id, ct.Id;

PRINT N'';
PRINT N'🎉 HOÀN THÀNH: Đã kiểm tra schema và nạp thành công 3 Đơn đặt hàng PO mẫu!';
PRINT N'Bây giờ bạn có thể mở giao diện Quản lý nhập kho (http://localhost:3001/inventory/import)';
PRINT N'và bấm nút "📦 Nhập từ Đơn đặt hàng (PO)" để trải nghiệm ngay!';
GO
