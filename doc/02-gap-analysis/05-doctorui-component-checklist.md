# CHECKLIST COMPONENTS & FORM FIELDS CẦN BỔ SUNG – DOCTOR UI
## (Phân loại P0/P1/P2 theo rủi ro lâm sàng)

> **Ngày lập:** 2026-09-16  
> **Gắn với:** `04-doctorui-gap-analysis.md`  
> **Quy ước:**  
> - 🔴 **P0** — Bắt buộc: Thiếu gây nguy hiểm lâm sàng hoặc không vận hành được  
> - 🟡 **P1** — Quan trọng: Ảnh hưởng đến chất lượng và an toàn điều trị  
> - 🟢 **P2** — Cải tiến: Tăng hiệu quả và trải nghiệm bác sĩ  

---

## ═══ P0 – KHẨN CẤP (Fix trước khi go-live) ═══

---

### P0-01 | SỬA: `ElectronicRecordWorkspace.tsx` — Kết nối API Hoàn tất Khám

**Vấn đề:** Nút "Xác nhận & Hoàn tất" chỉ gọi `alert()`. Lượt khám không được chốt, không sinh hóa đơn.

**Thay đổi trong `useExam.ts`:**
```typescript
// TRƯỚC (dòng 138):
const handleFinish = async () => {
  if (!window.confirm('Bạn chắc chắn muốn hoàn tất lượt khám này?')) return;
  alert('Lượt khám đã được hoàn tất.');
};

// SAU:
const handleFinish = async () => {
  if (!selectedPatient?.luotKhamId) return;
  const confirm = await showConfirmDialog({
    title: 'Hoàn tất lượt khám',
    message: 'Hành động này sẽ khóa lượt khám và sinh hóa đơn. Tiếp tục?',
    confirmLabel: 'Hoàn tất',
    variant: 'warning',
  });
  if (!confirm) return;
  try {
    setIsFinishing(true);
    await examinationApi.completeExam(selectedPatient.luotKhamId);
    toast.success('Lượt khám đã hoàn tất. Bệnh nhân chuyển sang thanh toán.');
    await refreshQueue();
    setSelectedPatient(null);
  } catch (err) {
    toast.error('Không thể hoàn tất: ' + (err as Error).message);
  } finally {
    setIsFinishing(false);
  }
};
```

**Bổ sung `examinationApi.completeExam`:**
```typescript
// examination/api/examination.api.ts
completeExam: (luotKhamId: string) =>
  api.post(`/api/LuotKham/${luotKhamId}/complete`),
```

**Validate trước khi cho phép hoàn tất (UI-level guard):**
- [ ] Phải có ít nhất 1 chẩn đoán chính (`laChanDoanChinh = true`)
- [ ] Phải đã nhập lý do khám (chiefComplaint không rỗng)
- [ ] Hiển thị danh sách điều kiện chưa đạt nếu bị chặn

---

### P0-02 | SỬA: `TreatmentWorkspace.tsx` — Kích hoạt toàn bộ Form Kê đơn Thuốc

**Vấn đề:** Toàn bộ subtab Prescription chỉ là HTML disabled/readOnly. Bác sĩ không kê được thuốc.

**Form Fields cần implement đầy đủ:**

| Field | Type | Validate | Ghi chú |
|---|---|---|---|
| `search` (tìm kiếm thuốc) | `input[type=text]` + debounce 300ms | required khi thêm | `GET /api/inventory/items?q=&isActive=true&canKeDon=true` |
| `itemId` | hidden (sau khi chọn từ kết quả tìm) | required | UUID từ kho dược |
| `tenThuoc` | `input readOnly` (tự điền sau chọn) | — | Tên thuốc + hàm lượng |
| `hoatChat` | `input readOnly` (tự điền) | — | Dùng cho drug interaction check |
| `soLuong` | `input[type=number]` min=1, max=999 | required, > 0 | |
| `donViId` | `select` (nạp từ đơn vị của thuốc) | required | VD: Viên, Vỉ, Lọ |
| `duongDung` | `select` | required | Uống / Tiêm bắp / Tiêm TM / Bôi / Nhỏ mắt |
| `lieuDung` | `input[type=text]` | required | VD: "1 viên x 3 lần/ngày" |
| `soNgay` | `input[type=number]` min=1, max=90 | required | |
| `huongDan` | `textarea` | optional | Sáng 1v sau ăn, Tối 1v trước ngủ |
| `ghiChu` | `input[type=text]` | optional | Ghi chú cho dược sĩ |
| `loaiDonThuoc` | `radio / select` | required | `BHYT` / `TU_TUC` / `HON_HOP` |

**API cần kết nối:**
```typescript
// Tìm kiếm thuốc trong kho
GET /api/inventory/items?q={keyword}&isActive=true&canKeDon=true&pageSize=20

// Tạo/cập nhật đơn thuốc
POST /api/luot-kham/{luotKhamId}/don-thuoc
Body: {
  loaiDonThuoc: 'BHYT' | 'TU_TUC',
  thuocItems: [{
    itemId, soLuong, donViId, duongDung, lieuDung, soNgay, huongDan, ghiChu
  }]
}

// Kiểm tra tương tác thuốc trước khi lưu (gọi khi thêm mỗi thuốc)
POST /api/ai/drug-interaction-check
Body: { drugs: [{itemId, name, dose, unit}], patientId, allergies[] }
```

**Validation flow khi thêm thuốc:**
```
1. User chọn thuốc từ kết quả search
2. Auto-fill: hoatChat, donViOptions, duongDungOptions
3. Gọi kiểm tra dị ứng ngay: nếu hoatChat ∈ allergies[] -> BLOCK + cảnh báo đỏ
4. Gọi drug-interaction-check -> nếu SEVERE/CONTRAINDICATED -> warning modal
5. Nếu MILD/MODERATE -> hiển thị warning nhỏ (không block)
6. User nhập liều, số ngày, hướng dẫn
7. Click "Thêm vào đơn" -> append vào danh sách
8. Khi "Lưu đơn thuốc" -> POST API
```

---

### P0-03 | SỬA: `QueuePanel.tsx` — Hiển thị Mức ưu tiên & Triage Summary

**Vấn đề:** Cột Ưu tiên hiện tại rỗng vì `HangDoiDto` backend chưa trả `priority`. Bác sĩ không biết ca nào cấp cứu.

**Thay đổi cần thiết:**

1. **Backend DTO cần bổ sung field** (phối hợp với BE team):
```typescript
// queue/type/queue.type.ts - thêm fields:
interface HangDoiDto {
  // existing fields...
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';     // MỚI
  vitalSigns?: {                                     // MỚI - từ triage
    huyetAp?: string;      // "120/80"
    nhipTim?: number;
    spO2?: number;
    nhietDo?: number;
    priority?: string;
  };
  waitingMinutes?: number;                           // MỚI - thời gian chờ tính từ BE
}
```

2. **UI Priority Badge cần render:**
```tsx
// Trong QueuePanel.tsx - cột Ưu tiên:
const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = {
    EMERGENCY: { label: 'CẤP CỨU', class: 'badge-danger', icon: '🚨' },
    URGENT:    { label: 'ƯU TIÊN', class: 'badge-warning', icon: '⚡' },
    NORMAL:    { label: 'Thường',  class: 'badge-default', icon: '' },
  };
  const { label, class: cls, icon } = config[priority] ?? config.NORMAL;
  return <span className={`priority-badge ${cls}`}>{icon} {label}</span>;
};
```

3. **Hiển thị sinh hiệu triage trong DetailOverlay:**
```tsx
// DetailOverlay.tsx - thêm khối VitalSigns:
{patient.vitalSigns && (
  <div className="triage-vitals">
    <h4>Sinh hiệu ban đầu</h4>
    <span>HA: {patient.vitalSigns.huyetAp} mmHg</span>
    <span className={patient.vitalSigns.spO2 < 95 ? 'text-danger' : ''}>
      SpO2: {patient.vitalSigns.spO2}%
    </span>
    <span>Nhiệt độ: {patient.vitalSigns.nhietDo}°C</span>
    <span>Nhịp tim: {patient.vitalSigns.nhipTim} bpm</span>
  </div>
)}
```

4. **Sắp xếp hàng đợi theo ưu tiên** (`EMERGENCY` → `URGENT` → `NORMAL`):
```typescript
const sortedPatients = useMemo(() =>
  [...filteredPatients].sort((a, b) => {
    const order = { EMERGENCY: 0, URGENT: 1, NORMAL: 2 };
    return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
  }), [filteredPatients]);
```

---

### P0-04 | SỬA: `ExaminationWorkspace.tsx` — Bổ sung trường Nhịp thở + BMI + Cảnh báo Dị ứng

**Trường cần thêm vào form sinh hiệu:**

| Field | Type | Unit | Validate | Ghi chú |
|---|---|---|---|---|
| `nhipTho` | `input[type=number]` | lần/phút | 8-40 | **Đang thiếu — bắt buộc theo chuẩn HIS** |
| `bmi` | `input readOnly` (tự tính) | kg/m² | — | Tự tính: `(canNang / (chieuCao/100)²)` + label: Gầy/BT/Thừa cân/Béo phì |

**Cảnh báo dị ứng nổi bật cần thêm:**
```tsx
// Đầu ExaminationWorkspace.tsx, sau khi load tiền sử:
{allergies.length > 0 && (
  <div className="allergy-alert-banner">
    <span className="allergy-icon">⚠️ DỊ ỨNG</span>
    {allergies.map(a => (
      <span key={a.id} className="allergy-chip danger">{a.ten}</span>
    ))}
  </div>
)}
```

**Bổ sung trường Bệnh sử hiện tại (HPI):**
```tsx
// Thêm sau textarea "Lý do khám":
<textarea
  name="benhSuHienTai"
  rows={4}
  placeholder="Mô tả chi tiết diễn biến bệnh: khởi phát khi nào, diễn biến ra sao, các triệu chứng kèm theo, đã điều trị gì..."
  disabled={!isEditing}
/>
```

---

### P0-05 | TẠO MỚI: `DirtyFormGuard` — Bảo vệ dữ liệu khi chuyển bệnh nhân

**Vấn đề:** Khi chuyển bệnh nhân giữa chừng, dữ liệu form đang gõ bị xóa không cảnh báo.

**Giải pháp:**
```typescript
// examination/hooks/useDirtyFormGuard.ts (TẠO MỚI)
export function useDirtyFormGuard(isDirty: boolean) {
  const confirmSwitch = useCallback(async () => {
    if (!isDirty) return true;
    return await showConfirmDialog({
      title: 'Dữ liệu chưa lưu',
      message: 'Bạn có thay đổi chưa được lưu. Chuyển bệnh nhân sẽ mất dữ liệu này.',
      confirmLabel: 'Chuyển bệnh nhân (bỏ thay đổi)',
      cancelLabel: 'Ở lại và lưu trước',
      variant: 'danger',
    });
  }, [isDirty]);
  return { confirmSwitch };
}

// Trong ExamPanel.tsx - khi click chọn bệnh nhân khác:
const handleSelectPatient = async (patient: BenhNhanListDto) => {
  const confirmed = await confirmSwitch(); // <-- check dirty
  if (!confirmed) return;
  setSelectedPatient(patient);
};
```

---

### P0-06 | SỬA: `QueuePanel.tsx` — Thay `alert()`/`confirm()` bằng xử lý nghiệp vụ thực

**Vấn đề:** Gọi bệnh nhân vào khám chỉ dùng `window.confirm()` không gọi API.

**Fix:**
```typescript
// QueuePanel.tsx - handleCallPatient:
const handleCallPatient = async (patient: HangDoiDto) => {
  const confirm = await showConfirmDialog({
    title: `Gọi ${patient.hoTen} vào khám?`,
    message: `STT ${patient.soThuTu} - ${patient.tenKhoa}`,
    confirmLabel: 'Gọi vào khám',
  });
  if (!confirm) return;
  try {
    await examinationApi.startExam(patient.luotKhamId);
    toast.success(`Đã gọi ${patient.hoTen} vào phòng khám`);
    await refetch(); // cập nhật danh sách
  } catch (err) {
    toast.error('Không thể gọi bệnh nhân: ' + (err as Error).message);
  }
};
```

---

## ═══ P1 – QUAN TRỌNG (Sprint đầu tiên sau go-live) ═══

---

### P1-01 | SỬA: `TreatmentWorkspace.tsx` subtab Results — Kết nối API Kết quả CLS

**Thay thế mock data bằng API thực:**
```typescript
// Trong TreatmentWorkspace.tsx:
const { data: clsResults, loading: loadingResults } = useClsResults(luotKhamId);

// Hook mới: examination/hooks/useClsResults.ts
export function useClsResults(luotKhamId: string) {
  return useQuery({
    queryKey: ['cls-results', luotKhamId],
    queryFn: () => api.get(`/api/LuotKham/${luotKhamId}/chi-dinh-dich-vu?coKetQua=true`),
    enabled: !!luotKhamId,
  });
}
```

**Hiển thị kết quả XN với cảnh báo bất thường:**
```tsx
{result.ketQuaItems?.map(item => (
  <tr key={item.id}
      className={item.interpretation === 'BAT_THUONG' ? 'row-danger' : ''}>
    <td>{item.tenChiSo}</td>
    <td className={item.interpretation === 'BAT_THUONG' ? 'text-danger fw-bold' : ''}>
      {item.ketQua} {item.donVi}
    </td>
    <td>{item.khoangThamChieu}</td>
    <td>
      {item.interpretation === 'BAT_THUONG' && <span className="badge danger">⚠ BẤT THƯỜNG</span>}
      {item.interpretation === 'CANH_BAO' && <span className="badge warning">⚡ CẢNH BÁO</span>}
      {item.interpretation === 'BINH_THUONG' && <span className="badge success">✓</span>}
    </td>
  </tr>
))}
```

---

### P1-02 | SỬA: `RecordsPanel.tsx` — Kết nối API Lịch sử Khám Bệnh

**Thay 100% mock data bằng API thực. Thứ tự ưu tiên kết nối:**

1. **Tìm kiếm bệnh nhân:**
```typescript
GET /api/BenhNhan?q={keyword}&pageSize=20
```

2. **Lịch sử lượt khám:**
```typescript
GET /api/BenhNhan/{benhNhanId}/visits?pageIndex=1&pageSize=20
```

3. **Tab Tiền sử (History):**
```typescript
GET /api/BenhNhan/{benhNhanId}/medical-history
```

4. **Tab Đơn thuốc cũ:**
```typescript
GET /api/BenhNhan/{benhNhanId}/prescriptions?pageSize=10
```

5. **Tab Kết quả XN:**
```typescript
GET /api/BenhNhan/{benhNhanId}/lab-results?pageSize=20
```

---

### P1-03 | TẠO MỚI: `DispositionPanel.tsx` — Xử trí Kết thúc Lượt khám

**Tạo component mới trong `ElectronicRecordWorkspace.tsx` hoặc tab riêng:**

**Các lựa chọn xử trí (Disposition Options):**

| Option | Label | API | Form Fields |
|---|---|---|---|
| DISCHARGE | "Cho về nhà" | Đã có trong complete | — |
| FOLLOW_UP | "Hẹn tái khám" | `POST /api/reception/appointments` | Ngày hẹn (date picker), Bác sĩ tái khám, Lý do tái khám, Ghi chú dặn dò |
| ADMIT | "Nhập viện Nội trú" | `POST /api/inpatient/admissions` | Khoa nội trú, Loại phòng, Lý do nhập viện |
| REFER | "Chuyển viện / Chuyển tuyến" | `POST /api/referrals` | Cơ sở chuyển, Khoa tiếp nhận, Lý do chuyển, Tóm tắt bệnh án |
| CONSULT | "Yêu cầu Hội chẩn" | `POST /api/consultations` | Khoa hội chẩn, Câu hỏi hội chẩn, Mức độ khẩn |

**UI Layout:**
```tsx
// DispositionPanel.tsx
<div className="disposition-panel">
  <h3>Xử trí kết thúc lượt khám</h3>
  <div className="disposition-options">
    <DispositionCard 
      icon="🏠" label="Cho về nhà" 
      value="DISCHARGE" selected={disposition === 'DISCHARGE'}
      onClick={() => setDisposition('DISCHARGE')} />
    <DispositionCard 
      icon="📅" label="Hẹn tái khám"
      value="FOLLOW_UP" selected={disposition === 'FOLLOW_UP'}
      onClick={() => setDisposition('FOLLOW_UP')} />
    <DispositionCard 
      icon="🏥" label="Nhập viện"
      value="ADMIT" selected={disposition === 'ADMIT'}
      onClick={() => setDisposition('ADMIT')} />
    <DispositionCard 
      icon="🚑" label="Chuyển viện"
      value="REFER" selected={disposition === 'REFER'}
      onClick={() => setDisposition('REFER')} />
    <DispositionCard 
      icon="👥" label="Hội chẩn"
      value="CONSULT" selected={disposition === 'CONSULT'}
      onClick={() => setDisposition('CONSULT')} />
  </div>
  {/* Sub-form theo disposition được chọn */}
  {disposition === 'FOLLOW_UP' && <FollowUpForm onSave={handleSaveFollowUp} />}
  {disposition === 'REFER' && <ReferralForm onSave={handleSaveReferral} />}
  {disposition === 'ADMIT' && <AdmissionForm onSave={handleSaveAdmission} />}
</div>
```

---

### P1-04 | TẠO MỚI: Polling/SignalR — Cập nhật hàng đợi Real-time

**Giải pháp đơn giản (polling 30 giây) trong khi chờ SignalR:**
```typescript
// queue/hook/useQueuExaminationList.ts - thêm auto-refresh:
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 30_000); // mỗi 30 giây

  // Dừng polling khi tab mất focus (tối ưu tài nguyên)
  const handleVisibilityChange = () => {
    if (document.hidden) clearInterval(interval);
    else setInterval(refetch, 30_000);
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [refetch]);
```

**Giải pháp đầy đủ (SignalR — roadmap):**
```typescript
// shared/hooks/useQueueSignalR.ts (TẠO MỚI)
import * as signalR from '@microsoft/signalr';

export function useQueueSignalR(khoaId: string, onQueueUpdate: () => void) {
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/queue')
      .withAutomaticReconnect()
      .build();

    connection.on('QueueUpdated', (data) => {
      if (data.khoaId === khoaId) onQueueUpdate();
    });

    connection.start().catch(console.error);
    return () => { connection.stop(); };
  }, [khoaId, onQueueUpdate]);
}
```

---

### P1-05 | SỬA: `ExaminationWorkspace.tsx` — Khám lâm sàng theo cơ quan (Physical Examination)

**Form fields cần thêm (structured physical exam):**

```tsx
// Thêm section "Khám lâm sàng" sau phần sinh hiệu:
<section className="physical-exam">
  <h4>Khám lâm sàng theo cơ quan</h4>
  <div className="pe-grid">
    <FormField label="Tim mạch" name="khamTimMach"
      placeholder="Nhịp tim đều, không có tiếng thổi bất thường..." />
    <FormField label="Hô hấp" name="khamHoHap"
      placeholder="Phổi thông khí đều 2 bên, không ran..." />
    <FormField label="Tiêu hóa" name="khamTieuHoa"
      placeholder="Bụng mềm, không điểm đau khu trú..." />
    <FormField label="Thần kinh" name="khamThanKinh"
      placeholder="Tỉnh táo, định hướng tốt, không liệt..." />
    <FormField label="Cơ xương khớp" name="khamCoXuongKhop"
      placeholder="Không sưng đau khớp..." />
    <FormField label="Da liễu" name="khamDaLieu"
      placeholder="Da niêm mạc hồng hào..." />
  </div>
  <FormTextarea label="Tổng kết khám lâm sàng" name="tongKetKhamLS"
    placeholder="Nhận định lâm sàng tổng hợp của bác sĩ..." rows={3} />
</section>
```

---

### P1-06 | SỬA: `CatalogPanel.tsx` — Kết nối API Danh mục thực tế

**Thứ tự kết nối ưu tiên:**

| Danh mục | API | Priority |
|---|---|:---:|
| Thuốc kê đơn | `GET /api/inventory/items?canKeDon=true` | 🔴 P0 (dùng trong kê đơn) |
| Dịch vụ CLS | `GET /api/LuotKham/danh-muc-dich-vu` | ✅ Đã có trong Examination |
| ICD-10 | `GET /api/LuotKham/icd?keyword=` | ✅ Đã có trong Diagnosis |
| Tác nhân dị ứng | `GET /api/BenhNhan/allergy-agents` | 🟡 P1 |
| Tiền sử bệnh | `GET /api/BenhNhan/loai-tien-su` | ✅ Đã có |
| Vật tư y tế | `GET /api/inventory/items?nhomThuoc=VAT_TU_Y_TE` | 🟢 P2 |

---

### P1-07 | SỬA: `Header.tsx` — Đọc thông tin bác sĩ từ AuthContext

```tsx
// Header.tsx - TRƯỚC (hardcode):
<span className="doctor-name">BS. Nguyễn Văn Tuấn</span>

// SAU (dynamic):
const { user } = useAuth();
<span className="doctor-name">{user?.fullName ?? 'Bác sĩ'}</span>
<span className="doctor-dept">{user?.chuyenKhoa}</span>
```

---

### P1-08 | SỬA: `dashboard/components/OverviewPanel.tsx` — Kết nối KPI API thực

**Endpoints cần kết nối:**

| KPI Card | API | Interval |
|---|---|---|
| Tổng/Chờ/Đang khám/Hoàn thành | `GET /api/LuotKham/thong-ke?bacSiId=&ngay=today` | 60s |
| Bệnh nhân đang khám | `GET /api/LuotKham/dang-xu-ly?bacSiId=` | 30s |
| Bệnh nhân tiếp theo | `GET /api/LuotKham/hang-doi-list?maBacSi=&trangThai=CHO_KHAM&pageSize=3` | 30s |
| Kết quả CLS mới | `GET /api/LuotKham/ket-qua-cho?bacSiId=` | 60s |
| Lịch hẹn hôm nay | `GET /api/LichHen?bacSiId=&ngay=today` | 300s |
| Cảnh báo | `GET /api/notifications?userId=&type=CLINICAL_ALERT&unread=true` | 30s |

---

## ═══ P2 – CẢI TIẾN (Triển khai sau ổn định P0+P1) ═══

---

### P2-01 | TẠO MỚI: AI Suggest Diagnosis trong Diagnosis Tab

```typescript
// examination/hooks/Diagnosis/useAiDiagnosis.ts (TẠO MỚI)
export function useAiDiagnosis() {
  const suggestDiagnosis = async (payload: {
    visitId: string;
    symptoms: string[];
    vitalSigns: VitalSigns;
    patientProfile: PatientProfile;
  }) => {
    const result = await api.post('/api/ai/suggest-diagnosis', payload);
    return result.data; // { suggestions: [{icdCode, name, confidence, reasoning}], fallback }
  };

  return { suggestDiagnosis };
}
```

**UI hiển thị AI suggestions:**
```tsx
{aiSuggestions.length > 0 && !aiSuggestions.fallback && (
  <div className="ai-suggestions">
    <h5>🤖 Gợi ý AI (confidence ≥ 70%)</h5>
    {aiSuggestions
      .filter(s => s.confidence >= 0.7)
      .map(s => (
        <button key={s.icdCode}
          className="suggestion-chip"
          onClick={() => applyAiSuggestion(s)}
          title={s.reasoning}>
          {s.icdCode} — {s.name} ({Math.round(s.confidence * 100)}%)
        </button>
      ))}
  </div>
)}
```

---

### P2-02 | TẠO MỚI: DICOM / File Viewer cho Kết quả CĐHA

```tsx
// examination/components/workspaces/DicomViewer.tsx (TẠO MỚI)
// Tích hợp cornerstone.js hoặc link tới PACS viewer
const DicomViewer = ({ signedUrl, fileType }: { signedUrl: string; fileType: string }) => {
  if (fileType === 'pdf') {
    return <iframe src={signedUrl} className="pdf-viewer" title="Kết quả PDF" />;
  }
  if (['jpg', 'jpeg', 'png'].includes(fileType)) {
    return <img src={signedUrl} className="image-viewer" alt="Kết quả hình ảnh" />;
  }
  if (fileType === 'dcm') {
    // Tích hợp cornerstone.js hoặc link PACS web viewer
    return <a href={signedUrl} target="_blank" className="btn-view-dicom">Xem DICOM ↗</a>;
  }
  return null;
};
```

---

### P2-03 | SỬA: `ContextBar.tsx` — Đọc thông tin ca trực từ API

```typescript
// Thay hardcode bằng:
const { data: shift } = useCurrentShift(); // GET /api/schedules/current-shift?userId=

// ContextBar hiển thị:
// Ca: {shift.loaiCa} | Phòng: {shift.phongKham} | {shift.gioKetThuc}
```

---

### P2-04 | SỬA: Route Bug `system/routes.tsx`

```typescript
// TRƯỚC (import sai):
import ReportsPage from '../reports/pages/ReportsPage';

// SAU (tạo file mới system/pages/SystemPage.tsx):
import SystemPage from './pages/SystemPage';
```

---

### P2-05 | XÓA: Nút Demo ICDModal góc màn hình

```tsx
// ICDModal.tsx - Xóa đoạn code:
// <button
//   onClick={() => setIsOpen(true)}
//   style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 50 }}
// >
//   Tra cứu ICD (demo)
// </button>
// Tích hợp ICDModal vào DiagnosisTab qua prop callback thay vì nút floating global
```

---

### P2-06 | DỌN DẸP: Consolidate File Trùng lặp

```bash
# Xóa file trùng lặp:
rm ClinicManagement.DoctorUI/src/components/layouts/MainLayout.tsx
rm ClinicManagement.DoctorUI/src/examination/components/ActionToolbar.tsx
rm ClinicManagement.DoctorUI/src/examination/components/ActionToolbar.css

# Cập nhật import trong examination/components/ExamPanel.tsx:
# import ActionToolbar from '../../components/common/ActionToolbar';
```

---

## TỔNG HỢP SỐ LƯỢNG THAY ĐỔI CẦN THỰC HIỆN

| Ưu tiên | Tạo mới | Sửa đổi | Xóa/Dọn dẹp | Tổng |
|:---:|:---:|:---:|:---:|:---:|
| **P0** | 2 | 4 | 0 | **6** |
| **P1** | 3 | 5 | 0 | **8** |
| **P2** | 2 | 3 | 2 | **7** |
| **Tổng** | **7** | **12** | **2** | **21** |

---

*© 2026 – DoctorUI Component Checklist – ClinicManagement HIS*
