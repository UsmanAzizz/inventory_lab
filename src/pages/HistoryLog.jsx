import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { useMockDB } from '../store/FirebaseDBContext';
import { useConfirm } from '../store/ConfirmDialogContext';

const HistoryLog = () => {
  const { logs, catalog, snapshots, loading, deleteLog } = useMockDB();
  const { confirm } = useConfirm();

  const getLogBadge = (type) => {
    if (type === 'PURCHASE') return <span className="badge badge-green">Masuk</span>;
    if (type === 'DAMAGE') return <span className="badge badge-red">Rusak</span>;
    if (type === 'OUTBOUND') return <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>Keluar</span>;
    return <span className="badge badge-yellow">Opname</span>;
  };

  const getItemName = (log) => {
    if (log.itemSnapshot) {
      return `${log.itemSnapshot.name} (${log.itemSnapshot.brand} ${log.itemSnapshot.type})`;
    }

    let item = catalog.find(i => i.id === log.itemId);
    
    if (!item && snapshots) {
      for (const snap of snapshots) {
        const found = snap.catalog_state?.find(i => i.id === log.itemId);
        if (found) {
          item = found;
          break;
        }
      }
    }

    return item ? `${item.name} (${item.brand} ${item.type})` : 'Barang Tidak Dikenal';
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleDelete = async (logId) => {
    const isConfirmed = await confirm({
      title: 'Hapus Riwayat',
      message: 'Apakah Anda yakin ingin menghapus riwayat ini? Ini akan mengembalikan stok seperti semula (kecuali Audit Faktual).',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      danger: true
    });
    if (isConfirmed) {
      await deleteLog(logId);
    }
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
              <th style={{ width: '10%', textAlign: 'center' }}>Tipe Transaksi</th>
              <th style={{ width: '25%' }}>Master Barang</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Mutasi Fisik</th>
              <th style={{ width: '25%' }}>Keterangan</th>
              <th style={{ width: '5%', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="cell-text" style={{ textAlign: 'center', color: 'var(--primary-blue)', padding: '32px 0' }}>
                  Sedang memuat data dari pangkalan data...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="cell-text" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada riwayat mutasi/transaksi tercatat.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>{formatDate(log.date)}</td>
                  <td className="cell-text" style={{ textAlign: 'center' }}>{getLogBadge(log.action)}</td>
                  <td className="cell-text" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{getItemName(log)}</td>
                  <td className="cell-text" style={{ fontWeight: '500', textAlign: 'center' }}>
                    {log.qty_change}
                  </td>
                  <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>{log.notes}</td>
                  <td className="cell-text" style={{ textAlign: 'center' }}>
                    <button 
                      className="btn-icon" 
                      style={{ color: 'var(--text-muted)', border: 'none', background: 'none', cursor: log.action === 'FAKTUAL' ? 'not-allowed' : 'pointer', opacity: log.action === 'FAKTUAL' ? 0.3 : 1 }}
                      onClick={() => log.action !== 'FAKTUAL' && handleDelete(log.id)}
                      title={log.action === 'FAKTUAL' ? "Audit Faktual tidak bisa dihapus" : "Hapus Riwayat"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
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
