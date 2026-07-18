import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, ArrowDownRight, ArrowUpRight, Clock, BookOpen } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { path: '/katalog', label: 'Katalog Barang', icon: <BookOpen size={16} /> },
    { path: '/audit', label: 'Audit Faktual', icon: <CheckSquare size={16} /> },
    { path: '/purchase', label: 'Barang Masuk', icon: <ArrowUpRight size={16} /> },
    { path: '/damage', label: 'Barang Rusak/Keluar', icon: <ArrowDownRight size={16} /> },
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
        
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 12px', gap: '4px' }}>
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
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '13px',
                  transition: 'var(--transition)',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '16px',
                    backgroundColor: 'var(--primary-blue)',
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
                <span style={{ 
                  color: isActive ? 'var(--primary-blue)' : 'var(--text-muted)',
                  transition: 'var(--transition)'
                }}>
                  {item.icon}
                </span>
                <span style={{ fontWeight: isActive ? '500' : '400' }}>{item.label}</span>
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
