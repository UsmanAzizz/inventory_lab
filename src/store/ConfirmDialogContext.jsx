import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

const ConfirmDialogContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
};

export const ConfirmDialogProvider = ({ children }) => {
  const [dialogConfig, setDialogConfig] = useState(null);

  const confirm = useCallback(({ 
    title = 'Konfirmasi', 
    message = 'Apakah Anda yakin?', 
    confirmText = 'Ya, Lanjutkan', 
    cancelText = 'Batal', 
    danger = false 
  }) => {
    return new Promise((resolve) => {
      setDialogConfig({
        title,
        message,
        confirmText,
        cancelText,
        danger,
        onConfirm: () => {
          setDialogConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setDialogConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      
      {dialogConfig && (
        <div className="confirm-overlay" onClick={dialogConfig.onCancel}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ 
                padding: '10px', 
                backgroundColor: dialogConfig.danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                color: dialogConfig.danger ? '#EF4444' : 'var(--primary-blue)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {dialogConfig.danger ? <AlertTriangle size={24} /> : <Info size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {dialogConfig.title}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {dialogConfig.message}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                className="btn btn-outline" 
                onClick={dialogConfig.onCancel}
              >
                {dialogConfig.cancelText}
              </button>
              <button 
                className={`btn ${dialogConfig.danger ? 'btn-danger' : 'btn-primary'}`} 
                onClick={dialogConfig.onConfirm}
              >
                {dialogConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};
