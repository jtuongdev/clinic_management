using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFixedScheduleTemplateAndMonthlyGeneration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LichLamViecCoDinh_MaNhanVien_MaKhoa_MaCaTruc_ThuTrongTuan_TuNgay",
                table: "LichLamViecCoDinh");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "LichLamViecCoDinh",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AlterColumn<string>(
                name: "NguonLich",
                table: "LichLamViec",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.CreateIndex(
                name: "IX_LichCoDinh_NhanVien_Thu_Ca",
                table: "LichLamViecCoDinh",
                columns: new[] { "MaNhanVien", "ThuTrongTuan", "MaCaTruc" },
                unique: true,
                filter: "[IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LichCoDinh_NhanVien_Thu_Ca",
                table: "LichLamViecCoDinh");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "LichLamViecCoDinh");

            migrationBuilder.AlterColumn<string>(
                name: "NguonLich",
                table: "LichLamViec",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViecCoDinh_MaNhanVien_MaKhoa_MaCaTruc_ThuTrongTuan_TuNgay",
                table: "LichLamViecCoDinh",
                columns: new[] { "MaNhanVien", "MaKhoa", "MaCaTruc", "ThuTrongTuan", "TuNgay" });
        }
    }
}
