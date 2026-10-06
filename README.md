# Ứng Dụng Quản Lý Thu Chi Gia Đình 👨‍👩‍👧‍👦💰

Ứng dụng web hiện đại, mượt mà, đầy đủ tính năng giúp gia đình quản lý chi tiêu và thu nhập một cách khoa học, trực quan và tiện lợi.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. 💵 Quản Lý Khoản Thu & Khoản Chi
- **Ghi chép giao dịch dễ dàng:**
  - Chuyển đổi nhanh giữa **Khoản Thu** (màu xanh lá) và **Khoản Chi** (màu đỏ).
  - Nhập số tiền có định dạng hàng nghìn tiếng Việt tự động (`150.000 ₫`, `2.500.000 ₫`...).
  - Nút cộng nhanh số tiền: `+50k`, `+100k`, `+200k`, `+500k`, `+1tr`, `+2tr`, `+5tr`.
  - Phân loại theo **Danh mục** trực quan với biểu tượng màu sắc riêng.
  - Phân công **Thành viên gia đình** thực hiện (Bố, Mẹ, Con cái, Quỹ chung...).
  - Chọn ngày giao dịch và hình thức thanh toán (Tiền mặt, Chuyển khoản, Thẻ tín dụng, Ví điện tử).
  - Ghi chú chi tiết cho từng khoản tiền.
- **Sửa & Xóa giao dịch:** Thao tác chỉnh sửa hoặc xóa nhanh chóng ngay trên danh sách.

### 2. 📊 Thống Kê Chi Tiêu Tổng Hợp Toàn Diện (Ngày / Tháng / Năm)
- **Thống kê theo Ngày:**
  - Chọn bất kỳ ngày nào trong lịch hoặc bấm lùi/tiến ngày.
  - Tổng thu trong ngày, Tổng chi trong ngày, Dòng tiền chênh lệch.
  - Danh sách chi tiết từng giao dịch trong ngày đó.
  - Biểu đồ đường (Line Chart) theo dõi biến động chi tiêu qua 14 ngày.
- **Thống kê theo Tháng:**
  - Chọn Tháng và Năm bất kỳ.
  - Tổng thu cả tháng, Tổng chi cả tháng, Số dư thặng dư và Mức chi trung bình mỗi ngày.
  - Biểu đồ cột (Bar Chart) chi tiết thu - chi từng ngày trong tháng.
  - Biểu đồ tròn (Doughnut Chart) tỷ trọng cơ cấu danh mục chi tiêu lớn nhất.
  - Top 5 khoản chi tiêu nặng đô nhất trong tháng.
- **Thống kê theo Năm:**
  - Xem báo cáo tài chính cả năm: Tổng thu năm, Tổng chi năm, Tích lũy ròng, Tỷ lệ tiết kiệm (%).
  - Biểu đồ cột so sánh thu - chi 12 tháng trong năm.
  - Bảng đối soát chi tiết dòng tiền từng tháng (kèm đánh giá trạng thái tiết kiệm/âm ví).

### 3. 🎯 Hạn Mức & Kế Hoạch Ngân Sách Gia Đình
- **Hạn mức tổng tháng:** Đặt trần chi tiêu cho cả gia đình trong tháng.
- **Hạn mức theo từng danh mục:** Đặt giới hạn chi tiêu riêng cho Ăn uống, Tiền nhà, Con cái học phí, Mua sắm...
- **Hệ thống cảnh báo thông minh:**
  - Xanh lá: Chi tiêu an toàn (< 70%).
  - Vàng: Cảnh báo sắp cạn ngân sách (> 85%).
  - Đỏ: Cảnh báo đã vượt ngân sách chi tiêu!

### 4. 👨‍👩‍👧‍👦 Quản Lý Thành Viên & Danh Mục Linh Hoạt
- Thêm thành viên mới trong gia đình với tên, vai trò và biểu tượng cảm xúc (Bố, Mẹ, Con trai, Con gái, Ông, Bà...).
- Thêm/xóa danh mục thu và chi theo thói quen sinh hoạt riêng của từng gia đình.

### 5. 💾 Lưu Trữ & Sao Lưu Dữ Liệu An Toàn
- Tự động lưu mọi dữ liệu vào **LocalStorage** trên trình duyệt của bạn (không sợ mất khi F5 hoặc tắt máy).
- **Xuất file Excel (.CSV):** Định dạng chuẩn UTF-8 BOM, mở bằng Microsoft Excel tiếng Việt không lo lỗi font.
- **Sao lưu & Khôi phục (.JSON):** Tải file dự phòng về máy tính hoặc chuyển dữ liệu sang máy tính khác dễ dàng.
- **Nạp dữ liệu mẫu:** Tích hợp sẵn bộ dữ liệu mẫu thực tế của gia đình Việt Nam để trải nghiệm ngay lập tức.

---

## 🚀 Hướng Dẫn Khởi Động Ứng Dụng

### Cách 1: Khởi động nhanh (Khuyên dùng)
- Nhấp đúp chuột vào file **`chay-ung-dung.bat`** trong thư mục này. Trình duyệt web sẽ tự động mở ứng dụng tại địa chỉ `http://localhost:5173`.

### Cách 2: Chạy bằng Terminal / PowerShell
Mở PowerShell tại thư mục `c:\Users\phthi\kho antigravity` và gõ:
```bash
npm run dev
```
Sau đó mở trình duyệt và truy cập: `http://localhost:5173`

---

## 🛠 Công Nghệ Sử Dụng
- **React 19** & **Vite 8**
- **Tailwind CSS v4** cho giao diện hiện đại, responsive hoàn hảo trên máy tính và điện thoại.
- **Chart.js** & **react-chartjs-2** cho các biểu đồ tài chính trực quan.
- **Lucide React** cho bộ biểu tượng đẹp mắt.
