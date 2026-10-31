import React, { useState, useEffect } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import TransactionSection from './components/TransactionSection';
import InsightsSection from './components/InsightsSection';
import SettingsSection from './components/SettingsSection';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'dashboard' | 'transactions' | 'insights' | 'settings';

const AppContent: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Listen for hash changes and sidebar link clicks
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as Tab;
      if (['dashboard', 'transactions', 'insights', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // run on mount
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':    return <DashboardOverview />;
      case 'transactions': return <TransactionSection />;
      case 'insights':     return <InsightsSection />;
      case 'settings':     return <SettingsSection theme={theme} toggleTheme={toggleTheme} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <div className="mesh-gradient" />
      <div className="noise" />
      <Sidebar activeTab={activeTab} onNavigate={setActiveTab} />
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '2.5rem',
        minHeight: '100vh',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Top Navbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '3rem',
          gap: '1.25rem'
        }}>
          <button
            onClick={toggleTheme}
            className="glass-effect"
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="flex items-center gap-4 glass-effect" style={{ padding: '0.5rem 0.5rem 0.5rem 1.25rem', borderRadius: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{user.fullName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{user.profession}</div>
            </div>
            <img
              src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${user.username}`}
              alt="Avatar"
              style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-primary)', border: '2px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}
            />
            <button
              onClick={() => { logout(); }}
              className="glass-effect"
              title="Logout"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--error)',
                background: 'var(--error-light)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>


        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AuthConsumer />
  </AuthProvider>
);

const AuthConsumer: React.FC = () => {
  const { user } = useAuth();
  return (
    <FinanceProvider key={user?.id || 'guest'}>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;
