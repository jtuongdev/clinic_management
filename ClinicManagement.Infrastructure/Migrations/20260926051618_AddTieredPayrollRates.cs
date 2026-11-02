using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTieredPayrollRates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "ThuLaoMoiLuot",
                table: "NhanVien",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldPrecision: 18,
                oldScale: 2,
                oldDefaultValue: 0m);

            migrationBuilder.AlterColumn<decimal>(
                name: "TyLeHoaHong",
                table: "DanhMucDichVu",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldDefaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ThuLaoMoiLuot",
                table: "ChucVu",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "CauHinhHoaHongLoaiDichVu",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoaiDichVu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TyLeHoaHong = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    GhiChu = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CauHinhHoaHongLoaiDichVu", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CauHinhHoaHongLoaiDichVu_LoaiDichVu",
                table: "CauHinhHoaHongLoaiDichVu",
                column: "LoaiDichVu",
                unique: true);

            // Seed dữ liệu mặc định ban đầu cho 4 nhóm Loại dịch vụ
            migrationBuilder.InsertData(
                table: "CauHinhHoaHongLoaiDichVu",
                columns: new[] { "LoaiDichVu", "TyLeHoaHong", "GhiChu", "CreatedAt", "IsDeleted" },
                values: new object[,]
                {
                    { "Kham", 0.00m, "Khám bệnh lâm sàng (hưởng thù lao theo lượt)", DateTime.UtcNow, false },
                    { "XetNghiem", 10.00m, "Xét nghiệm huyết học, sinh hóa, vi sinh (10%)", DateTime.UtcNow, false },
                    { "ChanDoanHinhAnh", 15.00m, "Chẩn đoán hình ảnh: X-quang, Siêu âm, CT (15%)", DateTime.UtcNow, false },
                    { "DichVuKyThuat", 10.00m, "Thủ thuật, can thiệp kỹ thuật (10%)", DateTime.UtcNow, false }
                });

            // Cập nhật thù lao mặc định cho chức vụ Bác sĩ
            migrationBuilder.Sql("UPDATE ChucVu SET ThuLaoMoiLuot = 50000 WHERE TenChucVu LIKE N'%Bác sĩ%' OR TenChucVu LIKE N'%bác sĩ%' OR TenChucVu LIKE N'%Trưởng khoa%';");

            // Chuyển các giá trị 0 mặc định cũ về NULL để tự động kế thừa từ cấu hình phân cấp
            migrationBuilder.Sql("UPDATE NhanVien SET ThuLaoMoiLuot = NULL WHERE ThuLaoMoiLuot = 0;");
            migrationBuilder.Sql("UPDATE DanhMucDichVu SET TyLeHoaHong = NULL WHERE TyLeHoaHong = 0;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CauHinhHoaHongLoaiDichVu");

            migrationBuilder.DropColumn(
                name: "ThuLaoMoiLuot",
                table: "ChucVu");

            migrationBuilder.AlterColumn<decimal>(
                name: "ThuLaoMoiLuot",
                table: "NhanVien",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldPrecision: 18,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "TyLeHoaHong",
                table: "DanhMucDichVu",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);
        }
    }
}
