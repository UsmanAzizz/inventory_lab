import React, { useState, useRef } from 'react';
import { FileText, Download, X, Search, Filter, Printer } from 'lucide-react';
import { useMockDB } from '../store/FirebaseDBContext';
import html2pdf from 'html2pdf.js';

const Laporan = () => {
  const { snapshots, getFullInventory, loading } = useMockDB();
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');

  const availableYears = [...new Set(snapshots.map(s => s.timestamp.substring(0, 4)))].sort().reverse();
  const availableMonths = [
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
    { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ];

  const filteredSnapshots = snapshots.filter(s => {
    if (filterType !== 'ALL' && s.title !== filterType) return false;
    if (filterYear !== 'ALL' && !s.timestamp.startsWith(filterYear)) return false;
    if (filterMonth !== 'ALL' && s.timestamp.substring(5, 7) !== filterMonth) return false;
    return true;
  });

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const printRef = useRef(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const element = printRef.current;
    
    // Make sure it's temporarily visible so html2pdf can capture it
    const originalDisplay = element.style.display;
    element.style.display = 'block';

    const opt = {
      margin:       [10, 20, 10, 20], // top, right, bottom, left
      filename:     `Laporan_Inventaris_${selectedSnapshot.title.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).outputPdf('bloburl').then((pdfBlobUrl) => {
      // Open in a new tab
      window.open(pdfBlobUrl, '_blank');
      // Revert visibility back to hidden
      element.style.display = originalDisplay;
    });
  };

  return (
    <div>
      {/* --- View Layar Utama (Non-Print) --- */}
      <div className="no-print">
        <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
              <Printer size={20} color="var(--primary-blue)" /> Arsip Laporan
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
            >
              <option value="ALL">Semua Bulan</option>
              {availableMonths.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
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
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
            >
              <option value="ALL">Semua Mutasi</option>
              <option value="Audit Faktual">Inventaris (Audit)</option>
              <option value="Barang Masuk">Pengadaan (Masuk)</option>
              <option value="Barang Rusak/Keluar">Pengeluaran (Keluar)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-blue)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            Sedang memuat riwayat snapshot dari pangkalan data...
          </div>
        ) : filteredSnapshots.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            Belum ada riwayat snapshot pada periode ini.
          </div>
        ) : (
          <div className="grid-container" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <table className="grid-table" style={{ minWidth: '600px', width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ width: '40%', textAlign: 'left' }}>Jenis Mutasi</th>
                  <th style={{ width: '40%', textAlign: 'left' }}>Waktu Pencatatan</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSnapshots.map(snap => (
                  <tr key={snap.id} style={{ transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="cell-text" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{snap.title}</td>
                    <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>{formatDate(snap.timestamp)}</td>
                    <td className="cell-text" style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => setSelectedSnapshot(snap)}
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                      >
                        Lihat Laporan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Modal Pratinjau (Terlihat di Layar Saat Dibuka, Tapi Jadi Tampilan Utama Saat Diprint) --- */}
      {selectedSnapshot && (
        <div 
          className="print-modal-overlay no-print" 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100,
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
            overflowY: 'auto', padding: '40px 20px'
          }}
          onClick={(e) => { if(e.target === e.currentTarget) setSelectedSnapshot(null); }}
        >
          {/* A4 Paper View Wrapper for Screen */}
          <div style={{ 
            backgroundColor: 'white', width: '100%', maxWidth: '210mm', 
            minHeight: '297mm', color: 'black', padding: '20mm',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)', position: 'relative'
          }}>
            {/* Action Bar for Screen Only */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '20px', borderBottom: '1px dashed #ccc', paddingBottom: '20px' }}>
              <button className="btn" onClick={() => setSelectedSnapshot(null)} style={{ border: '1px solid #ccc', color: '#333' }}>Tutup</button>
              <button className="btn btn-primary" onClick={handlePrint} style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                <Download size={16} /> Unduh PDF
              </button>
            </div>

            {/* This inner div is what actually gets styled nicely for print */}
            <div>
              {/* Kop Surat */}
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px solid black', paddingBottom: '16px', marginBottom: '24px' }}>
                <img src="/favicon.png" alt="Logo" style={{ width: '60px', height: '60px', marginRight: '20px', objectFit: 'contain' }} />
                <div>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MGMP TJKT SMK DIPONEGORO CIPARI</h1>
                  <p style={{ margin: 0, fontSize: '14px' }}>Laporan Inventaris Laboratorium TJKT</p>
                </div>
              </div>

              {/* Info Laporan */}
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Jenis Mutasi:</strong> {selectedSnapshot.title}</p>
                  <p style={{ margin: 0 }}><strong>Total Item Master:</strong> {selectedSnapshot.catalog_state.length} Barang</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Waktu Pencatatan:</strong> {formatDate(selectedSnapshot.timestamp)}</p>
                  <p style={{ margin: 0 }}><strong>Dicetak Pada:</strong> {formatDate(new Date().toISOString())}</p>
                </div>
              </div>

              {/* Tabel Data */}
              <table className="pdf-table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ width: '25%', color: 'black', textAlign: 'left' }}>Katalog Barang</th>
                    <th style={{ width: '15%', color: 'black', textAlign: 'center' }}>Merek</th>
                    <th style={{ width: '15%', color: 'black', textAlign: 'center' }}>Tipe/Model</th>
                    <th style={{ width: '15%', color: 'black', textAlign: 'center' }}>Satuan</th>
                    <th style={{ width: '15%', color: 'black', textAlign: 'center' }}>Stok Baik</th>
                    <th style={{ width: '15%', color: 'black', textAlign: 'center' }}>Stok Rusak</th>
                  </tr>
                </thead>
                <tbody>
                  {getFullInventory(selectedSnapshot.stock_state, selectedSnapshot.catalog_state).map(item => (
                    <tr key={item.id}>
                      <td style={{ color: 'black', textAlign: 'left' }}>{item.name}</td>
                      <td style={{ color: 'black', textAlign: 'center' }}>{item.brand}</td>
                      <td style={{ color: 'black', textAlign: 'center' }}>{item.type}</td>
                      <td style={{ color: 'black', textAlign: 'center' }}>{item.unit}</td>
                      <td style={{ color: 'black', textAlign: 'center' }}>{item.qty_good}</td>
                      <td style={{ color: 'black', textAlign: 'center' }}>{item.qty_damaged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Kolom Tanda Tangan */}
              <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'center', width: '350px' }}>
                  <p style={{ margin: '0 0 70px 0', whiteSpace: 'nowrap' }}>Mengetahui,<br/>Penanggung Jawab Laboratorium</p>
                  <p style={{ margin: 0, paddingTop: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Hilmi Haidar Ali, S.Kom.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Komponen Kertas Tersembunyi Khusus Cetak (Hanya Muncul Saat Print Ditekan) --- */}
      <style>{`
        @media print {
          .print-modal-overlay {
            display: none !important;
          }
          .print-content-only {
            display: block !important;
            color: black !important;
            background: white !important;
          }
        }
        @media screen {
          /* Bila tidak di dalam modal, print content tersembunyi */
          body > .print-content-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Komponen Kertas Tersembunyi untuk html2pdf.js */}
      {selectedSnapshot && (
        <div ref={printRef} style={{ display: 'none', backgroundColor: 'white', color: 'black', padding: '0' }}>
          {/* Kop Surat */}
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px solid black', paddingBottom: '16px', marginBottom: '24px' }}>
            <img src="/favicon.png" alt="Logo" style={{ width: '60px', height: '60px', marginRight: '20px', objectFit: 'contain' }} />
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MGMP TJKT SMK DIPONEGORO CIPARI</h1>
              <p style={{ margin: 0, fontSize: '14px' }}>Laporan Inventaris Laboratorium TJKT</p>
            </div>
          </div>

          {/* Info Laporan */}
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0' }}><strong>Jenis Mutasi:</strong> {selectedSnapshot.title}</p>
              <p style={{ margin: 0 }}><strong>Total Item Master:</strong> {selectedSnapshot.catalog_state.length} Barang</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Waktu Pencatatan:</strong> {formatDate(selectedSnapshot.timestamp)}</p>
              <p style={{ margin: 0 }}><strong>Dicetak Pada:</strong> {formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          {/* Tabel Data */}
          <table className="pdf-table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ width: '25%', color: 'black', textAlign: 'left' }}>Katalog Barang</th>
                <th style={{ width: '15%', color: 'black', textAlign: 'center' }}>Merek</th>
                <th style={{ width: '15%', color: 'black', textAlign: 'center' }}>Tipe/Model</th>
                <th style={{ width: '15%', color: 'black', textAlign: 'center' }}>Satuan</th>
                <th style={{ width: '15%', color: '#10B981', textAlign: 'center' }}>Stok Baik</th>
                <th style={{ width: '15%', color: '#EF4444', textAlign: 'center' }}>Stok Rusak</th>
              </tr>
            </thead>
            <tbody>
              {getFullInventory(selectedSnapshot.stock_state, selectedSnapshot.catalog_state).map(item => (
                <tr key={item.id}>
                  <td style={{ color: 'black', textAlign: 'left' }}>{item.name}</td>
                  <td style={{ color: 'black', textAlign: 'center' }}>{item.brand}</td>
                  <td style={{ color: 'black', textAlign: 'center' }}>{item.type}</td>
                  <td style={{ color: 'black', textAlign: 'center' }}><span className="badge badge-blue">{item.unit}</span></td>
                  <td style={{ color: 'black', textAlign: 'center' }}>{item.qty_good}</td>
                  <td style={{ color: 'black', textAlign: 'center' }}>{item.qty_damaged}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Kolom Tanda Tangan */}
          <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center', width: '350px' }}>
              <p style={{ margin: '0 0 70px 0', whiteSpace: 'nowrap' }}>Mengetahui,<br/>Penanggung Jawab Laboratorium</p>
              <p style={{ margin: 0, paddingTop: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Hilmi Haidar Ali, S.Kom.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;
