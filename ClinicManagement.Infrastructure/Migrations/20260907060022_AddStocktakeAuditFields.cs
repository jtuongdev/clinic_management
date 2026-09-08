using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStocktakeAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_InventoryTransaction_IdempotencyKey",
                table: "InventoryTransaction");

            migrationBuilder.AddColumn<int>(
                name: "ApprovedByUserId",
                table: "Stocktake",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubmittedByUserId",
                table: "Stocktake",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_IdempotencyKey",
                table: "InventoryTransaction",
                column: "IdempotencyKey",
                filter: "[IdempotencyKey] <> ''");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_InventoryTransaction_IdempotencyKey",
                table: "InventoryTransaction");

            migrationBuilder.DropColumn(
                name: "ApprovedByUserId",
                table: "Stocktake");

            migrationBuilder.DropColumn(
                name: "SubmittedByUserId",
                table: "Stocktake");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_IdempotencyKey",
                table: "InventoryTransaction",
                column: "IdempotencyKey",
                unique: true,
                filter: "[IdempotencyKey] <> ''");
        }
    }
}
