import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, ArrowDownRight, ArrowUpRight, Clock, BookOpen, LogOut } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { path: '/katalog', label: 'Katalog Barang', icon: <BookOpen size={16} /> },
    { path: '/audit', label: 'Audit Faktual', icon: <CheckSquare size={16} /> },
    { path: '/purchase', label: 'Barang Masuk', icon: <ArrowUpRight size={16} /> },
    { path: '/damage', label: 'Barang Rusak/Keluar', icon: <ArrowDownRight size={16} /> },
  ];

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-void)' }}>
      
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
          <LogOut size={18} />
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
                >
                  <span className="nav-icon">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div style={{ marginTop: 'auto', padding: '0 12px' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                width: '100%',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#EF4444';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.querySelector('span').style.color = '#EF4444';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.querySelector('span').style.color = 'var(--text-muted)';
              }}
            >
              <span style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }}><LogOut size={16} /></span>
              Logout / Kunci Layar
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div className="main-content-wrapper" style={{ padding: '40px 48px' }}>
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
              <span style={{ fontSize: '10px', marginTop: '2px' }}>
                {item.label === 'Barang Rusak/Keluar' ? 'Keluar' : 
                 item.label === 'Katalog Barang' ? 'Katalog' :
                 item.label === 'Audit Faktual' ? 'Audit' :
                 item.label === 'Barang Masuk' ? 'Masuk' : 'Overview'}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
