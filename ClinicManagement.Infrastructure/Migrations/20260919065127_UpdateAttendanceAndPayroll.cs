using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAttendanceAndPayroll : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LichLamViec_MaNhanVien_MaCaTruc_NgayLam",
                table: "LichLamViec");

            migrationBuilder.DropIndex(
                name: "IX_ChamCong_MaLichLamViec",
                table: "ChamCong");

            migrationBuilder.AddColumn<decimal>(
                name: "TienNoKyNay",
                table: "BangLuong",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaNhanVien_MaCaTruc_NgayLam",
                table: "LichLamViec",
                columns: new[] { "MaNhanVien", "MaCaTruc", "NgayLam" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_ChamCong_MaLichLamViec",
                table: "ChamCong",
                column: "MaLichLamViec",
                unique: true,
                filter: "[IsDeleted] = 0 AND [MaLichLamViec] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LichLamViec_MaNhanVien_MaCaTruc_NgayLam",
                table: "LichLamViec");

            migrationBuilder.DropIndex(
                name: "IX_ChamCong_MaLichLamViec",
                table: "ChamCong");

            migrationBuilder.DropColumn(
                name: "TienNoKyNay",
                table: "BangLuong");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaNhanVien_MaCaTruc_NgayLam",
                table: "LichLamViec",
                columns: new[] { "MaNhanVien", "MaCaTruc", "NgayLam" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChamCong_MaLichLamViec",
                table: "ChamCong",
                column: "MaLichLamViec",
                unique: true,
                filter: "[MaLichLamViec] IS NOT NULL");
        }
    }
}
