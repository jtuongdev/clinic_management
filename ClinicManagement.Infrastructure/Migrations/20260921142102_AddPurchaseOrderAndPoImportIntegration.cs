using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseOrderAndPoImportIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.PhieuNhapKho') AND name = 'MaDonDatHang')
BEGIN
    ALTER TABLE [dbo].[PhieuNhapKho] ADD [MaDonDatHang] INT NULL;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ChiTietNhapKho') AND name = 'MaChiTietDonDatHang')
BEGIN
    ALTER TABLE [dbo].[ChiTietNhapKho] ADD [MaChiTietDonDatHang] INT NULL;
END

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
END

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
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DonDatHang_MaDonDatHang')
    CREATE UNIQUE NONCLUSTERED INDEX [IX_DonDatHang_MaDonDatHang] ON [dbo].[DonDatHang] ([MaDonDatHang] ASC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DonDatHang_MaCoSo')
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_MaCoSo] ON [dbo].[DonDatHang] ([MaCoSo] ASC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DonDatHang_MaKho')
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_MaKho] ON [dbo].[DonDatHang] ([MaKho] ASC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DonDatHang_MaNhaCungCap')
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_MaNhaCungCap] ON [dbo].[DonDatHang] ([MaNhaCungCap] ASC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DonDatHang_MaNguoiDat')
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_MaNguoiDat] ON [dbo].[DonDatHang] ([MaNguoiDat] ASC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DonDatHang_NgayDat')
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_NgayDat] ON [dbo].[DonDatHang] ([NgayDat] ASC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DonDatHang_TrangThai')
    CREATE NONCLUSTERED INDEX [IX_DonDatHang_TrangThai] ON [dbo].[DonDatHang] ([TrangThai] ASC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ChiTietDonDatHang_MaDonDatHang')
    CREATE NONCLUSTERED INDEX [IX_ChiTietDonDatHang_MaDonDatHang] ON [dbo].[ChiTietDonDatHang] ([MaDonDatHang] ASC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ChiTietDonDatHang_MaItem')
    CREATE NONCLUSTERED INDEX [IX_ChiTietDonDatHang_MaItem] ON [dbo].[ChiTietDonDatHang] ([MaItem] ASC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ChiTietDonDatHang_MaQuyDoi')
    CREATE NONCLUSTERED INDEX [IX_ChiTietDonDatHang_MaQuyDoi] ON [dbo].[ChiTietDonDatHang] ([MaQuyDoi] ASC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PhieuNhapKho_MaDonDatHang')
    CREATE NONCLUSTERED INDEX [IX_PhieuNhapKho_MaDonDatHang] ON [dbo].[PhieuNhapKho] ([MaDonDatHang] ASC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ChiTietNhapKho_MaChiTietDonDatHang')
    CREATE NONCLUSTERED INDEX [IX_ChiTietNhapKho_MaChiTietDonDatHang] ON [dbo].[ChiTietNhapKho] ([MaChiTietDonDatHang] ASC);

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_PhieuNhapKho_DonDatHang_MaDonDatHang')
    ALTER TABLE [dbo].[PhieuNhapKho] ADD CONSTRAINT [FK_PhieuNhapKho_DonDatHang_MaDonDatHang]
        FOREIGN KEY ([MaDonDatHang]) REFERENCES [dbo].[DonDatHang] ([Id]) ON DELETE SET NULL;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ChiTietNhapKho_ChiTietDonDatHang_MaChiTietDonDatHang')
    ALTER TABLE [dbo].[ChiTietNhapKho] ADD CONSTRAINT [FK_ChiTietNhapKho_ChiTietDonDatHang_MaChiTietDonDatHang]
        FOREIGN KEY ([MaChiTietDonDatHang]) REFERENCES [dbo].[ChiTietDonDatHang] ([Id]) ON DELETE SET NULL;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChiTietNhapKho_ChiTietDonDatHang_MaChiTietDonDatHang",
                table: "ChiTietNhapKho");

            migrationBuilder.DropForeignKey(
                name: "FK_PhieuNhapKho_DonDatHang_MaDonDatHang",
                table: "PhieuNhapKho");

            migrationBuilder.DropTable(
                name: "ChiTietDonDatHang");

            migrationBuilder.DropTable(
                name: "DonDatHang");

            migrationBuilder.DropIndex(
                name: "IX_PhieuNhapKho_MaDonDatHang",
                table: "PhieuNhapKho");

            migrationBuilder.DropIndex(
                name: "IX_ChiTietNhapKho_MaChiTietDonDatHang",
                table: "ChiTietNhapKho");

            migrationBuilder.DropColumn(
                name: "MaDonDatHang",
                table: "PhieuNhapKho");

            migrationBuilder.DropColumn(
                name: "MaChiTietDonDatHang",
                table: "ChiTietNhapKho");
        }
    }
}
