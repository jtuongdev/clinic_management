using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BenhNhan",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Ho = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NgaySinh = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GioiTinh = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DienThoai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SoCCCD = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DiaChi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    NguoiLienHeTen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NguoiLienHeDienThoai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BenhNhan", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CauHinhTichHops",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DanhMuc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GiaTri = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DaMaHoa = table.Column<bool>(type: "bit", nullable: false),
                    NguoiCapNhat = table.Column<int>(type: "int", nullable: true),
                    ThoiGianCapNhat = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CauHinhTichHops", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChucVu",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenChucVu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChucVu", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CoSo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoaiCoSo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Ma = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DiaChi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DienThoai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoSo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DanhMucDichVu",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoaiDichVu = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Ma = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DonViTinh = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Gia = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DanhMucDichVu", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ICD",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaICD = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TenICD = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Chuong = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ICD", x => x.Id);
                    table.UniqueConstraint("AK_ICD_MaICD", x => x.MaICD);
                });

            migrationBuilder.CreateTable(
                name: "IdempotencyRecord",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Operation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StatusCode = table.Column<int>(type: "int", nullable: false),
                    ResponseJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdempotencyRecord", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Item",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoaiItem = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Ma = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TenGoc = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DangBaoChe = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HamLuong = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HoatChat = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SoDangKy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DuongDung = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaBHYT = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TyLeBHYT = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    DonViTinhCoBan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    GiaBanLe = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CanKeDon = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    TonToiThieu = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Item", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KyChamCong",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DaKhoa = table.Column<bool>(type: "bit", nullable: false),
                    NguoiKhoa = table.Column<int>(type: "int", nullable: true),
                    ThoiGianKhoa = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KyChamCong", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LoaiCa",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Ma = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TenLoai = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoaiCa", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NhaCungCap",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Ma = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DiaChi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DienThoai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaSoThue = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhaCungCap", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NhatKyHoSoBenhAns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: false),
                    MaHoSo = table.Column<int>(type: "int", nullable: false),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    HanhDong = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhanHe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DiaChiIp = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ThoiGian = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChiTiet = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhatKyHoSoBenhAns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Stocktake",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReferenceCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true),
                    SubmittedByUserId = table.Column<int>(type: "int", nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "int", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stocktake", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VaiTro",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenVaiTro = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VaiTro", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BaoHiem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: false),
                    LoaiBaoHiem = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TenNhaCungCap = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SoThe = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MucHuong = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaoHiem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BaoHiem_BenhNhan_MaBenhNhan",
                        column: x => x.MaBenhNhan,
                        principalTable: "BenhNhan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TienSuBenh",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: false),
                    LoaiTienSu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NgayGhiNhan = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TienSuBenh", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TienSuBenh_BenhNhan_MaBenhNhan",
                        column: x => x.MaBenhNhan,
                        principalTable: "BenhNhan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BenhNhanCoSo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: false),
                    MaCoSo = table.Column<int>(type: "int", nullable: false),
                    MaBenhNhanNoiBo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NgayDangKy = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BenhNhanCoSo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BenhNhanCoSo_BenhNhan_MaBenhNhan",
                        column: x => x.MaBenhNhan,
                        principalTable: "BenhNhan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BenhNhanCoSo_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Khoa",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaCoSo = table.Column<int>(type: "int", nullable: false),
                    MaKhoaCha = table.Column<int>(type: "int", nullable: true),
                    Ma = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Khoa", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Khoa_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Khoa_Khoa_MaKhoaCha",
                        column: x => x.MaKhoaCha,
                        principalTable: "Khoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ThamSoHeThong",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaCoSo = table.Column<int>(type: "int", nullable: true),
                    TenThamSo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    GiaTri = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThamSoHeThong", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ThamSoHeThong_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "DonViTinhQuyDoi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaItem = table.Column<int>(type: "int", nullable: false),
                    DonVi = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    HeSo = table.Column<decimal>(type: "decimal(12,5)", nullable: false),
                    IsBase = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonViTinhQuyDoi", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonViTinhQuyDoi_Item_MaItem",
                        column: x => x.MaItem,
                        principalTable: "Item",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KyLuong",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Thang = table.Column<int>(type: "int", nullable: false),
                    Nam = table.Column<int>(type: "int", nullable: false),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MaKyChamCong = table.Column<int>(type: "int", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KyLuong", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KyLuong_KyChamCong_MaKyChamCong",
                        column: x => x.MaKyChamCong,
                        principalTable: "KyChamCong",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CaTruc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaLoaiCa = table.Column<int>(type: "int", nullable: false),
                    TenCa = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ThoiGianBatDau = table.Column<TimeSpan>(type: "time", nullable: false),
                    ThoiGianKetThuc = table.Column<TimeSpan>(type: "time", nullable: false),
                    HeSo = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaTruc", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CaTruc_LoaiCa_MaLoaiCa",
                        column: x => x.MaLoaiCa,
                        principalTable: "LoaiCa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MaTranPhanQuyen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaVaiTro = table.Column<int>(type: "int", nullable: false),
                    PhanHe = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    HanhDong = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PhamViDuLieu = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DuocPhep = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaTranPhanQuyen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MaTranPhanQuyen_VaiTro_MaVaiTro",
                        column: x => x.MaVaiTro,
                        principalTable: "VaiTro",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhongKham",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaKhoa = table.Column<int>(type: "int", nullable: false),
                    Ma = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhongKham", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhongKham_Khoa_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "Khoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NhanVien",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    HoTen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NgaySinh = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GioiTinh = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DienThoai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MaChucVu = table.Column<int>(type: "int", nullable: true),
                    ChuyenKhoa = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SoHanhNghe = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LuongCoBan = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PhuCapCoDinh = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TyLeBaoHiem = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PhongKhamId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhanVien", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NhanVien_ChucVu_MaChucVu",
                        column: x => x.MaChucVu,
                        principalTable: "ChucVu",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_NhanVien_PhongKham_PhongKhamId",
                        column: x => x.PhongKhamId,
                        principalTable: "PhongKham",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "BangLuong",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaKyLuong = table.Column<int>(type: "int", nullable: false),
                    MaNhanVien = table.Column<int>(type: "int", nullable: false),
                    MaKyChamCong = table.Column<int>(type: "int", nullable: true),
                    LuongCoBan = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SoNgayCong = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    SoNgayNghiKhongLuong = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    TongPhuCap = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TongKhauTru = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ThucLinh = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    LuongTheoNgayCong = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    KhauTruNghiKhongLuong = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TienTangCa = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    KhauTruDiMuonVeSom = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TienBaoHiem = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BangLuong", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BangLuong_KyLuong_MaKyLuong",
                        column: x => x.MaKyLuong,
                        principalTable: "KyLuong",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BangLuong_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Kho",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaCoSo = table.Column<int>(type: "int", nullable: false),
                    MaKhoa = table.Column<int>(type: "int", nullable: true),
                    TenKho = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LoaiKho = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MaNguoiPhuTrach = table.Column<int>(type: "int", nullable: true),
                    DiaChi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kho", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Kho_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Kho_Khoa_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "Khoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Kho_NhanVien_MaNguoiPhuTrach",
                        column: x => x.MaNguoiPhuTrach,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "LichHen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: false),
                    MaBacSi = table.Column<int>(type: "int", nullable: false),
                    MaCoSo = table.Column<int>(type: "int", nullable: false),
                    MaKhoa = table.Column<int>(type: "int", nullable: true),
                    ThoiGianBatDau = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ThoiGianKetThuc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LyDo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NguonDat = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichHen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LichHen_BenhNhan_MaBenhNhan",
                        column: x => x.MaBenhNhan,
                        principalTable: "BenhNhan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichHen_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichHen_Khoa_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "Khoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichHen_NhanVien_MaBacSi",
                        column: x => x.MaBacSi,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LichLamViecCoDinh",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNhanVien = table.Column<int>(type: "int", nullable: false),
                    MaKhoa = table.Column<int>(type: "int", nullable: false),
                    MaCaTruc = table.Column<int>(type: "int", nullable: false),
                    MaPhongKham = table.Column<int>(type: "int", nullable: true),
                    ThuTrongTuan = table.Column<int>(type: "int", nullable: false),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichLamViecCoDinh", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LichLamViecCoDinh_CaTruc_MaCaTruc",
                        column: x => x.MaCaTruc,
                        principalTable: "CaTruc",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichLamViecCoDinh_Khoa_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "Khoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichLamViecCoDinh_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichLamViecCoDinh_PhongKham_MaPhongKham",
                        column: x => x.MaPhongKham,
                        principalTable: "PhongKham",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NghiPhep",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNhanVien = table.Column<int>(type: "int", nullable: false),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LoaiNghi = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    LyDo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NguoiDuyet = table.Column<int>(type: "int", nullable: true),
                    NgayDuyet = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NghiPhep", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NghiPhep_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NghiPhep_NhanVien_NguoiDuyet",
                        column: x => x.NguoiDuyet,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "NhanVienKhoa",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNhanVien = table.Column<int>(type: "int", nullable: false),
                    MaKhoa = table.Column<int>(type: "int", nullable: false),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LaKhoaChinh = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhanVienKhoa", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NhanVienKhoa_Khoa_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "Khoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NhanVienKhoa_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NhanVienVaiTro",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNhanVien = table.Column<int>(type: "int", nullable: false),
                    MaVaiTro = table.Column<int>(type: "int", nullable: false),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhanVienVaiTro", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NhanVienVaiTro_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NhanVienVaiTro_VaiTro_MaVaiTro",
                        column: x => x.MaVaiTro,
                        principalTable: "VaiTro",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NhatKyHeThong",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Bang = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaBangGhi = table.Column<int>(type: "int", nullable: false),
                    HanhDong = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DuLieuCu = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DuLieuMoi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NguoiThucHien = table.Column<int>(type: "int", nullable: true),
                    DiaChiIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    ThoiGian = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhatKyHeThong", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NhatKyHeThong_NhanVien_NguoiThucHien",
                        column: x => x.NguoiThucHien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PhanQuyenCoSo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNhanVien = table.Column<int>(type: "int", nullable: false),
                    MaCoSo = table.Column<int>(type: "int", nullable: false),
                    MaVaiTro = table.Column<int>(type: "int", nullable: false),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhanQuyenCoSo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhanQuyenCoSo_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PhanQuyenCoSo_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PhanQuyenCoSo_VaiTro_MaVaiTro",
                        column: x => x.MaVaiTro,
                        principalTable: "VaiTro",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TokenLamMoi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNhanVien = table.Column<int>(type: "int", nullable: true),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: true),
                    MaToken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NgayHetHan = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DaHuyBo = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TokenLamMoi", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TokenLamMoi_BenhNhan_MaBenhNhan",
                        column: x => x.MaBenhNhan,
                        principalTable: "BenhNhan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TokenLamMoi_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChiTietBangLuong",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBangLuong = table.Column<int>(type: "int", nullable: false),
                    LoaiKhoan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TenKhoan = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiTietBangLuong", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChiTietBangLuong_BangLuong_MaBangLuong",
                        column: x => x.MaBangLuong,
                        principalTable: "BangLuong",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhieuNhapKho",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaPhieu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MaCoSo = table.Column<int>(type: "int", nullable: false),
                    MaKho = table.Column<int>(type: "int", nullable: false),
                    MaNhaCungCap = table.Column<int>(type: "int", nullable: false),
                    NgayNhap = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TongTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    MaNguoiNhap = table.Column<int>(type: "int", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhieuNhapKho", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhieuNhapKho_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhieuNhapKho_Kho_MaKho",
                        column: x => x.MaKho,
                        principalTable: "Kho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhieuNhapKho_NhaCungCap_MaNhaCungCap",
                        column: x => x.MaNhaCungCap,
                        principalTable: "NhaCungCap",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhieuNhapKho_NhanVien_MaNguoiNhap",
                        column: x => x.MaNguoiNhap,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LuotKham",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: false),
                    MaBacSi = table.Column<int>(type: "int", nullable: true),
                    MaLichHen = table.Column<int>(type: "int", nullable: true),
                    MaCoSo = table.Column<int>(type: "int", nullable: false),
                    MaKhoa = table.Column<int>(type: "int", nullable: false),
                    HinhThucDieuTri = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SoThuTu = table.Column<int>(type: "int", nullable: true),
                    NgayKham = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ThoiGianBatDauKham = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThoiGianKetThucKham = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LyDoKham = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MaPhongKham = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    EmrLocked = table.Column<bool>(type: "bit", nullable: false),
                    EmrSignature = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmrLockedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmrLockedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LuotKham", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LuotKham_BenhNhan_MaBenhNhan",
                        column: x => x.MaBenhNhan,
                        principalTable: "BenhNhan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LuotKham_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LuotKham_Khoa_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "Khoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LuotKham_LichHen_MaLichHen",
                        column: x => x.MaLichHen,
                        principalTable: "LichHen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LuotKham_NhanVien_MaBacSi",
                        column: x => x.MaBacSi,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LuotKham_PhongKham_MaPhongKham",
                        column: x => x.MaPhongKham,
                        principalTable: "PhongKham",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "LichLamViec",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNhanVien = table.Column<int>(type: "int", nullable: false),
                    MaKhoa = table.Column<int>(type: "int", nullable: false),
                    MaCaTruc = table.Column<int>(type: "int", nullable: false),
                    MaPhongKham = table.Column<int>(type: "int", nullable: true),
                    MaLichLamViecCoDinh = table.Column<int>(type: "int", nullable: true),
                    NguonLich = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NgayLam = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichLamViec", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LichLamViec_CaTruc_MaCaTruc",
                        column: x => x.MaCaTruc,
                        principalTable: "CaTruc",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichLamViec_Khoa_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "Khoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichLamViec_LichLamViecCoDinh_MaLichLamViecCoDinh",
                        column: x => x.MaLichLamViecCoDinh,
                        principalTable: "LichLamViecCoDinh",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichLamViec_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichLamViec_PhongKham_MaPhongKham",
                        column: x => x.MaPhongKham,
                        principalTable: "PhongKham",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ChiTietNhapKho",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaPhieuNhap = table.Column<int>(type: "int", nullable: false),
                    MaItem = table.Column<int>(type: "int", nullable: false),
                    MaQuyDoi = table.Column<int>(type: "int", nullable: true),
                    SoLuong = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    DonGiaNhap = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoLo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    HanSuDung = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ViTri = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiTietNhapKho", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChiTietNhapKho_DonViTinhQuyDoi_MaQuyDoi",
                        column: x => x.MaQuyDoi,
                        principalTable: "DonViTinhQuyDoi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ChiTietNhapKho_Item_MaItem",
                        column: x => x.MaItem,
                        principalTable: "Item",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChiTietNhapKho_PhieuNhapKho_MaPhieuNhap",
                        column: x => x.MaPhieuNhap,
                        principalTable: "PhieuNhapKho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChanDoan",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaLuotKham = table.Column<int>(type: "int", nullable: false),
                    MaICD = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TenChanDoan = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    LaChanDoanChinh = table.Column<bool>(type: "bit", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChanDoan", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChanDoan_ICD_MaICD",
                        column: x => x.MaICD,
                        principalTable: "ICD",
                        principalColumn: "MaICD",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChanDoan_LuotKham_MaLuotKham",
                        column: x => x.MaLuotKham,
                        principalTable: "LuotKham",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChiDinhDichVu",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaLuotKham = table.Column<int>(type: "int", nullable: false),
                    MaBacSiChiDinh = table.Column<int>(type: "int", nullable: false),
                    MaDanhMuc = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NgayChiDinh = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayTiepNhan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayThucHien = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayCoKetQua = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaNguoiThucHien = table.Column<int>(type: "int", nullable: true),
                    KetLuan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UrlKetQua = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiDinhDichVu", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChiDinhDichVu_DanhMucDichVu_MaDanhMuc",
                        column: x => x.MaDanhMuc,
                        principalTable: "DanhMucDichVu",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChiDinhDichVu_LuotKham_MaLuotKham",
                        column: x => x.MaLuotKham,
                        principalTable: "LuotKham",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChiDinhDichVu_NhanVien_MaBacSiChiDinh",
                        column: x => x.MaBacSiChiDinh,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChiDinhDichVu_NhanVien_MaNguoiThucHien",
                        column: x => x.MaNguoiThucHien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "DonThuoc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaLuotKham = table.Column<int>(type: "int", nullable: false),
                    MaBacSi = table.Column<int>(type: "int", nullable: false),
                    MaCoSo = table.Column<int>(type: "int", nullable: false),
                    NgayKe = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NgayCapThuoc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaNguoiCapThuoc = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonThuoc", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonThuoc_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DonThuoc_LuotKham_MaLuotKham",
                        column: x => x.MaLuotKham,
                        principalTable: "LuotKham",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DonThuoc_NhanVien_MaBacSi",
                        column: x => x.MaBacSi,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DonThuoc_NhanVien_MaNguoiCapThuoc",
                        column: x => x.MaNguoiCapThuoc,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "HoaDon",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SoHoaDon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MaLuotKham = table.Column<int>(type: "int", nullable: false),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: false),
                    MaCoSo = table.Column<int>(type: "int", nullable: false),
                    NgayLap = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TongTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoTienBaoHiemChiTra = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoTienBenhNhanChiTra = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DaThanhToan = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HoaDon", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HoaDon_BenhNhan_MaBenhNhan",
                        column: x => x.MaBenhNhan,
                        principalTable: "BenhNhan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HoaDon_CoSo_MaCoSo",
                        column: x => x.MaCoSo,
                        principalTable: "CoSo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HoaDon_LuotKham_MaLuotKham",
                        column: x => x.MaLuotKham,
                        principalTable: "LuotKham",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SinhHieu",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaLuotKham = table.Column<int>(type: "int", nullable: false),
                    ThoiDiemDo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HuyetApTamThu = table.Column<int>(type: "int", nullable: true),
                    HuyetApTamTruong = table.Column<int>(type: "int", nullable: true),
                    Mach = table.Column<int>(type: "int", nullable: true),
                    NhietDo = table.Column<decimal>(type: "decimal(4,1)", nullable: true),
                    CanNang = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    ChieuCao = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    SpO2 = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SinhHieu", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SinhHieu_LuotKham_MaLuotKham",
                        column: x => x.MaLuotKham,
                        principalTable: "LuotKham",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChamCong",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNhanVien = table.Column<int>(type: "int", nullable: false),
                    MaLichLamViec = table.Column<int>(type: "int", nullable: true),
                    NgayChamCong = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckIn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckOut = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GioLamThucTe = table.Column<double>(type: "float", nullable: false),
                    PhutDiMuon = table.Column<int>(type: "int", nullable: false),
                    PhutVeSom = table.Column<int>(type: "int", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    LoaiNghi = table.Column<int>(type: "int", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChamCong", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChamCong_LichLamViec_MaLichLamViec",
                        column: x => x.MaLichLamViec,
                        principalTable: "LichLamViec",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChamCong_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LichLamViecDieuChinh",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaLichLamViec = table.Column<int>(type: "int", nullable: false),
                    CaCu = table.Column<int>(type: "int", nullable: true),
                    CaMoi = table.Column<int>(type: "int", nullable: true),
                    PhongCu = table.Column<int>(type: "int", nullable: true),
                    PhongMoi = table.Column<int>(type: "int", nullable: true),
                    TrangThaiCu = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TrangThaiMoi = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LyDo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NguoiThucHien = table.Column<int>(type: "int", nullable: false),
                    ThoiDiem = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichLamViecDieuChinh", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LichLamViecDieuChinh_LichLamViec_MaLichLamViec",
                        column: x => x.MaLichLamViec,
                        principalTable: "LichLamViec",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TonKho",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaKho = table.Column<int>(type: "int", nullable: false),
                    MaItem = table.Column<int>(type: "int", nullable: false),
                    MaChiTietNhap = table.Column<int>(type: "int", nullable: false),
                    SoLuongTon = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    NgayCapNhatCuoi = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TonKho", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TonKho_ChiTietNhapKho_MaChiTietNhap",
                        column: x => x.MaChiTietNhap,
                        principalTable: "ChiTietNhapKho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TonKho_Item_MaItem",
                        column: x => x.MaItem,
                        principalTable: "Item",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TonKho_Kho_MaKho",
                        column: x => x.MaKho,
                        principalTable: "Kho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChiTietKetQuaXetNghiem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaChiDinh = table.Column<int>(type: "int", nullable: false),
                    TenChiSo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    GiaTri = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DonVi = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    KhoangThamChieu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BatThuong = table.Column<bool>(type: "bit", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiTietKetQuaXetNghiem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChiTietKetQuaXetNghiem_ChiDinhDichVu_MaChiDinh",
                        column: x => x.MaChiDinh,
                        principalTable: "ChiDinhDichVu",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChiTietDonThuoc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaDonThuoc = table.Column<int>(type: "int", nullable: false),
                    MaItem = table.Column<int>(type: "int", nullable: false),
                    SoLuongKe = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    SoLuongDaXuat = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    LieuDung = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TanSuat = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SoNgay = table.Column<int>(type: "int", nullable: true),
                    HuongDan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DonGiaKe = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiTietDonThuoc", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChiTietDonThuoc_DonThuoc_MaDonThuoc",
                        column: x => x.MaDonThuoc,
                        principalTable: "DonThuoc",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChiTietDonThuoc_Item_MaItem",
                        column: x => x.MaItem,
                        principalTable: "Item",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PhieuXuatKho",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaPhieu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LoaiXuat = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    MaKhoXuat = table.Column<int>(type: "int", nullable: false),
                    MaKhoNhan = table.Column<int>(type: "int", nullable: true),
                    MaDonThuoc = table.Column<int>(type: "int", nullable: true),
                    NgayXuat = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MaNguoiXuat = table.Column<int>(type: "int", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhieuXuatKho", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhieuXuatKho_DonThuoc_MaDonThuoc",
                        column: x => x.MaDonThuoc,
                        principalTable: "DonThuoc",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PhieuXuatKho_Kho_MaKhoNhan",
                        column: x => x.MaKhoNhan,
                        principalTable: "Kho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhieuXuatKho_Kho_MaKhoXuat",
                        column: x => x.MaKhoXuat,
                        principalTable: "Kho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhieuXuatKho_NhanVien_MaNguoiXuat",
                        column: x => x.MaNguoiXuat,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ChiTietHoaDon",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaHoaDon = table.Column<int>(type: "int", nullable: false),
                    LoaiDoiTuong = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MaDoiTuong = table.Column<int>(type: "int", nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SoLuong = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    DonGia = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiTietHoaDon", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChiTietHoaDon_HoaDon_MaHoaDon",
                        column: x => x.MaHoaDon,
                        principalTable: "HoaDon",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CongNoBenhNhan",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: false),
                    MaHoaDon = table.Column<int>(type: "int", nullable: false),
                    SoTienNo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoTienDaTra = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HanThanhToan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CongNoBenhNhan", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CongNoBenhNhan_BenhNhan_MaBenhNhan",
                        column: x => x.MaBenhNhan,
                        principalTable: "BenhNhan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CongNoBenhNhan_HoaDon_MaHoaDon",
                        column: x => x.MaHoaDon,
                        principalTable: "HoaDon",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhieuThu",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SoPhieuThu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MaBenhNhan = table.Column<int>(type: "int", nullable: false),
                    MaLuotKham = table.Column<int>(type: "int", nullable: true),
                    MaHoaDon = table.Column<int>(type: "int", nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayThu = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PhuongThuc = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    MaNguoiThu = table.Column<int>(type: "int", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhieuThu", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhieuThu_BenhNhan_MaBenhNhan",
                        column: x => x.MaBenhNhan,
                        principalTable: "BenhNhan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhieuThu_HoaDon_MaHoaDon",
                        column: x => x.MaHoaDon,
                        principalTable: "HoaDon",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PhieuThu_LuotKham_MaLuotKham",
                        column: x => x.MaLuotKham,
                        principalTable: "LuotKham",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PhieuThu_NhanVien_MaNguoiThu",
                        column: x => x.MaNguoiThu,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DieuChinhChamCong",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaChamCong = table.Column<int>(type: "int", nullable: false),
                    MaNhanVien = table.Column<int>(type: "int", nullable: false),
                    CheckInCu = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckOutCu = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckInMoi = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckOutMoi = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LyDo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NguoiDuyet = table.Column<int>(type: "int", nullable: true),
                    ThoiGianDuyet = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GhiChuDuyet = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DieuChinhChamCong", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DieuChinhChamCong_ChamCong_MaChamCong",
                        column: x => x.MaChamCong,
                        principalTable: "ChamCong",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DieuChinhChamCong_NhanVien_MaNhanVien",
                        column: x => x.MaNhanVien,
                        principalTable: "NhanVien",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventoryTransaction",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoaiGiaoDich = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    MaItem = table.Column<int>(type: "int", nullable: false),
                    MaTonKho = table.Column<int>(type: "int", nullable: true),
                    SoLo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SoLuongTruoc = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    SoLuongThayDoi = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    SoLuongSau = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    MaChungTu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MaNguoiThucHien = table.Column<int>(type: "int", nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryTransaction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryTransaction_Item_MaItem",
                        column: x => x.MaItem,
                        principalTable: "Item",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryTransaction_TonKho_MaTonKho",
                        column: x => x.MaTonKho,
                        principalTable: "TonKho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StocktakeCount",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StocktakeId = table.Column<int>(type: "int", nullable: false),
                    MaTonKho = table.Column<int>(type: "int", nullable: false),
                    SystemQuantity = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    ActualQuantity = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StocktakeCount", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StocktakeCount_Stocktake_StocktakeId",
                        column: x => x.StocktakeId,
                        principalTable: "Stocktake",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StocktakeCount_TonKho_MaTonKho",
                        column: x => x.MaTonKho,
                        principalTable: "TonKho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ChiTietXuatKho",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaPhieuXuat = table.Column<int>(type: "int", nullable: false),
                    MaChiTietNhap = table.Column<int>(type: "int", nullable: false),
                    SoLuongXuat = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    DonGiaXuat = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiTietXuatKho", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChiTietXuatKho_ChiTietNhapKho_MaChiTietNhap",
                        column: x => x.MaChiTietNhap,
                        principalTable: "ChiTietNhapKho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChiTietXuatKho_PhieuXuatKho_MaPhieuXuat",
                        column: x => x.MaPhieuXuat,
                        principalTable: "PhieuXuatKho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BangLuong_MaKyLuong_MaNhanVien",
                table: "BangLuong",
                columns: new[] { "MaKyLuong", "MaNhanVien" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BangLuong_MaNhanVien",
                table: "BangLuong",
                column: "MaNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_BaoHiem_MaBenhNhan",
                table: "BaoHiem",
                column: "MaBenhNhan");

            migrationBuilder.CreateIndex(
                name: "IX_BaoHiem_SoThe",
                table: "BaoHiem",
                column: "SoThe",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BenhNhan_Email",
                table: "BenhNhan",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BenhNhan_SoCCCD",
                table: "BenhNhan",
                column: "SoCCCD",
                unique: true,
                filter: "[SoCCCD] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BenhNhan_Username",
                table: "BenhNhan",
                column: "Username",
                unique: true,
                filter: "[Username] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BenhNhanCoSo_MaBenhNhan",
                table: "BenhNhanCoSo",
                column: "MaBenhNhan");

            migrationBuilder.CreateIndex(
                name: "IX_BenhNhanCoSo_MaCoSo_MaBenhNhanNoiBo",
                table: "BenhNhanCoSo",
                columns: new[] { "MaCoSo", "MaBenhNhanNoiBo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CaTruc_MaLoaiCa",
                table: "CaTruc",
                column: "MaLoaiCa");

            migrationBuilder.CreateIndex(
                name: "IX_ChamCong_MaLichLamViec",
                table: "ChamCong",
                column: "MaLichLamViec",
                unique: true,
                filter: "[MaLichLamViec] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ChamCong_MaNhanVien",
                table: "ChamCong",
                column: "MaNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_ChanDoan_MaICD",
                table: "ChanDoan",
                column: "MaICD");

            migrationBuilder.CreateIndex(
                name: "IX_ChanDoan_MaLuotKham",
                table: "ChanDoan",
                column: "MaLuotKham",
                unique: true,
                filter: "[LaChanDoanChinh] = 1 AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_ChiDinhDichVu_MaBacSiChiDinh",
                table: "ChiDinhDichVu",
                column: "MaBacSiChiDinh");

            migrationBuilder.CreateIndex(
                name: "IX_ChiDinhDichVu_MaDanhMuc",
                table: "ChiDinhDichVu",
                column: "MaDanhMuc");

            migrationBuilder.CreateIndex(
                name: "IX_ChiDinhDichVu_MaLuotKham",
                table: "ChiDinhDichVu",
                column: "MaLuotKham");

            migrationBuilder.CreateIndex(
                name: "IX_ChiDinhDichVu_MaNguoiThucHien",
                table: "ChiDinhDichVu",
                column: "MaNguoiThucHien");

            migrationBuilder.CreateIndex(
                name: "IX_ChiDinhDichVu_NgayChiDinh",
                table: "ChiDinhDichVu",
                column: "NgayChiDinh");

            migrationBuilder.CreateIndex(
                name: "IX_ChiDinhDichVu_TrangThai",
                table: "ChiDinhDichVu",
                column: "TrangThai");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietBangLuong_MaBangLuong",
                table: "ChiTietBangLuong",
                column: "MaBangLuong");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietDonThuoc_MaDonThuoc",
                table: "ChiTietDonThuoc",
                column: "MaDonThuoc");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietDonThuoc_MaItem",
                table: "ChiTietDonThuoc",
                column: "MaItem");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietHoaDon_LoaiDoiTuong_MaDoiTuong",
                table: "ChiTietHoaDon",
                columns: new[] { "LoaiDoiTuong", "MaDoiTuong" });

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietHoaDon_MaHoaDon",
                table: "ChiTietHoaDon",
                column: "MaHoaDon");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietKetQuaXetNghiem_MaChiDinh",
                table: "ChiTietKetQuaXetNghiem",
                column: "MaChiDinh");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietNhapKho_MaItem",
                table: "ChiTietNhapKho",
                column: "MaItem");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietNhapKho_MaPhieuNhap",
                table: "ChiTietNhapKho",
                column: "MaPhieuNhap");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietNhapKho_MaQuyDoi",
                table: "ChiTietNhapKho",
                column: "MaQuyDoi");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietXuatKho_MaChiTietNhap",
                table: "ChiTietXuatKho",
                column: "MaChiTietNhap");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietXuatKho_MaPhieuXuat",
                table: "ChiTietXuatKho",
                column: "MaPhieuXuat");

            migrationBuilder.CreateIndex(
                name: "IX_ChucVu_TenChucVu",
                table: "ChucVu",
                column: "TenChucVu",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CongNoBenhNhan_MaBenhNhan",
                table: "CongNoBenhNhan",
                column: "MaBenhNhan");

            migrationBuilder.CreateIndex(
                name: "IX_CongNoBenhNhan_MaHoaDon",
                table: "CongNoBenhNhan",
                column: "MaHoaDon",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CongNoBenhNhan_TrangThai_HanThanhToan",
                table: "CongNoBenhNhan",
                columns: new[] { "TrangThai", "HanThanhToan" });

            migrationBuilder.CreateIndex(
                name: "IX_CoSo_Ma",
                table: "CoSo",
                column: "Ma",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DanhMucDichVu_LoaiDichVu_Ma",
                table: "DanhMucDichVu",
                columns: new[] { "LoaiDichVu", "Ma" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DanhMucDichVu_Ten",
                table: "DanhMucDichVu",
                column: "Ten");

            migrationBuilder.CreateIndex(
                name: "IX_DieuChinhChamCong_MaChamCong_TrangThai",
                table: "DieuChinhChamCong",
                columns: new[] { "MaChamCong", "TrangThai" });

            migrationBuilder.CreateIndex(
                name: "IX_DieuChinhChamCong_MaNhanVien",
                table: "DieuChinhChamCong",
                column: "MaNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_DonThuoc_MaBacSi",
                table: "DonThuoc",
                column: "MaBacSi");

            migrationBuilder.CreateIndex(
                name: "IX_DonThuoc_MaCoSo",
                table: "DonThuoc",
                column: "MaCoSo");

            migrationBuilder.CreateIndex(
                name: "IX_DonThuoc_MaLuotKham",
                table: "DonThuoc",
                column: "MaLuotKham");

            migrationBuilder.CreateIndex(
                name: "IX_DonThuoc_MaNguoiCapThuoc",
                table: "DonThuoc",
                column: "MaNguoiCapThuoc");

            migrationBuilder.CreateIndex(
                name: "IX_DonThuoc_NgayKe",
                table: "DonThuoc",
                column: "NgayKe");

            migrationBuilder.CreateIndex(
                name: "IX_DonThuoc_TrangThai",
                table: "DonThuoc",
                column: "TrangThai");

            migrationBuilder.CreateIndex(
                name: "IX_DonViTinhQuyDoi_MaItem_DonVi",
                table: "DonViTinhQuyDoi",
                columns: new[] { "MaItem", "DonVi" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HoaDon_MaBenhNhan",
                table: "HoaDon",
                column: "MaBenhNhan");

            migrationBuilder.CreateIndex(
                name: "IX_HoaDon_MaCoSo",
                table: "HoaDon",
                column: "MaCoSo");

            migrationBuilder.CreateIndex(
                name: "IX_HoaDon_MaLuotKham",
                table: "HoaDon",
                column: "MaLuotKham");

            migrationBuilder.CreateIndex(
                name: "IX_HoaDon_NgayLap",
                table: "HoaDon",
                column: "NgayLap");

            migrationBuilder.CreateIndex(
                name: "IX_HoaDon_SoHoaDon",
                table: "HoaDon",
                column: "SoHoaDon",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HoaDon_TrangThai",
                table: "HoaDon",
                column: "TrangThai");

            migrationBuilder.CreateIndex(
                name: "IX_ICD_MaICD",
                table: "ICD",
                column: "MaICD",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IdempotencyRecord_Key_Operation",
                table: "IdempotencyRecord",
                columns: new[] { "Key", "Operation" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_IdempotencyKey",
                table: "InventoryTransaction",
                column: "IdempotencyKey",
                filter: "[IdempotencyKey] <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_MaItem_CreatedAt",
                table: "InventoryTransaction",
                columns: new[] { "MaItem", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_MaTonKho",
                table: "InventoryTransaction",
                column: "MaTonKho");

            migrationBuilder.CreateIndex(
                name: "IX_Item_Ma",
                table: "Item",
                column: "Ma",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Item_Ten",
                table: "Item",
                column: "Ten");

            migrationBuilder.CreateIndex(
                name: "IX_Kho_MaCoSo",
                table: "Kho",
                column: "MaCoSo");

            migrationBuilder.CreateIndex(
                name: "IX_Kho_MaKhoa",
                table: "Kho",
                column: "MaKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_Kho_MaNguoiPhuTrach",
                table: "Kho",
                column: "MaNguoiPhuTrach");

            migrationBuilder.CreateIndex(
                name: "IX_Kho_TrangThai",
                table: "Kho",
                column: "TrangThai");

            migrationBuilder.CreateIndex(
                name: "IX_Khoa_MaCoSo_Ma",
                table: "Khoa",
                columns: new[] { "MaCoSo", "Ma" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Khoa_MaKhoaCha",
                table: "Khoa",
                column: "MaKhoaCha");

            migrationBuilder.CreateIndex(
                name: "IX_KyChamCong_TuNgay_DenNgay",
                table: "KyChamCong",
                columns: new[] { "TuNgay", "DenNgay" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KyLuong_MaKyChamCong",
                table: "KyLuong",
                column: "MaKyChamCong");

            migrationBuilder.CreateIndex(
                name: "IX_KyLuong_Thang_Nam",
                table: "KyLuong",
                columns: new[] { "Thang", "Nam" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LichHen_MaBacSi_ThoiGianBatDau",
                table: "LichHen",
                columns: new[] { "MaBacSi", "ThoiGianBatDau" });

            migrationBuilder.CreateIndex(
                name: "IX_LichHen_MaBenhNhan_ThoiGianBatDau",
                table: "LichHen",
                columns: new[] { "MaBenhNhan", "ThoiGianBatDau" });

            migrationBuilder.CreateIndex(
                name: "IX_LichHen_MaCoSo",
                table: "LichHen",
                column: "MaCoSo");

            migrationBuilder.CreateIndex(
                name: "IX_LichHen_MaKhoa",
                table: "LichHen",
                column: "MaKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_LichHen_ThoiGianBatDau",
                table: "LichHen",
                column: "ThoiGianBatDau");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaCaTruc",
                table: "LichLamViec",
                column: "MaCaTruc");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaKhoa_NgayLam",
                table: "LichLamViec",
                columns: new[] { "MaKhoa", "NgayLam" });

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaLichLamViecCoDinh",
                table: "LichLamViec",
                column: "MaLichLamViecCoDinh");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaNhanVien_MaCaTruc_NgayLam",
                table: "LichLamViec",
                columns: new[] { "MaNhanVien", "MaCaTruc", "NgayLam" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaPhongKham",
                table: "LichLamViec",
                column: "MaPhongKham");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViecCoDinh_MaCaTruc",
                table: "LichLamViecCoDinh",
                column: "MaCaTruc");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViecCoDinh_MaKhoa",
                table: "LichLamViecCoDinh",
                column: "MaKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViecCoDinh_MaNhanVien_MaKhoa_MaCaTruc_ThuTrongTuan_TuNgay",
                table: "LichLamViecCoDinh",
                columns: new[] { "MaNhanVien", "MaKhoa", "MaCaTruc", "ThuTrongTuan", "TuNgay" });

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViecCoDinh_MaPhongKham",
                table: "LichLamViecCoDinh",
                column: "MaPhongKham");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViecDieuChinh_MaLichLamViec_ThoiDiem",
                table: "LichLamViecDieuChinh",
                columns: new[] { "MaLichLamViec", "ThoiDiem" });

            migrationBuilder.CreateIndex(
                name: "IX_LoaiCa_Ma",
                table: "LoaiCa",
                column: "Ma",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaBacSi_NgayKham",
                table: "LuotKham",
                columns: new[] { "MaBacSi", "NgayKham" },
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaBenhNhan_NgayKham",
                table: "LuotKham",
                columns: new[] { "MaBenhNhan", "NgayKham" },
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaCoSo",
                table: "LuotKham",
                column: "MaCoSo");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaKhoa",
                table: "LuotKham",
                column: "MaKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaLichHen",
                table: "LuotKham",
                column: "MaLichHen");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaPhongKham",
                table: "LuotKham",
                column: "MaPhongKham",
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_NgayKham",
                table: "LuotKham",
                column: "NgayKham",
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_TrangThai",
                table: "LuotKham",
                column: "TrangThai",
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_MaTranPhanQuyen_MaVaiTro_PhanHe_HanhDong",
                table: "MaTranPhanQuyen",
                columns: new[] { "MaVaiTro", "PhanHe", "HanhDong" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NghiPhep_MaNhanVien_TrangThai",
                table: "NghiPhep",
                columns: new[] { "MaNhanVien", "TrangThai" });

            migrationBuilder.CreateIndex(
                name: "IX_NghiPhep_NguoiDuyet",
                table: "NghiPhep",
                column: "NguoiDuyet");

            migrationBuilder.CreateIndex(
                name: "IX_NghiPhep_TuNgay_DenNgay",
                table: "NghiPhep",
                columns: new[] { "TuNgay", "DenNgay" });

            migrationBuilder.CreateIndex(
                name: "IX_NhaCungCap_DienThoai",
                table: "NhaCungCap",
                column: "DienThoai");

            migrationBuilder.CreateIndex(
                name: "IX_NhaCungCap_Ma",
                table: "NhaCungCap",
                column: "Ma",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NhanVien_Email",
                table: "NhanVien",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NhanVien_MaChucVu",
                table: "NhanVien",
                column: "MaChucVu");

            migrationBuilder.CreateIndex(
                name: "IX_NhanVien_PhongKhamId",
                table: "NhanVien",
                column: "PhongKhamId");

            migrationBuilder.CreateIndex(
                name: "IX_NhanVien_SoHanhNghe",
                table: "NhanVien",
                column: "SoHanhNghe",
                unique: true,
                filter: "[SoHanhNghe] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NhanVien_Username",
                table: "NhanVien",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NhanVienKhoa_MaKhoa",
                table: "NhanVienKhoa",
                column: "MaKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_NhanVienKhoa_MaNhanVien",
                table: "NhanVienKhoa",
                column: "MaNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_NhanVienVaiTro_MaNhanVien",
                table: "NhanVienVaiTro",
                column: "MaNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_NhanVienVaiTro_MaVaiTro",
                table: "NhanVienVaiTro",
                column: "MaVaiTro");

            migrationBuilder.CreateIndex(
                name: "IX_NhatKyHeThong_Bang_MaBangGhi",
                table: "NhatKyHeThong",
                columns: new[] { "Bang", "MaBangGhi" });

            migrationBuilder.CreateIndex(
                name: "IX_NhatKyHeThong_NguoiThucHien",
                table: "NhatKyHeThong",
                column: "NguoiThucHien");

            migrationBuilder.CreateIndex(
                name: "IX_NhatKyHeThong_ThoiGian",
                table: "NhatKyHeThong",
                column: "ThoiGian");

            migrationBuilder.CreateIndex(
                name: "IX_PhanQuyenCoSo_MaCoSo",
                table: "PhanQuyenCoSo",
                column: "MaCoSo");

            migrationBuilder.CreateIndex(
                name: "IX_PhanQuyenCoSo_MaNhanVien",
                table: "PhanQuyenCoSo",
                column: "MaNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_PhanQuyenCoSo_MaVaiTro",
                table: "PhanQuyenCoSo",
                column: "MaVaiTro");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuNhapKho_MaCoSo",
                table: "PhieuNhapKho",
                column: "MaCoSo");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuNhapKho_MaKho",
                table: "PhieuNhapKho",
                column: "MaKho");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuNhapKho_MaNguoiNhap",
                table: "PhieuNhapKho",
                column: "MaNguoiNhap");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuNhapKho_MaNhaCungCap",
                table: "PhieuNhapKho",
                column: "MaNhaCungCap");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuNhapKho_MaPhieu",
                table: "PhieuNhapKho",
                column: "MaPhieu",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhieuNhapKho_NgayNhap",
                table: "PhieuNhapKho",
                column: "NgayNhap");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuNhapKho_TrangThai",
                table: "PhieuNhapKho",
                column: "TrangThai");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuThu_MaBenhNhan",
                table: "PhieuThu",
                column: "MaBenhNhan");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuThu_MaHoaDon",
                table: "PhieuThu",
                column: "MaHoaDon");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuThu_MaLuotKham",
                table: "PhieuThu",
                column: "MaLuotKham");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuThu_MaNguoiThu",
                table: "PhieuThu",
                column: "MaNguoiThu");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuThu_NgayThu",
                table: "PhieuThu",
                column: "NgayThu");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuThu_SoPhieuThu",
                table: "PhieuThu",
                column: "SoPhieuThu",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_LoaiXuat",
                table: "PhieuXuatKho",
                column: "LoaiXuat");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_MaDonThuoc",
                table: "PhieuXuatKho",
                column: "MaDonThuoc");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_MaKhoNhan",
                table: "PhieuXuatKho",
                column: "MaKhoNhan");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_MaKhoXuat",
                table: "PhieuXuatKho",
                column: "MaKhoXuat");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_MaNguoiXuat",
                table: "PhieuXuatKho",
                column: "MaNguoiXuat");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_MaPhieu",
                table: "PhieuXuatKho",
                column: "MaPhieu",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_NgayXuat",
                table: "PhieuXuatKho",
                column: "NgayXuat");

            migrationBuilder.CreateIndex(
                name: "IX_PhongKham_Ma",
                table: "PhongKham",
                column: "Ma",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhongKham_MaKhoa",
                table: "PhongKham",
                column: "MaKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_SinhHieu_MaLuotKham",
                table: "SinhHieu",
                column: "MaLuotKham");

            migrationBuilder.CreateIndex(
                name: "IX_Stocktake_ReferenceCode",
                table: "Stocktake",
                column: "ReferenceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeCount_MaTonKho",
                table: "StocktakeCount",
                column: "MaTonKho");

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeCount_StocktakeId_MaTonKho",
                table: "StocktakeCount",
                columns: new[] { "StocktakeId", "MaTonKho" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ThamSoHeThong_MaCoSo_TenThamSo",
                table: "ThamSoHeThong",
                columns: new[] { "MaCoSo", "TenThamSo" },
                unique: true,
                filter: "[MaCoSo] IS NOT NULL AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_ThamSoHeThong_TenThamSo",
                table: "ThamSoHeThong",
                column: "TenThamSo",
                unique: true,
                filter: "[MaCoSo] IS NULL AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_TienSuBenh_MaBenhNhan",
                table: "TienSuBenh",
                column: "MaBenhNhan");

            migrationBuilder.CreateIndex(
                name: "IX_TokenLamMoi_MaBenhNhan",
                table: "TokenLamMoi",
                column: "MaBenhNhan");

            migrationBuilder.CreateIndex(
                name: "IX_TokenLamMoi_MaNhanVien",
                table: "TokenLamMoi",
                column: "MaNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_TokenLamMoi_MaToken",
                table: "TokenLamMoi",
                column: "MaToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TonKho_MaChiTietNhap",
                table: "TonKho",
                column: "MaChiTietNhap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TonKho_MaItem",
                table: "TonKho",
                column: "MaItem");

            migrationBuilder.CreateIndex(
                name: "IX_TonKho_MaKho_MaItem",
                table: "TonKho",
                columns: new[] { "MaKho", "MaItem" });

            migrationBuilder.CreateIndex(
                name: "IX_VaiTro_TenVaiTro",
                table: "VaiTro",
                column: "TenVaiTro",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BaoHiem");

            migrationBuilder.DropTable(
                name: "BenhNhanCoSo");

            migrationBuilder.DropTable(
                name: "CauHinhTichHops");

            migrationBuilder.DropTable(
                name: "ChanDoan");

            migrationBuilder.DropTable(
                name: "ChiTietBangLuong");

            migrationBuilder.DropTable(
                name: "ChiTietDonThuoc");

            migrationBuilder.DropTable(
                name: "ChiTietHoaDon");

            migrationBuilder.DropTable(
                name: "ChiTietKetQuaXetNghiem");

            migrationBuilder.DropTable(
                name: "ChiTietXuatKho");

            migrationBuilder.DropTable(
                name: "CongNoBenhNhan");

            migrationBuilder.DropTable(
                name: "DieuChinhChamCong");

            migrationBuilder.DropTable(
                name: "IdempotencyRecord");

            migrationBuilder.DropTable(
                name: "InventoryTransaction");

            migrationBuilder.DropTable(
                name: "LichLamViecDieuChinh");

            migrationBuilder.DropTable(
                name: "MaTranPhanQuyen");

            migrationBuilder.DropTable(
                name: "NghiPhep");

            migrationBuilder.DropTable(
                name: "NhanVienKhoa");

            migrationBuilder.DropTable(
                name: "NhanVienVaiTro");

            migrationBuilder.DropTable(
                name: "NhatKyHeThong");

            migrationBuilder.DropTable(
                name: "NhatKyHoSoBenhAns");

            migrationBuilder.DropTable(
                name: "PhanQuyenCoSo");

            migrationBuilder.DropTable(
                name: "PhieuThu");

            migrationBuilder.DropTable(
                name: "SinhHieu");

            migrationBuilder.DropTable(
                name: "StocktakeCount");

            migrationBuilder.DropTable(
                name: "ThamSoHeThong");

            migrationBuilder.DropTable(
                name: "TienSuBenh");

            migrationBuilder.DropTable(
                name: "TokenLamMoi");

            migrationBuilder.DropTable(
                name: "ICD");

            migrationBuilder.DropTable(
                name: "BangLuong");

            migrationBuilder.DropTable(
                name: "ChiDinhDichVu");

            migrationBuilder.DropTable(
                name: "PhieuXuatKho");

            migrationBuilder.DropTable(
                name: "ChamCong");

            migrationBuilder.DropTable(
                name: "VaiTro");

            migrationBuilder.DropTable(
                name: "HoaDon");

            migrationBuilder.DropTable(
                name: "Stocktake");

            migrationBuilder.DropTable(
                name: "TonKho");

            migrationBuilder.DropTable(
                name: "KyLuong");

            migrationBuilder.DropTable(
                name: "DanhMucDichVu");

            migrationBuilder.DropTable(
                name: "DonThuoc");

            migrationBuilder.DropTable(
                name: "LichLamViec");

            migrationBuilder.DropTable(
                name: "ChiTietNhapKho");

            migrationBuilder.DropTable(
                name: "KyChamCong");

            migrationBuilder.DropTable(
                name: "LuotKham");

            migrationBuilder.DropTable(
                name: "LichLamViecCoDinh");

            migrationBuilder.DropTable(
                name: "DonViTinhQuyDoi");

            migrationBuilder.DropTable(
                name: "PhieuNhapKho");

            migrationBuilder.DropTable(
                name: "LichHen");

            migrationBuilder.DropTable(
                name: "CaTruc");

            migrationBuilder.DropTable(
                name: "Item");

            migrationBuilder.DropTable(
                name: "Kho");

            migrationBuilder.DropTable(
                name: "NhaCungCap");

            migrationBuilder.DropTable(
                name: "BenhNhan");

            migrationBuilder.DropTable(
                name: "LoaiCa");

            migrationBuilder.DropTable(
                name: "NhanVien");

            migrationBuilder.DropTable(
                name: "ChucVu");

            migrationBuilder.DropTable(
                name: "PhongKham");

            migrationBuilder.DropTable(
                name: "Khoa");

            migrationBuilder.DropTable(
                name: "CoSo");
        }
    }
}
