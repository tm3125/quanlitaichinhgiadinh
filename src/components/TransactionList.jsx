import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  User,
  Tag,
  Trash2,
  Edit2,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  exportTransactionsToCSV,
} from '../utils/formatters';

export const TransactionList = ({
  transactions,
  expenseCategories,
  incomeCategories,
  members,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [dateRange, setDateRange] = useState('this-month'); // 'all' | 'today' | '7-days' | 'this-month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Bản đồ danh mục và thành viên
  const catMap = useMemo(() => {
    const map = {};
    [...expenseCategories, ...incomeCategories].forEach((c) => (map[c.id] = c));
    return map;
  }, [expenseCategories, incomeCategories]);

  const memberMap = useMemo(() => {
    const map = {};
    members.forEach((m) => (map[m.id] = m));
    return map;
  }, [members]);

  // Lọc giao dịch
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    return transactions.filter((t) => {
      // 1. Lọc theo Loại (Thu/Chi)
      if (filterType !== 'all' && t.type !== filterType) return false;

      // 2. Lọc theo Danh mục
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;

      // 3. Lọc theo Thành viên
      if (filterMember !== 'all' && t.member !== filterMember) return false;

      // 4. Lọc theo Khoảng thời gian
      if (dateRange === 'today' && t.date !== todayStr) return false;
      if (dateRange === '7-days') {
        const transDate = new Date(t.date);
        const diffDays = (now - transDate) / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 7) return false;
      }
      if (dateRange === 'this-month') {
        const d = new Date(t.date);
        if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) {
          return false;
        }
      }
      if (dateRange === 'custom') {
        if (customStartDate && t.date < customStartDate) return false;
        if (customEndDate && t.date > customEndDate) return false;
      }

      // 5. Tìm kiếm từ khóa (ghi chú, tên danh mục, tên người)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const catName = (catMap[t.category]?.name || '').toLowerCase();
        const memName = (memberMap[t.member]?.name || '').toLowerCase();
        const note = (t.note || '').toLowerCase();
        if (!catName.includes(q) && !memName.includes(q) && !note.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    filterType,
    filterCategory,
    filterMember,
    dateRange,
    customStartDate,
    customEndDate,
    searchTerm,
    catMap,
    memberMap,
  ]);

  // Sắp xếp
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [filteredTransactions, sortBy]);

  // Tổng kết của bộ lọc hiện tại
  const filterSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    sortedTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
    });
    return {
      income,
      expense,
      balance: income - expense,
      count: sortedTransactions.length,
    };
  }, [sortedTransactions]);

  // Phân trang
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(start, start + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  // Reset toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterMember('all');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportTransactionsToCSV(sortedTransactions, catMap, memberMap);
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Các nút hành động chính */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Sổ Giao Dịch Thu Chi</h2>
          <p className="text-xs text-slate-500">
            Theo dõi, tra cứu và quản lý tất cả các khoản thu chi gia đình
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Download size={15} />
            Xuất Excel (.CSV)
          </button>
          <button
            onClick={() => onOpenAddModal('expense')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            <Plus size={16} />
            Ghi chép mới
          </button>
        </div>
      </div>

      {/* Thanh bộ lọc đa năng */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-4">
        {/* Hàng 1: Ô tìm kiếm và Loại Thu/Chi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo ghi chú, danh mục, người chi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Loại giao dịch */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setFilterType('all');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => {
                setFilterType('expense');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Khoản Chi
            </button>
            <button
              onClick={() => {
                setFilterType('income');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Khoản Thu
            </button>
          </div>
        </div>

        {/* Hàng 2: Lọc Danh mục, Thành viên, Thời gian, Sắp xếp */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Danh mục */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Danh mục
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white text-slate-700 cursor-pointer"
            >
              <option value="all">Tất cả danh mục</option>
              {(filterType === 'all' || filterType === 'expense'
                ? expenseCategories
                : []
              ).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Chi)
                </option>
              ))}
              {(filterType === 'all' || filterType === 'income'
                ? incomeCategories
                : []
              ).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Thu)
                </option>
              ))}
            </select>
          </div>

          {/* Thành viên */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Thành viên
            </label>
            <select
              value={filterMember}
              onChange={(e) => {
                setFilterMember(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white text-slate-700 cursor-pointer"
            >
              <option value="all">Tất cả thành viên</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Thời gian */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Thời gian
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white text-slate-700 cursor-pointer"
            >
              <option value="all">Toàn bộ thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="7-days">7 ngày gần nhất</option>
              <option value="this-month">Tháng này</option>
              <option value="custom">Tùy chọn ngày...</option>
            </select>
          </div>

          {/* Sắp xếp */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Sắp xếp
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white text-slate-700 cursor-pointer"
            >
              <option value="date-desc">Mới nhất trước</option>
              <option value="date-asc">Cũ nhất trước</option>
              <option value="amount-desc">Số tiền lớn nhất</option>
              <option value="amount-asc">Số tiền nhỏ nhất</option>
            </select>
          </div>

          {/* Nút đặt lại */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              Đặt lại
            </button>
          </div>
        </div>

        {/* Tùy chọn ngày bắt đầu - kết thúc nếu chọn custom */}
        {dateRange === 'custom' && (
          <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600">Từ ngày:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
            />
            <span className="font-semibold text-slate-600">Đến ngày:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
            />
          </div>
        )}
      </div>

      {/* Dải tổng kết cho bộ lọc hiện tại */}
      <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        <div className="text-slate-600">
          Hiển thị <span className="font-bold text-indigo-700">{filterSummary.count}</span> giao dịch
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <div>
            Tổng thu:{' '}
            <span className="font-black text-emerald-600 text-sm">
              +{formatCurrency(filterSummary.income)}
            </span>
          </div>
          <div>
            Tổng chi:{' '}
            <span className="font-black text-rose-600 text-sm">
              -{formatCurrency(filterSummary.expense)}
            </span>
          </div>
          <div className="border-l border-indigo-200 pl-4">
            Chênh lệch:{' '}
            <span
              className={`font-black text-sm ${
                filterSummary.balance >= 0 ? 'text-indigo-700' : 'text-rose-600'
              }`}
            >
              {filterSummary.balance >= 0 ? '+' : ''}
              {formatCurrency(filterSummary.balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Bảng danh sách giao dịch */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm space-y-2">
            <p>Không tìm thấy giao dịch nào phù hợp với bộ lọc.</p>
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              Bấm vào đây để xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedTransactions.map((t) => {
              const cat = catMap[t.category] || {
                name: t.category,
                icon: 'CircleDot',
                color: '#64748b',
                bgColor: '#f1f5f9',
              };
              const mem = memberMap[t.member] || { name: t.member, avatar: '👤' };

              return (
                <div
                  key={t.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors group"
                >
                  {/* Cột trái: Icon, Danh mục, Ghi chú */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span className="truncate">{cat.name}</span>
                        {t.type === 'income' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold shrink-0">
                            Thu
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold shrink-0">
                            Chi
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                        <span>{formatDate(t.date)}</span>
                        <span>•</span>
                        <span>
                          {mem.avatar} {mem.name}
                        </span>
                        {t.note && (
                          <>
                            <span>•</span>
                            <span className="truncate italic text-slate-500">"{t.note}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: Số tiền & Nút sửa/xóa */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-14 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div
                        className={`text-base font-black ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatCurrency(t.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {t.paymentMethod === 'cash'
                          ? 'Tiền mặt'
                          : t.paymentMethod === 'credit'
                          ? 'Thẻ tín dụng'
                          : t.paymentMethod === 'ewallet'
                          ? 'Ví điện tử'
                          : 'Chuyển khoản'}
                      </div>
                    </div>

                    {/* Nút Sửa & Xóa */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onOpenEditModal(t)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa giao dịch"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa giao dịch"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
            <span className="text-slate-500">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-50"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
