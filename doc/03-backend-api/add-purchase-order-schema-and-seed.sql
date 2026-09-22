-- ============================================================================
-- SQL SCRIPT: TẠO BẢNG ĐƠN ĐẶT HÀNG (DON DATHANG) VÀ LIÊN KẾT NHẬP KHO (PHIEU NHAPKHO)
-- Hệ thống: HIS / Pharmacy ERP - Clinic Management
-- ============================================================================

USE ClinicManagementDb;
GO

-- 1. Bảng DonDatHang (Purchase Order)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DonDatHang')
BEGIN
    CREATE TABLE [dbo].[DonDatHang] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [MaDonDatHang] NVARCHAR(50) NOT NULL,
        [MaCoSo] INT NOT NULL,
        [MaKho] INT NOT NULL,
        [MaNhaCungCap] INT NOT NULL,
        [NgayDat] DATETIME2 NOT NULL,
        [NgayDuKienGiao] DATETIME2 NULL,
        [TongTien] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [TrangThai] NVARCHAR(30) NOT NULL DEFAULT 'CHO_DUYET',
        [MaNguoiDat] INT NOT NULL,
        [GhiChu] NVARCHAR(500) NOT NULL DEFAULT '',
        [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [CreatedBy] INT NULL,
        [UpdatedAt] DATETIME2 NULL,
        [UpdatedBy] INT NULL,
        [IsDeleted] BIT NOT NULL DEFAULT 0,
        [DeletedAt] DATETIME2 NULL,
        [DeletedBy] INT NULL,
        CONSTRAINT [PK_DonDatHang] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_DonDatHang_CoSo_MaCoSo] FOREIGN KEY ([MaCoSo]) REFERENCES [dbo].[CoSo] ([Id]),
        CONSTRAINT [FK_DonDatHang_Kho_MaKho] FOREIGN KEY ([MaKho]) REFERENCES [dbo].[Kho] ([Id]),
        CONSTRAINT [FK_DonDatHang_NhaCungCap_MaNhaCungCap] FOREIGN KEY ([MaNhaCungCap]) REFERENCES [dbo].[NhaCungCap] ([Id]),
        CONSTRAINT [FK_DonDatHang_NhanVien_MaNguoiDat] FOREIGN KEY ([MaNguoiDat]) REFERENCES [dbo].[NhanVien] ([Id])
    );

    CREATE UNIQUE NONCLUSTERED INDEX [IX_DonDatHang_MaDonDatHang] ON [dbo].[DonDatHang] ([MaDonDatHang] ASC);
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_MaCoSo] ON [dbo].[DonDatHang] ([MaCoSo] ASC);
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_MaKho] ON [dbo].[DonDatHang] ([MaKho] ASC);
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_MaNhaCungCap] ON [dbo].[DonDatHang] ([MaNhaCungCap] ASC);
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_NgayDat] ON [dbo].[DonDatHang] ([NgayDat] ASC);
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_TrangThai] ON [dbo].[DonDatHang] ([TrangThai] ASC);
END
GO

-- 2. Bảng ChiTietDonDatHang (Purchase Order Items)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChiTietDonDatHang')
BEGIN
    CREATE TABLE [dbo].[ChiTietDonDatHang] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [MaDonDatHang] INT NOT NULL,
        [MaItem] INT NOT NULL,
        [MaQuyDoi] INT NULL,
        [DonViTinh] NVARCHAR(50) NOT NULL,
        [SoLuongDat] DECIMAL(12,3) NOT NULL,
        [SoLuongDaNhap] DECIMAL(12,3) NOT NULL DEFAULT 0,
        [DonGiaDat] DECIMAL(18,2) NOT NULL,
        [GhiChu] NVARCHAR(255) NOT NULL DEFAULT '',
        [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [CreatedBy] INT NULL,
        [UpdatedAt] DATETIME2 NULL,
        [UpdatedBy] INT NULL,
        [IsDeleted] BIT NOT NULL DEFAULT 0,
        [DeletedAt] DATETIME2 NULL,
        [DeletedBy] INT NULL,
        CONSTRAINT [PK_ChiTietDonDatHang] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_ChiTietDonDatHang_DonDatHang_MaDonDatHang] FOREIGN KEY ([MaDonDatHang]) REFERENCES [dbo].[DonDatHang] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ChiTietDonDatHang_Item_MaItem] FOREIGN KEY ([MaItem]) REFERENCES [dbo].[Item] ([Id]),
        CONSTRAINT [FK_ChiTietDonDatHang_DonViTinhQuyDoi_MaQuyDoi] FOREIGN KEY ([MaQuyDoi]) REFERENCES [dbo].[DonViTinhQuyDoi] ([Id]) ON DELETE SET NULL
    );

    CREATE NONCLUSTERED INDEX [IX_ChiTietDonDatHang_MaDonDatHang] ON [dbo].[ChiTietDonDatHang] ([MaDonDatHang] ASC);
    CREATE NONCLUSTERED INDEX [IX_ChiTietDonDatHang_MaItem] ON [dbo].[ChiTietDonDatHang] ([MaItem] ASC);
END
GO

-- 3. Cập nhật PhieuNhapKho: thêm cột MaDonDatHang
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.PhieuNhapKho') AND name = 'MaDonDatHang')
BEGIN
    ALTER TABLE [dbo].[PhieuNhapKho] ADD [MaDonDatHang] INT NULL;
    
    ALTER TABLE [dbo].[PhieuNhapKho] ADD CONSTRAINT [FK_PhieuNhapKho_DonDatHang_MaDonDatHang]
        FOREIGN KEY ([MaDonDatHang]) REFERENCES [dbo].[DonDatHang] ([Id]) ON DELETE SET NULL;
        
    CREATE NONCLUSTERED INDEX [IX_PhieuNhapKho_MaDonDatHang] ON [dbo].[PhieuNhapKho] ([MaDonDatHang] ASC);
END
GO

-- 4. Cập nhật ChiTietNhapKho: thêm cột MaChiTietDonDatHang
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ChiTietNhapKho') AND name = 'MaChiTietDonDatHang')
BEGIN
    ALTER TABLE [dbo].[ChiTietNhapKho] ADD [MaChiTietDonDatHang] INT NULL;

    ALTER TABLE [dbo].[ChiTietNhapKho] ADD CONSTRAINT [FK_ChiTietNhapKho_ChiTietDonDatHang_MaChiTietDonDatHang]
        FOREIGN KEY ([MaChiTietDonDatHang]) REFERENCES [dbo].[ChiTietDonDatHang] ([Id]) ON DELETE SET NULL;

    CREATE NONCLUSTERED INDEX [IX_ChiTietNhapKho_MaChiTietDonDatHang] ON [dbo].[ChiTietNhapKho] ([MaChiTietDonDatHang] ASC);
END
GO

-- 5. Seed dữ liệu mẫu: 2 đơn đặt hàng sẵn sàng nhập kho (DA_DAT & GIAO_MOT_PHAN)
DECLARE @NccId INT, @KhoId INT, @CoSoId INT, @NhanVienId INT;
SELECT TOP 1 @NccId = Id FROM NhaCungCap WHERE IsActive = 1 ORDER BY Id;
SELECT TOP 1 @KhoId = Id, @CoSoId = MaCoSo FROM Kho WHERE TrangThai = 1 ORDER BY Id;
SELECT TOP 1 @NhanVienId = Id FROM NhanVien ORDER BY Id;

IF @NccId IS NOT NULL AND @KhoId IS NOT NULL AND @NhanVienId IS NOT NULL
BEGIN
    -- PO-2026-001: Đơn đặt hàng ĐÃ ĐẶT (chưa nhập đợt nào)
    IF NOT EXISTS (SELECT 1 FROM DonDatHang WHERE MaDonDatHang = 'PO-2026-001')
    BEGIN
        INSERT INTO DonDatHang (MaDonDatHang, MaCoSo, MaKho, MaNhaCungCap, NgayDat, NgayDuKienGiao, TongTien, TrangThai, MaNguoiDat, GhiChu)
        VALUES ('PO-2026-001', @CoSoId, @KhoId, @NccId, DATEADD(day, -2, SYSUTCDATETIME()), DATEADD(day, 1, SYSUTCDATETIME()), 0, 'DA_DAT', @NhanVienId, N'Đơn đặt thuốc kháng sinh & giảm đau định kỳ đầu tuần');

        DECLARE @Po1Id INT = SCOPE_IDENTITY();

        -- Lấy 3 mặt hàng thuốc đầu tiên
        INSERT INTO ChiTietDonDatHang (MaDonDatHang, MaItem, DonViTinh, SoLuongDat, SoLuongDaNhap, DonGiaDat, GhiChu)
        SELECT TOP 3 @Po1Id, Id, DonViTinhCoBan, 100.000, 0.000, ISNULL(GiaBan, 50000.00) * 0.85, N'Hợp đồng cung ứng số 01'
        FROM Item WHERE IsActive = 1;

        -- Cập nhật tổng tiền PO 1
        UPDATE DonDatHang 
        SET TongTien = (SELECT SUM(SoLuongDat * DonGiaDat) FROM ChiTietDonDatHang WHERE MaDonDatHang = @Po1Id)
        WHERE Id = @Po1Id;
    END

    -- PO-2026-002: Đơn đặt hàng ĐANG GIAO MỘT PHẦN (đã nhập 1 đợt, còn thiếu)
    IF NOT EXISTS (SELECT 1 FROM DonDatHang WHERE MaDonDatHang = 'PO-2026-002')
    BEGIN
        INSERT INTO DonDatHang (MaDonDatHang, MaCoSo, MaKho, MaNhaCungCap, NgayDat, NgayDuKienGiao, TongTien, TrangThai, MaNguoiDat, GhiChu)
        VALUES ('PO-2026-002', @CoSoId, @KhoId, @NccId, DATEADD(day, -5, SYSUTCDATETIME()), SYSUTCDATETIME(), 0, 'GIAO_MOT_PHAN', @NhanVienId, N'Đơn đặt bổ sung vật tư tiêu hao và dịch truyền - Giao đợt 2');

        DECLARE @Po2Id INT = SCOPE_IDENTITY();

        -- Lấy 3 mặt hàng khác
        INSERT INTO ChiTietDonDatHang (MaDonDatHang, MaItem, DonViTinh, SoLuongDat, SoLuongDaNhap, DonGiaDat, GhiChu)
        SELECT TOP 3 @Po2Id, Id, DonViTinhCoBan, 200.000, 80.000, ISNULL(GiaBan, 30000.00) * 0.80, N'Hợp đồng cung ứng số 02'
        FROM Item WHERE IsActive = 1 ORDER BY Id DESC;

        -- Cập nhật tổng tiền PO 2
        UPDATE DonDatHang 
        SET TongTien = (SELECT SUM(SoLuongDat * DonGiaDat) FROM ChiTietDonDatHang WHERE MaDonDatHang = @Po2Id)
        WHERE Id = @Po2Id;
    END
END
GO
