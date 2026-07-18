import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, ArrowDownRight, ArrowUpRight, Clock } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { path: '/audit', label: 'Audit Faktual', icon: <CheckSquare size={16} /> },
    { path: '/purchase', label: 'Barang Masuk', icon: <ArrowUpRight size={16} /> },
    { path: '/damage', label: 'Barang Rusak/Keluar', icon: <ArrowDownRight size={16} /> },
    { path: '/history', label: 'Buku Besar (History)', icon: <Clock size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-void)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '0 24px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Lab</span> History
          </h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 12px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '13px',
                  transition: 'var(--transition)'
                }}
              >
                <span style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '40px 48px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
