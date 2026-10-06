// Định dạng tiền tệ VNĐ
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Định dạng số tiền rút gọn (ví dụ 1.5 tr, 250 k)
export const formatCompactCurrency = (amount) => {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1).replace('.0', '') + ' tỷ';
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1).replace('.0', '') + ' tr';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + ' k';
  }
  return formatCurrency(amount);
};

// Định dạng ngày theo chuẩn tiếng Việt: dd/mm/yyyy
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// Định dạng ngày đầy đủ: Thứ Ba, 06/10/2026
export const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${dayName}, ${d}/${m}/${y}`;
};

// Định dạng ngày tương đối (Hôm nay, Hôm qua, ...)
export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '';
  const target = new Date(dateStr);
  const now = new Date();
  
  target.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = today - target;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays === -1) return 'Ngày mai';
  return formatDate(dateStr);
};

// Lấy ngày hôm nay định dạng YYYY-MM-DD
export const getTodayDateString = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Xuất file CSV hỗ trợ Excel tiếng Việt (UTF-8 BOM)
export const exportTransactionsToCSV = (transactions, categoriesMap, membersMap) => {
  const headers = [
    'Mã giao dịch',
    'Loại (Thu/Chi)',
    'Số tiền (VNĐ)',
    'Danh mục',
    'Thành viên',
    'Ngày',
    'Phương thức',
    'Ghi chú',
  ];

  const paymentNameMap = {
    cash: 'Tiền mặt',
    bank: 'Chuyển khoản ngân hàng',
    credit: 'Thẻ tín dụng',
    ewallet: 'Ví điện tử',
  };

  const rows = transactions.map((t) => [
    `"${t.id}"`,
    `"${t.type === 'income' ? 'Khoản thu' : 'Khoản chi'}"`,
    t.amount,
    `"${categoriesMap[t.category]?.name || t.category}"`,
    `"${membersMap[t.member]?.name || t.member}"`,
    `"${formatDate(t.date)}"`,
    `"${paymentNameMap[t.paymentMethod] || t.paymentMethod}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  // UTF-8 BOM \uFEFF giúp Excel mở không bị lỗi font tiếng Việt
  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `so-thu-chi-gia-dinh-${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
