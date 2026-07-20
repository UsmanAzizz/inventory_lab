import React, { useState } from 'react';
import { useMockDB } from '../store/FirebaseDBContext';
import { Trash2, Clock, LayoutDashboard } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, width }) => {
  const [isOpen, setIsOpen] = React.useState(false);
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

const Dashboard = () => {
  const { catalog, stock, snapshots, loading, getDashboardData, getFullInventory, clearData } = useMockDB();
  const [selectedSnapshotId, setSelectedSnapshotId] = React.useState('LATEST');
  const [filterMonth, setFilterMonth] = React.useState('ALL');

  const availableMonths = [...new Set(snapshots.map(s => s.timestamp.substring(0, 7)))].sort().reverse();
  const filteredSnapshots = filterMonth === 'ALL' ? snapshots : snapshots.filter(s => s.timestamp.startsWith(filterMonth));

  // If the selected snapshot gets filtered out, fallback to LATEST
  React.useEffect(() => {
    if (selectedSnapshotId !== 'LATEST' && !filteredSnapshots.find(s => s.id === selectedSnapshotId)) {
      setSelectedSnapshotId('LATEST');
    }
  }, [filterMonth, filteredSnapshots, selectedSnapshotId]);

  // If LATEST is selected, pull data from the most recent snapshot. If none exists, use live stock.
  const currentSnapshot = selectedSnapshotId === 'LATEST'
    ? (filteredSnapshots.length > 0 ? filteredSnapshots[0] : null)
    : snapshots.find(s => s.id === selectedSnapshotId);

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

  const monthOptions = [
    { value: 'ALL', label: 'Semua Bulan' },
    ...availableMonths.map(m => ({ value: m, label: formatMonth(m) }))
  ];

  const snapshotOptions = [
    { value: 'LATEST', label: 'Kondisi Terkini' },
    ...[...filteredSnapshots].reverse().map(snap => ({
      value: snap.id,
      label: `${snap.title} (${formatDate(snap.timestamp)})`
    }))
  ];

  return (
    <div>
      <div className="topbar" style={{ height: '54px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 className="page-title">
            <LayoutDashboard size={20} color="var(--primary-blue)" /> Overview Inventaris
          </h2>
          <span style={{ color: 'var(--border-focus)', fontSize: '14px' }}>|</span>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {selectedSnapshotId === 'LATEST'
              ? <span>Rekap Stok Saat Ini</span>
              : currentSnapshot 
                ? <span>Rekap Stok Saat <b>{currentSnapshot.title}</b> - {formatDate(currentSnapshot.timestamp)}</span>
                : <span>Rekap Stok Saat Ini</span>
            }
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 12px', height: '38px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <Clock size={14} color="var(--text-secondary)" style={{ marginRight: '4px' }} />
            
            <CustomSelect 
              width="130px"
              value={filterMonth}
              onChange={setFilterMonth}
              options={monthOptions}
            />
            
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
            
            <CustomSelect 
              width="240px"
              value={selectedSnapshotId}
              onChange={setSelectedSnapshotId}
              options={snapshotOptions}
            />
          </div>
        </div>
      </div>
      
      <div className="grid-container" style={{ overflowX: 'auto', marginTop: '24px' }}>
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
            {loading ? (
              <tr>
                <td colSpan="6" className="cell-text" style={{ textAlign: 'center', color: 'var(--primary-blue)', padding: '32px 0' }}>
                  Sedang memuat data dari pangkalan data...
                </td>
              </tr>
            ) : inventory.length === 0 ? (
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
