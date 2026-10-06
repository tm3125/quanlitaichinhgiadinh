import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart2,
  Target,
  Settings,
  Plus,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const Navbar = ({ activeTab, setActiveTab, onOpenAddModal, totalBalance }) => {
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Sổ giao dịch', icon: ReceiptText },
    { id: 'statistics', label: 'Thống kê (Ngày/Tháng/Năm)', icon: BarChart2 },
    { id: 'budget', label: 'Hạn mức ngân sách', icon: Target },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Tên ứng dụng */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Wallet size={22} />
            </div>
            <div>
              <div className="font-black text-base sm:text-lg text-slate-800 leading-tight">
                Sổ Thu Chi Gia Đình
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                Quản lý tài chính thông minh
              </div>
            </div>
          </div>

          {/* Menu Điều Hướng Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Số Dư Nhanh & Nút Thêm Giao Dịch */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Số dư hiện tại
              </div>
              <div
                className={`text-sm sm:text-base font-black ${
                  totalBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(totalBalance)}
              </div>
            </div>

            <button
              onClick={() => onOpenAddModal('expense')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all cursor-pointer"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Ghi Chép Mới</span>
              <span className="sm:hidden">Ghi Chép</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thanh Điều Hướng Dưới Cùng Dành Cho Điện Thoại (Mobile Navigation Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                <span className="truncate max-w-[65px]">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
