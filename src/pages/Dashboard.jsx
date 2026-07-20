import React, { useState } from 'react';
import { useMockDB } from '../store/FirebaseDBContext';
import { Trash2, Clock, LayoutDashboard } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

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
    ...[...filteredSnapshots]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(snap => ({
        value: snap.id,
        label: formatDate(snap.timestamp)
    }))
  ];

  return (
    <div>
      <div className="topbar" style={{ height: '54px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 className="page-title">
            <LayoutDashboard size={20} color="var(--primary-blue)" /> Overview Inventaris
          </h2>
          <span style={{ color: 'var(--border-focus)', fontSize: '14px', transform: 'translateY(1px)' }}>|</span>
          <div className="rekap-stok-text" style={{ fontSize: '13px', color: 'var(--text-secondary)', transform: 'translateY(2px)' }}>
            {selectedSnapshotId === 'LATEST'
              ? <span>Kondisi Terkini</span>
              : currentSnapshot 
                ? <span><b>{currentSnapshot.title}</b> - {formatDate(currentSnapshot.timestamp)}</span>
                : <span>Kondisi Terkini</span>
            }
          </div>
        </div>
        
        <div className="mobile-scrollable filter-container-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="filter-container" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 12px', height: '38px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <Clock size={14} color="var(--text-secondary)" style={{ marginRight: '4px', flexShrink: 0 }} />
            
            <div className="filter-month" style={{ width: '130px' }}>
              <CustomSelect 
                width="100%"
                value={filterMonth}
                onChange={setFilterMonth}
                options={monthOptions}
              />
            </div>
            
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)', margin: '0 4px', flexShrink: 0 }} />
            
            <div className="filter-kondisi" style={{ width: '180px' }}>
              <CustomSelect 
                width="100%"
                value={selectedSnapshotId}
                onChange={setSelectedSnapshotId}
                options={snapshotOptions}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid-container" style={{ overflowX: 'auto', marginTop: '24px' }}>
        <table className="grid-table" style={{ minWidth: '900px' }}>
          <thead>
            <tr>
              <th className="col-name">Nama Barang</th>
              <th className="col-brand">Merek</th>
              <th className="col-model">Tipe/Model</th>
              <th className="col-unit">Satuan</th>
              <th className="col-good" style={{ color: '#10B981' }}>Stok Baik</th>
              <th className="col-bad" style={{ color: '#EF4444' }}>Stok Rusak</th>
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
