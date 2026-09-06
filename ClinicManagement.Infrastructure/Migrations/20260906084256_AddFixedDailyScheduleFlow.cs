using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFixedDailyScheduleFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaLichLamViecCoDinh",
                table: "LichLamViec",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaPhongKham",
                table: "LichLamViec",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NguonLich",
                table: "LichLamViec",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

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
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaLichLamViecCoDinh",
                table: "LichLamViec",
                column: "MaLichLamViecCoDinh");

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

            migrationBuilder.AddForeignKey(
                name: "FK_LichLamViec_LichLamViecCoDinh_MaLichLamViecCoDinh",
                table: "LichLamViec",
                column: "MaLichLamViecCoDinh",
                principalTable: "LichLamViecCoDinh",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LichLamViec_PhongKham_MaPhongKham",
                table: "LichLamViec",
                column: "MaPhongKham",
                principalTable: "PhongKham",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LichLamViec_LichLamViecCoDinh_MaLichLamViecCoDinh",
                table: "LichLamViec");

            migrationBuilder.DropForeignKey(
                name: "FK_LichLamViec_PhongKham_MaPhongKham",
                table: "LichLamViec");

            migrationBuilder.DropTable(
                name: "LichLamViecCoDinh");

            migrationBuilder.DropIndex(
                name: "IX_LichLamViec_MaLichLamViecCoDinh",
                table: "LichLamViec");

            migrationBuilder.DropIndex(
                name: "IX_LichLamViec_MaPhongKham",
                table: "LichLamViec");

            migrationBuilder.DropColumn(
                name: "MaLichLamViecCoDinh",
                table: "LichLamViec");

            migrationBuilder.DropColumn(
                name: "MaPhongKham",
                table: "LichLamViec");

            migrationBuilder.DropColumn(
                name: "NguonLich",
                table: "LichLamViec");
        }
    }
}
