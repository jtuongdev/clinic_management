using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPhongKham : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LuotKham_MaBacSi_NgayKham",
                table: "LuotKham");

            migrationBuilder.DropIndex(
                name: "IX_LuotKham_MaBenhNhan_NgayKham",
                table: "LuotKham");

            migrationBuilder.DropIndex(
                name: "IX_LuotKham_NgayKham",
                table: "LuotKham");

            migrationBuilder.DropIndex(
                name: "IX_LuotKham_TrangThai",
                table: "LuotKham");

            migrationBuilder.DropColumn(
                name: "PhongKham",
                table: "LuotKham");

            migrationBuilder.AddColumn<int>(
                name: "PhongKhamId",
                table: "NhanVien",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MaBacSi",
                table: "LuotKham",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "MaPhongKham",
                table: "LuotKham",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PhongKham",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaKhoa = table.Column<int>(type: "int", nullable: false),
                    Ma = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    KhoaId = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_PhongKham", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhongKham_Khoa_KhoaId",
                        column: x => x.KhoaId,
                        principalTable: "Khoa",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PhongKham_Khoa_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "Khoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NhanVien_PhongKhamId",
                table: "NhanVien",
                column: "PhongKhamId");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaBacSi_NgayKham",
                table: "LuotKham",
                columns: new[] { "MaBacSi", "NgayKham" },
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaBenhNhan_NgayKham",
                table: "LuotKham",
                columns: new[] { "MaBenhNhan", "NgayKham" },
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaPhongKham",
                table: "LuotKham",
                column: "MaPhongKham",
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_NgayKham",
                table: "LuotKham",
                column: "NgayKham",
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_TrangThai",
                table: "LuotKham",
                column: "TrangThai",
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_PhongKham_KhoaId",
                table: "PhongKham",
                column: "KhoaId");

            migrationBuilder.CreateIndex(
                name: "IX_PhongKham_Ma",
                table: "PhongKham",
                column: "Ma",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhongKham_MaKhoa",
                table: "PhongKham",
                column: "MaKhoa");

            migrationBuilder.AddForeignKey(
                name: "FK_LuotKham_PhongKham_MaPhongKham",
                table: "LuotKham",
                column: "MaPhongKham",
                principalTable: "PhongKham",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_NhanVien_PhongKham_PhongKhamId",
                table: "NhanVien",
                column: "PhongKhamId",
                principalTable: "PhongKham",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LuotKham_PhongKham_MaPhongKham",
                table: "LuotKham");

            migrationBuilder.DropForeignKey(
                name: "FK_NhanVien_PhongKham_PhongKhamId",
                table: "NhanVien");

            migrationBuilder.DropTable(
                name: "PhongKham");

            migrationBuilder.DropIndex(
                name: "IX_NhanVien_PhongKhamId",
                table: "NhanVien");

            migrationBuilder.DropIndex(
                name: "IX_LuotKham_MaBacSi_NgayKham",
                table: "LuotKham");

            migrationBuilder.DropIndex(
                name: "IX_LuotKham_MaBenhNhan_NgayKham",
                table: "LuotKham");

            migrationBuilder.DropIndex(
                name: "IX_LuotKham_MaPhongKham",
                table: "LuotKham");

            migrationBuilder.DropIndex(
                name: "IX_LuotKham_NgayKham",
                table: "LuotKham");

            migrationBuilder.DropIndex(
                name: "IX_LuotKham_TrangThai",
                table: "LuotKham");

            migrationBuilder.DropColumn(
                name: "PhongKhamId",
                table: "NhanVien");

            migrationBuilder.DropColumn(
                name: "MaPhongKham",
                table: "LuotKham");

            migrationBuilder.AlterColumn<int>(
                name: "MaBacSi",
                table: "LuotKham",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhongKham",
                table: "LuotKham",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaBacSi_NgayKham",
                table: "LuotKham",
                columns: new[] { "MaBacSi", "NgayKham" });

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_MaBenhNhan_NgayKham",
                table: "LuotKham",
                columns: new[] { "MaBenhNhan", "NgayKham" });

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_NgayKham",
                table: "LuotKham",
                column: "NgayKham");

            migrationBuilder.CreateIndex(
                name: "IX_LuotKham_TrangThai",
                table: "LuotKham",
                column: "TrangThai");
        }
    }
}
