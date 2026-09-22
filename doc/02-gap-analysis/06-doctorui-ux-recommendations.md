# ĐỀ XUẤT TỐI ƯU UX CHO BÁC SĨ
## (Clinical Ergonomics & Fast-Click Design Principles)

> **Ngày lập:** 2026-09-16  
> **Bối cảnh:** Bác sĩ trung bình khám 30–60 bệnh nhân/ngày tại phòng khám ngoại trú.  
> Mỗi phút tiết kiệm được trên mỗi lượt khám = **30–60 phút/ngày** cho bác sĩ.  
> UX tốt là **an toàn lâm sàng** — giảm click = giảm nhầm lẫn = giảm sai sót y khoa.

---

## 1. NGUYÊN TẮC THIẾT KẾ UX Y TẾ CỐT LÕI

| Nguyên tắc | Ý nghĩa | Áp dụng tại |
|---|---|---|
| **One-hand navigation** | Bác sĩ thường dùng 1 tay ghi chú, tay kia thao tác UI | Phím tắt bàn phím, Tab key navigation |
| **3-click rule** | Mọi thao tác phổ biến phải thực hiện được trong ≤ 3 click | Kê đơn, chỉ định CLS, chẩn đoán |
| **Zero-confirm for undo-able actions** | Không popup confirm cho hành động có thể hoàn tác | Thêm thuốc vào đơn, thêm CLS |
| **Red = Block, Yellow = Warn, Green = Go** | Màu sắc nhất quán cho mức độ nguy hiểm | Dị ứng (đỏ), Tương tác (vàng), Bình thường (xanh) |
| **Sticky context** | Thông tin bệnh nhân luôn hiển thị ở header khi đang khám | ExamPanel header bar |
| **Auto-save draft** | Tự động lưu form mỗi 30 giây tránh mất dữ liệu | ExaminationWorkspace, Prescription |

---

## 2. TỐI ƯU HÀNG ĐỢI & GIAO DIỆN TỔNG QUAN

### 2.1. Dashboard Bác sĩ — Cải tiến cấu trúc thông tin

**Hiện tại:** 2-column layout với KPI cards và nhiều card thông tin không ưu tiên.

**Đề xuất:** Thiết kế theo nguyên tắc **"Next Action Prominence"**:

```
┌─────────────────────────────────────────────────────────────────┐
│ CA TRỰC: Sáng 07:30-11:30 | Phòng PK01 | 27/08/2026    [Đổi ca]│
├───────────────────┬─────────────────────────────────────────────┤
│                   │  ⚡ HÀNH ĐỘNG NGAY                          │
│  KPI SUMMARY      │ ┌─────────────────────────────────────────┐ │
│  🔴 Chờ: 6        │ │ 🚨 CA CẤP CỨU: Nguyễn Văn X (EMERGENCY)│ │
│  🟡 Đang: 1       │ │    SpO2: 88% | HA: 85/60               │ │
│  ✅ Xong: 10      │ │    [Vào khám ngay →]                    │ │
│  ⚡ CLS chờ: 4    │ └─────────────────────────────────────────┘ │
│                   │                                             │
│                   │ 🔬 KẾT QUẢ XN MỚI (4)                      │
│  [Vào phòng khám]│ • Trần Thị B — Kali máu 2.8 ⚠️ THẤP        │
│      CTA lớn      │ • Lê Văn C — X-Quang ngực [Xem]           │
│                   │                                             │
│                   │ 📅 LỊCH HẸN HÔM NAY (4/6 còn lại)         │
└───────────────────┴─────────────────────────────────────────────┘
```

**Cải tiến cụ thể:**
- [ ] Đẩy thẻ **bệnh nhân EMERGENCY** lên đầu với viền đỏ nổi bật
- [ ] **Nút CTA lớn "Vào phòng khám"** ở sidebar trái thay vì menu nhỏ
- [ ] **Notification badge** trên icon CLS showing số kết quả mới
- [ ] Auto-refresh dashboard mỗi 30 giây (không reload trang)

---

### 2.2. Queue Panel — Cải tiến hiển thị & thao tác

**Cải tiến 1: Visual Priority Sorting**
```
┌───┬──────────────────┬───────────────────┬────────────┬───────────────────┐
│STT│ Bệnh nhân         │ Sinh hiệu triage  │ Chờ (phút) │ Thao tác          │
├───┼──────────────────┼───────────────────┼────────────┼───────────────────┤
│ 3 │ 🚨 Phạm Văn C    │ SpO2:86% HA:85/60 │ 5 phút     │ [VÀO KHÁM NGAY]  │
│   │ 59t EMERGENCY    │ Nhịp tim: 110     │            │ nút đỏ to         │
├───┼──────────────────┼───────────────────┼────────────┼───────────────────┤
│ 1 │ ⚡ Trần Văn B    │ SpO2:95% HA:150/95│ 18 phút    │ [Gọi vào khám]   │
│   │ 47t URGENT       │ Nhịp tim: 92      │            │ nút vàng          │
├───┼──────────────────┼───────────────────┼────────────┼───────────────────┤
│ 2 │ Lê Thị A         │ SpO2:98% HA:120/80│ 12 phút    │ [Gọi vào khám]   │
│   │ 32t NORMAL       │                   │            │ nút xanh          │
└───┴──────────────────┴───────────────────┴────────────┴───────────────────┘
```

**Cải tiến 2: Gọi bệnh nhân bằng 1 click**
- Loại bỏ `window.confirm()` — thay bằng `toast.loading("Đang gọi...")` → `toast.success()`
- Highlight dòng đang chọn bằng màu xanh nhạt
- Nút "Vào khám" trong dòng DANG_KHAM mở thẳng sang `/exam` và auto-select bệnh nhân đó

**Cải tiến 3: Phím tắt trong Queue**
```
F1  → Gọi bệnh nhân tiếp theo (ưu tiên cao nhất)
F2  → Làm mới danh sách
↑↓  → Di chuyển giữa các bệnh nhân trong danh sách
Enter → Xem chi tiết / Gọi vào khám
```

---

## 3. TỐI ƯU PHÒNG KHÁM 4 BƯỚC (ExamPanel)

### 3.1. Sticky Patient Info Header — Thông tin bệnh nhân luôn hiển thị

**Vấn đề hiện tại:** Khi bác sĩ ở Bước 3 (Treatment), không nhìn thấy ngay thông tin BN.

**Giải pháp:** Compact sticky header trong ExamPanel:
```
┌────────────────────────────────────────────────────────────────────┐
│ 👤 Nguyễn Thị An (BN000123) | 45t Nữ | BHYT hạn: 31/12/2026      │
│ ⚠️ DỊ ỨNG: Penicillin, Aspirin | 🔴 Chẩn đoán: J18.9 Viêm phổi  │
│ [Bước 1] [Bước 2] [Bước 3 ★] [Bước 4] │ ⏱ 00:18:34 │ [Hoàn tất] │
└────────────────────────────────────────────────────────────────────┘
```

**Yêu cầu kỹ thuật:**
```tsx
// examination/components/ExamHeader.tsx (TẠO MỚI)
// - Luôn visible khi đã chọn bệnh nhân (sticky position)
// - Hiển thị: Tên, tuổi, giới, BHYT, DỊ ỨNG (màu đỏ), Chẩn đoán chính
// - Timer bấm giờ từ lúc Start Exam
// - Nút Hoàn tất nhanh (không cần vào Bước 4)
```

---

### 3.2. ExaminationWorkspace — Sinh hiệu Fast Input

**Cải tiến 1: Nhập sinh hiệu bằng Tab key**
- Thứ tự Tab: Nhiệt độ → Mạch → HA Tâm thu → HA Tâm trương → SpO2 → Nhịp thở → Cân nặng → Chiều cao → Lý do khám
- Auto-focus vào ô đầu tiên khi vào Bước 2
- Enter key → chuyển ô tiếp theo (như máy tính bàn)

**Cải tiến 2: Bộ sinh hiệu Nhanh (Quick Vital Entry)**
```tsx
// Chế độ "Nhập nhanh 1 dòng" (dành cho bác sĩ có điều dưỡng đã lấy sinh hiệu):
<div className="quick-vital-bar">
  <input placeholder="T°" name="nhietDo" style={{ width: '60px' }} />
  <input placeholder="Mạch" name="mach" style={{ width: '60px' }} />
  <input placeholder="HA" name="huyetAp" style={{ width: '80px' }} 
         pattern="\d{2,3}\/\d{2,3}" />  {/* "120/80" */}
  <input placeholder="SpO2%" name="spO2" style={{ width: '60px' }} />
  <input placeholder="Cân kg" name="canNang" style={{ width: '60px' }} />
  <button className="btn-sm primary">Lưu sinh hiệu</button>
</div>
```

**Cải tiến 3: Cảnh báo sinh hiệu bất thường ngay khi nhập**
```typescript
const VITAL_THRESHOLDS = {
  nhietDo: { min: 35, max: 39, dangerMin: 34, dangerMax: 40 },
  mach: { min: 60, max: 100, dangerMin: 40, dangerMax: 130 },
  haTamThu: { min: 90, max: 140, dangerMin: 80, dangerMax: 180 },
  spO2: { min: 95, max: 100, dangerMin: 90, dangerMax: 100 },
};

// Hiển thị cảnh báo ngay khi rời ô input (onBlur):
// - Ngoài ngưỡng bình thường → viền vàng + tooltip "Cao hơn bình thường"
// - Ngoài ngưỡng nguy hiểm → viền đỏ + toast.warning "⚠️ Nhiệt độ nguy hiểm!"
```

---

### 3.3. Diagnosis Tab — ICD-10 Fast Selection

**Cải tiến 1: ICD-10 Fuzzy Search với keyboard**
```
[  viêm phổi                               ] 🔍
│ J18.9  Viêm phổi, không xác định        ← Highlight
│ J18.1  Viêm phổi thùy                    
│ J18.0  Viêm phế quản phổi               
└─────────────────────────────────────────
  ↑↓ Di chuyển  |  Enter: Chọn  |  Esc: Đóng
```

**Cải tiến 2: Danh sách "Chẩn đoán hay dùng" theo chuyên khoa**
```tsx
// Hiển thị top 10 ICD-10 phổ biến nhất của bác sĩ (từ lịch sử kê của họ):
<div className="frequent-icd">
  <h5>Hay dùng</h5>
  {frequentIcds.map(icd => (
    <button key={icd.code}
      className="icd-chip"
      onClick={() => applyIcd(icd)}>
      {icd.code} {icd.shortName}
    </button>
  ))}
</div>
// API: GET /api/LuotKham/icd/frequent?bacSiId=&limit=10
```

**Cải tiến 3: Phím tắt chẩn đoán**
```
Alt+D   → Focus vào ô nhập mã ICD
Alt+P   → Thêm chẩn đoán Chính
Alt+S   → Thêm chẩn đoán Phụ (Secondary)
```

---

### 3.4. Prescription Tab — Kê đơn tối thiểu 3 click

**Quy trình mục tiêu: 3 click để thêm 1 thuốc vào đơn:**
```
Click 1: Gõ "Amoxicillin" → chọn từ dropdown (auto-fill hàm lượng, đường dùng)
Click 2: Nhập số lượng + số ngày (Tab navigation)
Click 3: "Thêm vào đơn" → thuốc vào danh sách
```

**Cải tiến 1: Prescription Quick Template (Đơn mẫu)**
```tsx
// Bác sĩ có thể lưu "Phác đồ mẫu" cho bệnh phổ biến:
<select name="prescriptionTemplate" onChange={applyTemplate}>
  <option value="">-- Chọn phác đồ mẫu --</option>
  <option value="viem-hong">Viêm họng cấp (3 thuốc)</option>
  <option value="tang-huyet-ap">Tăng huyết áp (2 thuốc)</option>
  <option value="dai-thao-duong">Đái tháo đường type 2 (3 thuốc)</option>
</select>
// API: GET /api/prescription-templates?bacSiId=
// Sau khi chọn → auto-fill toàn bộ danh sách thuốc, chỉ cần review và lưu
```

**Cải tiến 2: Drug Autocomplete với thông tin dược lý ngắn gọn**
```
[Tìm thuốc: parace...                    ]
│ Paracetamol 500mg TAB         Còn: 500v
│   Đường dùng: Uống | Liều thường: 1-2v x 3-4l/ng
│ Paracetamol 1000mg TAB        Còn: 200v
│   Đường dùng: Uống | Liều thường: 1v x 3l/ng
└─────────────────────────────────────────────────
```

**Cải tiến 3: Cảnh báo tương tác thuốc trong dòng (Inline Warning)**
```tsx
// Sau mỗi lần thêm thuốc, hiển thị ngay dưới dòng thuốc đó:
<tr className={interaction?.severity === 'SEVERE' ? 'row-danger' : ''}>
  <td>Warfarin 5mg</td>
  <td>...</td>
  <td>
    {interaction && (
      <div className={`interaction-warning ${interaction.severity.toLowerCase()}`}>
        ⚠️ Tương tác với Aspirin: {interaction.mechanism}
        {interaction.severity === 'SEVERE' && (
          <strong> — CẦN XEM XÉT LẠI</strong>
        )}
      </div>
    )}
  </td>
</tr>
```

**Cải tiến 4: Phím tắt kê đơn**
```
Alt+M   → Focus ô tìm kiếm thuốc (Medication search)
Alt+Enter → Thêm thuốc đang chọn vào đơn
Ctrl+P  → In đơn thuốc (Print prescription)
Ctrl+S  → Lưu đơn thuốc
```

---

### 3.5. ElectronicRecordWorkspace — Hoàn tất nhanh

**Cải tiến 1: One-Click Finish với điều kiện hiển thị rõ ràng**

```tsx
// Trước nút Hoàn tất, hiển thị checklist điều kiện:
<div className="finish-checklist">
  <CheckItem done={hasDiagnosis} label="Đã có chẩn đoán chính" />
  <CheckItem done={hasChiefComplaint} label="Đã ghi lý do khám" />
  <CheckItem done={hasVitalSigns} label="Đã nhập sinh hiệu" />
  <CheckItem done={hasPrescription || noMedsNeeded} label="Đã kê đơn hoặc không cần thuốc" optional />
  <CheckItem done={hasDisposition} label="Đã chọn xử trí (về nhà / tái khám / nhập viện)" />
</div>

<button
  className={`btn-finish ${allConditionsMet ? 'btn-success' : 'btn-disabled'}`}
  disabled={!allConditionsMet}
  onClick={handleFinish}>
  {allConditionsMet ? '✅ Hoàn tất & Chuyển thanh toán' : '⚠️ Còn thiếu thông tin'}
</button>
```

**Cải tiến 2: Quick Finish từ mọi tab (không cần vào Bước 4)**

```tsx
// Thêm nút "Hoàn tất nhanh" trong sticky header (chỉ active khi đủ điều kiện):
// Sau khi click → mở modal tóm tắt + xác nhận
<button className="btn-quick-finish" onClick={openQuickFinishModal}>
  ✓ Hoàn tất
</button>
```

---

## 4. PHÍM TẮT BÀN PHÍM TOÀN HỆ THỐNG (Global Hotkeys)

### 4.1. Bảng phím tắt đề xuất cho DoctorUI

| Phím tắt | Hành động | Màn hình áp dụng |
|---|---|---|
| `F1` | Gọi bệnh nhân tiếp theo | Queue, Dashboard |
| `F2` | Làm mới danh sách | Tất cả |
| `F3` | Bắt đầu khám bệnh nhân đang chọn | Queue, Exam |
| `F5` | Không dùng (tránh nhầm với F5 browser) | — |
| `F9` | Xác nhận & Hoàn tất lượt khám | Exam bước 4 |
| `Ctrl+D` | Thêm chẩn đoán mới | Exam bước 3 |
| `Ctrl+M` | Focus ô tìm kiếm thuốc | Prescription tab |
| `Ctrl+L` | Thêm chỉ định CLS | Services tab |
| `Ctrl+S` | Lưu form hiện tại | Tất cả form |
| `Ctrl+P` | In (phiếu khám / đơn thuốc / bệnh án) | Exam |
| `Esc` | Đóng modal / Huỷ thao tác | Tất cả |
| `Alt+1-4` | Chuyển giữa 4 bước khám | ExamPanel |
| `Alt+T` | Chuyển sang tab Thuốc | Treatment |
| `Alt+C` | Chuyển sang tab Cận lâm sàng | Treatment |
| `Alt+G` | Chuyển sang tab Chẩn đoán | Treatment |
| `↑↓` | Di chuyển trong danh sách hàng đợi | Queue |
| `Enter` | Chọn / Xác nhận hành động | Danh sách |

### 4.2. Triển khai Global Hotkey Hook

```typescript
// shared/hooks/useGlobalHotkeys.ts (TẠO MỚI)
import { useHotkeys } from 'react-hotkeys-hook';

export function useExamHotkeys({
  onNextPatient, onStartExam, onFinish, onSave
}: ExamHotkeyHandlers) {
  useHotkeys('f1', onNextPatient, { description: 'Gọi bệnh nhân tiếp theo' });
  useHotkeys('f3', onStartExam, { description: 'Bắt đầu khám' });
  useHotkeys('f9', onFinish, { description: 'Hoàn tất lượt khám' });
  useHotkeys('ctrl+s', (e) => { e.preventDefault(); onSave(); });
}
// Thư viện: react-hotkeys-hook (đã phổ biến, nhẹ, hỗ trợ scope)
```

---

## 5. CẢI TIẾN THÔNG BÁO & CẢnh BÁO (Notification UX)

### 5.1. Thay thế toàn bộ `alert()` / `confirm()` bằng Toast + Modal

**Thư viện khuyên dùng:** `react-hot-toast` (đã nhẹ, hỗ trợ promise)

```typescript
// shared/utils/toast.ts (TẠO MỚI)
import toast from 'react-hot-toast';

export const notify = {
  success: (msg: string) => toast.success(msg, { duration: 3000 }),
  error: (msg: string) => toast.error(msg, { duration: 5000 }),
  warning: (msg: string) => toast(msg, { icon: '⚠️', duration: 4000 }),
  // Promise toast - dùng khi gọi API:
  promise: <T>(promise: Promise<T>, msgs: ToastMessages) =>
    toast.promise(promise, msgs),
};

// Sử dụng:
notify.promise(
  examinationApi.completeExam(luotKhamId),
  {
    loading: 'Đang hoàn tất lượt khám...',
    success: 'Lượt khám đã hoàn tất. Bệnh nhân chuyển sang thanh toán.',
    error: 'Không thể hoàn tất lượt khám. Vui lòng thử lại.',
  }
);
```

### 5.2. Notification Center — Thông báo lâm sàng real-time

```tsx
// shared/components/NotificationCenter.tsx (TẠO MỚI)
// Bell icon với badge số thông báo chưa đọc
// Khi click → Dropdown danh sách thông báo
// Phân loại:
// 🔬 "Kết quả XN bệnh nhân Nguyễn A đã có" → Click → mở thẳng tab Results
// ⚠️ "Kết quả X-Quang BN Trần B: BẤT THƯỜNG" → Click → mở ExamPanel
// ✅ "Thuốc cho BN Lê C đã cấp phát tại kho" → Thông báo bình thường
// 🚨 "Bệnh nhân Phạm D vừa triage: EMERGENCY" → Click → queue.emergency
```

---

## 6. TỐI ƯU THIẾT BỊ & RESPONSIVE

### 6.1. Tablet Mode (iPad trong phòng khám)

```css
/* styles/responsive.css - cải thiện cho tablet 768-1024px */
@media (max-width: 1024px) {
  .exam-panel {
    /* 4 bước hiển thị dạng accordion thay vì tabs */
    flex-direction: column;
  }

  .exam-sidebar {
    /* Thu gọn sidebar thành icon + số đếm */
    width: 48px;
  }

  .vital-signs-grid {
    /* 2 cột thay vì 4 cột */
    grid-template-columns: repeat(2, 1fr);
  }

  .prescription-form {
    /* Stack thay vì inline */
    flex-direction: column;
  }
}
```

### 6.2. Font size y tế (dễ đọc dưới ánh đèn phòng khám)

```css
/* styles/variables.css */
:root {
  --font-base: 15px;           /* Từ 14px lên 15px */
  --font-data: 16px;           /* Số liệu sinh hiệu */
  --font-alert: 17px;          /* Cảnh báo dị ứng */
  --line-height-table: 1.6;    /* Khoảng cách dòng dễ đọc */
  --color-danger: #dc2626;     /* Đỏ dị ứng / cảnh báo */
  --color-warning: #d97706;    /* Vàng - cảnh báo nhẹ */
  --color-success: #16a34a;    /* Xanh - bình thường */
}
```

---

## 7. TÓM TẮT ROADMAP UX CẢI TIẾN

| # | Cải tiến | Impact | Effort | Priority |
|:---:|---|:---:|:---:|:---:|
| U1 | Sticky Patient Info Header khi khám | 🔴 Cao | Thấp | P0 |
| U2 | Thay toàn bộ alert()/confirm() bằng Toast/Modal | 🔴 Cao | Thấp | P0 |
| U3 | Visual Priority badges trong Queue (EMERGENCY đỏ) | 🔴 Cao | Thấp | P0 |
| U4 | Tab key navigation qua các ô sinh hiệu | 🟡 TB | Thấp | P1 |
| U5 | ICD-10 Fuzzy search + keyboard navigation | 🟡 TB | Thấp | P1 |
| U6 | Checklist điều kiện Hoàn tất Khám | 🟡 TB | Thấp | P1 |
| U7 | Global hotkeys (F1, F3, F9, Ctrl+S) | 🟡 TB | Trung | P1 |
| U8 | Cảnh báo sinh hiệu bất thường inline | 🔴 Cao | Trung | P1 |
| U9 | Auto-refresh Queue mỗi 30 giây (polling) | 🔴 Cao | Thấp | P1 |
| U10 | Prescription Template (phác đồ mẫu) | 🟡 TB | Trung | P2 |
| U11 | Drug autocomplete với tồn kho + dược lý | 🔴 Cao | Cao | P2 |
| U12 | Notification Center real-time | 🟡 TB | Cao | P2 |
| U13 | AI Suggest Diagnosis từ triệu chứng | 🟡 TB | Cao | P2 |
| U14 | Tablet responsive mode | 🟢 Thấp | Trung | P2 |
| U15 | Frequent ICD-10 shortcuts theo chuyên khoa | 🟢 Thấp | Thấp | P2 |

---

## 8. TIÊU CHUẨN KIỂM ĐỊNH UX TRƯỚC GO-LIVE

**Bác sĩ phải hoàn thành lượt khám mẫu đáp ứng các tiêu chí sau:**

| Tiêu chí | Mục tiêu | Đo lường |
|---|---|---|
| Thời gian nhập sinh hiệu 7 chỉ số | < 45 giây | Stopwatch test |
| Thời gian tìm + chọn ICD-10 | < 20 giây | Stopwatch test |
| Thời gian kê 1 thuốc hoàn chỉnh | < 30 giây | Stopwatch test |
| Số click để hoàn tất 1 lượt khám | ≤ 25 click | Click counter |
| Tỷ lệ lỗi form (nhập sai, submit lỗi) | < 5% | Error logging |
| Bác sĩ tìm được tính năng không quen | < 10 giây | UX observation |

---

*© 2026 – DoctorUI UX Recommendations – ClinicManagement HIS*  
*Tài liệu tham khảo: HIMSS UX Guidelines for EMR, AHRQ Clinical Decision Support Design Patterns, WHO Digital Health Guidelines 2023*
