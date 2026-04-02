import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit2, 
  Download,
  AlertCircle,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import type { Transaction } from '../data/mockData';
import { CATEGORIES } from '../data/mockData';
import SectionHeader from './SectionHeader';

const TransactionSection: React.FC = () => {
  const { transactions, role, filters, setFilters, deleteTransaction, addTransaction, updateTransaction } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase()) || 
                          t.category.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === 'all' || t.category === filters.category;
      const matchesType = filters.type === 'all' || t.type === filters.type;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, filters]);

  const handleExport = () => {
    setIsExporting(true);
    const headers = ['ID', 'Date', 'Description', 'Category', 'Amount', 'Type'];
    const csvData = filteredTransactions.map(t => 
      [t.id, t.date, `"${t.description}"`, t.category, t.amount, t.type].join(',')
    );
    const csvContent = [headers.join(','), ...csvData].join('\n');
    
    setTimeout(() => {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      setIsExporting(false);
    }, 1000);
  };

  const [newTx, setNewTx] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: 'Food',
    type: 'expense',
    description: ''
  });

  const handleSave = () => {
    if (newTx.amount <= 0 || !newTx.description) return alert("Please fill all fields correctly.");
    
    if (isEditMode && editingId) {
      updateTransaction(editingId, newTx);
    } else {
      addTransaction(newTx);
    }
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTx({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      category: 'Food',
      type: 'expense',
      description: ''
    });
    setIsEditMode(false);
    setEditingId(null);
  };

  const openEditModal = (tx: Transaction) => {
    setNewTx({
      date: tx.date,
      amount: tx.amount,
      category: tx.category,
      type: tx.type,
      description: tx.description
    });
    setEditingId(tx.id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <SectionHeader title="Transactions" subtitle="Manage and review your financial activity.">
        <button 
          onClick={handleExport}
          className="card" 
          disabled={isExporting}
          style={{ 
            padding: '0.75rem 1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.6 : 1
          }}
        >
          <Download size={18} />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
        {role === 'admin' && (
          <button 
            onClick={openAddModal}
            style={{ 
              padding: '0.75rem 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'var(--accent-primary)',
              color: 'white',
              fontWeight: 600,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <Plus size={18} />
            New Transaction
          </button>
        )}
      </SectionHeader>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by description or category..." 
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Filter size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select 
                value={filters.category}
                onChange={(e) => setFilters({ category: e.target.value })}
                style={{
                  padding: '0.75rem 1rem 0.75rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  WebkitAppearance: 'none'
                }}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <select 
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value })}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
               <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                 <th style={{ padding: '1rem 1.5rem' }}>Transaction</th>
                 <th style={{ padding: '1rem 1.5rem' }}>Category</th>
                 <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                 <th style={{ padding: '1rem 1.5rem' }}>Amount</th>
                 <th style={{ padding: '1rem 1.5rem' }}>Type</th>
                 <th style={{ padding: '1rem 1.5rem' }}>Actions</th>
               </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }} className="table-row">
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tx.description}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      background: 'var(--bg-tertiary)', 
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: tx.type === 'income' ? 'var(--success)' : 'var(--text-primary)' }}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.35rem', 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: tx.type === 'income' ? 'var(--success-light)' : 'var(--error-light)',
                      color: tx.type === 'income' ? 'var(--success)' : 'var(--error)'
                    }}>
                      {tx.type === 'income' ? <PlusCircle size={14} /> : <MinusCircle size={14} />}
                      {tx.type.toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openEditModal(tx)}
                        disabled={role !== 'admin'}
                        style={{ color: 'var(--text-muted)', background: 'none', padding: '0.5rem', borderRadius: ' var(--radius-sm)', cursor: role === 'admin' ? 'pointer' : 'not-allowed' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteTransaction(tx.id)}
                        disabled={role !== 'admin'}
                        style={{ color: 'var(--error)', background: 'none', padding: '0.5rem', borderRadius: ' var(--radius-sm)', cursor: role === 'admin' ? 'pointer' : 'not-allowed' }}
                      >
                        <Trash2 size={16} />
                      </button>
                      {role !== 'admin' && <div title="Administrator permission required" style={{ display: 'flex', alignItems: 'center' }}><AlertCircle size={14} style={{ color: 'var(--text-muted)' }} /></div>}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Search size={48} opacity={0.3} />
                      <p>No transactions match your filters.</p>
                      <button 
                        onClick={() => setFilters({ search: '', category: 'all', type: 'all' })}
                        style={{ color: 'var(--accent-primary)', fontWeight: 600, background: 'none' }}
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card glass-effect" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-secondary)' }}>
             <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{isEditMode ? 'Edit' : 'New'} Transaction</h3>
             <div className="flex flex-col gap-4">
                <div>
                   <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>DESCRIPTION</label>
                   <input 
                      type="text" 
                      placeholder="e.g. Starbucks Coffee" 
                      value={newTx.description}
                      onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>AMOUNT (₹)</label>
                    <input 
                        type="number" 
                        value={newTx.amount}
                        onChange={(e) => setNewTx({...newTx, amount: parseFloat(e.target.value) || 0})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>TYPE</label>
                    <select 
                        value={newTx.type}
                        onChange={(e) => setNewTx({...newTx, type: e.target.value as 'income' | 'expense'})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>CATEGORY</label>
                    <select 
                        value={newTx.category}
                        onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>DATE</label>
                    <input 
                        type="date" 
                        value={newTx.date}
                        onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                <div className="flex gap-4" style={{ marginTop: '1.5rem' }}>
                   <button 
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 600 }}
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleSave}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: 'white', fontWeight: 600 }}
                   >
                     {isEditMode ? 'Update' : 'Add'} Transaction
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSection;
