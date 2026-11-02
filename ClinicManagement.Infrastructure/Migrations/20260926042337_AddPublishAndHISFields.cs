using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPublishAndHISFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ThuLaoMoiLuot",
                table: "NhanVien",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "KyLuong",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "TyLeHoaHong",
                table: "DanhMucDichVu",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ThuLaoMoiLuot",
                table: "NhanVien");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "KyLuong");

            migrationBuilder.DropColumn(
                name: "TyLeHoaHong",
                table: "DanhMucDichVu");
        }
    }
}
