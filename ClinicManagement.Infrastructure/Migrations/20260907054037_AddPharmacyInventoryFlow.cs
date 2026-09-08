using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPharmacyInventoryFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "TonKho",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "TonToiThieu",
                table: "Item",
                type: "decimal(12,3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "IdempotencyRecord",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Operation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StatusCode = table.Column<int>(type: "int", nullable: false),
                    ResponseJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_IdempotencyRecord", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InventoryTransaction",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoaiGiaoDich = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    MaItem = table.Column<int>(type: "int", nullable: false),
                    MaTonKho = table.Column<int>(type: "int", nullable: true),
                    SoLo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SoLuongTruoc = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    SoLuongThayDoi = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    SoLuongSau = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    MaChungTu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MaNguoiThucHien = table.Column<int>(type: "int", nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
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
                    table.PrimaryKey("PK_InventoryTransaction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryTransaction_Item_MaItem",
                        column: x => x.MaItem,
                        principalTable: "Item",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryTransaction_TonKho_MaTonKho",
                        column: x => x.MaTonKho,
                        principalTable: "TonKho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Stocktake",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReferenceCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_Stocktake", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StocktakeCount",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StocktakeId = table.Column<int>(type: "int", nullable: false),
                    MaTonKho = table.Column<int>(type: "int", nullable: false),
                    SystemQuantity = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    ActualQuantity = table.Column<decimal>(type: "decimal(12,3)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
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
                    table.PrimaryKey("PK_StocktakeCount", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StocktakeCount_Stocktake_StocktakeId",
                        column: x => x.StocktakeId,
                        principalTable: "Stocktake",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StocktakeCount_TonKho_MaTonKho",
                        column: x => x.MaTonKho,
                        principalTable: "TonKho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IdempotencyRecord_Key_Operation",
                table: "IdempotencyRecord",
                columns: new[] { "Key", "Operation" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_IdempotencyKey",
                table: "InventoryTransaction",
                column: "IdempotencyKey",
                filter: "[IdempotencyKey] <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_MaItem_CreatedAt",
                table: "InventoryTransaction",
                columns: new[] { "MaItem", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_MaTonKho",
                table: "InventoryTransaction",
                column: "MaTonKho");

            migrationBuilder.CreateIndex(
                name: "IX_Stocktake_ReferenceCode",
                table: "Stocktake",
                column: "ReferenceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeCount_MaTonKho",
                table: "StocktakeCount",
                column: "MaTonKho");

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeCount_StocktakeId_MaTonKho",
                table: "StocktakeCount",
                columns: new[] { "StocktakeId", "MaTonKho" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IdempotencyRecord");

            migrationBuilder.DropTable(
                name: "InventoryTransaction");

            migrationBuilder.DropTable(
                name: "StocktakeCount");

            migrationBuilder.DropTable(
                name: "Stocktake");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "TonKho");

            migrationBuilder.DropColumn(
                name: "TonToiThieu",
                table: "Item");
        }
    }
}
