import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Download, X, Search, Filter, Printer } from 'lucide-react';
import { useMockDB } from '../store/FirebaseDBContext';
import html2pdf from 'html2pdf.js';

const Laporan = () => {
  const { snapshots, logs, catalog, getFullInventory, loading } = useMockDB();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [filterYear, setFilterYear] = useState('ALL');

  // Helper to format YYYY-MM to localized string
  const formatMonthLabel = (yyyyMm) => {
    const [year, month] = yyyyMm.split('-');
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Extract all unique YYYY-MM from snapshots and logs
  const monthSet = new Set();
  snapshots.forEach(s => monthSet.add(s.timestamp.substring(0, 7)));
  logs.forEach(l => monthSet.add(l.date.substring(0, 7)));
  
  const allMonths = Array.from(monthSet).sort().reverse();
  const availableYears = [...new Set(allMonths.map(m => m.substring(0, 4)))];
  
  const filteredMonths = allMonths.filter(m => filterYear === 'ALL' || m.startsWith(filterYear));

  // Print Logic
  const printRef = useRef(null);
  const handlePrint = () => {
    if (!printRef.current) return;
    const element = printRef.current;
    
    const originalDisplay = element.style.display;
    element.style.display = 'block';

    const opt = {
      margin:       [10, 15, 10, 15],
      filename:     `Laporan_Bulanan_${selectedMonth}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).outputPdf('bloburl').then((pdfBlobUrl) => {
      window.open(pdfBlobUrl, '_blank');
      element.style.display = originalDisplay;
    });
  };

  // --- Data Computation for Modal ---
  let faktualInventory = [];
  let masukData = [];
  let keluarData = [];
  let rusakData = [];
  let latestSnapshotInMonth = null;

  if (selectedMonth) {
    const endOfMonth = `${selectedMonth}-31T23:59:59.999Z`;
    latestSnapshotInMonth = snapshots.find(s => s.timestamp <= endOfMonth);
    
    if (latestSnapshotInMonth) {
       const snapStock = Array.isArray(latestSnapshotInMonth.stock_state) ? latestSnapshotInMonth.stock_state : Object.values(latestSnapshotInMonth.stock_state || {});
       const snapCatalog = Array.isArray(latestSnapshotInMonth.catalog_state) ? latestSnapshotInMonth.catalog_state : Object.values(latestSnapshotInMonth.catalog_state || {});
       faktualInventory = getFullInventory(snapStock, snapCatalog);
    }

    const monthLogs = logs.filter(l => l.date.startsWith(selectedMonth));
    
    const aggregateLogs = (logArray) => {
        const agg = {};
        const logSnapshots = {};
        logArray.forEach(l => {
           if (!agg[l.itemId]) agg[l.itemId] = 0;
           const match = l.qty_change.match(/[-+]?(\d+)/);
           const qty = match ? parseInt(match[1]) : 0;
           agg[l.itemId] += Math.abs(qty);
           if (l.itemSnapshot) logSnapshots[l.itemId] = l.itemSnapshot;
        });
        
        return Object.keys(agg).map(itemId => {
           const snapCatalog = latestSnapshotInMonth ? (Array.isArray(latestSnapshotInMonth.catalog_state) ? latestSnapshotInMonth.catalog_state : Object.values(latestSnapshotInMonth.catalog_state || {})) : [];
           const item = logSnapshots[itemId] ||
                        catalog.find(c => c.id === itemId) || 
                        snapCatalog.find(c => c.id === itemId) || 
                        { name: 'Unknown', brand: '-', type: '-', unit: '-' };
           return { ...item, qty_total: agg[itemId] };
        }).sort((a,b) => a.name.localeCompare(b.name));
    };

    masukData = aggregateLogs(monthLogs.filter(l => l.action === 'PURCHASE'));
    keluarData = aggregateLogs(monthLogs.filter(l => l.action === 'OUTBOUND'));
    rusakData = aggregateLogs(monthLogs.filter(l => l.action === 'DAMAGE'));
  }

  const renderKopSurat = (title) => (
    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px solid black', paddingBottom: '16px', marginBottom: '24px' }}>
      <img src="/favicon.png" alt="Logo" style={{ width: '60px', height: '60px', marginRight: '20px', objectFit: 'contain' }} />
      <div>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MGMP TJKT SMK DIPONEGORO CIPARI</h1>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{title}</p>
      </div>
    </div>
  );

  const renderSignature = () => (
    <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end', pageBreakInside: 'avoid' }}>
      <div style={{ textAlign: 'center', width: '350px' }}>
        <p style={{ margin: '0 0 70px 0', whiteSpace: 'nowrap' }}>Mengetahui,<br/>Penanggung Jawab Laboratorium</p>
        <p style={{ margin: 0, paddingTop: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Hilmi Haidar Ali, S.Kom.</p>
      </div>
    </div>
  );

  const formatDateOnly = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const renderInfoTable = (jenisLaporan, keterangan) => (
    <table style={{ width: '100%', marginBottom: '20px', fontSize: '12px', borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <td style={{ width: '120px', padding: '4px 0', fontWeight: 'bold' }}>Jenis Laporan</td>
          <td style={{ width: '10px', padding: '4px 0' }}>:</td>
          <td style={{ padding: '4px 0' }}>{jenisLaporan}</td>
        </tr>
        <tr>
          <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Keterangan</td>
          <td style={{ padding: '4px 0' }}>:</td>
          <td style={{ padding: '4px 0' }}>{keterangan}</td>
        </tr>
        <tr>
          <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Bulan / Tahun</td>
          <td style={{ padding: '4px 0' }}>:</td>
          <td style={{ padding: '4px 0' }}>{formatMonthLabel(selectedMonth)}</td>
        </tr>
        <tr>
          <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Tanggal Cetak</td>
          <td style={{ padding: '4px 0' }}>:</td>
          <td style={{ padding: '4px 0' }}>{formatDateOnly(new Date().toISOString())}</td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div className="page-container">
      <div className="no-print topbar">
        <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
          <h2 className="page-title">
            <Printer size={20} color="var(--primary-blue)" /> Laporan Bulanan
          </h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
            >
              <option value="ALL">Semua Tahun</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      <div className="page-content">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-blue)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            Sedang memuat data laporan...
          </div>
        ) : filteredMonths.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            Belum ada rekaman laporan untuk tahun ini.
          </div>
        ) : (
          <div className="grid-container" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <table className="grid-table" style={{ minWidth: '600px', width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ width: '60%', textAlign: 'left' }}>Bulan Laporan</th>
                  <th style={{ width: '40%', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMonths.map(monthStr => (
                  <tr key={monthStr} style={{ transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="cell-text" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Laporan Inventaris - {formatMonthLabel(monthStr)}
                    </td>
                    <td className="cell-text" style={{ textAlign: 'center', padding: 0, borderLeft: '1px solid var(--border-color)' }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setSelectedMonth(monthStr)}
                        style={{ width: '100%', height: '100%', minHeight: '52px', padding: '12px 16px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', borderRadius: 0, border: 'none', margin: 0 }}
                      >
                        <FileText size={14} />
                        Cetak Laporan Bulanan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Modal Pratinjau --- */}
      {selectedMonth && createPortal(
        <div 
          className="print-modal-overlay no-print" 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 99999, /* Increased to ensure it's on top of everything */
            display: 'block',
            overflowY: 'auto', padding: '40px 20px'
          }}
          onClick={(e) => { if(e.target === e.currentTarget) setSelectedMonth(null); }}
        >
          <div style={{ 
            backgroundColor: 'white', width: '100%', maxWidth: '210mm', 
            minHeight: '297mm', color: 'black', padding: '20mm',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)', margin: '0 auto',
            position: 'relative'
          }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '20px', borderBottom: '1px dashed #ccc', paddingBottom: '20px' }}>
              <button className="btn" onClick={() => setSelectedMonth(null)} style={{ border: '1px solid #ccc', color: '#333' }}>Tutup</button>
              <button className="btn btn-primary" onClick={handlePrint} style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                <Download size={16} /> Unduh PDF
              </button>
            </div>

            {/* Konten Laporan Asli yang Akan Diprint */}
            <div ref={printRef} className="print-content" style={{ backgroundColor: 'white', color: 'black' }}>
              
              {/* HALAMAN 1: AUDIT FAKTUAL */}
              <div>
                {renderKopSurat('Laporan Audit Faktual Inventaris')}
                {renderInfoTable('Rekapitulasi Inventaris', `Kondisi akhir stok inventaris laboratorium TJKT per tanggal ${latestSnapshotInMonth ? formatDateOnly(latestSnapshotInMonth.timestamp) : '-'}.`)}
                <table className="pdf-table" style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '30px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Nama Barang</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Merek</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Tipe/Model</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Satuan</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Stok Baik</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Stok Rusak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faktualInventory.length > 0 ? faktualInventory.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>{item.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.brand}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.type}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.unit}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.qty_good}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.qty_damaged}</td>
                      </tr>
                    )) : <tr><td colSpan="6" style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Tidak ada data inventaris</td></tr>}
                  </tbody>
                </table>
                {renderSignature()}
              </div>

              {/* HALAMAN 2: BARANG MASUK */}
              <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}>
                {renderKopSurat('Laporan Rekapitulasi Barang Masuk')}
                {renderInfoTable('Rekapitulasi Barang Masuk', `Akumulasi seluruh barang masuk (pengadaan) per tanggal ${latestSnapshotInMonth ? formatDateOnly(latestSnapshotInMonth.timestamp) : '-'}.`)}
                <table className="pdf-table" style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '30px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Nama Barang</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Merek</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Tipe/Model</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Total Masuk</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masukData.length > 0 ? masukData.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>{item.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.brand}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.type}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', fontWeight: 'bold', color: '#10B981' }}>+{item.qty_total}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.unit}</td>
                      </tr>
                    )) : <tr><td colSpan="5" style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Tidak ada transaksi barang masuk bulan ini</td></tr>}
                  </tbody>
                </table>
                {renderSignature()}
              </div>

              {/* HALAMAN 3: BARANG KELUAR */}
              <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}>
                {renderKopSurat('Laporan Rekapitulasi Barang Keluar')}
                {renderInfoTable('Rekapitulasi Barang Keluar', `Akumulasi seluruh barang keluar per tanggal ${latestSnapshotInMonth ? formatDateOnly(latestSnapshotInMonth.timestamp) : '-'}.`)}
                <table className="pdf-table" style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '30px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Nama Barang</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Merek</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Tipe/Model</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Total Keluar</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keluarData.length > 0 ? keluarData.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>{item.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.brand}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.type}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', fontWeight: 'bold', color: '#EF4444' }}>-{item.qty_total}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.unit}</td>
                      </tr>
                    )) : <tr><td colSpan="5" style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Tidak ada transaksi barang keluar bulan ini</td></tr>}
                  </tbody>
                </table>
                {renderSignature()}
              </div>

              {/* HALAMAN 4: BARANG RUSAK */}
              <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}>
                {renderKopSurat('Laporan Rekapitulasi Barang Rusak')}
                {renderInfoTable('Rekapitulasi Barang Rusak', `Akumulasi seluruh barang yang dilaporkan rusak per tanggal ${latestSnapshotInMonth ? formatDateOnly(latestSnapshotInMonth.timestamp) : '-'}.`)}
                <table className="pdf-table" style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '30px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Nama Barang</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Merek</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Tipe/Model</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Total Rusak</th>
                      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rusakData.length > 0 ? rusakData.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>{item.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.brand}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.type}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', fontWeight: 'bold', color: '#F59E0B' }}>{item.qty_total}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{item.unit}</td>
                      </tr>
                    )) : <tr><td colSpan="5" style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Tidak ada laporan barang rusak bulan ini</td></tr>}
                  </tbody>
                </table>
                {renderSignature()}
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default Laporan;
