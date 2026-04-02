import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Settings,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

type Tab = 'dashboard' | 'transactions' | 'insights' | 'settings';

interface SidebarProps {
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
}

const navItems: { name: string; icon: React.ElementType; id: Tab }[] = [
  { name: 'Dashboard',     icon: LayoutDashboard, id: 'dashboard' },
  { name: 'Transactions',  icon: ArrowLeftRight,  id: 'transactions' },
  { name: 'Insights',      icon: TrendingUp,      id: 'insights' },
  { name: 'Settings',      icon: Settings,        id: 'settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  const { role, switchRole } = useFinance();

  return (
    <div
      className="sidebar glass-effect"
      style={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        zIndex: 100,
        borderRight: '1px solid var(--border-color)'
      }}
    >
      {/* Logo */}
      <div
        className="logo-container"
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}
      >
        <div style={{
          width: '40px', height: '40px',
          background: 'var(--accent-primary)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 'bold', fontSize: '1.25rem', flexShrink: 0
        }}>G</div>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Gravity</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onNavigate(item.id);
                    window.location.hash = item.id;
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                    transition: 'var(--transition)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                  {isActive && (
                    <span style={{
                      marginLeft: 'auto',
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: 'var(--accent-primary)'
                    }} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role Switcher */}
      <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
        <div
          className="card"
          style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {role === 'admin'
              ? <ShieldCheck size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
              : <ShieldAlert size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            }
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{role.toUpperCase()} Mode</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {role === 'admin' ? 'Full control over all entries.' : 'View-only access is active.'}
          </p>
          <button
            onClick={() => switchRole(role === 'admin' ? 'viewer' : 'admin')}
            style={{
              width: '100%', padding: '0.5rem',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem', fontWeight: 'bold',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            Switch to {role === 'admin' ? 'Viewer' : 'Admin'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
