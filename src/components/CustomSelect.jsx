import React, { useState } from 'react';

const CustomSelect = ({ value, onChange, options, width }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div 
      style={{ position: 'relative', cursor: 'pointer', width, outline: 'none' }}
      onClick={() => setIsOpen(!isOpen)}
      onBlur={() => setIsOpen(false)}
      tabIndex={0}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', fontSize: '13px', color: 'var(--text-primary)' }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedOption?.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          minWidth: '100%',
          backgroundColor: '#1e232b',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '4px 0'
        }}>
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                color: opt.value === value ? '#3b82f6' : '#c9d1d9',
                backgroundColor: opt.value === value ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                if (opt.value !== value) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
              onMouseOut={(e) => {
                if (opt.value !== value) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
