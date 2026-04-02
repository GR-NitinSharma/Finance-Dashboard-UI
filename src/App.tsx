import React, { useState, useEffect } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import TransactionSection from './components/TransactionSection';
import InsightsSection from './components/InsightsSection';
import SettingsSection from './components/SettingsSection';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'dashboard' | 'transactions' | 'insights' | 'settings';

const AppContent: React.FC = () => {
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

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeTab={activeTab} onNavigate={setActiveTab} />
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '2rem',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Navbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1.5rem'
        }}>
          <button
            onClick={toggleTheme}
            className="card"
            style={{
              padding: '0.75rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              background: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="flex items-center gap-3">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Nitin Sharma</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Aspiring Full Stack Web Developer</div>
            </div>
            <img
              src="https://api.dicebear.com/7.x/miniavs/svg?seed=Nitin"
              alt="Avatar"
              style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--accent-primary)', border: '2px solid var(--border-color)' }}
            />
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
  <FinanceProvider>
    <AppContent />
  </FinanceProvider>
);

export default App;
