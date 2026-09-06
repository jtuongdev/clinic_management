using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPayrollCalculationSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PhuCapCoDinh",
                table: "NhanVien",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TyLeBaoHiem",
                table: "NhanVien",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "LoaiNghi",
                table: "ChamCong",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "KhauTruDiMuonVeSom",
                table: "BangLuong",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "KhauTruNghiKhongLuong",
                table: "BangLuong",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "LuongTheoNgayCong",
                table: "BangLuong",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TienBaoHiem",
                table: "BangLuong",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TienTangCa",
                table: "BangLuong",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhuCapCoDinh",
                table: "NhanVien");

            migrationBuilder.DropColumn(
                name: "TyLeBaoHiem",
                table: "NhanVien");

            migrationBuilder.DropColumn(
                name: "LoaiNghi",
                table: "ChamCong");

            migrationBuilder.DropColumn(
                name: "KhauTruDiMuonVeSom",
                table: "BangLuong");

            migrationBuilder.DropColumn(
                name: "KhauTruNghiKhongLuong",
                table: "BangLuong");

            migrationBuilder.DropColumn(
                name: "LuongTheoNgayCong",
                table: "BangLuong");

            migrationBuilder.DropColumn(
                name: "TienBaoHiem",
                table: "BangLuong");

            migrationBuilder.DropColumn(
                name: "TienTangCa",
                table: "BangLuong");
        }
    }
}
