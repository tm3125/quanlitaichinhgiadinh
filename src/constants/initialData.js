// Danh mục chi tiêu mặc định
export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'an-uong', name: 'Ăn uống & Đi chợ', icon: 'Utensils', color: '#ef4444', bgColor: '#fee2e2' },
  { id: 'nha-cua', name: 'Tiền nhà & Tiện ích', icon: 'Home', color: '#f97316', bgColor: '#ffedd5' },
  { id: 'dien-nuoc', name: 'Điện, Nước & Internet', icon: 'Zap', color: '#eab308', bgColor: '#fef9c3' },
  { id: 'con-cai', name: 'Con cái & Học phí', icon: 'GraduationCap', color: '#8b5cf6', bgColor: '#ede9fe' },
  { id: 'di-lai', name: 'Xăng xe & Đi lại', icon: 'Car', color: '#06b6d4', bgColor: '#cffafe' },
  { id: 'mua-sam', name: 'Mua sắm & Đồ gia dụng', icon: 'ShoppingBag', color: '#ec4899', bgColor: '#fce7f3' },
  { id: 'y-te', name: 'Y tế & Sức khỏe', icon: 'HeartPulse', color: '#10b981', bgColor: '#d1fae5' },
  { id: 'giai-tri', name: 'Giải trí & Du lịch', icon: 'Palmtree', color: '#6366f1', bgColor: '#e0e7ff' },
  { id: 'hieu-hy', name: 'Hiếu hỷ & Biếu tặng', icon: 'Gift', color: '#d946ef', bgColor: '#fae8ff' },
  { id: 'bao-hiem', name: 'Bảo hiểm & Tiết kiệm', icon: 'ShieldCheck', color: '#14b8a6', bgColor: '#ccfbf1' },
  { id: 'chi-khac', name: 'Chi phí khác', icon: 'MoreHorizontal', color: '#64748b', bgColor: '#f1f5f9' },
];

// Danh mục thu nhập mặc định
export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'luong-chong', name: 'Lương Chồng / Bố', icon: 'Briefcase', color: '#10b981', bgColor: '#d1fae5' },
  { id: 'luong-vo', name: 'Lương Vợ / Mẹ', icon: 'Briefcase', color: '#059669', bgColor: '#a7f3d0' },
  { id: 'thuong', name: 'Tiền thưởng & Hoa hồng', icon: 'Award', color: '#eab308', bgColor: '#fef9c3' },
  { id: 'kinh-doanh', name: 'Kinh doanh & Bán hàng', icon: 'Store', color: '#3b82f6', bgColor: '#dbeafe' },
  { id: 'dau-tu', name: 'Đầu tư & Cổ tức / Lãi', icon: 'TrendingUp', color: '#8b5cf6', bgColor: '#ede9fe' },
  { id: 'bieu-tang', name: 'Được biếu / Tặng / Cho', icon: 'Gift', color: '#ec4899', bgColor: '#fce7f3' },
  { id: 'thu-khac', name: 'Thu nhập khác', icon: 'PlusCircle', color: '#64748b', bgColor: '#f1f5f9' },
];

// Thành viên gia đình mặc định
export const DEFAULT_MEMBERS = [
  { id: 'chung', name: 'Quỹ chung Gia đình', role: 'Chung', color: '#3b82f6', avatar: '👨‍👩‍👧‍👦' },
  { id: 'bo', name: 'Bố (Chồng)', role: 'Bố', color: '#0284c7', avatar: '👨' },
  { id: 'me', name: 'Mẹ (Vợ)', role: 'Mẹ', color: '#ec4899', avatar: '👩' },
  { id: 'con-1', name: 'Bé lớn', role: 'Con', color: '#8b5cf6', avatar: '👦' },
  { id: 'con-2', name: 'Bé nhỏ', role: 'Con', color: '#f59e0b', avatar: '👧' },
];

// Phương thức thanh toán
export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Tiền mặt' },
  { id: 'bank', name: 'Chuyển khoản ngân hàng' },
  { id: 'credit', name: 'Thẻ tín dụng' },
  { id: 'ewallet', name: 'Ví điện tử (MoMo/ZaloPay)' },
];

// Tạo dữ liệu mẫu thực tế cho gia đình Việt Nam
export const generateSampleTransactions = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  // Format date helper: YYYY-MM-DD
  const formatDateStr = (y, m, d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${y}-${pad(m + 1)}-${pad(d)}`;
  };

  const sampleData = [];
  let idCounter = 1;

  // Lặp qua 3 tháng gần nhất để có dữ liệu biểu đồ phong phú
  for (let mOffset = 2; mOffset >= 0; mOffset--) {
    const targetMonthDate = new Date(year, month - mOffset, 1);
    const y = targetMonthDate.getFullYear();
    const m = targetMonthDate.getMonth();

    // 1. Khoản thu cố định đầu tháng (Lương & Thưởng)
    sampleData.push({
      id: `trans-${idCounter++}`,
      type: 'income',
      amount: 25000000,
      category: 'luong-chong',
      member: 'bo',
      date: formatDateStr(y, m, 5),
      note: 'Lương công ty tháng này',
      paymentMethod: 'bank',
    });

    sampleData.push({
      id: `trans-${idCounter++}`,
      type: 'income',
      amount: 18000000,
      category: 'luong-vo',
      member: 'me',
      date: formatDateStr(y, m, 5),
      note: 'Lương văn phòng tháng này',
      paymentMethod: 'bank',
    });

    if (mOffset === 0 || mOffset === 1) {
      sampleData.push({
        id: `trans-${idCounter++}`,
        type: 'income',
        amount: 3500000,
        category: 'kinh-doanh',
        member: 'me',
        date: formatDateStr(y, m, 18),
        note: 'Bán hàng online mỹ phẩm & đồ gia dụng',
        paymentMethod: 'ewallet',
      });
    }

    if (mOffset === 0) {
      sampleData.push({
        id: `trans-${idCounter++}`,
        type: 'income',
        amount: 2000000,
        category: 'dau-tu',
        member: 'bo',
        date: formatDateStr(y, m, 22),
        note: 'Tiền lãi tiết kiệm ngân hàng',
        paymentMethod: 'bank',
      });
    }

    // 2. Chi phí sinh hoạt hàng tháng
    sampleData.push({
      id: `trans-${idCounter++}`,
      type: 'expense',
      amount: 7500000,
      category: 'nha-cua',
      member: 'chung',
      date: formatDateStr(y, m, 6),
      note: 'Tiền thuê căn hộ / Phí quản lý chung cư',
      paymentMethod: 'bank',
    });

    sampleData.push({
      id: `trans-${idCounter++}`,
      type: 'expense',
      amount: 2150000,
      category: 'dien-nuoc',
      member: 'chung',
      date: formatDateStr(y, m, 8),
      note: 'Tiền điện sinh hoạt + Nước + Wifi FPT',
      paymentMethod: 'ewallet',
    });

    sampleData.push({
      id: `trans-${idCounter++}`,
      type: 'expense',
      amount: 4800000,
      category: 'con-cai',
      member: 'me',
      date: formatDateStr(y, m, 10),
      note: 'Học phí bán trú & tiền sữa trường mầm non bé lớn',
      paymentMethod: 'bank',
    });

    sampleData.push({
      id: `trans-${idCounter++}`,
      type: 'expense',
      amount: 2500000,
      category: 'bao-hiem',
      member: 'bo',
      date: formatDateStr(y, m, 12),
      note: 'Bảo hiểm sức khỏe gia đình Manulife',
      paymentMethod: 'bank',
    });

    // 3. Tiền ăn uống & chợ búa trải đều các ngày
    const groceryDays = [2, 4, 7, 9, 11, 14, 16, 19, 21, 23, 26, 28];
    groceryDays.forEach((day, index) => {
      // Chỉ thêm nếu ngày <= ngày hiện tại đối với tháng hiện tại
      if (mOffset === 0 && day > today.getDate()) return;

      sampleData.push({
        id: `trans-${idCounter++}`,
        type: 'expense',
        amount: 250000 + (index % 4) * 90000,
        category: 'an-uong',
        member: index % 2 === 0 ? 'me' : 'bo',
        date: formatDateStr(y, m, day),
        note: index % 3 === 0 ? 'Đi siêu thị WinMart mua thực phẩm cả tuần' : 'Đi chợ sớm mua rau củ, thịt cá tươi',
        paymentMethod: index % 2 === 0 ? 'cash' : 'ewallet',
      });
    });

    // 4. Các chi phí phát sinh khác
    if (mOffset <= 1) {
      sampleData.push({
        id: `trans-${idCounter++}`,
        type: 'expense',
        amount: 1450000,
        category: 'mua-sam',
        member: 'me',
        date: formatDateStr(y, m, Math.min(15, today.getDate())),
        note: 'Mua nồi chiên không dầu & đồ gia dụng',
        paymentMethod: 'credit',
      });

      sampleData.push({
        id: `trans-${idCounter++}`,
        type: 'expense',
        amount: 550000,
        category: 'di-lai',
        member: 'bo',
        date: formatDateStr(y, m, Math.min(12, today.getDate())),
        note: 'Đổ xăng ô tô & bảo dưỡng thay nhớt',
        paymentMethod: 'credit',
      });

      sampleData.push({
        id: `trans-${idCounter++}`,
        type: 'expense',
        amount: 850000,
        category: 'giai-tri',
        member: 'chung',
        date: formatDateStr(y, m, Math.min(20, today.getDate())),
        note: 'Cả nhà đi ăn lẩu cuối tuần & xem phim',
        paymentMethod: 'ewallet',
      });
    }

    if (mOffset === 0 && today.getDate() >= 3) {
      sampleData.push({
        id: `trans-${idCounter++}`,
        type: 'expense',
        amount: 420000,
        category: 'y-te',
        member: 'me',
        date: formatDateStr(y, m, 3),
        note: 'Mua vitamin C & thuốc ho cho con',
        paymentMethod: 'cash',
      });
    }
  }

  // Sắp xếp ngày giảm dần
  return sampleData.sort((a, b) => new Date(b.date) - new Date(a.date));
};
