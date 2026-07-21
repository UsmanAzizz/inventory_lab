import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, ArrowDownRight, ArrowUpRight, PackageMinus, Clock, Box, LogOut, Printer, Power } from 'lucide-react';
import { useConfirm } from '../store/ConfirmDialogContext';
import { useAuth } from '../store/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { confirm } = useConfirm();
  const { logout, currentUser } = useAuth();

  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={16} />, activeColor: 'var(--primary-blue)', activeBg: 'rgba(59, 130, 246, 0.1)' },
    { path: '/audit', label: 'Audit Faktual', icon: <CheckSquare size={16} />, activeColor: 'var(--primary-blue)', activeBg: 'rgba(59, 130, 246, 0.1)' },
    { path: '/purchase', label: 'Barang Masuk', icon: <ArrowUpRight size={16} />, activeColor: '#10B981', activeBg: 'rgba(16, 185, 129, 0.1)' },
    { path: '/damage', label: 'Barang Rusak', icon: <ArrowDownRight size={16} />, activeColor: '#EF4444', activeBg: 'rgba(239, 68, 68, 0.1)' },
    { path: '/outbound', label: 'Barang Keluar', icon: <PackageMinus size={16} />, activeColor: '#F59E0B', activeBg: 'rgba(245, 158, 11, 0.1)' },
    { path: '/katalog', label: 'Katalog Barang', icon: <Box size={16} />, activeColor: 'var(--primary-blue)', activeBg: 'rgba(59, 130, 246, 0.1)' },
    { path: '/laporan', label: 'Cetak Laporan', icon: <Printer size={16} />, activeColor: 'var(--primary-blue)', activeBg: 'rgba(59, 130, 246, 0.1)' },
  ];

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin keluar dari sesi saat ini?',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal'
    });
    
    if (isConfirmed) {
      await logout();
      window.location.href = '/login';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-void)' }}>
      
      {/* Mobile Header (Hidden on Desktop) */}
      <header className="mobile-header mobile-only">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/favicon.png" alt="Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Lab</span> History
          </h2>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: 'transparent', border: 'none', color: '#EF4444', padding: '8px' }}
        >
          <Power size={18} />
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <aside className="desktop-only" style={{
          width: '240px',
          borderRight: '1px solid var(--border-color)',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/favicon.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            <h2 style={{ fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Lab</span> History
            </h2>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 12px', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  style={isActive ? { 
                    color: item.activeColor,
                    backgroundColor: item.activeBg,
                    '--icon-color': item.activeColor 
                  } : {}}
                >
                  <span className="nav-icon">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div style={{ marginTop: 'auto', padding: '0 24px' }}>
            {currentUser && (
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.email || 'User')}&background=0D8ABC&color=fff`} 
                  alt="Profile" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.displayName || 'Admin'}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.email}
                  </p>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <Power size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div className="main-content-wrapper" style={{ position: 'absolute', inset: 0, overflow: 'hidden', padding: '32px 48px 0 48px', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Hidden on Desktop) */}
      <nav className="bottom-nav mobile-only">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="icon-wrapper">
                {item.icon}
              </div>
              <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: '500' }}>
                {item.label === 'Barang Keluar' ? 'Keluar' : 
                 item.label === 'Barang Rusak' ? 'Rusak' : 
                 item.label === 'Katalog Barang' ? 'Katalog' :
                 item.label === 'Audit Faktual' ? 'Audit' :
                 item.label === 'Barang Masuk' ? 'Masuk' : 
                 item.label === 'Cetak Laporan' ? 'Cetak' : 'Overview'}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
