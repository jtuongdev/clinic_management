using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDinhMucVatTuDichVu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "GhiChu",
                table: "PhieuThu",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "GhiChu",
                table: "HoaDon",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.CreateTable(
                name: "DinhMucVatTuDichVu",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaDanhMucDichVu = table.Column<int>(type: "int", nullable: false),
                    MaItem = table.Column<int>(type: "int", nullable: false),
                    SoLuong = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    DonViTinh = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
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
                    table.PrimaryKey("PK_DinhMucVatTuDichVu", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DinhMucVatTuDichVu_DanhMucDichVu_MaDanhMucDichVu",
                        column: x => x.MaDanhMucDichVu,
                        principalTable: "DanhMucDichVu",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DinhMucVatTuDichVu_Item_MaItem",
                        column: x => x.MaItem,
                        principalTable: "Item",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DinhMucVatTuDichVu_MaDanhMucDichVu_MaItem",
                table: "DinhMucVatTuDichVu",
                columns: new[] { "MaDanhMucDichVu", "MaItem" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DinhMucVatTuDichVu_MaItem",
                table: "DinhMucVatTuDichVu",
                column: "MaItem");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DinhMucVatTuDichVu");

            migrationBuilder.AlterColumn<string>(
                name: "GhiChu",
                table: "PhieuThu",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "GhiChu",
                table: "HoaDon",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldDefaultValue: "");
        }
    }
}
