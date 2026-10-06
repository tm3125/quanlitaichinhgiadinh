import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import StatisticsView from './components/StatisticsView';
import BudgetView from './components/BudgetView';
import SettingsView from './components/SettingsView';
import TransactionModal from './components/TransactionModal';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_MEMBERS,
  generateSampleTransactions,
} from './constants/initialData';

const LOCAL_STORAGE_KEYS = {
  TRANSACTIONS: 'family_expense_transactions_v1',
  EXPENSE_CATEGORIES: 'family_expense_categories_v1',
  INCOME_CATEGORIES: 'family_income_categories_v1',
  MEMBERS: 'family_members_v1',
  BUDGET_LIMIT: 'family_budget_limit_v1',
  CATEGORY_BUDGETS: 'family_category_budgets_v1',
};

export function App() {
  // 1. Quản lý State với LocalStorage
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : generateSampleTransactions();
    } catch {
      return generateSampleTransactions();
    }
  });

  const [expenseCategories, setExpenseCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSE_CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSE_CATEGORIES;
    } catch {
      return DEFAULT_EXPENSE_CATEGORIES;
    }
  });

  const [incomeCategories, setIncomeCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INCOME_CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_INCOME_CATEGORIES;
    } catch {
      return DEFAULT_INCOME_CATEGORIES;
    }
  });

  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MEMBERS);
      return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
    } catch {
      return DEFAULT_MEMBERS;
    }
  });

  const [budgetLimit, setBudgetLimit] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BUDGET_LIMIT);
      return saved ? JSON.parse(saved) : 25000000;
    } catch {
      return 25000000;
    }
  });

  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORY_BUDGETS);
      return saved
        ? JSON.parse(saved)
        : {
            'an-uong': 8000000,
            'nha-cua': 8000000,
            'con-cai': 5000000,
            'dien-nuoc': 2500000,
          };
    } catch {
      return {
        'an-uong': 8000000,
        'nha-cua': 8000000,
        'con-cai': 5000000,
        'dien-nuoc': 2500000,
      };
    }
  });

  // Tab hiện tại
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal thêm / sửa giao dịch
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Tự động lưu LocalStorage khi state thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Lỗi lưu giao dịch vào localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BUDGET_LIMIT, JSON.stringify(budgetLimit));
  }, [budgetLimit]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORY_BUDGETS, JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  // Tính tổng số dư ví hiện nay
  const totalBalance = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else if (t.type === 'expense') exp += t.amount;
    });
    return inc - exp;
  }, [transactions]);

  // Hành động với giao dịch
  const handleSaveTransaction = (transactionData) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionData.id ? transactionData : t))
      );
    } else {
      setTransactions((prev) => [transactionData, ...prev]);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleOpenAddModal = (defaultType = 'expense') => {
    setEditingTransaction({
      type: defaultType,
      amount: '',
      category: defaultType === 'expense' ? expenseCategories[0]?.id : incomeCategories[0]?.id,
      member: members[0]?.id || 'chung',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (trans) => {
    setEditingTransaction(trans);
    setIsModalOpen(true);
  };

  // Nạp lại dữ liệu mẫu
  const handleResetSampleData = () => {
    const sample = generateSampleTransactions();
    setTransactions(sample);
    setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
    setMembers(DEFAULT_MEMBERS);
    setBudgetLimit(25000000);
    setCategoryBudgets({
      'an-uong': 8000000,
      'nha-cua': 8000000,
      'con-cai': 5000000,
      'dien-nuoc': 2500000,
    });
  };

  // Xóa trắng dữ liệu
  const handleClearAllData = () => {
    setTransactions([]);
  };

  // Nhập toàn bộ dữ liệu từ JSON
  const handleImportAllData = (backupData) => {
    if (backupData.transactions) setTransactions(backupData.transactions);
    if (backupData.expenseCategories) setExpenseCategories(backupData.expenseCategories);
    if (backupData.incomeCategories) setIncomeCategories(backupData.incomeCategories);
    if (backupData.members) setMembers(backupData.members);
    if (backupData.budgetLimit) setBudgetLimit(backupData.budgetLimit);
    if (backupData.categoryBudgets) setCategoryBudgets(backupData.categoryBudgets);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col pb-20 lg:pb-8 selection:bg-indigo-500 selection:text-white">
      {/* Thanh điều hướng Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        totalBalance={totalBalance}
      />

      {/* Nội dung chính các trang */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            members={members}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
            onNavigateTab={setActiveTab}
            budgetLimit={budgetLimit}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            members={members}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView
            transactions={transactions}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            members={members}
            onOpenEditModal={handleOpenEditModal}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            transactions={transactions}
            expenseCategories={expenseCategories}
            budgetLimit={budgetLimit}
            setBudgetLimit={setBudgetLimit}
            categoryBudgets={categoryBudgets}
            setCategoryBudgets={setCategoryBudgets}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            members={members}
            setMembers={setMembers}
            expenseCategories={expenseCategories}
            setExpenseCategories={setExpenseCategories}
            incomeCategories={incomeCategories}
            setIncomeCategories={setIncomeCategories}
            onResetSampleData={handleResetSampleData}
            onClearAllData={handleClearAllData}
            transactions={transactions}
            budgetLimit={budgetLimit}
            categoryBudgets={categoryBudgets}
            onImportAllData={handleImportAllData}
          />
        )}
      </main>

      {/* Modal Thêm / Sửa Giao Dịch */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        members={members}
      />
    </div>
  );
}

export default App;
