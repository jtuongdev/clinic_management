using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentToWorkSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaKhoa",
                table: "LichLamViec",
                type: "int",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE l
                SET MaKhoa = nk.MaKhoa
                FROM LichLamViec l
                CROSS APPLY (
                    SELECT TOP 1 MaKhoa
                    FROM NhanVienKhoa
                    WHERE MaNhanVien = l.MaNhanVien
                      AND TuNgay <= l.NgayLam
                      AND (DenNgay IS NULL OR DenNgay >= l.NgayLam)
                    ORDER BY TuNgay DESC
                ) nk
                WHERE l.MaKhoa IS NULL;
                """);

            migrationBuilder.Sql("""
                UPDATE l
                SET MaKhoa = nk.MaKhoa
                FROM LichLamViec l
                CROSS APPLY (
                    SELECT TOP 1 MaKhoa
                    FROM NhanVienKhoa
                    WHERE MaNhanVien = l.MaNhanVien
                    ORDER BY
                        CASE WHEN LaKhoaChinh = 1 THEN 0 ELSE 1 END,
                        TuNgay DESC
                ) nk
                WHERE l.MaKhoa IS NULL;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM LichLamViec WHERE MaKhoa IS NULL)
                    THROW 51000, 'Khong the xac dinh khoa cho mot so lich lam viec cu. Can bo sung NhanVienKhoa truoc khi chay migration.', 1;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "MaKhoa",
                table: "LichLamViec",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaKhoa_NgayLam",
                table: "LichLamViec",
                columns: new[] { "MaKhoa", "NgayLam" });

            migrationBuilder.AddForeignKey(
                name: "FK_LichLamViec_Khoa_MaKhoa",
                table: "LichLamViec",
                column: "MaKhoa",
                principalTable: "Khoa",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LichLamViec_Khoa_MaKhoa",
                table: "LichLamViec");

            migrationBuilder.DropIndex(
                name: "IX_LichLamViec_MaKhoa_NgayLam",
                table: "LichLamViec");

            migrationBuilder.DropColumn(
                name: "MaKhoa",
                table: "LichLamViec");
        }
    }
}
