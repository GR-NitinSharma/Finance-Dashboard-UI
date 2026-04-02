import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Transaction, Role } from '../data/mockData';
import { INITIAL_TRANSACTIONS } from '../data/mockData';

interface Budget {
  category: string;
  limit: number;
}

interface Filters {
  search: string;
  category: string;
  type: string; // 'all' | 'income' | 'expense'
}

interface FinanceContextType {
  transactions: Transaction[];
  role: Role;
  filters: Filters;
  budgets: Budget[];
  setFilters: (filters: Partial<Filters>) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  updateBudget: (category: string, limit: number) => void;
  switchRole: (role: Role) => void;
  stats: {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    balanceTrend: { date: string; balance: number }[];
    categoryBreakdown: { name: string; value: number }[];
    savingsGoalPct: number;
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(() => {
    const saved = localStorage.getItem('finance_role');
    return (saved as Role) || 'admin';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finance_budgets');
    return saved ? JSON.parse(saved) : [
      { category: 'Food', limit: 5000 },
      { category: 'Shopping', limit: 3000 },
      { category: 'Entertainment', limit: 2000 },
      { category: 'Transport', limit: 1500 },
      { category: 'Bills', limit: 8000 }
    ];
  });

  const [filters, setFiltersState] = useState<Filters>({
    search: '',
    category: 'all',
    type: 'all',
  });

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finance_role', role);
  }, [role]);

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    if (role !== 'admin') return;
    const newTransaction: Transaction = {
      ...t,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    if (role !== 'admin') return;
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    if (role !== 'admin') return;
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const updateBudget = (category: string, limit: number) => {
    if (role !== 'admin') return;
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category);
      if (exists) {
        return prev.map(b => b.category === category ? { ...b, limit } : b);
      }
      return [...prev, { category, limit }];
    });
  };

  const switchRole = (newRole: Role) => {
    setRole(newRole);
  };

  const stats = useMemo(() => {
    const sortedTs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let currentBalance = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    
    const balanceTrend = sortedTs.map(t => {
      if (t.type === 'income') {
        currentBalance += t.amount;
        totalIncome += t.amount;
      } else {
        currentBalance -= t.amount;
        totalExpenses += t.amount;
      }
      return { date: t.date, balance: currentBalance };
    });

    const categories: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });

    const categoryBreakdown = Object.entries(categories).map(([name, value]) => ({ name, value }));

    // Calculate overall savings goal percentage (simple version for demo)
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const savingsGoalPct = totalBudget > 0 ? Math.min(100, Math.max(0, ((totalBudget - totalExpenses) / totalBudget) * 100)) : 0;

    return {
      totalBalance: currentBalance,
      totalIncome,
      totalExpenses,
      balanceTrend: balanceTrend.slice(-15), // Last 15 data points
      categoryBreakdown,
      savingsGoalPct
    };
  }, [transactions, budgets]);

  return (
    <FinanceContext.Provider value={{ 
      transactions, role, filters, budgets, setFilters, 
      addTransaction, deleteTransaction, updateTransaction, updateBudget,
      switchRole, stats 
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
