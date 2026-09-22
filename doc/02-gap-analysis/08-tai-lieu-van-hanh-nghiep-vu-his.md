# TÀI LIỆU HƯỚNG DẪN VẬN HÀNH NGHIỆP VỤ HỆ THỐNG HIS/EMR
## (Sổ tay Quy trình Lâm sàng & Vận hành Hành chính Toàn diện)

> **Đối tượng áp dụng:** Bác sĩ khám chữa bệnh, Điều dưỡng tiếp đón, Dược sĩ, Thu ngân, Kỹ thuật viên CLS và Quản trị viên phòng KHTH / CNTT.  
> **Hệ thống:** ClinicManagement HIS/EMR  
> **Cập nhật:** 2026-09-16 | **Phiên bản:** 2.0 (Bản chuẩn hóa Vận hành Nghiệp vụ)

---

## MỤC LỤC QUY TRÌNH
1. [Sơ đồ Luồng Vận hành Nghiệp vụ Khép kín (End-to-End Clinical Flow)](#1-sơ-đồ-luồng-vận-hành-nghiệp-vụ-khép-kín)
2. [Quy trình 1: Tiếp đón, Phân luồng & Triage Cấp cứu](#quy-trình-1-tiếp-đón-phân-luồng--triage-cấp-cứu)
3. [Quy trình 2: Khám bệnh Lâm sàng & Chẩn đoán Bệnh án Điện tử (EMR)](#quy-trình-2-khám-bệnh-lâm-sàng--chẩn-đoán-bệnh-án-điện-tử-emr)
4. [Quy trình 3: Chỉ định Cận lâm sàng & Theo dõi Kết quả Thực hiện (LIS / PACS)](#quy-trình-3-chỉ-định-cận-lâm-sàng--theo-dõi-kết-quả-thực-hiện-lis--pacs)
5. [Quy trình 4: Kê đơn Thuốc Điện tử & Kiểm soát An toàn Dược lâm sàng](#quy-trình-4-kê-đơn-thuốc-điện-tử--kiểm-soát-an-toàn-dược-lâm-sàng)
6. [Quy trình 5: Ký số, Khóa Hồ sơ Bệnh án & Xử trí Kết thúc Khám](#quy-trình-5-ký-số-khóa-hồ-sơ-bệnh-án--xử-trí-kết-thúc-khám)
7. [Quy trình 6: Thu viện phí, Quản lý Ca Thu ngân & Thanh toán BHYT](#quy-trình-6-thu-viện-phí-quản-lý-ca-thu-ngân--thanh-toán-bhyt)
8. [Quy trình 7: Cấp phát Thuốc & Quản lý Kho Dược Ngoại trú](#quy-trình-7-cấp-phát-thuốc--quản-lý-kho-dược-ngoại-trú)
9. [Quy trình 8: Quản trị Hệ thống, Phân quyền Dữ liệu & Kiểm toán Bệnh án (Audit Trail)](#quy-trình-8-quản-trị-hệ-thống-phân-quyền-dữ-liệu--kiểm-toán-bệnh-án)

---

# 1. SƠ ĐỒ LUỒNG VẬN HÀNH NGHIỆP VỤ KHÉP KÍN

```
[ BỆNH NHÂN ĐẾN ]
        │
        ▼
[ 1. TIẾP ĐÓN & TRIAGE ] ─── (Cấp cứu/Ưu tiên/Thường) ───► [ Sinh hiệu ban đầu ]
        │
        ▼
[ 2. HÀNG ĐỢI BUỒNG KHÁM ] ─── (Tự động cập nhật 30s) ───► [ Bác sĩ gọi vào khám ]
        │
        ▼
[ 3. KHÁM BỆNH & CHẨN ĐOÁN ]
        ├── Khai thác bệnh sử & kiểm tra Sticky Allergy Banner (Dị ứng)
        ├── Đo đạc bổ sung sinh hiệu & tự động tính BMI
        └── Chẩn đoán ICD-10 (Bắt buộc 1 Bệnh chính + Các bệnh kèm theo)
        │
        ├──► [ 4. CHỈ ĐỊNH CẬN LÂM SÀNG (Nếu cần) ]
        │          ├── Lấy mẫu / Chụp X-Quang / Siêu âm
        │          └── Trả kết quả (LIS / PACS) -> Bác sĩ đánh giá bất thường
        │
        ├──► [ 5. KÊ ĐƠN THUỐC ĐIỆN TỬ ]
        │          ├── Kiểm tra tương tác thuốc & trùng hoạt chất dị ứng
        │          └── Chọn loại đơn: BHYT / Tự túc / Hỗn hợp
        │
        ▼
[ 6. KÝ SỐ & KHÓA BỆNH ÁN ] ───► Chuyển hồ sơ sang chế độ CHỈ ĐỌC (Read-Only)
        │
        ▼
[ 7. THU VIỆN PHÍ & BHYT ] ───► Mở ca thu ngân -> Xuất hóa đơn -> Chốt ca đối soát
        │
        ▼
[ 8. KHO DƯỢC CẤP THUỐC ] ───► Kiểm tra đơn -> Trừ tồn kho -> Bệnh nhân ra về
```

---

# QUY TRÌNH 1: TIẾP ĐÓN, PHÂN LUỒNG & TRIAGE CẤP CỨU

### 1. Mục tiêu
Tiếp nhận bệnh nhân nhanh chóng, đo dấu hiệu sinh tồn ban đầu và phân luồng chính xác theo mức độ ưu tiên y khoa (Triage) để xử lý kịp thời các ca nguy kịch.

### 2. Các bước thực hiện nghiệp vụ

#### Bước 1.1: Tra cứu & Đăng ký bệnh nhân
- **Nhân sự thực hiện:** Điều dưỡng bàn tiếp đón / Nhân viên lễ tân.
- **Thao tác:**
  1. Quét mã CCCD / Thẻ BHYT hoặc tra cứu theo Số điện thoại / Họ tên.
  2. Nếu là **bệnh nhân mới**: Nhập đầy đủ thông tin hành chính (Họ tên, Ngày sinh, Giới tính, Địa chỉ, Số CCCD, Mã thẻ BHYT).
  3. Nếu là **bệnh nhân cũ**: Kiểm tra và xác nhận lại thông tin cư trú và hạn dùng thẻ BHYT.

#### Bước 1.2: Phân loại Triage & Đo lường Sinh hiệu ban đầu
- **Nhân sự thực hiện:** Điều dưỡng tiếp đón.
- **Thao tác nghiệp vụ:**
  1. Tiến hành đo sinh hiệu: **Mạch, Huyết áp, SpO2, Nhiệt độ**.
  2. Phân loại mức độ ưu tiên theo 3 mức chuẩn:
     - 🚨 **CẤP CỨU (EMERGENCY):** Bệnh nhân khó thở (SpO2 < 90%), đau ngực dữ dội, huyết áp tăng vọt (> 180/110 mmHg), co giật, hôn mê.
     - ⚡ **ƯU TIÊN (URGENT):** Trẻ sơ sinh, người già > 75 tuổi, phụ nữ có thai đau bụng, sốt cao > 39°C.
     - 🟢 **THƯỜNG (NORMAL):** Các trường hợp khám bệnh định kỳ, bệnh nhẹ mạn tính.
  3. Chọn Khoa khám / Buồng khám chuyên khoa phù hợp và phát số thứ tự tiếp đón.

#### Bước 1.3: Kết quả đầu ra trên hệ thống
- Hệ thống tự động đẩy bệnh nhân vào Hàng đợi của Buồng khám tương ứng.
- Ca **Cấp cứu** tự động nhảy lên vị trí đầu tiên của hàng đợi với nhãn đỏ rực `🚨 CẤP CỨU` để bác sĩ tiếp nhận ngay lập tức.

---

# QUY TRÌNH 2: KHÁM BỆNH LÂM SÀNG & CHẨN ĐOÁN BỆNH ÁN ĐIỆN TỬ (EMR)

### 1. Mục tiêu
Bác sĩ tiếp nhận bệnh nhân, khai thác bệnh sử an toàn, ghi nhận các cơ quan lâm sàng và kết luận chẩn đoán mã hóa theo danh mục ICD-10.

### 2. Các bước thực hiện nghiệp vụ

#### Bước 2.1: Gọi bệnh nhân vào phòng khám
- Bác sĩ mở giao diện **Hàng đợi buồng khám** (`/queue`).
- Quan sát danh sách: Nhận biết nhanh qua nhãn ưu tiên (`CẤP CỨU`, `ƯU TIÊN`) và widget hover xem nhanh sinh hiệu (Mạch, HA, SpO2).
- Nhấn nút **"Vào khám"** hoặc **"Gọi khám"**: Trạng thái lượt khám chuyển sang `DANG_KHAM`.

#### Bước 2.2: Tiếp nhận & Nhận diện Cảnh báo Dị ứng (Allergy Banner)
- Tại Bước 1 (**Không gian bệnh nhân**), bác sĩ đối chiếu nhanh họ tên, ngày sinh, đối tượng BHYT.
- Chuyển sang Bước 2 (**Khám bệnh**):
  - **LƯU Ý ĐẶC BIỆT:** Nếu bệnh nhân có tiền sử dị ứng thuốc/thức ăn, hệ thống sẽ ghim cố định thanh cảnh báo màu đỏ **Sticky Allergy Banner**:  
    `⚠️ CẢNH BÁO NGUY HIỂM: Bệnh nhân có tiền sử dị ứng với [Tên hoạt chất / Tác nhân]`.
  - Bác sĩ phải ghi nhớ cảnh báo này để tuyệt đối không kê các loại thuốc thuộc nhóm tương tự.

#### Bước 2.3: Nhập Lý do khám, Bệnh sử & Sinh hiệu
- **Lý do khám:** Ghi nhận lý do chính khiến bệnh nhân đến viện (VD: Đau ngực trái giờ thứ 2, ho sốt kéo dài 3 ngày...).
- **Cập nhật sinh hiệu:** Nhập các thông số thực tế tại buồng khám. Hệ thống tự động tính toán chỉ số khối cơ thể **BMI (kg/m²)** và phân loại thể trạng (Bình thường / Thiếu cân / Thừa cân / Béo phì).
- Nhấn **"Lưu thông tin khám bệnh"**.

#### Bước 2.4: Kết luận Chẩn đoán Bệnh tật (ICD-10)
- Chuyển sang Bước 3 (**Xử trí**), chọn tab con **"Chẩn đoán"**:
  1. Nhập từ khóa tìm kiếm mã hoặc tên bệnh (VD: `J18` hoặc `viêm phổi`).
  2. **Quy tắc phân loại bắt buộc:**
     - **Chẩn đoán chính:** Bắt buộc duy nhất **01 bệnh chính** (nguyên nhân chính của đợt khám).
     - **Chẩn đoán kèm theo:** Có thể thêm nhiều bệnh phụ/bệnh nền (VD: Tăng huyết áp, Đái tháo đường type 2).
  3. Nhấn **"Lưu chẩn đoán"**.

---

# QUY TRÌNH 3: CHỈ ĐỊNH CẬN LÂM SÀNG & THEO DÕI KẾT QUẢ THỰC HIỆN (LIS / PACS)

### 1. Mục tiêu
Chỉ định đúng và đủ các xét nghiệm, chẩn đoán hình ảnh phục vụ chẩn đoán xác định, theo dõi tiến trình thực hiện và đọc kết quả trả về thời gian thực.

### 2. Các bước thực hiện nghiệp vụ

#### Bước 3.1: Chỉ định Dịch vụ Kỹ thuật
- Tại tab **"Chỉ định dịch vụ"** trong Bước 3:
  1. Chọn dịch vụ từ danh mục (Xét nghiệm huyết học, Sinh hóa, X-Quang, Siêu âm...).
  2. Hệ thống tự động xác định loại dịch vụ và mức giá tương ứng.
  3. Nhấn **"Thêm chỉ định"**.
  4. Trạng thái chỉ định ban đầu là `DaChiDinh` (Đã chỉ định).

#### Bước 3.2: Luồng phối hợp liên phòng ban
- **Phòng Lấy mẫu / Xét nghiệm (LIS):** Nhận bệnh nhân theo mã lượt khám -> Lấy mẫu bệnh phẩm -> Đưa vào máy chạy tự động -> Kết quả được máy gửi qua cổng MLLP đẩy thẳng vào hệ thống HIS.
- **Phòng Chẩn đoán hình ảnh (RIS/PACS):** Bệnh nhân được chụp X-quang/CT/Siêu âm -> Hình ảnh được lưu trữ trên PACS Server -> Bác sĩ chẩn đoán hình ảnh duyệt kết luận và trả link ảnh DICOM.

#### Bước 3.3: Bác sĩ điều trị xem & Đánh giá kết quả
- Bác sĩ mở tab con **"Kết quả"**:
  - Xem kết quả xét nghiệm hóa sinh / huyết học: Các chỉ số **bất thường (vượt ngưỡng tham chiếu)** được hệ thống bôi đậm màu đỏ hoặc gắn cờ `CẢNH BÁO / BẤT THƯỜNG`.
  - Xem kết quả chẩn đoán hình ảnh: Bấm xem mô tả hình ảnh hoặc nhấp vào liên kết mở trình duyệt xem phim chụp DICOM trực tiếp.
- Dựa trên kết quả cận lâm sàng, bác sĩ quay lại tab Chẩn đoán để bổ sung hoặc hoàn thiện chẩn đoán xác định.

---

# QUY TRÌNH 4: KÊ ĐƠN THUỐC ĐIỆN TỬ & KIỂM SOÁT AN TOÀN DƯỢC LÂM SÀNG

### 1. Mục tiêu
Kê đơn an toàn, chính xác liều lượng, kiểm soát tương tác thuốc và bảo đảm quyền lợi người bệnh có thẻ BHYT.

### 2. Các bước thực hiện nghiệp vụ

#### Bước 4.1: Chọn Loại đơn thuốc
- Tại tab con **"Đơn thuốc"**, bác sĩ chọn hình thức thanh toán của đơn:
  - **Đơn BHYT:** Áp dụng cho danh mục thuốc thuộc quỹ BHYT chi trả.
  - **Đơn Tự túc / Thu phí:** Áp dụng cho thuốc ngoài danh mục hoặc bệnh nhân khám dịch vụ.
  - **Đơn Hỗn hợp:** Kết hợp cả thuốc BHYT và thuốc ngoài phạm vi.

#### Bước 4.2: Tìm kiếm Thuốc từ Kho Dược
- Nhập tên biệt dược hoặc tên hoạt chất tại ô tìm kiếm (VD: `Amoxicillin` hoặc `Paracetamol`).
- Bảng gợi ý xổ xuống hiển thị: Tên thuốc, Hoạt chất, Hàm lượng, Tồn kho khả dụng và nhãn `BHYT`.
- Chọn loại thuốc cần kê.

#### Bước 4.3: Tự động Kiểm tra Dị ứng & Tương tác Thuốc (Clinical CDS)
- **Cơ chế kiểm soát an toàn:**
  - Ngay khi bác sĩ chọn thuốc, hệ thống lập tức đối chiếu hoạt chất chính của thuốc với tiền sử dị ứng của bệnh nhân.
  - **Nếu phát hiện nguy cơ dị ứng:** Hệ thống kích hoạt hộp thoại cảnh báo nguy kịch màu đỏ:  
    `🚨 CẢNH BÁO NGUY HIỂM: Bệnh nhân có tiền sử dị ứng với hoạt chất [Tên hoạt chất]! Nguy cơ sốc phản vệ.`
  - Bác sĩ phải lập tức xem xét đổi sang nhóm thuốc an toàn khác.

#### Bước 4.4: Nhập Liều lượng & Hướng dẫn Sử dụng
- Nhập: Số lượng, Đơn vị tính (Viên, Gói, Lọ...), Đường dùng (Uống, Tiêm...), Số ngày sử dụng.
- Nhập hướng dẫn cụ thể cho bệnh nhân (VD: *Sáng 1 viên sau ăn no, Tối 1 viên trước khi đi ngủ*).
- Bấm **"Thêm vào đơn"**.
- Sau khi thêm đủ các thuốc, bấm **"Lưu đơn thuốc"** để hệ thống ghi nhận vào phiên làm việc.

---

# QUY TRÌNH 5: KÝ SỐ, KHÓA HỒ SƠ BỆNH ÁN & XỬ TRÍ KẾT THÚC KHÁM

### 1. Mục tiêu
Tổng kết toàn bộ phiên khám chữa bệnh, kiểm tra tính đầy đủ của dữ liệu theo quy định Bộ Y tế, thực hiện ký số điện tử và đóng băng hồ sơ không cho phép chỉnh sửa.

### 2. Các bước thực hiện nghiệp vụ

#### Bước 5.1: Kiểm tra Bệnh án Điện tử (Bước 4)
- Bác sĩ chuyển sang Bước 4 (**Bệnh án điện tử**).
- Hệ thống tự động tổng hợp:
  - Thông tin hành chính bệnh nhân & lượt khám.
  - Tóm tắt lý do khám, triệu chứng và sinh hiệu.
  - Chẩn đoán chính và các chẩn đoán phụ kèm theo mã ICD-10.
  - Danh sách đơn thuốc ngoại trú và các dịch vụ cận lâm sàng đã làm.

#### Bước 5.2: Đối chiếu Checklist Tiền Điều kiện
- Màn hình hiển thị bộ checklist điều kiện bắt buộc trước khi khóa:
  - `[✔]` Đã có Lý do khám bệnh.
  - `[✔]` Đã có ít nhất 01 Chẩn đoán chính (ICD-10).
  - `[✔]` Đã ghi nhận Sinh hiệu ban đầu.
- **Nếu thiếu bất kỳ điều kiện nào:** Nút hoàn tất sẽ bị vô hiệu hóa kèm cảnh báo hướng dẫn bác sĩ quay lại bổ sung.

#### Bước 5.3: Ký số & Khóa Hồ sơ Bệnh án
- Nhấn nút **"Ký số & Khóa hồ sơ khám"**.
- Xác nhận hộp thoại cảnh báo: *Hành động này sẽ tạo chữ ký điện tử bất biến và chuyển hồ sơ sang chế độ Chỉ đọc (Read-only)*.
- **Sau khi xác nhận thành công:**
  1. Hồ sơ được cấp một mã Chữ ký số duy nhất (VD: `SIG_20260916_DOC_NTTUAN`).
  2. Giao diện hiển thị Banner xác nhận: **HỒ SƠ ĐÃ ĐƯỢC KHÓA BỆNH ÁN ĐIỆN TỬ (READ-ONLY)**.
  3. Lượt khám chuyển trạng thái sang `HOAN_THANH`.
  4. Tự động sinh hồ sơ chi phí chuyển tiếp sang bộ phận Thu ngân viện phí.
  5. Bác sĩ có thể bấm **"In bệnh án"** để giao cho bệnh nhân.

---

# QUY TRÌNH 6: THU VIỆN PHÍ, QUẢN LÝ CA THU NGÂN & THANH TOÁN BHYT

### 1. Mục tiêu
Quản lý dòng tiền chặt chẽ theo từng thu ngân, chốt sổ ca làm việc minh bạch, đối soát BHYT chính xác và chống thất thoát tài chính.

### 2. Các bước thực hiện nghiệp vụ

#### Bước 6.1: Đầu ca - Mở ca Thu ngân (Cashier Session Open)
- Thu ngân đăng nhập tài khoản tại phân hệ Quản trị viện phí.
- Truy cập màn hình **Quản lý Ca thu ngân**:
  - Nhập **Số tiền mặt đầu ca** (tiền lẻ dự trữ ban đầu để thối lại).
  - Bấm **"Mở ca làm việc"**. Kể từ thời điểm này, mọi biên lai thu tiền sẽ được gắn chặt với mã phiên của thu ngân đó.

#### Bước 6.2: Thu tiền Khám, Cận lâm sàng & Thuốc
- Tìm kiếm lượt khám bệnh nhân bằng mã bệnh nhân hoặc mã lượt khám.
- Hệ thống hiển thị bảng kê chi phí:
  - Tiền công khám bệnh.
  - Tiền dịch vụ cận lâm sàng (Xét nghiệm, CĐHA).
  - Tiền thuốc ngoại trú.
  - Phần tiền quỹ BHYT chi trả (theo % quyền lợi của thẻ).
  - Phần tiền bệnh nhân cùng chi trả / thanh toán tự túc.
- Lựa chọn phương thức thanh toán: **Tiền mặt / Chuyển khoản QR ngân hàng / Thẻ POS**.
- Bấm **"Xác nhận thanh toán & In biên lai thu tiền"**.

#### Bước 6.3: Xử lý Hoàn tiền & Hủy biên lai (Nếu có)
- Trường hợp bệnh nhân hủy dịch vụ cận lâm sàng chưa thực hiện hoặc bác sĩ hủy chỉ định:
  - Vào màn hình **"Phiếu hoàn tiền / Void"**.
  - Nhập lý do hoàn tiền (Bệnh nhân từ chối thực hiện / Bác sĩ đổi chỉ định).
  - Yêu cầu Trưởng ca/Supervisor duyệt xác nhận trước khi hoàn trả tiền mặt lại cho bệnh nhân.

#### Bước 6.4: Cuối ca - Đóng ca & Đối soát Tài chính (Cashier Session Close)
- Thu ngân kiểm đếm tiền mặt thực tế tại két.
- Bấm **"Đóng ca làm việc"**:
  - Hệ thống hiển thị Tổng tiền kỳ vọng (Tiền mặt + Chuyển khoản).
  - Nhập số tiền mặt thực tế kiểm đếm.
  - Hệ thống tính toán chênh lệch (Variance: Khớp / Thừa / Thiếu).
  - Bấm **"Chốt ca & In biên bản bàn giao ca"** nộp cho thủ quỹ.

---

# QUY TRÌNH 7: CẤP PHÁT THUỐC & QUẢN LÝ KHO DƯỢC NGOẠI TRÚ

### 1. Mục tiêu
Đảm bảo bệnh nhân nhận đúng thuốc, đúng liều lượng, theo dõi xuất kho tự động và quản lý hạn dùng thuốc chặt chẽ theo nguyên tắc FEFO.

### 2. Các bước thực hiện nghiệp vụ

#### Bước 7.1: Tiếp nhận Đơn thuốc tại Quầy Dược
- Dược sĩ mở phân hệ **Cấp phát & Xuất kho Dược** (`/inventory/dispense`).
- Quét mã đơn thuốc hoặc nhập mã lượt khám của bệnh nhân.
- Hệ thống kiểm tra điều kiện: Đơn thuốc đã được bác sĩ ký số và bệnh nhân đã hoàn tất thanh toán tại thu ngân.

#### Bước 7.2: Chuẩn bị & Kiểm tra Dược lâm sàng (3 Tra - 5 Chiếu)
- Dược sĩ đối chiếu đơn thuốc: Tên thuốc, nồng độ/hàm lượng, số lượng, hướng dẫn sử dụng.
- Lấy thuốc từ các ngăn tủ kho ngoại trú.
- Hệ thống tự động ưu tiên trừ kho các lô thuốc có hạn sử dụng gần nhất (**Nguyên tắc FEFO - First Expired, First Out**).

#### Bước 7.3: Giao thuốc & Dặn dò Bệnh nhân
- Gọi bệnh nhân theo số thứ tự nhận thuốc.
- Hướng dẫn trực tiếp cho bệnh nhân cách uống thuốc (uống trước/sau ăn, các thực phẩm kiêng kỵ khi uống kháng sinh).
- Bấm **"Xác nhận đã cấp phát thuốc"** trên hệ thống: Tồn kho thực tế tự động giảm trừ.

---

# QUY TRÌNH 8: QUẢN TRỊ HỆ THỐNG, PHÂN QUYỀN DỮ LIỆU & KIỂM TOÁN (AUDIT TRAIL)

### 1. Mục tiêu
Bảo mật thông tin bệnh án, phân quyền chặt chẽ theo nguyên tắc quyền tối thiểu (Least Privilege) và truy vết bất biến toàn bộ hành vi người dùng theo quy định pháp lý.

### 2. Các bước thực hiện nghiệp vụ

#### Bước 8.1: Thiết lập Phân quyền Chức năng & Phạm vi Dữ liệu (Granular RBAC)
- Quản trị viên truy cập màn hình **Vai trò & Phân quyền** (`/settings/role`):
  1. Chọn hoặc tạo mới vai trò (Bác sĩ, Điều dưỡng, Dược sĩ, Thu ngân...).
  2. **Thiết lập phạm vi dữ liệu (Data Scope):**
     - `Toàn bộ cơ sở`: Dành cho Giám đốc, KHTH, IT Admin.
     - `Cơ sở trực thuộc`: Dành cho nhân viên làm việc tại 1 phòng khám/chi nhánh cụ thể.
     - `Khoa phòng phân công`: Bác sĩ chỉ xem và sửa bệnh án thuộc khoa phòng được phân công làm việc trong ngày.
  3. Tích chọn ma trận quyền: Xem, Tạo mới, Chỉnh sửa, Xóa, Phê duyệt/Ký số cho từng phân hệ y tế.
  4. Bấm **"Lưu phân quyền"**.

#### Bước 8.2: Giám sát Nhật ký Kiểm toán Bệnh án (EMR Audit Trail)
- Phòng Kế hoạch Tổng hợp hoặc Thanh tra y tế truy cập màn hình **Nhật ký Bệnh án** (`/settings/logs`):
  - Lọc tra cứu theo: Mã bệnh nhân, Tên bác sĩ, Hành động (`Xem hồ sơ`, `Ký số`, `Xuất dữ liệu`).
  - Hệ thống ghi nhận chi tiết: Ai đã mở bệnh án xem lúc mấy giờ, từ địa chỉ IP nào, nội dung xem là gì.
  - Khi có yêu cầu của cơ quan quản lý, bấm **"Xuất báo cáo CSV"** để xuất dữ liệu kiểm toán phục vụ thanh tra.

#### Bước 8.3: Cấu hình Tích hợp Hạ tầng Y tế (LIS / PACS / BHXH)
- IT Quản trị truy cập màn hình **Cấu hình Tham số Tích hợp** (`/settings/params`):
  - Kiểm tra cổng MLLP máy xét nghiệm (Port 2575, mã hóa UTF-8).
  - Cấu hình PACS Server (AE Title, IP Host, Cổng DICOM 104, URL Web DICOM Viewer).
  - Kiểm tra xác thực Token kết nối Cổng Giám định BHYT theo chuẩn Quyết định 4210/QĐ-BYT.

---

## 3. TỔNG KẾT BẢNG TRÁCH NHIỆM VẬN HÀNH (RACI MATRIX)

| Nghiệp vụ chính | Tiếp đón | Bác sĩ | KTV CLS | Thu ngân | Dược sĩ | Admin / IT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| 1. Đăng ký & Triage Cấp cứu | **R** | I | I | I | I | A |
| 2. Khám & Chẩn đoán ICD-10 | I | **R** | I | I | I | A |
| 3. Thực hiện Xét nghiệm / CĐHA | I | C | **R** | I | I | A |
| 4. Kê đơn & Kiểm tra Tương tác | I | **R** | I | I | C | A |
| 5. Ký số & Khóa bệnh án | I | **R** | I | I | I | A |
| 6. Mở/Đóng ca & Thu viện phí | I | I | I | **R** | I | A |
| 7. Cấp phát & Trừ kho Dược | I | I | I | I | **R** | A |
| 8. Phân quyền & Giám sát Audit | I | I | I | I | I | **R** |

> *Ghi chú chữ cái:* **R** = Chịu trách nhiệm chính thực hiện (Responsible) | **A** = Quản lý & Chịu trách nhiệm giải trình (Accountable) | **C** = Tham vấn chuyên môn (Consulted) | **I** = Nhận thông tin (Informed).

---
*© 2026 – Tài liệu Hướng dẫn Vận hành Nghiệp vụ HIS/EMR – ClinicManagement*
