import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const SectionHeader: React.FC<Props> = ({ title, subtitle, children }) => {
  return (
    <div style={{
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    }}>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>{children}</div>}
    </div>
  );
};

export default SectionHeader;
