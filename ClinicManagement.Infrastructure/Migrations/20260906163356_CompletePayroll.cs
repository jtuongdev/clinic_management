using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CompletePayroll : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "LuongCoBan",
                table: "NhanVien",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "MaKyChamCong",
                table: "KyLuong",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaKyChamCong",
                table: "BangLuong",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_KyLuong_MaKyChamCong",
                table: "KyLuong",
                column: "MaKyChamCong");

            migrationBuilder.AddForeignKey(
                name: "FK_KyLuong_KyChamCong_MaKyChamCong",
                table: "KyLuong",
                column: "MaKyChamCong",
                principalTable: "KyChamCong",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KyLuong_KyChamCong_MaKyChamCong",
                table: "KyLuong");

            migrationBuilder.DropIndex(
                name: "IX_KyLuong_MaKyChamCong",
                table: "KyLuong");

            migrationBuilder.DropColumn(
                name: "LuongCoBan",
                table: "NhanVien");

            migrationBuilder.DropColumn(
                name: "MaKyChamCong",
                table: "KyLuong");

            migrationBuilder.DropColumn(
                name: "MaKyChamCong",
                table: "BangLuong");
        }
    }
}
