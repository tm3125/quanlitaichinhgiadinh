import React, { useState } from 'react';
import {
  Users,
  Tag,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Plus,
  ShieldCheck,
  Check,
  AlertTriangle,
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export const SettingsView = ({
  members,
  setMembers,
  expenseCategories,
  setExpenseCategories,
  incomeCategories,
  setIncomeCategories,
  onResetSampleData,
  onClearAllData,
  transactions,
  budgetLimit,
  categoryBudgets,
  onImportAllData,
}) => {
  // Thêm thành viên mới
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Khác');
  const [newMemberAvatar, setNewMemberAvatar] = useState('🧑');

  // Thêm danh mục mới
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  const [notification, setNotification] = useState('');

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Thêm thành viên
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMem = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      avatar: newMemberAvatar || '🧑',
      color: '#3b82f6',
    };

    setMembers([...members, newMem]);
    setNewMemberName('');
    showNotify('Đã thêm thành viên gia đình mới thành công!');
  };

  // Xóa thành viên
  const handleDeleteMember = (id) => {
    if (members.length <= 1) {
      alert('Cần giữ lại ít nhất 1 thành viên hoặc Quỹ chung!');
      return;
    }
    if (confirm('Bạn có chắc muốn xóa thành viên này?')) {
      setMembers(members.filter((m) => m.id !== id));
      showNotify('Đã xóa thành viên');
    }
  };

  // Thêm danh mục
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      icon: newCatIcon,
      color: newCatColor,
      bgColor: '#eff6ff',
    };

    if (newCatType === 'expense') {
      setExpenseCategories([...expenseCategories, newCat]);
    } else {
      setIncomeCategories([...incomeCategories, newCat]);
    }
    setNewCatName('');
    showNotify('Đã thêm danh mục mới thành công!');
  };

  // Xóa danh mục
  const handleDeleteCategory = (id, type) => {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      if (type === 'expense') {
        setExpenseCategories(expenseCategories.filter((c) => c.id !== id));
      } else {
        setIncomeCategories(incomeCategories.filter((c) => c.id !== id));
      }
      showNotify('Đã xóa danh mục');
    }
  };

  // Xuất file backup JSON
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      expenseCategories,
      incomeCategories,
      members,
      budgetLimit,
      categoryBudgets,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sotietkiem-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotify('Đã tải xuống file sao lưu JSON an toàn!');
  };

  // Nhập từ file backup JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          onImportAllData(parsed);
          showNotify('Khôi phục dữ liệu từ file JSON thành công!');
        } else {
          alert('File JSON không đúng định dạng sao lưu của ứng dụng!');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h2 className="text-2xl font-black text-slate-800">Cài Đặt & Dữ Liệu</h2>
        <p className="text-xs text-slate-500">
          Quản lý thành viên, danh mục thu chi và sao lưu dữ liệu an toàn
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl flex items-center gap-2">
          <Check size={16} /> {notification}
        </div>
      )}

      {/* Quản lý Thành Viên Gia Đình */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users size={18} />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Thành Viên Trong Gia Đình</h3>
            <p className="text-xs text-slate-400">Danh sách người thực hiện thu/chi trong nhà</p>
          </div>
        </div>

        {/* Danh sách thành viên */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.avatar}</span>
                <div>
                  <div className="font-bold text-sm text-slate-800">{m.name}</div>
                  <div className="text-[11px] text-slate-400">Vai trò: {m.role}</div>
                </div>
              </div>
              {m.id !== 'chung' && (
                <button
                  onClick={() => handleDeleteMember(m.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Xóa thành viên"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Form thêm thành viên */}
        <form
          onSubmit={handleAddMember}
          className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-3"
        >
          <div className="w-16">
            <select
              value={newMemberAvatar}
              onChange={(e) => setNewMemberAvatar(e.target.value)}
              className="w-full px-2 py-2 border border-slate-200 rounded-xl bg-white text-center text-lg"
            >
              <option value="👨">👨 Bố</option>
              <option value="👩">👩 Mẹ</option>
              <option value="👦">👦 Con trai</option>
              <option value="👧">👧 Con gái</option>
              <option value="👴">👴 Ông</option>
              <option value="👵">👵 Bà</option>
              <option value="🧑">🧑 Khác</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Tên thành viên (VD: Bố, Mẹ, Bé Bo...)"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="flex-1 min-w-[150px] px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-indigo-500"
          />
          <select
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
          >
            <option value="Bố">Bố / Chồng</option>
            <option value="Mẹ">Mẹ / Vợ</option>
            <option value="Con">Con cái</option>
            <option value="Khác">Khác</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Thêm thành viên
          </button>
        </form>
      </div>

      {/* Quản lý Danh mục Thu & Chi */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Tag size={18} />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Danh Mục Thu Chi Gia Đình</h3>
            <p className="text-xs text-slate-400">Tùy biến các loại khoản thu và khoản chi theo ý bạn</p>
          </div>
        </div>

        {/* Danh sách danh mục chi tiêu */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Danh mục Chi tiêu ({expenseCategories.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {expenseCategories.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: c.bgColor || '#fee2e2', color: c.color || '#ef4444' }}
                  >
                    <CategoryIcon name={c.icon} size={14} />
                  </span>
                  <span className="font-semibold text-slate-700 truncate">{c.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(c.id, 'expense')}
                  className="p-1 text-slate-300 hover:text-rose-500 rounded-md cursor-pointer shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danh sách danh mục thu nhập */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Danh mục Thu nhập ({incomeCategories.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {incomeCategories.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: c.bgColor || '#d1fae5', color: c.color || '#10b981' }}
                  >
                    <CategoryIcon name={c.icon} size={14} />
                  </span>
                  <span className="font-semibold text-slate-700 truncate">{c.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(c.id, 'income')}
                  className="p-1 text-slate-300 hover:text-rose-500 rounded-md cursor-pointer shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form thêm danh mục */}
        <form
          onSubmit={handleAddCategory}
          className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-3 pt-3"
        >
          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold"
          >
            <option value="expense">Khoản Chi</option>
            <option value="income">Khoản Thu</option>
          </select>
          <input
            type="text"
            placeholder="Tên danh mục (VD: Thú cưng, Thể thao...)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 min-w-[150px] px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Thêm danh mục
          </button>
        </form>
      </div>

      {/* Sao Lưu & Phục Hồi Dữ Liệu */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Sao Lưu & Quản Lý Dữ Liệu</h3>
            <p className="text-xs text-slate-400">
              Dữ liệu được lưu trực tiếp trên trình duyệt của bạn (LocalStorage)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tải bản sao lưu */}
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
          >
            <Download size={24} className="text-indigo-600 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-bold text-xs text-slate-800">Tải file sao lưu (JSON)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Lưu trữ dự phòng trên máy tính</div>
            </div>
          </button>

          {/* Khôi phục file */}
          <label className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group">
            <Upload size={24} className="text-emerald-600 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-bold text-xs text-slate-800">Khôi phục từ file JSON</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Nhập lại dữ liệu đã sao lưu</div>
            </div>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          {/* Nạp lại dữ liệu mẫu */}
          <button
            onClick={() => {
              if (confirm('Bạn muốn nạp lại dữ liệu mẫu gia đình? Dữ liệu hiện tại sẽ được cập nhật.')) {
                onResetSampleData();
                showNotify('Đã nạp lại dữ liệu mẫu thành công!');
              }
            }}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
          >
            <RotateCcw size={24} className="text-amber-600 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-bold text-xs text-slate-800">Nạp lại dữ liệu mẫu</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Trải nghiệm biểu đồ đầy đủ</div>
            </div>
          </button>

          {/* Xóa toàn bộ dữ liệu */}
          <button
            onClick={() => {
              if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ giao dịch để làm mới từ đầu?')) {
                onClearAllData();
                showNotify('Đã xóa toàn bộ giao dịch');
              }
            }}
            className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
          >
            <Trash2 size={24} className="text-rose-600 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-bold text-xs text-rose-700">Xóa trắng sổ giao dịch</div>
              <div className="text-[11px] text-rose-400 mt-0.5">Bắt đầu sổ chi tiêu mới tinh</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
