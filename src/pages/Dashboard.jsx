import React, { useState } from 'react';
import { useMockDB } from '../store/MockDBContext';
import { Trash2, Clock } from 'lucide-react';

const Dashboard = () => {
  const { catalog, stock, snapshots, getDashboardData, getFullInventory, clearData } = useMockDB();
  const [selectedSnapshotId, setSelectedSnapshotId] = useState('LATEST');
  const [filterMonth, setFilterMonth] = useState('ALL');

  const availableMonths = [...new Set(snapshots.map(s => s.timestamp.substring(0, 7)))].sort().reverse();
  const filteredSnapshots = filterMonth === 'ALL' ? snapshots : snapshots.filter(s => s.timestamp.startsWith(filterMonth));

  // If the selected snapshot gets filtered out, fallback to LATEST
  React.useEffect(() => {
    if (selectedSnapshotId !== 'LATEST' && !filteredSnapshots.find(s => s.id === selectedSnapshotId)) {
      setSelectedSnapshotId('LATEST');
    }
  }, [filterMonth, filteredSnapshots, selectedSnapshotId]);

  const currentSnapshot = snapshots.find(s => s.id === selectedSnapshotId);
  const targetStock = currentSnapshot ? currentSnapshot.stock_state : stock;
  const targetCatalog = currentSnapshot ? currentSnapshot.catalog_state : catalog;

  const inventory = getFullInventory(targetStock, targetCatalog);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatMonth = (yyyyMm) => {
    if (yyyyMm === 'ALL') return 'Semua Waktu';
    const [y, m] = yyyyMm.split('-');
    const date = new Date(y, m - 1);
    return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
            Overview Inventaris
          </h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', height: '38px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <Clock size={14} color="var(--text-secondary)" />
            <select 
              style={{ border: 'none', background: 'transparent', padding: '0', width: '130px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', borderRight: '1px solid var(--border-color)', marginRight: '8px', outline: 'none' }}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="ALL">Semua Bulan</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
            
            <select 
              style={{ border: 'none', background: 'transparent', padding: '0', width: '200px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}
              value={selectedSnapshotId}
              onChange={(e) => setSelectedSnapshotId(e.target.value)}
            >
              <option value="LATEST">Histori Terkini (Saat Ini)</option>
              {[...filteredSnapshots].reverse().map((snap, idx) => (
                <option key={snap.id} value={snap.id}>
                  {snap.title} ({formatDate(snap.timestamp)})
                </option>
              ))}
            </select>
          </div>
          
          <button className="btn btn-outline" onClick={clearData} style={{ borderColor: 'var(--border-color)', height: '38px', padding: '0 16px' }}>
            <Trash2 size={16} /> Reset
          </button>
        </div>
      </div>

      <div style={{ paddingBottom: '16px' }} />

      <h3 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        {currentSnapshot 
          ? <span>Rekap Stok Saat <b>{currentSnapshot.title}</b> ({formatDate(currentSnapshot.timestamp)})</span>
          : <span>Rekap Stok Aktual Saat Ini</span>
        }
      </h3>
      
      <div className="grid-container" style={{ overflowX: 'auto' }}>
        <table className="grid-table" style={{ minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Katalog Barang</th>
              <th style={{ width: '15%' }}>Merek</th>
              <th style={{ width: '15%' }}>Tipe/Model</th>
              <th style={{ width: '15%' }}>Satuan</th>
              <th style={{ width: '15%', color: '#10B981' }}>Stok Baik</th>
              <th style={{ width: '15%', color: '#EF4444' }}>Stok Rusak</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="cell-text" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada data inventaris. Silakan isi lewat Audit Faktual atau Barang Masuk.
                </td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id}>
                  <td className="cell-text" style={{ color: 'var(--text-primary)' }}>{item.name}</td>
                  <td className="cell-text">{item.brand}</td>
                  <td className="cell-text">{item.type}</td>
                  <td className="cell-text"><span className="badge badge-blue">{item.unit}</span></td>
                  <td className="cell-text">{item.qty_good}</td>
                  <td className="cell-text">{item.qty_damaged}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
