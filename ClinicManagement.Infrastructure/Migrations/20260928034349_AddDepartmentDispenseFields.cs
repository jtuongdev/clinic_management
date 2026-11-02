using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentDispenseFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaKhoaNhan",
                table: "PhieuXuatKho",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NguoiNhanId",
                table: "PhieuXuatKho",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThaiXuat",
                table: "PhieuXuatKho",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaItemYeuCau",
                table: "ChiTietXuatKho",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_LoaiXuat_TrangThai_Khoa",
                table: "PhieuXuatKho",
                columns: new[] { "LoaiXuat", "TrangThaiXuat", "MaKhoaNhan" });

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_MaKhoaNhan",
                table: "PhieuXuatKho",
                column: "MaKhoaNhan");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuXuatKho_NguoiNhanId",
                table: "PhieuXuatKho",
                column: "NguoiNhanId");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietXuatKho_MaItemYeuCau",
                table: "ChiTietXuatKho",
                column: "MaItemYeuCau");

            migrationBuilder.AddForeignKey(
                name: "FK_ChiTietXuatKho_Item_MaItemYeuCau",
                table: "ChiTietXuatKho",
                column: "MaItemYeuCau",
                principalTable: "Item",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PhieuXuatKho_Khoa_MaKhoaNhan",
                table: "PhieuXuatKho",
                column: "MaKhoaNhan",
                principalTable: "Khoa",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PhieuXuatKho_NhanVien_NguoiNhanId",
                table: "PhieuXuatKho",
                column: "NguoiNhanId",
                principalTable: "NhanVien",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChiTietXuatKho_Item_MaItemYeuCau",
                table: "ChiTietXuatKho");

            migrationBuilder.DropForeignKey(
                name: "FK_PhieuXuatKho_Khoa_MaKhoaNhan",
                table: "PhieuXuatKho");

            migrationBuilder.DropForeignKey(
                name: "FK_PhieuXuatKho_NhanVien_NguoiNhanId",
                table: "PhieuXuatKho");

            migrationBuilder.DropIndex(
                name: "IX_PhieuXuatKho_LoaiXuat_TrangThai_Khoa",
                table: "PhieuXuatKho");

            migrationBuilder.DropIndex(
                name: "IX_PhieuXuatKho_MaKhoaNhan",
                table: "PhieuXuatKho");

            migrationBuilder.DropIndex(
                name: "IX_PhieuXuatKho_NguoiNhanId",
                table: "PhieuXuatKho");

            migrationBuilder.DropIndex(
                name: "IX_ChiTietXuatKho_MaItemYeuCau",
                table: "ChiTietXuatKho");

            migrationBuilder.DropColumn(
                name: "MaKhoaNhan",
                table: "PhieuXuatKho");

            migrationBuilder.DropColumn(
                name: "NguoiNhanId",
                table: "PhieuXuatKho");

            migrationBuilder.DropColumn(
                name: "TrangThaiXuat",
                table: "PhieuXuatKho");

            migrationBuilder.DropColumn(
                name: "MaItemYeuCau",
                table: "ChiTietXuatKho");
        }
    }
}
