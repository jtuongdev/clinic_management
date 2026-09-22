# Báo Cáo Kiểm Thử Toàn Bộ API (Method: GET)

Báo cáo dưới đây liệt kê trạng thái của tất cả các API GET trong hệ thống khi được gọi với token của `admin.test`.


### ✅ /
- **URL Test:** `/`
- **Status:** `200`
- **Response:**
```json
Clinic Management API is running. Go to /scalar/v1 for API documentation.
```

### ❌ /api/admin/dashboard/overview
- **URL Test:** `/api/admin/dashboard/overview`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/admin/dashboard/finance
- **URL Test:** `/api/admin/dashboard/finance`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/admin/dashboard/reports
- **URL Test:** `/api/admin/dashboard/reports`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/admin/dashboard/staff
- **URL Test:** `/api/admin/dashboard/staff`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/admin/dashboard/reports/export
- **URL Test:** `/api/admin/dashboard/reports/export`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/admin/roles
- **URL Test:** `/api/admin/roles`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-afb8b91b92670243283c679e090d7900-0dcc975bfc81ce47-00"}
```

### ❌ /api/admin/audit-logs
- **URL Test:** `/api/admin/audit-logs`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-2813b019ae1df10405d885a720a22846-0a5f83807939e184-00"}
```

### ❌ /api/admin/audit-logs/export
- **URL Test:** `/api/admin/audit-logs/export`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-028ef66bb586d1863c9d3c6bfaaa65c8-1014c3b9a8e832a4-00"}
```

### ❌ /api/admin/integration-config
- **URL Test:** `/api/admin/integration-config`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-bf756c3a839144134615039ee979c11a-f30d9be02c1ef6b7-00"}
```

### ❌ /api/Auth/me
- **URL Test:** `/api/Auth/me`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/Auth/validate
- **URL Test:** `/api/Auth/validate`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/Auth/has-role/{role}
- **URL Test:** `/api/Auth/has-role/1`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/BenhNhan/paged
- **URL Test:** `/api/BenhNhan/paged`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-95e825772148713c5ec2c45805b63692-1cee347326a8f80b-00"}
```

### ❌ /api/BenhNhan/count/benhnhan/thongke
- **URL Test:** `/api/BenhNhan/count/benhnhan/thongke`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-266b8cb1167651a8118402fe030602df-8b7f739471db49ff-00"}
```

### ❌ /api/BenhNhan/{id}
- **URL Test:** `/api/BenhNhan/1`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-5b499fd1ad5759bb6a7915c85a3c3f15-7c87f32834b1ebb3-00"}
```

### ❌ /api/BenhNhan/search
- **URL Test:** `/api/BenhNhan/search`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-819828bd61c347ca34418b34c707acf4-aecf3e24060e0fc6-00"}
```

### ❌ /api/BenhNhan/filter-by-date
- **URL Test:** `/api/BenhNhan/filter-by-date`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-f2df3a32d17955ca81da2a383394ccba-c332453e5bbda85a-00"}
```

### ❌ /api/BenhNhan/deleted
- **URL Test:** `/api/BenhNhan/deleted`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-f944716971b88c23bda20ffcaf7c3a98-623afe61d7c180a5-00"}
```

### ❌ /api/BenhNhan/{id}/tiensu
- **URL Test:** `/api/BenhNhan/1/tiensu`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-2a26a6ede12db2bacc73994c828d8a87-80420586fa50e626-00"}
```

### ❌ /api/BenhNhan/{id}/tiensu/latest
- **URL Test:** `/api/BenhNhan/1/tiensu/latest`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-bab6c04effb039c473bf44401aeca49f-0ff6b5c94a04eaef-00"}
```

### ❌ /api/BenhNhan/loai-tien-su
- **URL Test:** `/api/BenhNhan/loai-tien-su`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-51b98959d2045cf6f9548d47c972a095-d9fe4d492660605c-00"}
```

### ❌ /api/BenhNhan/{id}/profile
- **URL Test:** `/api/BenhNhan/1/profile`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-aa0573c91685d0585d8204fbfc8b00ff-854d41febedc3694-00"}
```

### ❌ /api/BenhNhan/{id}/visits
- **URL Test:** `/api/BenhNhan/1/visits`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-8e9a1cd3e7dd468e2bb208e49ebdefee-fff7839075ea491d-00"}
```

### ❌ /api/BenhNhan/{id}/prescriptions
- **URL Test:** `/api/BenhNhan/1/prescriptions`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-2327dbeffd420246e4266ed92fe0b72d-ba39a0fe1f70ad97-00"}
```

### ❌ /api/BenhNhan/{id}/lab-results
- **URL Test:** `/api/BenhNhan/1/lab-results`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-8aaafb196c65dcad6597352bcd2278fa-8b577ed3226da7f6-00"}
```

### ❌ /api/BenhNhan/{id}/invoices
- **URL Test:** `/api/BenhNhan/1/invoices`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-5e9519019ed54dd62f5d7a8d2ef07b8e-8e70d0d17ef841ff-00"}
```

### ❌ /api/billing/invoices
- **URL Test:** `/api/billing/invoices`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/billing/invoices/{id}
- **URL Test:** `/api/billing/invoices/1`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/billing/invoices/by-visit/{visitId}
- **URL Test:** `/api/billing/invoices/by-visit/1`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/billing/invoices/{id}/payments
- **URL Test:** `/api/billing/invoices/1/payments`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/billing/debts/by-patient/{patientId}
- **URL Test:** `/api/billing/debts/by-patient/1`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/billing/debts/overdue
- **URL Test:** `/api/billing/debts/overdue`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/CaTruc
- **URL Test:** `/api/CaTruc`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-84272901519ad5857866eb8739663a12-f6d005a0aa0a290c-00"}
```

### ❌ /api/ChamCong
- **URL Test:** `/api/ChamCong`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-17bc5070acf8105350794759f7ac4fdf-38d964085169796d-00"}
```

### ❌ /api/ChamCong/kpi-summary
- **URL Test:** `/api/ChamCong/kpi-summary`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-7febe5d9dbe3baf47adcb44bca21bcd8-5c184f7ff5f5f3bb-00"}
```

### ❌ /api/ChamCong/adjustments
- **URL Test:** `/api/ChamCong/adjustments`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-6fb729b3a52cad8bda23b40dfe19e318-f78bd84b4033341f-00"}
```

### ❌ /api/ChamCong/periods
- **URL Test:** `/api/ChamCong/periods`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-f5c4ac5cd6fe395efd65d50b474fc526-150eeb9647418cc4-00"}
```

### ❌ /api/clinical/transactions/{visitId}/summary
- **URL Test:** `/api/clinical/transactions/1/summary`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-4de4b10fbf881dc6268f1e548e4c72f0-9775396b72e080e1-00"}
```

### ✅ /api/CoSo/dropdown
- **URL Test:** `/api/CoSo/dropdown`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Lấy danh sách cơ sở thành công", "data": [{"id": 3, "ma": "CS-TEST", "ten": "Cơ sở test ClinicManagement"}]}
```

### ❌ /api/EnumCatalog/schedule-statuses
- **URL Test:** `/api/EnumCatalog/schedule-statuses`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/EnumCatalog/attendance-statuses
- **URL Test:** `/api/EnumCatalog/attendance-statuses`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/EnumCatalog/leave-statuses
- **URL Test:** `/api/EnumCatalog/leave-statuses`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/inventory/audit-transactions
- **URL Test:** `/api/inventory/audit-transactions`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-b6453f20bf17da4c7e631c40df716e30-830ebd7060fcacbf-00"}
```

### ❌ /api/inventory/prescriptions/pending
- **URL Test:** `/api/inventory/prescriptions/pending`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-7bc96bd6fe7e302ab04073d5a76e2aca-4d7d1b60272b58c6-00"}
```

### ❌ /api/inventory/prescriptions/dispensed
- **URL Test:** `/api/inventory/prescriptions/dispensed`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-65dfd1b2daf13a8f16ae552d2ef307b5-9dc3badf0ebd6388-00"}
```

### ❌ /api/inventory/prescriptions/{prescriptionId}/print-data
- **URL Test:** `/api/inventory/prescriptions/1/print-data`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-6cf5ffae399d45b71142c1dc1ed63155-b1c43f917b11a99a-00"}
```

### ❌ /api/inventory/items
- **URL Test:** `/api/inventory/items`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-8f659257afc1b64ee099baba8192e0e8-7b303edef749fd37-00"}
```

### ❌ /api/inventory/suppliers
- **URL Test:** `/api/inventory/suppliers`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-061dd747c342c3e2b45d042bb2db2051-c13fb70d71105752-00"}
```

### ❌ /api/inventory/import-receipts
- **URL Test:** `/api/inventory/import-receipts`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-f4a43de4fe995393f9bd1fdd35a098ec-f6e810075d3da338-00"}
```

### ❌ /api/inventory/stock
- **URL Test:** `/api/inventory/stock`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-7dbebf014c9916f2e5b3f5504e07b5ee-5173a9ee604108d3-00"}
```

### ❌ /api/inventory/stock/alerts
- **URL Test:** `/api/inventory/stock/alerts`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-e0c5ea9c10a8c22748a9b873266051e7-0348c3e5dae2af97-00"}
```

### ❌ /api/Khoa/dropdown
- **URL Test:** `/api/Khoa/dropdown`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-c9b589ac6daf7cf96171a77f240d233c-37b63986b320f1e0-00"}
```

### ❌ /api/Khoa/overview
- **URL Test:** `/api/Khoa/overview`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-d35eb8adfc7b272d602eea7a8f9b37d5-f50f166402a8b082-00"}
```

### ❌ /api/LichLamViec
- **URL Test:** `/api/LichLamViec`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-2624bbf8b3ddc1a12542950dbaed5205-78ce67fb0d1040ee-00"}
```

### ❌ /api/LichLamViec/fixed
- **URL Test:** `/api/LichLamViec/fixed`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-c6d465b7f295c2d9c768c3b36b6b0df0-21b52832cc1babc4-00"}
```

### ❌ /api/LichLamViec/{id}/adjustments
- **URL Test:** `/api/LichLamViec/1/adjustments`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-2c9c80b8896c25541c75fdae98a5b1a8-c449c45b9b35b0e2-00"}
```

### ❌ /api/LoaiCa
- **URL Test:** `/api/LoaiCa`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-0684dfd236190881c9a9641fe806a807-92789841020825a2-00"}
```

### ❌ /api/LuotKham/benh-nhan/{luotKhamId}/ho-so-dieu-tri
- **URL Test:** `/api/LuotKham/benh-nhan/1/ho-so-dieu-tri`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-9c0f32643299029f27568bdcb8a1e881-76f295886ca6394d-00"}
```

### ❌ /api/LuotKham/benh-nhan/{luotKhamId}/thong-tin-benh-nhan
- **URL Test:** `/api/LuotKham/benh-nhan/1/thong-tin-benh-nhan`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-4c969fe656060c9b6c58e8bd9ce37cc2-dd4a497da07a7b14-00"}
```

### ❌ /api/LuotKham/icd
- **URL Test:** `/api/LuotKham/icd`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-375fb304b808c2f9ca78104cb1d1d2b9-b4223b8867693219-00"}
```

### ❌ /api/LuotKham/{id}/diagnoses
- **URL Test:** `/api/LuotKham/1/diagnoses`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-3d4b85f00aef5619cb39577b522a6399-a61a2fafaa43e0d4-00"}
```

### ❌ /api/LuotKham/thong-ke-chi-dinh
- **URL Test:** `/api/LuotKham/thong-ke-chi-dinh`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-f17afa65c6d8c11812cc51e833049eb0-7173e490d9868291-00"}
```

### ❌ /api/LuotKham/danh-sach-chi-dinh
- **URL Test:** `/api/LuotKham/danh-sach-chi-dinh`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-eb51ff950b59b5f8f45c286aa6f9afd8-fcc3c2fac302869d-00"}
```

### ❌ /api/LuotKham/{luotKhamId}/chi-dinh-dich-vu
- **URL Test:** `/api/LuotKham/1/chi-dinh-dich-vu`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-db8c8801aa7ee505058a8980c72169b1-b5dae8bfb5199198-00"}
```

### ❌ /api/LuotKham/danh-muc-dich-vu
- **URL Test:** `/api/LuotKham/danh-muc-dich-vu`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-6367d1492cc37b98950a62a9880b3506-386642b4267196eb-00"}
```

### ❌ /api/LuotKham/danh-sach-donthuoc
- **URL Test:** `/api/LuotKham/danh-sach-donthuoc`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-301ae865eeae5e632094a211c90fdee2-f9171537c6bdd3e4-00"}
```

### ❌ /api/LuotKham/thong-ke-donthuoc
- **URL Test:** `/api/LuotKham/thong-ke-donthuoc`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-2cbde2973b35688ebee353f6593babc9-2b7df048457129dc-00"}
```

### ❌ /api/LuotKham/hang-doi
- **URL Test:** `/api/LuotKham/hang-doi`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-4ee87be85a739cb11c9a4a1f0cd5dbbf-7f8b6afbb992c9f9-00"}
```

### ❌ /api/LuotKham/hang-doi-list
- **URL Test:** `/api/LuotKham/hang-doi-list`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-6e601211cffbc4bdcf73fece7dd48aff-ea299597578f2559-00"}
```

### ❌ /api/LuotKham
- **URL Test:** `/api/LuotKham`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-b6ab17f3bcbce00b50f62e0faf40962a-134e2a8a6688f464-00"}
```

### ❌ /api/LuotKham/{id}
- **URL Test:** `/api/LuotKham/1`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-c7a76907a606038eef81e1e110de2c03-1fb44c6a6ad9755d-00"}
```

### ❌ /api/LuotKham/{id}/summary
- **URL Test:** `/api/LuotKham/1/summary`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-3352fba45ef91fddb68c1b472dcfe1ba-f0b32a5070c1d20e-00"}
```

### ❌ /api/LuotKham/thong-ke
- **URL Test:** `/api/LuotKham/thong-ke`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-88c278189d70e4f2cd11ccb505a15ff2-b7be4c9cea127630-00"}
```

### ❌ /api/LuotKham/dang-xu-ly
- **URL Test:** `/api/LuotKham/dang-xu-ly`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-0ffd790e6c614b1c1ea2d4de5640232f-b3ecb7d950011a23-00"}
```

### ❌ /api/LuotKham/danh-sach-benh-nhan
- **URL Test:** `/api/LuotKham/danh-sach-benh-nhan`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-83c2f07364ac0022dfce67c4767af272-d9f3c5922abe9384-00"}
```

### ❌ /api/LuotKham/thong-ke-benh-nhan
- **URL Test:** `/api/LuotKham/thong-ke-benh-nhan`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-d3842a0f06d6f68bc51ccc63c32a83c2-33e0fba4f68b2444-00"}
```

### ❌ /api/LuotKham/thong-ke-kham-benh
- **URL Test:** `/api/LuotKham/thong-ke-kham-benh`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-eae34f167e36265ac7b82430f9cfb8d4-62c39410502efe5c-00"}
```

### ❌ /api/LuotKham/{id}/examination
- **URL Test:** `/api/LuotKham/1/examination`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-c8b528f4212964e3f1f56714342b6241-afa8a9d42fa00966-00"}
```

### ❌ /api/NghiPhep
- **URL Test:** `/api/NghiPhep`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-f70b8199dfbfd33d49af626eb971e034-809c5c71536c30bd-00"}
```

### ❌ /api/NhanVien
- **URL Test:** `/api/NhanVien`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-638aaca6812b5b8046c89ba8376baef6-d1588b65810083e8-00"}
```

### ❌ /api/NhanVien/{id}
- **URL Test:** `/api/NhanVien/1`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-84b74b12f3a917b3d81e23e90b63b2a9-b5f6a4d40fadfb50-00"}
```

### ❌ /api/NhanVien/roles
- **URL Test:** `/api/NhanVien/roles`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-277268ff5546137286059c438cba56d5-9a9a86dd614a2008-00"}
```

### ❌ /api/NhanVien/{id}/permissions
- **URL Test:** `/api/NhanVien/1/permissions`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-455865ffdba4651503d906cd185a5168-9e78a61f1860b8ad-00"}
```

### ❌ /api/NhanVien/bac-si
- **URL Test:** `/api/NhanVien/bac-si`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-fa4b2880afb225215596506f8fb2cd14-e76bda4ca9dbefac-00"}
```

### ❌ /api/NhanVien/bac-si-truc
- **URL Test:** `/api/NhanVien/bac-si-truc`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-6df7cac6ff8035be23f245a85264984a-72d24be7a38f17c5-00"}
```

### ❌ /api/payroll/periods
- **URL Test:** `/api/payroll/periods`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-9756e93c9bce429b3a52f86af7561b27-6a9f1b747865234b-00"}
```

### ❌ /api/payroll/periods/{id}
- **URL Test:** `/api/payroll/periods/1`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-a2144d1e64c532db865b3740d54710a4-d88ee9abca774d89-00"}
```

### ✅ /api/PhongKham/by-khoa/{maKhoa}
- **URL Test:** `/api/PhongKham/by-khoa/1`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/PhongKham/dropdown
- **URL Test:** `/api/PhongKham/dropdown`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ❌ /api/luot-kham/{luotKhamId}/don-thuoc
- **URL Test:** `/api/luot-kham/1/don-thuoc`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}
- **URL Test:** `/api/luot-kham/1/don-thuoc/1`
- **Status:** `401`
- **Response:**
```json

```

### ❌ /api/Thuoc/catalog
- **URL Test:** `/api/Thuoc/catalog`
- **Status:** `401`
- **Response:**
```json
{"type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401, "traceId": "00-6ee75f98192a04265de5eba017d17449-a5cec2a3a1fcc584-00"}
```
