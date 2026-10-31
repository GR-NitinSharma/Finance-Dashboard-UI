import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit2, 
  Download,
  AlertCircle,
  MinusCircle,
  PlusCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import type { Transaction } from '../data/mockData';
import { CATEGORIES } from '../data/mockData';
import SectionHeader from './SectionHeader';

type Toast = { id: number; type: 'success' | 'error'; message: string };

const TransactionSection: React.FC = () => {
  const { transactions, role, filters, setFilters, deleteTransaction, addTransaction, updateTransaction } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

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
    amount: '' as unknown as number,
    category: 'Food',
    type: 'expense',
    description: ''
  });

  const handleSave = async () => {
    setFormError('');
    const amount = Number(newTx.amount);
    if (!newTx.description.trim()) {
      setFormError('Please enter a description.');
      return;
    }
    if (!amount || amount <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!newTx.date) {
      setFormError('Please select a date.');
      return;
    }

    setIsSaving(true);
    try {
      const txToSave = { ...newTx, amount };
      if (isEditMode && editingId) {
        await updateTransaction(editingId, txToSave);
        showToast('success', 'Transaction updated successfully!');
      } else {
        await addTransaction(txToSave);
        showToast('success', 'Transaction added successfully!');
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setNewTx({
      date: new Date().toISOString().split('T')[0],
      amount: '' as unknown as number,
      category: 'Food',
      type: 'expense',
      description: ''
    });
    setIsEditMode(false);
    setEditingId(null);
    setFormError('');
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
    setFormError('');
    setShowModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div style={{ padding: '2rem 1rem', position: 'relative' }}>
      {/* Toast Notifications */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: toast.type === 'success' ? 'var(--success)' : 'var(--error)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                minWidth: '280px'
              }}
            >
              {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <SectionHeader title="Transactions" subtitle="Manage and review your financial activity.">
        <button 
          onClick={handleExport}
          className="btn btn-secondary" 
          disabled={isExporting}
        >
          <Download size={18} />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
        {role === 'admin' && (
          <button 
            onClick={openAddModal}
            className="btn btn-primary"
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
                    <div className={`badge ${tx.type === 'income' ? 'badge-success' : 'badge-error'}`}>
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
          background: 'rgba(2, 6, 23, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="card glass-effect" 
            style={{ width: '100%', maxWidth: '540px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
          >
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h3 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                 {isEditMode ? 'Update' : 'New'} Transaction
               </h3>
               <button onClick={() => { setShowModal(false); resetForm(); }} style={{ color: 'var(--text-muted)', background: 'none', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
             </div>
             {/* Inline form error */}
             <AnimatePresence>
               {formError && (
                 <motion.div
                   initial={{ opacity: 0, y: -8 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -8 }}
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem',
                     padding: '0.75rem 1rem',
                     borderRadius: 'var(--radius-md)',
                     background: 'rgba(239,68,68,0.12)',
                     border: '1px solid rgba(239,68,68,0.3)',
                     color: 'var(--error)',
                     fontSize: '0.875rem',
                     marginBottom: '1.25rem',
                     fontWeight: 500
                   }}
                 >
                   <AlertCircle size={16} />
                   {formError}
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="flex flex-col gap-5">
                <div>
                   <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>DESCRIPTION</label>
                   <input 
                      type="text" 
                      className="input"
                      placeholder="e.g. Monthly Subscription" 
                      value={newTx.description}
                      onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>AMOUNT (₹)</label>
                    <input 
                        type="number" 
                        className="input"
                        value={newTx.amount}
                        onChange={(e) => setNewTx({...newTx, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>TYPE</label>
                    <select 
                        className="input"
                        value={newTx.type}
                        onChange={(e) => setNewTx({...newTx, type: e.target.value as 'income' | 'expense'})}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>CATEGORY</label>
                    <select 
                        className="input"
                        value={newTx.category}
                        onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>DATE</label>
                    <input 
                        type="date" 
                        className="input"
                        value={newTx.date}
                        onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4" style={{ marginTop: '1.5rem' }}>
                   <button 
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    disabled={isSaving}
                   >
                     {isSaving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : (isEditMode ? 'Update' : 'Add') + ' Transaction'}
                   </button>
                </div>
             </div>
          </motion.div>
        </div>

      )}
    </div>
  );
};

export default TransactionSection;
