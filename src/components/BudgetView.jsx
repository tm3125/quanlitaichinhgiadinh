import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  DollarSign,
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';

export const BudgetView = ({
  transactions,
  expenseCategories,
  budgetLimit,
  setBudgetLimit,
  categoryBudgets,
  setCategoryBudgets,
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [isEditingTotalBudget, setIsEditingTotalBudget] = useState(false);
  const [tempBudgetInput, setTempBudgetInput] = useState(String(budgetLimit));

  // Thêm ngân sách cho danh mục
  const [selectedCatId, setSelectedCatId] = useState(expenseCategories[0]?.id || '');
  const [catBudgetAmount, setCatBudgetAmount] = useState('');

  // Bản đồ danh mục
  const catMap = useMemo(() => {
    const map = {};
    expenseCategories.forEach((c) => (map[c.id] = c));
    return map;
  }, [expenseCategories]);

  // Chi tiêu tháng này theo từng danh mục
  const currentMonthSpent = useMemo(() => {
    let totalSpent = 0;
    const spentByCat = {};

    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        if (t.type === 'expense') {
          totalSpent += t.amount;
          spentByCat[t.category] = (spentByCat[t.category] || 0) + t.amount;
        }
      }
    });

    return { totalSpent, spentByCat };
  }, [transactions, currentYear, currentMonth]);

  // Lưu ngân sách tổng
  const handleSaveTotalBudget = () => {
    const val = parseInt(tempBudgetInput.replace(/\D/g, ''), 10);
    if (val && val > 0) {
      setBudgetLimit(val);
    }
    setIsEditingTotalBudget(false);
  };

  // Thêm / Cập nhật ngân sách danh mục
  const handleAddCatBudget = (e) => {
    e.preventDefault();
    const val = parseInt(catBudgetAmount.replace(/\D/g, ''), 10);
    if (!selectedCatId || !val || val <= 0) return;

    setCategoryBudgets((prev) => ({
      ...prev,
      [selectedCatId]: val,
    }));
    setCatBudgetAmount('');
  };

  // Xóa ngân sách danh mục
  const handleDeleteCatBudget = (catId) => {
    setCategoryBudgets((prev) => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });
  };

  const totalSpent = currentMonthSpent.totalSpent;
  const remainingBudget = budgetLimit - totalSpent;
  const percentTotal = Math.min(Math.round((totalSpent / budgetLimit) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h2 className="text-2xl font-black text-slate-800">Kế Hoạch & Hạn Mức Ngân Sách</h2>
        <p className="text-xs text-slate-500">
          Kiểm soát chi tiêu tháng {currentMonth + 1}/{currentYear} để không bị vượt kế hoạch tài chính gia đình
        </p>
      </div>

      {/* Thẻ Ngân Sách Tổng Thể */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
              <Target size={14} /> Hạn mức chi tiêu tổng cả tháng
            </div>
            {isEditingTotalBudget ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={Number(tempBudgetInput.replace(/\D/g, '')).toLocaleString('vi-VN')}
                  onChange={(e) => setTempBudgetInput(e.target.value.replace(/\D/g, ''))}
                  className="text-2xl sm:text-3xl font-black px-3 py-1 border border-indigo-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-slate-800"
                  autoFocus
                />
                <button
                  onClick={handleSaveTotalBudget}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
                  title="Lưu hạn mức"
                >
                  <Save size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-3xl sm:text-4xl font-black text-slate-800">
                  {formatCurrency(budgetLimit)}
                </div>
                <button
                  onClick={() => {
                    setTempBudgetInput(String(budgetLimit));
                    setIsEditingTotalBudget(true);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                  title="Thay đổi hạn mức"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 shrink-0">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Đã tiêu tháng này
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
                {formatCurrency(totalSpent)}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Còn lại khả dụng
              </div>
              <div
                className={`text-xl sm:text-2xl font-black mt-1 ${
                  remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {remainingBudget >= 0 ? formatCurrency(remainingBudget) : `Vượt ${formatCurrency(Math.abs(remainingBudget))}`}
              </div>
            </div>
          </div>
        </div>

        {/* Thanh tiến độ tổng quan */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Tiến độ chi tiêu: {percentTotal}%</span>
            <span>
              {remainingBudget < 0 ? (
                <span className="text-rose-600 flex items-center gap-1 font-bold">
                  <AlertTriangle size={14} /> Đã vượt ngân sách {Math.round((totalSpent / budgetLimit) * 100)}%
                </span>
              ) : percentTotal > 85 ? (
                <span className="text-amber-600 flex items-center gap-1 font-bold">
                  <AlertCircle size={14} /> Cảnh báo: Sắp cạn ngân sách
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <CheckCircle2 size={14} /> Ngân sách an toàn
                </span>
              )}
            </span>
          </div>

          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                remainingBudget < 0
                  ? 'bg-rose-500'
                  : percentTotal > 85
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${percentTotal}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ngân Sách Theo Danh Mục (Category-level Budgets) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Hạn Mức Từng Danh Mục</h3>
            <p className="text-xs text-slate-500">
              Thiết lập trần chi tiêu cho tiền ăn uống, tiền nhà, học phí, mua sắm,...
            </p>
          </div>
        </div>

        {/* Form thêm hạn mức danh mục */}
        <form
          onSubmit={handleAddCatBudget}
          className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="w-full sm:w-1/3">
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:flex-1 relative">
            <input
              type="text"
              placeholder="Nhập hạn mức số tiền (VNĐ)..."
              value={catBudgetAmount ? Number(catBudgetAmount).toLocaleString('vi-VN') : ''}
              onChange={(e) => setCatBudgetAmount(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white outline-none focus:border-indigo-500 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              ₫
            </span>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={15} />
            Đặt hạn mức
          </button>
        </form>

        {/* Danh sách các danh mục đã thiết lập ngân sách */}
        <div className="space-y-4">
          {Object.keys(categoryBudgets).length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Chưa thiết lập hạn mức theo danh mục nào. Hãy chọn danh mục ở trên và đặt hạn mức!
            </div>
          ) : (
            Object.entries(categoryBudgets).map(([catId, limit]) => {
              const cat = catMap[catId] || {
                name: catId,
                icon: 'CircleDot',
                color: '#64748b',
                bgColor: '#f1f5f9',
              };
              const spent = currentMonthSpent.spentByCat[catId] || 0;
              const percent = Math.min(Math.round((spent / limit) * 100), 100);
              const isOver = spent > limit;

              return (
                <div
                  key={catId}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat.bgColor, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={16} />
                      </span>
                      <div>
                        <div className="font-bold text-sm text-slate-800">{cat.name}</div>
                        <div className="text-xs text-slate-400">
                          Đã chi: <span className="font-bold text-slate-700">{formatCurrency(spent)}</span> / {formatCurrency(limit)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                          isOver
                            ? 'bg-rose-100 text-rose-700'
                            : percent > 80
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isOver ? `Vượt hạn mức (${Math.round((spent / limit) * 100)}%)` : `${percent}%`}
                      </span>
                      <button
                        onClick={() => handleDeleteCatBudget(catId)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Xóa hạn mức"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Tiến độ */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetView;
