import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp,
  CircleDollarSign,
  TrendingDown,
  Target
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import SectionHeader from './SectionHeader';

const DashboardOverview: React.FC = () => {
  const { stats, transactions } = useFinance();

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  const incomeCount = transactions.filter(t => t.type === 'income').length;
  const expenseCount = transactions.filter(t => t.type === 'expense').length;

  const highestExpense = stats.categoryBreakdown.reduce((prev, current) => 
    (prev.value > current.value) ? prev : current, { name: 'None', value: 0 });

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <SectionHeader 
        title="Welcome Back, Nitin" 
        subtitle="Here's what's happening with your finances today."
      >
        <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status: </span>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span className="status-dot-pulse" style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
              display: 'inline-block'
            }}></span> Healthy
          </span>
        </div>
      </SectionHeader>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="card glass-effect" style={{
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%)',
          border: 'none',
          color: 'white'
        }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <span style={{ opacity: 0.8, fontSize: '0.875rem', fontWeight: 500 }}>TOTAL BALANCE</span>
            <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}>
              <Wallet size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>₹{stats.totalBalance.toLocaleString('en-IN')}</h3>
          <div className="flex items-center gap-1" style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            {stats.totalBalance > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(Math.floor(stats.totalBalance * 0.15))}% vs last month</span>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>TOTAL INCOME</span>
            <div style={{ 
              padding: '0.5rem', 
              borderRadius: '50%', 
              background: 'var(--success-light)',
              color: 'var(--success)'
            }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>₹{stats.totalIncome.toLocaleString('en-IN')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>from {incomeCount} transactions</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>TOTAL EXPENSES</span>
            <div style={{ 
              padding: '0.5rem', 
              borderRadius: '50%', 
              background: 'var(--error-light)',
              color: 'var(--error)'
            }}>
              <ArrowDownRight size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>₹{stats.totalExpenses.toLocaleString('en-IN')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>across {expenseCount} categories</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="card grid-cols-2" style={{ gridColumn: 'span 2' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Balance Trend</h4>
            <select style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              <option>Last 15 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.balanceTrend}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--accent-primary)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="var(--accent-primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
           <h4 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Spending Breakdown</h4>
           <div style={{ width: '100%', height: '300px', position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={stats.categoryBreakdown}
                   cx="50%"
                   cy="45%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {stats.categoryBreakdown.map((_entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
                 <Legend verticalAlign="bottom" align="center" iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
             <div style={{
               position: 'absolute',
               top: '45%',
               left: '50%',
               transform: 'translate(-50%, -50%)',
               textAlign: 'center',
               pointerEvents: 'none'
             }}>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spent</span>
               <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{stats.totalExpenses.toLocaleString('en-IN')}</div>
             </div>
           </div>
        </div>
      </div>

      <div className="insights-row">
        <SectionHeader title="Financial Insights" subtitle="Smart observations from your activity." />
        <div className="grid grid-cols-4 gap-6">
          <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
              <CircleDollarSign size={20} className="text-secondary" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Savings Goal</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              You've maintained <span style={{ fontWeight: 700 }}>{stats.savingsGoalPct.toFixed(0)}%</span> of your monthly budget.
            </p>
            <div style={{ height: '8px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.savingsGoalPct}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
              <TrendingDown size={20} style={{ color: 'var(--error)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Highest Spend</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>{highestExpense.name}</span> is your top category.
            </p>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--error)' }}>₹{highestExpense.value.toLocaleString('en-IN')}</span>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly Growth</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Your net worth increased by
            </p>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>+₹1,240.50</span>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
              <Target size={20} style={{ color: 'var(--warning)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Efficiency</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Your expense-to-income ratio is healthy.
            </p>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>42%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
