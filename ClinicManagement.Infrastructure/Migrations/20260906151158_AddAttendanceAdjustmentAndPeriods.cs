using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceAdjustmentAndPeriods : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
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
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_DieuChinhChamCong_MaChamCong_TrangThai",
                table: "DieuChinhChamCong",
                columns: new[] { "MaChamCong", "TrangThai" });

            migrationBuilder.CreateIndex(
                name: "IX_DieuChinhChamCong_MaNhanVien",
                table: "DieuChinhChamCong",
                column: "MaNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_KyChamCong_TuNgay_DenNgay",
                table: "KyChamCong",
                columns: new[] { "TuNgay", "DenNgay" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DieuChinhChamCong");

            migrationBuilder.DropTable(
                name: "KyChamCong");
        }
    }
}
