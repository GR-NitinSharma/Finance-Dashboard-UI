import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Transaction, Role } from '../data/mockData';
import { INITIAL_TRANSACTIONS } from '../data/mockData';
import { useAuth } from './AuthContext';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

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
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
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
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  // Initialize role
  const [role, setRole] = useState<Role>(() => {
    if (userId === 'guest') return 'admin';
    const saved = localStorage.getItem(`finance_role_${userId}`);
    return (saved as Role) || 'admin';
  });

  // Initialize transactions from localStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (userId === 'guest') return INITIAL_TRANSACTIONS;
    const saved = localStorage.getItem(`finance_transactions_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback below
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const defaultBudgets = [
      { category: 'Food', limit: 5000 },
      { category: 'Shopping', limit: 3000 },
      { category: 'Entertainment', limit: 2000 },
      { category: 'Transport', limit: 1500 },
      { category: 'Bills', limit: 8000 }
    ];
    if (userId === 'guest') return defaultBudgets;
    const saved = localStorage.getItem(`finance_budgets_${userId}`);
    return saved ? JSON.parse(saved) : defaultBudgets;
  });

  const [filters, setFiltersState] = useState<Filters>({
    search: '',
    category: 'all',
    type: 'all',
  });

  // Fetch transactions from backend or maintain localStorage
  useEffect(() => {
    const fetchTransactions = async () => {
      if (userId === 'guest') {
        setTransactions(INITIAL_TRANSACTIONS);
        return;
      }

      // Check localStorage first
      const saved = localStorage.getItem(`finance_transactions_${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTransactions(parsed);
          } else {
            setTransactions(INITIAL_TRANSACTIONS);
            localStorage.setItem(`finance_transactions_${userId}`, JSON.stringify(INITIAL_TRANSACTIONS));
          }
        } catch {
          setTransactions(INITIAL_TRANSACTIONS);
        }
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem(`finance_transactions_${userId}`, JSON.stringify(INITIAL_TRANSACTIONS));
      }

      // Try fetching from backend if available
      try {
        const res = await fetch(`${API}/transactions/${userId}`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json().catch(() => null);
          if (data?.success && Array.isArray(data.transactions)) {
            setTransactions(data.transactions);
            localStorage.setItem(`finance_transactions_${userId}`, JSON.stringify(data.transactions));
          }
        }
      } catch {
        // Backend not available (e.g. Netlify static hosting)
      }
    };

    fetchTransactions();
  }, [userId]);

  // Saving budgets & role locally
  useEffect(() => {
    if (userId !== 'guest') {
      localStorage.setItem(`finance_budgets_${userId}`, JSON.stringify(budgets));
    }
  }, [budgets, userId]);

  useEffect(() => {
    if (userId !== 'guest') {
      localStorage.setItem(`finance_role_${userId}`, role);
    }
  }, [role, userId]);

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (role !== 'admin') return;

    const newTx: Transaction = {
      ...t,
      id: 'tx_' + Date.now(),
    };

    let finalTx = newTx;

    if (userId !== 'guest') {
      try {
        const res = await fetch(`${API}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...t, userId }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json().catch(() => null);
          if (data?.success && data?.transaction) {
            finalTx = data.transaction;
          }
        }
      } catch {
        // Backend offline, fallback to local
      }
    }

    setTransactions(prev => {
      const updated = [finalTx, ...prev];
      if (userId !== 'guest') {
        localStorage.setItem(`finance_transactions_${userId}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deleteTransaction = async (id: string) => {
    if (role !== 'admin') return;

    if (userId !== 'guest') {
      try {
        await fetch(`${API}/transactions/${id}`, { method: 'DELETE' });
      } catch {
        // Backend offline, fallback to local deletion
      }
    }

    setTransactions(prev => {
      const updated = prev.filter(t => t.id.toString() !== id.toString());
      if (userId !== 'guest') {
        localStorage.setItem(`finance_transactions_${userId}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateTransaction = async (id: string, updatedTx: Partial<Transaction>) => {
    if (role !== 'admin') return;

    if (userId !== 'guest') {
      try {
        await fetch(`${API}/transactions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTx),
        });
      } catch {
        // Backend offline, fallback to local update
      }
    }

    setTransactions(prev => {
      const updated = prev.map(t => t.id.toString() === id.toString() ? { ...t, ...updatedTx } : t);
      if (userId !== 'guest') {
        localStorage.setItem(`finance_transactions_${userId}`, JSON.stringify(updated));
      }
      return updated;
    });
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
    if (transactions.length === 0) {
      return { totalBalance: 0, totalIncome: 0, totalExpenses: 0, balanceTrend: [], categoryBreakdown: [], savingsGoalPct: 0 };
    }

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

    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const savingsGoalPct = totalBudget > 0 ? Math.min(100, Math.max(0, ((totalBudget - totalExpenses) / totalBudget) * 100)) : 0;

    return {
      totalBalance: currentBalance,
      totalIncome,
      totalExpenses,
      balanceTrend: balanceTrend.slice(-15),
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
