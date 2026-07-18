import React, { useState } from 'react';
import { Clock } from 'lucide-react';

const HistoryLog = () => {
  const [logs] = useState([
    {
      id: 'log1',
      itemName: 'Mouse Logitech B100',
      type: 'DAMAGE',
      date: '18 Jul 2026, 14:30',
      quantity_change: -3,
      actual_stock_after: 120,
      notes: '3 unit mouse rusak kabelnya'
    },
    {
      id: 'log2',
      itemName: 'Monitor Samsung 24"',
      type: 'PURCHASE',
      date: '15 Jul 2026, 10:15',
      quantity_change: +5,
      actual_stock_after: 45,
      notes: 'Pembelian dari Toko Komputer X (INV-009)'
    },
    {
      id: 'log3',
      itemName: 'Keyboard Fantech',
      type: 'AUDIT',
      date: '10 Jul 2026, 09:00',
      quantity_change: 0,
      actual_stock_after: 80,
      notes: 'Stok sesuai (Audit Bulanan)'
    }
  ]);

  const getLogBadge = (type) => {
    if (type === 'PURCHASE') return <span className="badge badge-green">Masuk</span>;
    if (type === 'DAMAGE') return <span className="badge badge-red">Keluar</span>;
    return <span className="badge badge-yellow">Audit</span>;
  };

  return (
    <div>
      <div className="topbar">
        <h2 className="page-title">
          <Clock size={20} color="var(--primary-blue)" /> Buku Besar (History Log)
        </h2>
      </div>

      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Waktu</th>
              <th style={{ width: '10%' }}>Tipe Transaksi</th>
              <th style={{ width: '25%' }}>Nama Barang</th>
              <th style={{ width: '10%' }}>Mutasi</th>
              <th style={{ width: '10%' }}>Stok Akhir</th>
              <th style={{ width: '25%' }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>{log.date}</td>
                <td className="cell-text">{getLogBadge(log.type)}</td>
                <td className="cell-text" style={{ color: 'var(--text-primary)' }}>{log.itemName}</td>
                <td className="cell-text" style={{ 
                  color: log.quantity_change > 0 ? '#10B981' : (log.quantity_change < 0 ? '#EF4444' : 'var(--text-secondary)')
                }}>
                  {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                </td>
                <td className="cell-text" style={{ fontWeight: '500' }}>{log.actual_stock_after}</td>
                <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryLog;
