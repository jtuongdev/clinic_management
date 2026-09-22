# 3. Kiểm tra và công việc còn lại

## 3.1. Kết quả kiểm tra

Đã chạy:

```bash
dotnet build ClinicManagement.slnx --nologo
```

Kết quả: **Build succeeded, 0 error**.

Còn hai nullable warning có sẵn ở:

- `GetThongKeChiDinhQueryHandler.cs`
- `GetBenhNhanProfileQueryHandler.cs`

## 3.2. Áp dụng migration

```bash
dotnet ef database update \
  --project ClinicManagement.Infrastructure/ClinicManagement.Infrastructure.csproj \
  --startup-project ClinicManagement.API/ClinicManagement.API.csproj \
  --context ClinicDbContext
```

Cần SQL Server đang chạy và `DefaultConnection` trỏ đúng database.

## 3.3. Giới hạn hiện tại

- Scope đã kiểm tra ở API permission boundary; chưa tự động xác minh mọi resource cụ thể thuộc cơ sở/khoa nào.
- Export hiện là CSV, chưa có chữ ký số file hoặc lịch sử lần export.
- Export giới hạn 10.000 dòng/lần; dữ liệu lớn nên chuyển sang background job.
- Role matrix chưa có seed mặc định trong database.
- Clinical transaction API mới là summary/validation, chưa thay thế các command ghi chẩn đoán, chỉ định, đơn thuốc và kết quả cận lâm sàng.
- Chưa chạy `database update` trong phiên này vì phụ thuộc SQL Server và connection string môi trường.

## 3.4. Khuyến nghị tiếp theo

1. Chạy migration trên database dev/staging.
2. Seed permission cho `ADMIN`, `DOCTOR`, `PHARMACIST`, `CASHIER`.
3. Bổ sung resource-level scope theo `MaCoSo`, `MaKhoa`, `MaPhongKham`.
4. Ghi audit tự động cho `VIEW`, `SIGN`, `PRESCRIBE`, `BILLING`, `DISPENSE`, `EXPORT`.
5. Viết integration test cho 401, 403, đúng scope và sai scope.
