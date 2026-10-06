import React, { useState, useMemo } from 'react';
import {
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Users,
  Award,
  Layers,
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import '../utils/chartConfig';
import CategoryIcon from './CategoryIcon';
import {
  formatCurrency,
  formatDate,
  formatFullDate,
  getTodayDateString,
} from '../utils/formatters';

export const StatisticsView = ({
  transactions,
  expenseCategories,
  incomeCategories,
  members,
  onOpenEditModal,
}) => {
  const [viewMode, setViewMode] = useState('month'); // 'day' | 'month' | 'year'

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

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

  // Danh sách các năm có trong dữ liệu
  const availableYears = useMemo(() => {
    const years = new Set([today.getFullYear()]);
    transactions.forEach((t) => {
      const y = new Date(t.date).getFullYear();
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, today]);

  // ==========================================
  // 1. THỐNG KÊ THEO NGÀY (DAILY)
  // ==========================================
  const dailyStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const dailyTransactions = [];

    transactions.forEach((t) => {
      if (t.date === selectedDate) {
        dailyTransactions.push(t);
        if (t.type === 'income') income += t.amount;
        else if (t.type === 'expense') expense += t.amount;
      }
    });

    // 14 ngày quanh ngày được chọn để vẽ biểu đồ xu hướng
    const trendLabels = [];
    const trendData = [];
    const baseDate = new Date(selectedDate);

    for (let i = 6; i >= -7; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${dayStr}`;

      trendLabels.push(`${dayStr}/${m}`);

      let dayExp = 0;
      transactions.forEach((t) => {
        if (t.date === dateKey && t.type === 'expense') {
          dayExp += t.amount;
        }
      });
      trendData.push(dayExp);
    }

    return {
      income,
      expense,
      balance: income - expense,
      dailyTransactions,
      trendChartData: {
        labels: trendLabels,
        datasets: [
          {
            label: 'Chi tiêu (VNĐ)',
            data: trendData,
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#f43f5e',
            pointRadius: 4,
          },
        ],
      },
    };
  }, [transactions, selectedDate]);

  // Điều hướng ngày: hôm trước / hôm sau
  const shiftDay = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  // ==========================================
  // 2. THỐNG KÊ THEO THÁNG (MONTHLY)
  // ==========================================
  const monthlyStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const expenseByCat = {};
    const expenseByMember = {};
    const monthTransactions = [];

    // Số ngày trong tháng đã chọn
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dailyExpenses = new Array(daysInMonth).fill(0);
    const dailyIncomes = new Array(daysInMonth).fill(0);

    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
        monthTransactions.push(t);
        const dayIdx = d.getDate() - 1;

        if (t.type === 'income') {
          income += t.amount;
          if (dayIdx >= 0 && dayIdx < daysInMonth) {
            dailyIncomes[dayIdx] += t.amount;
          }
        } else if (t.type === 'expense') {
          expense += t.amount;
          if (dayIdx >= 0 && dayIdx < daysInMonth) {
            dailyExpenses[dayIdx] += t.amount;
          }
          expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount;
          expenseByMember[t.member] = (expenseByMember[t.member] || 0) + t.amount;
        }
      }
    });

    const balance = income - expense;
    const avgDailyExpense = Math.round(expense / (daysInMonth || 1));

    // Biểu đồ từng ngày trong tháng
    const monthDayLabels = Array.from({ length: daysInMonth }, (_, i) => `N${i + 1}`);
    const monthChartData = {
      labels: monthDayLabels,
      datasets: [
        {
          label: 'Chi tiêu',
          data: dailyExpenses,
          backgroundColor: '#f43f5e',
          borderRadius: 4,
        },
        {
          label: 'Thu nhập',
          data: dailyIncomes,
          backgroundColor: '#10b981',
          borderRadius: 4,
        },
      ],
    };

    // Biểu đồ tròn danh mục chi tiêu tháng
    const catKeys = Object.keys(expenseByCat).sort((a, b) => expenseByCat[b] - expenseByCat[a]);
    const catLabels = catKeys.map((k) => catMap[k]?.name || k);
    const catData = catKeys.map((k) => expenseByCat[k]);
    const catColors = catKeys.map(
      (k, idx) =>
        catMap[k]?.color ||
        ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#64748b'][
          idx % 8
        ]
    );

    const categoryPieData =
      catKeys.length > 0
        ? {
            labels: catLabels,
            datasets: [
              {
                data: catData,
                backgroundColor: catColors,
                borderWidth: 2,
                borderColor: '#ffffff',
              },
            ],
          }
        : null;

    // Top 5 khoản chi lớn nhất tháng
    const topExpenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      income,
      expense,
      balance,
      avgDailyExpense,
      monthChartData,
      categoryPieData,
      expenseByCat,
      expenseByMember,
      topExpenses,
      transactionCount: monthTransactions.length,
    };
  }, [transactions, selectedYear, selectedMonth, catMap]);

  // Điều hướng tháng: tháng trước / tháng sau
  const shiftMonth = (delta) => {
    let newM = selectedMonth + delta;
    let newY = selectedYear;
    if (newM < 0) {
      newM = 11;
      newY -= 1;
    } else if (newM > 11) {
      newM = 0;
      newY += 1;
    }
    setSelectedMonth(newM);
    setSelectedYear(newY);
  };

  // ==========================================
  // 3. THỐNG KÊ THEO NĂM (YEARLY)
  // ==========================================
  const yearlyStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const monthlySummary = Array.from({ length: 12 }, () => ({
      income: 0,
      expense: 0,
      balance: 0,
    }));
    const expenseByCat = {};
    const expenseByMember = {};

    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === selectedYear) {
        const m = d.getMonth();
        if (t.type === 'income') {
          totalIncome += t.amount;
          monthlySummary[m].income += t.amount;
        } else if (t.type === 'expense') {
          totalExpense += t.amount;
          monthlySummary[m].expense += t.amount;
          expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount;
          expenseByMember[t.member] = (expenseByMember[t.member] || 0) + t.amount;
        }
      }
    });

    monthlySummary.forEach((m) => {
      m.balance = m.income - m.expense;
    });

    const yearlyBalance = totalIncome - totalExpense;
    const savingRate = totalIncome > 0 ? Math.round((yearlyBalance / totalIncome) * 100) : 0;
    const avgMonthlyExpense = Math.round(totalExpense / 12);

    const yearChartData = {
      labels: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
      ],
      datasets: [
        {
          label: 'Thu nhập',
          data: monthlySummary.map((m) => m.income),
          backgroundColor: '#10b981',
          borderRadius: 6,
        },
        {
          label: 'Chi tiêu',
          data: monthlySummary.map((m) => m.expense),
          backgroundColor: '#f43f5e',
          borderRadius: 6,
        },
      ],
    };

    return {
      totalIncome,
      totalExpense,
      yearlyBalance,
      savingRate,
      avgMonthlyExpense,
      monthlySummary,
      yearChartData,
      expenseByCat,
      expenseByMember,
    };
  }, [transactions, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Thanh chuyển chế độ thống kê: NGÀY - THÁNG - NĂM */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Nút Tab Chế Độ */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setViewMode('day')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
              viewMode === 'day'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo Ngày
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
              viewMode === 'month'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo Tháng
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
              viewMode === 'year'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo Năm
          </button>
        </div>

        {/* Bộ điều hướng thời gian tương ứng */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {viewMode === 'day' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftDay(-1)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
                title="Ngày trước"
              >
                <ChevronLeft size={18} />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 bg-white"
              />
              <button
                onClick={() => shiftDay(1)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
                title="Ngày tiếp theo"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {viewMode === 'month' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftMonth(-1)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft size={18} />
              </button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 bg-white cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 bg-white cursor-pointer"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
              <button
                onClick={() => shiftMonth(1)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {viewMode === 'year' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Chọn năm:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-1.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 bg-white cursor-pointer"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. NỘI DUNG: THỐNG KÊ THEO NGÀY                           */}
      {/* ======================================================== */}
      {viewMode === 'day' && (
        <div className="space-y-6">
          {/* Thẻ KPI Ngày */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Thu nhập trong ngày
              </span>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                {formatCurrency(dailyStats.income)}
              </div>
              <div className="text-xs text-slate-400 mt-1">{formatFullDate(selectedDate)}</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chi tiêu trong ngày
              </span>
              <div className="mt-2 text-2xl font-black text-rose-600">
                {formatCurrency(dailyStats.expense)}
              </div>
              <div className="text-xs text-slate-400 mt-1">{formatFullDate(selectedDate)}</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chênh lệch thu - chi
              </span>
              <div
                className={`mt-2 text-2xl font-black ${
                  dailyStats.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'
                }`}
              >
                {dailyStats.balance >= 0 ? '+' : ''}
                {formatCurrency(dailyStats.balance)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Dòng tiền trong ngày</div>
            </div>
          </div>

          {/* Biểu đồ biến động chi tiêu các ngày xung quanh */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <h3 className="font-bold text-slate-800 text-base mb-1">
              Biến động chi tiêu 14 ngày quanh mốc {formatDate(selectedDate)}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Theo dõi chi tiêu hàng ngày để kiểm soát thói quen mua sắm
            </p>
            <div className="h-64">
              <Line
                data={dailyStats.trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `Chi: ${formatCurrency(ctx.raw)}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: (v) => (v >= 1000000 ? v / 1000000 + ' tr' : v),
                      },
                      grid: { color: '#f1f5f9' },
                    },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>

          {/* Danh sách giao dịch chi tiết trong ngày được chọn */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center justify-between">
              <span>Các giao dịch ngày {formatDate(selectedDate)}</span>
              <span className="text-xs font-normal text-slate-500">
                ({dailyStats.dailyTransactions.length} giao dịch)
              </span>
            </h3>

            {dailyStats.dailyTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Không có giao dịch nào trong ngày này.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dailyStats.dailyTransactions.map((t) => {
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
                      onClick={() => onOpenEditModal(t)}
                      className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cat.bgColor, color: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={18} />
                        </span>
                        <div>
                          <div className="font-bold text-sm text-slate-800">{cat.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>
                              {mem.avatar} {mem.name}
                            </span>
                            {t.note && <span>• {t.note}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-black text-sm ${
                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {t.paymentMethod === 'cash' ? 'Tiền mặt' : 'Ngân hàng / Ví'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. NỘI DUNG: THỐNG KÊ THEO THÁNG                          */}
      {/* ======================================================== */}
      {viewMode === 'month' && (
        <div className="space-y-6">
          {/* Thẻ KPI Tháng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tổng thu tháng {selectedMonth + 1}/{selectedYear}
              </span>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                {formatCurrency(monthlyStats.income)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Nguồn thu cả gia đình</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tổng chi tháng {selectedMonth + 1}/{selectedYear}
              </span>
              <div className="mt-2 text-2xl font-black text-rose-600">
                {formatCurrency(monthlyStats.expense)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Toàn bộ chi phí sinh hoạt</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Số dư thặng dư tháng
              </span>
              <div
                className={`mt-2 text-2xl font-black ${
                  monthlyStats.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'
                }`}
              >
                {monthlyStats.balance >= 0 ? '+' : ''}
                {formatCurrency(monthlyStats.balance)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Tiền tích lũy tháng này</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Trung bình chi / ngày
              </span>
              <div className="mt-2 text-2xl font-black text-slate-800">
                {formatCurrency(monthlyStats.avgDailyExpense)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Mỗi ngày cả nhà tiêu</div>
            </div>
          </div>

          {/* Biểu đồ chi tiêu từng ngày trong tháng */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <h3 className="font-bold text-slate-800 text-base mb-1">
              Chi tiết Thu & Chi theo từng ngày trong tháng {selectedMonth + 1}/{selectedYear}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Xem ngày nào phát sinh nhiều chi phí nhất để cân đối
            </p>
            <div className="h-72">
              <Bar
                data={monthlyStats.monthChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: (v) => (v >= 1000000 ? v / 1000000 + ' tr' : v),
                      },
                      grid: { color: '#f1f5f9' },
                    },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>

          {/* Cơ cấu danh mục & Top khoản chi tháng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cơ cấu danh mục chi tiêu */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col">
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Phân bổ chi tiêu theo danh mục
              </h3>
              <p className="text-xs text-slate-500 mb-4">Tỷ trọng các nhóm chi tiêu trong tháng</p>
              <div className="h-64 flex-1 flex items-center justify-center">
                {monthlyStats.categoryPieData ? (
                  <Doughnut
                    data={monthlyStats.categoryPieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
                          },
                        },
                      },
                      cutout: '60%',
                    }}
                  />
                ) : (
                  <div className="text-slate-400 text-xs">Chưa có chi tiêu tháng này</div>
                )}
              </div>
            </div>

            {/* Top 5 khoản chi lớn nhất */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Top khoản chi lớn nhất tháng
              </h3>
              <p className="text-xs text-slate-500 mb-4">Những khoản chi tiêu nặng đô nhất</p>
              <div className="space-y-3">
                {monthlyStats.topExpenses.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    Chưa có khoản chi nào.
                  </div>
                ) : (
                  monthlyStats.topExpenses.map((t, idx) => {
                    const cat = catMap[t.category] || {
                      name: t.category,
                      icon: 'CircleDot',
                      color: '#64748b',
                    };
                    return (
                      <div
                        key={t.id}
                        className="p-3 bg-slate-50 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-slate-800">{cat.name}</div>
                            <div className="text-xs text-slate-400">
                              {formatDate(t.date)} {t.note ? `• ${t.note}` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="font-black text-rose-600 text-sm">
                          {formatCurrency(t.amount)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. NỘI DUNG: THỐNG KÊ THEO NĂM                           */}
      {/* ======================================================== */}
      {viewMode === 'year' && (
        <div className="space-y-6">
          {/* Thẻ KPI Năm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tổng thu nhập năm {selectedYear}
              </span>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                {formatCurrency(yearlyStats.totalIncome)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Cả năm gia đình thu về</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tổng chi tiêu năm {selectedYear}
              </span>
              <div className="mt-2 text-2xl font-black text-rose-600">
                {formatCurrency(yearlyStats.totalExpense)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Tổng tiền đã tiêu cả năm</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tích lũy ròng cả năm
              </span>
              <div
                className={`mt-2 text-2xl font-black ${
                  yearlyStats.yearlyBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'
                }`}
              >
                {yearlyStats.yearlyBalance >= 0 ? '+' : ''}
                {formatCurrency(yearlyStats.yearlyBalance)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Tỷ lệ tiết kiệm: {yearlyStats.savingRate}%
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Trung bình chi / tháng
              </span>
              <div className="mt-2 text-2xl font-black text-slate-800">
                {formatCurrency(yearlyStats.avgMonthlyExpense)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Mỗi tháng trung bình chi</div>
            </div>
          </div>

          {/* Biểu đồ cột 12 tháng trong năm */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <h3 className="font-bold text-slate-800 text-base mb-1">
              Báo cáo Thu nhập & Chi tiêu 12 tháng năm {selectedYear}
            </h3>
            <p className="text-xs text-slate-500 mb-4">So sánh trực quan dòng tiền theo từng tháng</p>
            <div className="h-80">
              <Bar
                data={yearlyStats.yearChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: (v) => (v >= 1000000 ? v / 1000000 + ' tr' : v),
                      },
                      grid: { color: '#f1f5f9' },
                    },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>

          {/* Bảng chi tiết 12 tháng */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs overflow-x-auto">
            <h3 className="font-bold text-slate-800 text-base mb-3">
              Bảng đối soát chi tiết từng tháng năm {selectedYear}
            </h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                  <th className="py-3 px-3">Tháng</th>
                  <th className="py-3 px-3 text-right">Tổng Thu (VNĐ)</th>
                  <th className="py-3 px-3 text-right">Tổng Chi (VNĐ)</th>
                  <th className="py-3 px-3 text-right">Thặng Dư / Tiết Kiệm</th>
                  <th className="py-3 px-3 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearlyStats.monthlySummary.map((m, idx) => {
                  const isPositive = m.balance >= 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800">Tháng {idx + 1}</td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                        {formatCurrency(m.income)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-rose-600">
                        {formatCurrency(m.expense)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          isPositive ? 'text-indigo-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(m.balance)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {m.income === 0 && m.expense === 0 ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Không có dữ liệu
                          </span>
                        ) : isPositive ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                            Tiết kiệm tốt
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                            Bị âm ví
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsView;
