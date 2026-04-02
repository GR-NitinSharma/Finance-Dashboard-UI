import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  LineChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertCircle, Award, Zap, Calendar, ArrowUpRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import SectionHeader from './SectionHeader';

const InsightsSection: React.FC = () => {
  const { transactions, stats } = useFinance();

  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number; month: string }> = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!months[key]) months[key] = { income: 0, expense: 0, month: label };
      if (t.type === 'income') months[key].income += t.amount;
      else months[key].expense += t.amount;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const topCategories = useMemo(() => {
    return [...stats.categoryBreakdown]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [stats.categoryBreakdown]);

  const savingsRate = stats.totalIncome > 0
    ? (((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100).toFixed(1)
    : '0';

  const avgExpensePerDay = useMemo(() => {
    if (transactions.length === 0) return 0;
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((s, t) => s + t.amount, 0);
    return (total / 30).toFixed(2);
  }, [transactions]);

  const radarData = topCategories.map(c => ({
    category: c.name,
    amount: c.value,
    fullMark: topCategories[0]?.value || 1
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <SectionHeader
        title="Financial Insights"
        subtitle="Deep-dive into your spending patterns and financial health."
      />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderTop: '3px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Savings Rate</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--success-light)', color: 'var(--success)' }}><TrendingUp size={16} /></div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{savingsRate}%</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>of your income is saved</p>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--error)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Daily Spend</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--error-light)', color: 'var(--error)' }}><TrendingDown size={16} /></div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>₹{avgExpensePerDay}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per day on average</p>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Category</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--warning-light)', color: 'var(--warning)' }}><Award size={16} /></div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{topCategories[0]?.name || 'N/A'}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{topCategories[0]?.value?.toLocaleString('en-IN') || 0} total spent</p>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color:'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Worth</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--info-light)', color: 'var(--info)' }}><Zap size={16} /></div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.25rem' }}>₹{stats.totalBalance.toLocaleString('en-IN')}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>current balance</p>
        </div>
      </div>

      {/* Monthly Income vs Expense */}
      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <h4 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Monthly Income vs Expenses</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Side-by-side comparison per month</p>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Balance Trend */}
        <div className="card">
          <h4 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Net Balance Over Time</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>How your wealth has grown</p>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.balanceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="balance" stroke="var(--accent-primary)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Rankings + Radar */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h4 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Top Spending Categories</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topCategories.map((cat, index) => {
              const pct = topCategories[0]?.value ? (cat.value / topCategories[0].value) * 100 : 0;
              return (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length], display: 'inline-block' }}></span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>#{index + 1} {cat.name}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>₹{cat.value.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: COLORS[index % COLORS.length], borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Spending Radar</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Relative comparison of top categories</p>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Radar name="Spending" dataKey="amount" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Smart Observations */}
      <div style={{ marginTop: '2.5rem' }}>
        <h4 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>💡 Smart Observations</h4>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              icon: <AlertCircle size={20} style={{ color: 'var(--warning)' }} />,
              bg: 'var(--warning-light)',
              title: 'Spending Alert',
              text: `Your ${topCategories[0]?.name || 'top'} spending is ${topCategories[0] && stats.totalExpenses ? ((topCategories[0].value / stats.totalExpenses) * 100).toFixed(0) : 0}% of all expenses. Consider setting a budget.`
            },
            {
              icon: <ArrowUpRight size={20} style={{ color: 'var(--success)' }} />,
              bg: 'var(--success-light)',
              title: 'Positive Trend',
              text: `Your savings rate of ${savingsRate}% is ${parseFloat(savingsRate) >= 20 ? 'excellent' : 'moderate'}. ${parseFloat(savingsRate) >= 20 ? 'Keep it up!' : 'Aim for 20%+ for financial stability.'}`
            },
            {
              icon: <Calendar size={20} style={{ color: 'var(--info)' }} />,
              bg: 'var(--info-light)',
              title: 'Monthly Pattern',
              text: `You have ${transactions.filter(t => t.type === 'income').length} income entries and ${transactions.filter(t => t.type === 'expense').length} expense entries in total.`
            }
          ].map((obs, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', background: obs.bg }}>
                  {obs.icon}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{obs.title}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{obs.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;
