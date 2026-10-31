import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Settings,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
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
        width: '280px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '2.5rem 1.5rem',
        zIndex: 100,
        borderRight: '1px solid var(--glass-border)',
        boxShadow: 'none'
      }}
    >
      {/* Logo */}
      <div
        className="logo-container"
        style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '3rem', padding: '0 0.5rem' }}
      >
        <div style={{
          width: '42px', height: '42px',
          background: 'var(--grad-primary)',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}>G</div>
        <span style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Gravity</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                    gap: '1rem',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '16px',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                    transition: 'var(--transition-fast)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9375rem',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative'
                  }}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      style={{
                        position: 'absolute',
                        left: '-1.5rem',
                        width: '4px',
                        height: '24px',
                        background: 'var(--accent-primary)',
                        borderRadius: '0 4px 4px 0'
                      }} 
                    />
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
          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-tertiary)', border: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {role === 'admin'
              ? <ShieldCheck size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
              : <ShieldAlert size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            }
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{role.toUpperCase()} MODE</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, fontWeight: 500 }}>
            {role === 'admin' ? 'Full administrative control active.' : 'View-only permissions granted.'}
          </p>
          <button
            onClick={() => switchRole(role === 'admin' ? 'viewer' : 'admin')}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.625rem', fontSize: '0.75rem', borderRadius: '12px' }}
          >
            Switch to {role === 'admin' ? 'Viewer' : 'Admin'}
          </button>
        </div>
      </div>
    </div>

  );
};

export default Sidebar;
