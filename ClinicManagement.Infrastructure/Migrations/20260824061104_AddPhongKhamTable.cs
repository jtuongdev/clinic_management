using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPhongKhamTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PhongKham_Khoa_KhoaId",
                table: "PhongKham");

            migrationBuilder.DropIndex(
                name: "IX_PhongKham_KhoaId",
                table: "PhongKham");

            migrationBuilder.DropColumn(
                name: "KhoaId",
                table: "PhongKham");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KhoaId",
                table: "PhongKham",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhongKham_KhoaId",
                table: "PhongKham",
                column: "KhoaId");

            migrationBuilder.AddForeignKey(
                name: "FK_PhongKham_Khoa_KhoaId",
                table: "PhongKham",
                column: "KhoaId",
                principalTable: "Khoa",
                principalColumn: "Id");
        }
    }
}
