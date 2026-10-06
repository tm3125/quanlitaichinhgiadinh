import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import '../utils/chartConfig';
import CategoryIcon from './CategoryIcon';
import { formatCurrency, formatRelativeDate } from '../utils/formatters';

export const Dashboard = ({
  transactions,
  expenseCategories,
  incomeCategories,
  members,
  onOpenAddModal,
  onOpenEditModal,
  onNavigateTab,
  budgetLimit = 25000000,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0 - 11

  // Bản đồ tra cứu danh mục và thành viên
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

  // Thống kê toàn thời gian
  const allTimeStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
    });
    const balance = income - expense;
    const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    return { income, expense, balance, savingRate };
  }, [transactions]);

  // Thống kê tháng này
  const currentMonthStats = useMemo(() => {
    let monthIncome = 0;
    let monthExpense = 0;
    const expenseByCat = {};
    const expenseByMember = {};

    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        if (t.type === 'income') {
          monthIncome += t.amount;
        } else if (t.type === 'expense') {
          monthExpense += t.amount;
          expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount;
          expenseByMember[t.member] = (expenseByMember[t.member] || 0) + t.amount;
        }
      }
    });

    const monthBalance = monthIncome - monthExpense;
    return { monthIncome, monthExpense, monthBalance, expenseByCat, expenseByMember };
  }, [transactions, currentYear, currentMonth]);

  // Dữ liệu biểu đồ 6 tháng gần nhất
  const sixMonthsChartData = useMemo(() => {
    const labels = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      labels.push(`T${m + 1}/${y}`);

      let inc = 0;
      let exp = 0;
      transactions.forEach((t) => {
        const td = new Date(t.date);
        if (td.getFullYear() === y && td.getMonth() === m) {
          if (t.type === 'income') inc += t.amount;
          else if (t.type === 'expense') exp += t.amount;
        }
      });
      incomeData.push(inc);
      expenseData.push(exp);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Thu nhập',
          data: incomeData,
          backgroundColor: '#10b981',
          borderRadius: 6,
        },
        {
          label: 'Chi tiêu',
          data: expenseData,
          backgroundColor: '#f43f5e',
          borderRadius: 6,
        },
      ],
    };
  }, [transactions, currentYear, currentMonth]);

  // Dữ liệu biểu đồ tròn chi tiêu theo danh mục tháng này
  const categoryPieData = useMemo(() => {
    const catKeys = Object.keys(currentMonthStats.expenseByCat);
    if (catKeys.length === 0) {
      return null;
    }

    const labels = catKeys.map((k) => catMap[k]?.name || k);
    const data = catKeys.map((k) => currentMonthStats.expenseByCat[k]);
    const backgroundColors = catKeys.map(
      (k, idx) =>
        catMap[k]?.color ||
        ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'][idx % 7]
    );

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [currentMonthStats.expenseByCat, catMap]);

  // Tính phần trăm ngân sách
  const budgetPercentage = Math.min(
    Math.round((currentMonthStats.monthExpense / budgetLimit) * 100),
    100
  );
  const isBudgetWarning = currentMonthStats.monthExpense > budgetLimit * 0.85;
  const isBudgetExceeded = currentMonthStats.monthExpense > budgetLimit;

  // 6 giao dịch gần đây nhất
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Banner chào & Thao tác nhanh */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-xs mb-3">
              <Calendar size={14} />
              Tháng {currentMonth + 1} / {currentYear}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quản Lý Tài Chính Gia Đình
            </h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl">
              Nắm bắt thu chi mỗi ngày, tiết kiệm thông minh và duy trì tài chính gia đình vững vàng.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenAddModal('expense')}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-900/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowDownRight size={18} />
              Thêm khoản chi
            </button>
            <button
              onClick={() => onOpenAddModal('income')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowUpRight size={18} />
              Thêm khoản thu
            </button>
          </div>
        </div>
      </div>

      {/* Thẻ Thống Kê Tổng Quan (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Số Dư Hiện Tại */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Số dư tích lũy
            </span>
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Wallet size={20} />
            </span>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-black ${
                allTimeStats.balance >= 0 ? 'text-indigo-950' : 'text-rose-600'
              }`}
            >
              {formatCurrency(allTimeStats.balance)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              Số dư trong ví gia đình hiện nay
            </div>
          </div>
        </div>

        {/* Tổng Thu Tháng Này */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thu nhập tháng này
            </span>
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600">
              {formatCurrency(currentMonthStats.monthIncome)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-700 font-bold">Tháng {currentMonth + 1}</span>
            </div>
          </div>
        </div>

        {/* Tổng Chi Tháng Này */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chi tiêu tháng này
            </span>
            <span className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown size={20} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">
              {formatCurrency(currentMonthStats.monthExpense)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              Chênh lệch tháng:{' '}
              <span
                className={`font-bold ${
                  currentMonthStats.monthBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {currentMonthStats.monthBalance >= 0 ? '+' : ''}
                {formatCurrency(currentMonthStats.monthBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Tỷ Lệ Tiết Kiệm */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tỷ lệ tiết kiệm
            </span>
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <PiggyBank size={20} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600">
              {allTimeStats.savingRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              {allTimeStats.savingRate >= 20 ? 'Tài chính lành mạnh' : 'Cần tối ưu chi tiêu'}
            </div>
          </div>
        </div>
      </div>

      {/* Tiến độ Hạn mức Ngân Sách Tháng Này */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-base">Hạn mức chi tiêu tháng {currentMonth + 1}</h3>
            {isBudgetExceeded ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                <AlertCircle size={13} /> Đã vượt hạn mức!
              </span>
            ) : isBudgetWarning ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                <AlertCircle size={13} /> Sắp chạm hạn mức ({budgetPercentage}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={13} /> An toàn ({budgetPercentage}%)
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-slate-500">
            Đã chi <span className="font-black text-slate-800">{formatCurrency(currentMonthStats.monthExpense)}</span> / {formatCurrency(budgetLimit)}
          </div>
        </div>

        {/* Thanh tiến trình */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isBudgetExceeded
                ? 'bg-rose-500'
                : isBudgetWarning
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400 font-medium">
          <span>Còn lại an toàn: {formatCurrency(Math.max(0, budgetLimit - currentMonthStats.monthExpense))}</span>
          <span>Hạn mức: {formatCurrency(budgetLimit)}</span>
        </div>
      </div>

      {/* Hàng 2: Biểu đồ Thu Chi 6 tháng & Biểu đồ Cơ cấu chi tiêu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ 6 tháng */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Xu hướng Thu & Chi 6 tháng gần đây</h3>
              <p className="text-xs text-slate-500">So sánh biến động tài chính theo các tháng</p>
            </div>
            <button
              onClick={() => onNavigateTab('statistics')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Chi tiết <ChevronRight size={14} />
            </button>
          </div>
          <div className="h-64 sm:h-72 w-full flex-1">
            <Bar
              data={sixMonthsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { boxWidth: 12, font: { weight: 'bold' } },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                    },
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => {
                        if (value >= 1000000) return value / 1000000 + ' tr';
                        return value;
                      },
                    },
                    grid: { color: '#f1f5f9' },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Biểu đồ Cơ cấu danh mục tháng này */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-base">Cơ cấu chi tiêu tháng {currentMonth + 1}</h3>
            <p className="text-xs text-slate-500">Các nhóm chi phí chiếm phần lớn ngân sách</p>
          </div>
          <div className="h-64 flex-1 flex items-center justify-center">
            {categoryPieData ? (
              <Doughnut
                data={categoryPieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: 10, font: { size: 11 } },
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
                      },
                    },
                  },
                  cutout: '65%',
                }}
              />
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có khoản chi nào trong tháng này.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Giao dịch gần đây & Đóng góp thành viên */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách giao dịch gần nhất */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Giao dịch gần đây</h3>
              <p className="text-xs text-slate-500">Các khoản thu chi mới phát sinh</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Xem sổ giao dịch <ChevronRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Chưa có giao dịch nào. Hãy bấm nút thêm khoản thu/chi ở trên!
              </div>
            ) : (
              recentTransactions.map((t) => {
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
                    className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.bgColor, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {cat.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 truncate">
                          <span>{formatRelativeDate(t.date)}</span>
                          <span>•</span>
                          <span>
                            {mem.avatar} {mem.name}
                          </span>
                          {t.note && (
                            <>
                              <span>•</span>
                              <span className="truncate italic">"{t.note}"</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <div
                        className={`font-black text-sm sm:text-base ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatCurrency(t.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {t.type === 'income' ? 'Khoản thu' : 'Khoản chi'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Thành viên gia đình chi tiêu */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Thành viên chi tiêu</h3>
              <p className="text-xs text-slate-500">Tỷ lệ theo từng thành viên tháng này</p>
            </div>
            <Users size={18} className="text-slate-400" />
          </div>

          <div className="space-y-4 flex-1">
            {members.map((m) => {
              const spent = currentMonthStats.expenseByMember[m.id] || 0;
              const percent =
                currentMonthStats.monthExpense > 0
                  ? Math.round((spent / currentMonthStats.monthExpense) * 100)
                  : 0;

              return (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>{m.avatar}</span>
                      <span>{m.name}</span>
                    </span>
                    <span className="font-semibold text-slate-600">
                      {formatCurrency(spent)} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: m.color || '#3b82f6',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
