import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ArrowDownRight, ArrowUpRight, Calendar, CreditCard, User, Tag, FileText } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { PAYMENT_METHODS } from '../constants/initialData';
import { formatCurrency, getTodayDateString } from '../utils/formatters';

export const TransactionModal = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  expenseCategories,
  incomeCategories,
  members,
}) => {
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [member, setMember] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Cập nhật khi mở modal hoặc thay đổi transaction đang sửa
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense');
      setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
      setCategory(editingTransaction.category || '');
      setMember(editingTransaction.member || '');
      setDate(editingTransaction.date || getTodayDateString());
      setPaymentMethod(editingTransaction.paymentMethod || 'bank');
      setNote(editingTransaction.note || '');
    } else {
      // Giá trị mặc định khi thêm mới
      setType('expense');
      setAmount('');
      const defaultExpCat = expenseCategories[0]?.id || '';
      setCategory(defaultExpCat);
      setMember(members[0]?.id || 'chung');
      setDate(getTodayDateString());
      setPaymentMethod('bank');
      setNote('');
    }
    setError('');
  }, [editingTransaction, isOpen, expenseCategories, members]);

  // Cập nhật danh mục mặc định khi đổi loại thu/chi nếu chưa chọn danh mục phù hợp
  const handleTypeChange = (newType) => {
    setType(newType);
    const availableCategories = newType === 'expense' ? expenseCategories : incomeCategories;
    if (!availableCategories.some((c) => c.id === category)) {
      setCategory(availableCategories[0]?.id || '');
    }
  };

  // Nút cộng dồn nhanh số tiền
  const addQuickAmount = (val) => {
    const current = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    setAmount(String(current + val));
  };

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }
    if (!category) {
      setError('Vui lòng chọn danh mục thu chi');
      return;
    }
    if (!member) {
      setError('Vui lòng chọn thành viên');
      return;
    }

    const payload = {
      id: editingTransaction ? editingTransaction.id : `trans-${Date.now()}`,
      type,
      amount: numAmount,
      category,
      member,
      date: date || getTodayDateString(),
      paymentMethod,
      note: note.trim(),
    };

    onSave(payload);
    onClose();
  };

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;
  const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span
              className={`p-2 rounded-xl text-white ${
                type === 'expense' ? 'bg-rose-500 shadow-rose-200 shadow-md' : 'bg-emerald-500 shadow-emerald-200 shadow-md'
              }`}
            >
              {type === 'expense' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Chọn Loại Thu / Chi */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight size={16} />
              Khoản Chi (Chi tiêu)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight size={16} />
              Khoản Thu (Thu nhập)
            </button>
          </div>

          {/* Số tiền */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Số tiền (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="0"
                value={amount ? Number(amount).toLocaleString('vi-VN') : ''}
                onChange={handleAmountChange}
                className={`w-full text-2xl sm:text-3xl font-extrabold px-4 py-3 rounded-xl border outline-none transition-all pr-12 ${
                  type === 'expense'
                    ? 'border-rose-200 focus:border-rose-500 text-rose-600 focus:ring-3 focus:ring-rose-100'
                    : 'border-emerald-200 focus:border-emerald-500 text-emerald-600 focus:ring-3 focus:ring-emerald-100'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ₫
              </span>
            </div>

            {/* Nút cộng nhanh */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[50000, 100000, 200000, 500000, 1000000, 2000000, 5000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  +{val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Chọn Danh mục */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Danh mục {type === 'expense' ? 'chi' : 'thu'} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {activeCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200/70 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgColor || '#f1f5f9', color: cat.color || '#475569' }}
                    >
                      <CategoryIcon name={cat.icon} size={15} />
                    </span>
                    <span className="truncate flex-1">{cat.name}</span>
                    {isSelected && <Check size={14} className="text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thành viên gia đình & Ngày giao dịch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Thành viên */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User size={13} />
                Người chi / nhận
              </label>
              <select
                value={member}
                onChange={(e) => setMember(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày giao dịch */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={13} />
                Ngày giao dịch
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <CreditCard size={13} />
              Phương thức thanh toán
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    paymentMethod === pm.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pm.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú mô tả */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText size={13} />
              Ghi chú thêm
            </label>
            <input
              type="text"
              placeholder="VD: Mua sữa cho bé, Tiền điện thoại, Ăn sáng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {editingTransaction ? 'Lưu thay đổi' : 'Thêm giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
