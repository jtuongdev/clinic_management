# Controller Authorization Audit Report

| Controller File | Auth Mechanism | Notes |
|-----------------|----------------|-------|
| AdminDashboardController.cs | ⚠️ Authorize | `Basic Auth` |
| AdminSettingsController.cs | ✅ ClinicalAuthorize | `ClinicalAuthorize("settings", PermissionAction.VIEW, DataScope.ALL_FACILITIES)` |
| AuthController.cs | ⚠️ Authorize | `Basic Auth` |
| BaseController.cs | ❓ No Auth Found | `Needs review` |
| BenhNhanController.cs | ⚠️ Authorize(Roles) | `// Authorize(Roles = "Admin,LeTan")` |
| Profile.BenhNhan.Controller.cs | ❓ No Auth Found | `Needs review` |
| BillingController.cs | ⚠️ Authorize | `Basic Auth` |
| CaTrucController.cs | ⚠️ Authorize(Roles) | `Authorize(Roles = "Admin")` |
| ChamCongController.cs | ⚠️ Authorize(Roles) | `Authorize(Roles = "Admin")` |
| ClinicalSafetyController.cs | ❓ No Auth Found | `Needs review` |
| ClinicalTransactionsController.cs | ✅ ClinicalAuthorize | `ClinicalAuthorize("examination", PermissionAction.VIEW)` |
| CoSoController.cs | ⚠️ Authorize | `Basic Auth` |
| EnumCatalogController.cs | ⚠️ Authorize | `Basic Auth` |
| InventoryController.cs | ❓ No Auth Found | `Needs review` |
| Audit.InventoryController.cs | ❓ No Auth Found | `Needs review` |
| CapPhat.InventoryController.cs | ❓ No Auth Found | `Needs review` |
| DanhMuc.InventoryController.cs | ❓ No Auth Found | `Needs review` |
| HoanTra.InventoryController.cs | ❓ No Auth Found | `Needs review` |
| KiemKe.InventoryController.cs | ❓ No Auth Found | `Needs review` |
| NhaCungCap.InventoryController.cs | ❓ No Auth Found | `Needs review` |
| NhapKho.InventoryController.cs | ❓ No Auth Found | `Needs review` |
| TonKho.InventoryController.cs | ❓ No Auth Found | `Needs review` |
| XuatKho.InventoryController.cs | ❓ No Auth Found | `Needs review` |
| KhoaController.cs | ⚠️ Authorize | `Basic Auth` |
| LichLamViecController.cs | ⚠️ Authorize(Roles) | `Authorize(Roles = "Admin")` |
| LoaiCaController.cs | ⚠️ Authorize(Roles) | `Authorize(Roles = "Admin")` |
| BenhNhan.LuotKhamController.cs | ❓ No Auth Found | `Needs review` |
| ChanDoan.LuotKhamController.cs | ❓ No Auth Found | `Needs review` |
| ChiDinhDichVu.LuotKhamController.cs | ❓ No Auth Found | `Needs review` |
| DanhMucDichVu.LuotKhamController.cs | ❓ No Auth Found | `Needs review` |
| DonThuoc.LuotKhamController.cs | ❓ No Auth Found | `Needs review` |
| HangDoi.LuotKhamController.cs | ❓ No Auth Found | `Needs review` |
| LuotKhamController.StartExam.cs | ❓ No Auth Found | `Needs review` |
| LuotKhamController.cs | ⚠️ Authorize | `Basic Auth` |
| MedicalRecord.LuotKhamController.cs | ❓ No Auth Found | `Needs review` |
| NghiPhepController.cs | ⚠️ Authorize(Roles) | `Authorize(Roles = "Admin")` |
| NhanVienController.cs | ⚠️ Authorize(Roles) | `Authorize(Roles = "Admin")` |
| PayrollController.cs | ⚠️ Authorize(Roles) | `Authorize(Roles = "Admin")` |
| PhongKhamController.cs | ⚠️ Authorize | `Basic Auth` |
| PrescriptionController.cs | ⚠️ Authorize | `Basic Auth` |
| ThuocController.cs | ⚠️ Authorize | `Basic Auth` |
