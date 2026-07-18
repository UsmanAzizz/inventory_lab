import React from 'react';
import { Clock } from 'lucide-react';
import { useMockDB } from '../store/FirebaseDBContext';

const HistoryLog = () => {
  const { logs, catalog } = useMockDB();

  const getLogBadge = (type) => {
    if (type === 'PURCHASE') return <span className="badge badge-green">Masuk</span>;
    if (type === 'DAMAGE') return <span className="badge badge-red">Keluar</span>;
    return <span className="badge badge-yellow">Opname</span>;
  };

  const getItemName = (itemId) => {
    const item = catalog.find(i => i.id === itemId);
    return item ? `${item.name} (${item.brand} ${item.type})` : 'Barang Tidak Dikenal';
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="topbar">
        <h2 className="page-title">
          <Clock size={20} color="var(--primary-blue)" /> Buku Besar (History Log)
        </h2>
      </div>

      <div className="grid-container" style={{ overflowX: 'auto' }}>
        <table className="grid-table" style={{ minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Waktu</th>
              <th style={{ width: '10%' }}>Tipe Transaksi</th>
              <th style={{ width: '30%' }}>Master Barang</th>
              <th style={{ width: '20%' }}>Mutasi Fisik</th>
              <th style={{ width: '25%' }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="cell-text" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada riwayat mutasi/transaksi tercatat.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>{formatDate(log.date)}</td>
                  <td className="cell-text">{getLogBadge(log.action)}</td>
                  <td className="cell-text" style={{ color: 'var(--text-primary)' }}>{getItemName(log.itemId)}</td>
                  <td className="cell-text" style={{ fontWeight: '500' }}>
                    {log.qty_change}
                  </td>
                  <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>{log.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryLog;
