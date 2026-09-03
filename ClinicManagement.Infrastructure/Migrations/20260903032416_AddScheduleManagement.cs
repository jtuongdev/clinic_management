using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScheduleManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LichTrucs_CaTruc_CaTrucId",
                table: "LichTrucs");

            migrationBuilder.DropForeignKey(
                name: "FK_LichTrucs_NhanVien_NhanVienId",
                table: "LichTrucs");

            migrationBuilder.DropIndex(
                name: "IX_LichLamViec_MaNhanVien_NgayLam",
                table: "LichLamViec");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LichTrucs",
                table: "LichTrucs");

            migrationBuilder.DropIndex(
                name: "IX_LichTrucs_CaTrucId",
                table: "LichTrucs");

            migrationBuilder.DropIndex(
                name: "IX_LichTrucs_NhanVienId",
                table: "LichTrucs");

            migrationBuilder.DropColumn(
                name: "CaTrucId",
                table: "LichTrucs");

            migrationBuilder.DropColumn(
                name: "NhanVienId",
                table: "LichTrucs");

            migrationBuilder.RenameTable(
                name: "LichTrucs",
                newName: "LichTruc");

            migrationBuilder.AlterColumn<string>(
                name: "GhiChu",
                table: "LichTruc",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LichTruc",
                table: "LichTruc",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaNhanVien_MaCaTruc_NgayLam",
                table: "LichLamViec",
                columns: new[] { "MaNhanVien", "MaCaTruc", "NgayLam" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LichTruc_MaCaTruc",
                table: "LichTruc",
                column: "MaCaTruc");

            migrationBuilder.CreateIndex(
                name: "IX_LichTruc_MaNhanVien_MaCaTruc_NgayTruc",
                table: "LichTruc",
                columns: new[] { "MaNhanVien", "MaCaTruc", "NgayTruc" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LichTruc_CaTruc_MaCaTruc",
                table: "LichTruc",
                column: "MaCaTruc",
                principalTable: "CaTruc",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LichTruc_NhanVien_MaNhanVien",
                table: "LichTruc",
                column: "MaNhanVien",
                principalTable: "NhanVien",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LichTruc_CaTruc_MaCaTruc",
                table: "LichTruc");

            migrationBuilder.DropForeignKey(
                name: "FK_LichTruc_NhanVien_MaNhanVien",
                table: "LichTruc");

            migrationBuilder.DropIndex(
                name: "IX_LichLamViec_MaNhanVien_MaCaTruc_NgayLam",
                table: "LichLamViec");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LichTruc",
                table: "LichTruc");

            migrationBuilder.DropIndex(
                name: "IX_LichTruc_MaCaTruc",
                table: "LichTruc");

            migrationBuilder.DropIndex(
                name: "IX_LichTruc_MaNhanVien_MaCaTruc_NgayTruc",
                table: "LichTruc");

            migrationBuilder.RenameTable(
                name: "LichTruc",
                newName: "LichTrucs");

            migrationBuilder.AlterColumn<string>(
                name: "GhiChu",
                table: "LichTrucs",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<int>(
                name: "CaTrucId",
                table: "LichTrucs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NhanVienId",
                table: "LichTrucs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_LichTrucs",
                table: "LichTrucs",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViec_MaNhanVien_NgayLam",
                table: "LichLamViec",
                columns: new[] { "MaNhanVien", "NgayLam" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LichTrucs_CaTrucId",
                table: "LichTrucs",
                column: "CaTrucId");

            migrationBuilder.CreateIndex(
                name: "IX_LichTrucs_NhanVienId",
                table: "LichTrucs",
                column: "NhanVienId");

            migrationBuilder.AddForeignKey(
                name: "FK_LichTrucs_CaTruc_CaTrucId",
                table: "LichTrucs",
                column: "CaTrucId",
                principalTable: "CaTruc",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LichTrucs_NhanVien_NhanVienId",
                table: "LichTrucs",
                column: "NhanVienId",
                principalTable: "NhanVien",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
