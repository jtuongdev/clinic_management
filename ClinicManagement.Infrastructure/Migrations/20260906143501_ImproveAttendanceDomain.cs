using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ImproveAttendanceDomain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LichLamViecDieuChinh",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaLichLamViec = table.Column<int>(type: "int", nullable: false),
                    CaCu = table.Column<int>(type: "int", nullable: true),
                    CaMoi = table.Column<int>(type: "int", nullable: true),
                    PhongCu = table.Column<int>(type: "int", nullable: true),
                    PhongMoi = table.Column<int>(type: "int", nullable: true),
                    TrangThaiCu = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TrangThaiMoi = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LyDo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NguoiThucHien = table.Column<int>(type: "int", nullable: false),
                    ThoiDiem = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    table.PrimaryKey("PK_LichLamViecDieuChinh", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LichLamViecDieuChinh_LichLamViec_MaLichLamViec",
                        column: x => x.MaLichLamViec,
                        principalTable: "LichLamViec",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LichLamViecDieuChinh_MaLichLamViec_ThoiDiem",
                table: "LichLamViecDieuChinh",
                columns: new[] { "MaLichLamViec", "ThoiDiem" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LichLamViecDieuChinh");
        }
    }
}
