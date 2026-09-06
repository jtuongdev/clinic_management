using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LinkAttendanceToDailySchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ChamCong_MaNhanVien_NgayChamCong",
                table: "ChamCong");

            migrationBuilder.AddColumn<double>(
                name: "GioLamThucTe",
                table: "ChamCong",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "MaLichLamViec",
                table: "ChamCong",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PhutDiMuon",
                table: "ChamCong",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PhutVeSom",
                table: "ChamCong",
                type: "int",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.AddForeignKey(
                name: "FK_ChamCong_LichLamViec_MaLichLamViec",
                table: "ChamCong",
                column: "MaLichLamViec",
                principalTable: "LichLamViec",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChamCong_LichLamViec_MaLichLamViec",
                table: "ChamCong");

            migrationBuilder.DropIndex(
                name: "IX_ChamCong_MaLichLamViec",
                table: "ChamCong");

            migrationBuilder.DropIndex(
                name: "IX_ChamCong_MaNhanVien",
                table: "ChamCong");

            migrationBuilder.DropColumn(
                name: "GioLamThucTe",
                table: "ChamCong");

            migrationBuilder.DropColumn(
                name: "MaLichLamViec",
                table: "ChamCong");

            migrationBuilder.DropColumn(
                name: "PhutDiMuon",
                table: "ChamCong");

            migrationBuilder.DropColumn(
                name: "PhutVeSom",
                table: "ChamCong");

            migrationBuilder.CreateIndex(
                name: "IX_ChamCong_MaNhanVien_NgayChamCong",
                table: "ChamCong",
                columns: new[] { "MaNhanVien", "NgayChamCong" },
                unique: true);
        }
    }
}
