import React, { useState } from 'react';
import {
  User, Shield, Moon, Sun, Trash2, Download, RefreshCw,
  ShieldCheck, ShieldAlert, Bell, Database, Info, Target
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { INITIAL_TRANSACTIONS } from '../data/mockData';
import SectionHeader from './SectionHeader';

interface SettingsProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SettingsSection: React.FC<SettingsProps> = ({ theme, toggleTheme }) => {
  const { role, switchRole, transactions } = useFinance();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExportAll = () => {
    const headers = ['ID', 'Date', 'Description', 'Category', 'Amount', 'Type'];
    const csvData = transactions.map(t =>
      [t.id, t.date, `"${t.description}"`, t.category, t.amount, t.type].join(',')
    );
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `all_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleResetData = () => {
    localStorage.setItem(`finance_transactions_${userId}`, JSON.stringify(INITIAL_TRANSACTIONS));
    window.location.reload();
  };

  const handleClearData = () => {
    localStorage.removeItem(`finance_transactions_${userId}`);
    window.location.reload();
  };

  const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void; disabled?: boolean }> = ({ enabled, onToggle, disabled }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      style={{
        width: '48px', height: '26px', borderRadius: '13px',
        background: enabled ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
        border: '2px solid ' + (enabled ? 'var(--accent-primary)' : 'var(--border-color)'),
        position: 'relative', transition: 'all 0.3s ease',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        flexShrink: 0
      }}
    >
      <span style={{
        display: 'block', width: '18px', height: '18px', borderRadius: '50%',
        background: 'white', position: 'absolute', top: '2px',
        left: enabled ? '22px' : '2px', transition: 'left 0.3s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  );

  const SettingRow: React.FC<{ icon: React.ReactNode; title: string; desc: string; control: React.ReactNode }> = ({ icon, title, desc, control }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
        </div>
      </div>
      <div>{control}</div>
    </div>
  );

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <SectionHeader title="Settings" subtitle="Manage your preferences and account configuration." />

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Profile Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Profile</span>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img
                src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.username || 'guest'}`}
                alt="Avatar"
                style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-primary)', border: '3px solid var(--border-color)', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{user?.fullName}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{user?.profession}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: role === 'admin' ? 'var(--info-light)' : 'var(--warning-light)', color: role === 'admin' ? 'var(--info)' : 'var(--warning)' }}>
                  {role === 'admin' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                  {role.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Role Management */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Role & Permissions</span>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Switch between roles to simulate different access levels for demonstration.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {(['admin', 'viewer'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    style={{
                      flex: 1, padding: '0.875rem', borderRadius: 'var(--radius-md)', fontWeight: 700,
                      fontSize: '0.875rem', transition: 'var(--transition)',
                      background: role === r ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: role === r ? 'white' : 'var(--text-secondary)',
                      border: role === r ? 'none' : '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                  >
                    {r === 'admin' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--info)' }} />
                <span>
                  <strong>Admin:</strong> Can add, edit and delete transactions.{' '}
                  <strong>Viewer:</strong> Read-only access, no data modifications allowed.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Appearance & Preferences */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {theme === 'light' ? <Sun size={16} style={{ color: 'var(--accent-primary)' }} /> : <Moon size={16} style={{ color: 'var(--accent-primary)' }} />}
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Appearance & Preferences</span>
            </div>
            <SettingRow
              icon={theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              title="Dark Mode"
              desc="Toggle between light and dark theme"
              control={<ToggleSwitch enabled={theme === 'dark'} onToggle={toggleTheme} />}
            />
            <SettingRow
              icon={<Bell size={18} />}
              title="Notifications"
              desc="Receive budget alerts and reminders"
              control={<ToggleSwitch enabled={notifications} onToggle={() => setNotifications(p => !p)} />}
            />
            <SettingRow
              icon={<Database size={18} />}
              title="Auto-save"
              desc="Automatically persist data to localStorage"
              control={<ToggleSwitch enabled={autoSave} onToggle={() => setAutoSave(p => !p)} />}
            />
          </div>

          {/* Budget Goals Management */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Monthly Budget Goals</span>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Set monthly limits for your spending categories.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {useFinance().budgets.map(budget => (
                  <div key={budget.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{budget.category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹</span>
                      <input
                        type="number"
                        value={budget.limit}
                        onChange={(e) => useFinance().updateBudget(budget.category, parseInt(e.target.value) || 0)}
                        disabled={role !== 'admin'}
                        style={{
                          width: '80px',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Data Management</span>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Total Transactions</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stored in localStorage</div>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{transactions.length}</span>
              </div>

              <button onClick={handleExportAll} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.875rem', borderRadius: 'var(--radius-md)', fontWeight: 600,
                fontSize: '0.875rem', background: 'var(--info-light)', color: 'var(--info)',
                border: '1px solid rgba(59,130,246,0.2)', transition: 'var(--transition)'
              }}>
                <Download size={16} /> Export All Data (CSV)
              </button>

              <button onClick={() => setShowResetConfirm(true)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.875rem', borderRadius: 'var(--radius-md)', fontWeight: 600,
                fontSize: '0.875rem', background: 'var(--warning-light)', color: 'var(--warning)',
                border: '1px solid rgba(245,158,11,0.2)', transition: 'var(--transition)'
              }}>
                <RefreshCw size={16} /> Reset to Sample Data
              </button>

              <button onClick={handleClearData} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.875rem', borderRadius: 'var(--radius-md)', fontWeight: 600,
                fontSize: '0.875rem', background: 'var(--error-light)', color: 'var(--error)',
                border: '1px solid rgba(239,68,68,0.2)', transition: 'var(--transition)'
              }}>
                <Trash2 size={16} /> Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', background: 'var(--bg-secondary)', textAlign: 'center' }}>
            <RefreshCw size={40} style={{ color: 'var(--warning)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Reset Data?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              This will replace all your transactions with the original sample data. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleResetData} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--warning)', color: 'white', fontWeight: 600 }}>
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsSection;
