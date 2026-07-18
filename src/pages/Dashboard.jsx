import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems([
      { id: '1', name: 'Monitor Samsung 24"', category: 'Hardware', current_stock: 45 },
      { id: '2', name: 'Mouse Logitech B100', category: 'Accessories', current_stock: 120 },
      { id: '3', name: 'Keyboard Fantech', category: 'Accessories', current_stock: 80 },
    ]);
  }, []);

  return (
    <div>
      <div className="topbar">
        <h2 className="page-title">Overview Inventaris</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Total Master Barang</h4>
          <p style={{ fontSize: '32px', color: 'var(--text-primary)', fontWeight: '400' }}>{items.length}</p>
        </div>
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Total Stok Fisik</h4>
          <p style={{ fontSize: '32px', color: 'var(--text-primary)', fontWeight: '400' }}>
            {items.reduce((acc, item) => acc + item.current_stock, 0)}
          </p>
        </div>
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Status Lab</h4>
          <p style={{ fontSize: '32px', color: '#10B981', fontWeight: '400' }}>Aman</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Stok Saat Ini (Master)</h3>
      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Katalog Barang</th>
              <th style={{ width: '25%' }}>Kategori</th>
              <th style={{ width: '20%' }}>Stok Akhir</th>
              <th style={{ width: '15%' }}>Kondisi</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="cell-text" style={{ color: 'var(--text-primary)' }}>{item.name}</td>
                <td className="cell-text"><span className="badge badge-blue">{item.category}</span></td>
                <td className="cell-text">{item.current_stock} Unit</td>
                <td className="cell-text">
                  {item.current_stock > 10 ? (
                    <span className="badge badge-green">Tersedia</span>
                  ) : (
                    <span className="badge badge-red">Menipis</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
