using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLichHenFinancialColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ChiPhiGiuCho",
                table: "LichHen",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 100000m);

            migrationBuilder.AddColumn<bool>(
                name: "DaThanhToanGiuCho",
                table: "LichHen",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "GhiChuHuy",
                table: "LichHen",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayThanhToan",
                table: "LichHen",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NguoiThuTien",
                table: "LichHen",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SoPhieuThu",
                table: "LichHen",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChiPhiGiuCho",
                table: "LichHen");

            migrationBuilder.DropColumn(
                name: "DaThanhToanGiuCho",
                table: "LichHen");

            migrationBuilder.DropColumn(
                name: "GhiChuHuy",
                table: "LichHen");

            migrationBuilder.DropColumn(
                name: "NgayThanhToan",
                table: "LichHen");

            migrationBuilder.DropColumn(
                name: "NguoiThuTien",
                table: "LichHen");

            migrationBuilder.DropColumn(
                name: "SoPhieuThu",
                table: "LichHen");
        }
    }
}
