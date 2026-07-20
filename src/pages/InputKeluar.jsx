import React, { useState } from 'react';
import { PackageMinus, Plus, Trash2, Calendar, FileText } from 'lucide-react';
import { useMockDB } from '../store/FirebaseDBContext';
import { toTitleCase } from '../utils';
import toast from 'react-hot-toast';
import CustomSelect from '../components/CustomSelect';

const InputKeluar = () => {
  const { catalog, logs, saveKeluar } = useMockDB();
  const [rows, setRows] = useState([]);

  // Filter Month Logic
  const currentMonthStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 7);
  const [filterMonth, setFilterMonth] = useState(currentMonthStr);

  const outboundLogs = logs.filter(l => l.action === 'OUTBOUND').sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const mappedLogs = outboundLogs.map(log => {
    const item = catalog.find(c => c.id === log.itemId);
    return {
      ...log,
      name: item?.name || 'Unknown Item',
      brand: item?.brand || '-',
      type: item?.type || '-',
      unit: item?.unit || '-'
    };
  });

  const availableMonths = [...new Set(mappedLogs.map(l => l.date.substring(0, 7)))].sort().reverse();
  if (!availableMonths.includes(currentMonthStr)) availableMonths.unshift(currentMonthStr);

  const formatMonthLabel = (yyyyMm) => {
    if (yyyyMm === 'ALL') return 'Semua Riwayat';
    const [year, month] = yyyyMm.split('-');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  };

  const monthOptions = [
    { value: 'ALL', label: 'Semua Riwayat' },
    ...availableMonths.map(m => ({ value: m, label: formatMonthLabel(m) }))
  ];

  const filteredLogs = filterMonth === 'ALL' ? mappedLogs : mappedLogs.filter(l => l.date.startsWith(filterMonth));

  // Datalist options
  const uniqueNames = [...new Set(catalog.map(c => c.name))].filter(Boolean);
  const uniqueBrands = [...new Set(catalog.map(c => c.brand))].filter(Boolean);
  const uniqueTypes = [...new Set(catalog.map(c => c.type))].filter(Boolean);

  const addRow = () => {
    setRows([{ 
      rowId: Date.now(), 
      date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      name: '', 
      brand: '', 
      type: '', 
      unit: 'Unit', 
      qty_out: '', 
      source: 'good',
      notes: '',
      isMatched: false
    }, ...rows]);
  };

  const removeRow = (rowId) => {
    setRows(rows.filter(r => r.rowId !== rowId));
  };

  const handleChange = (rowId, field, value) => {
    setRows(rows.map(row => {
      if (row.rowId === rowId) {
        const formattedValue = ['name', 'brand', 'type', 'unit', 'notes'].includes(field) ? toTitleCase(value) : value;
        const updatedRow = { ...row, [field]: formattedValue };
        
        if (field === 'name' || field === 'brand' || field === 'type') {
          const match = catalog.find(c => 
            c.name.toLowerCase() === updatedRow.name.toLowerCase() &&
            c.brand.toLowerCase() === updatedRow.brand.toLowerCase() &&
            c.type.toLowerCase() === updatedRow.type.toLowerCase()
          );
          
          if (match) {
            updatedRow.unit = match.unit;
            updatedRow.isMatched = true;
          } else {
            updatedRow.isMatched = false;
          }
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const handleSave = () => {
    const validRows = rows.filter(r => r.name !== '' && r.qty_out !== '' && r.notes !== '');
    if (validRows.length === 0) return toast.error('Belum ada data valid yang siap disimpan.');
    
    saveKeluar(validRows);
    toast.success('Disimpan: ' + validRows.length + ' baris transaksi');
    setRows([]);
  };

  return (
    <div>
      <div className="topbar" style={{ height: '54px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
          <h2 className="page-title">
            <PackageMinus size={20} color="#F59E0B" /> Catat Barang Keluar
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={addRow}>
            <Plus size={16} /> Tambah Baris Transaksi
          </button>
          {rows.length > 0 && <button className="btn btn-primary" onClick={handleSave}>Simpan</button>}
        </div>
      </div>

      <datalist id="catalog-names">
        {uniqueNames.map((n, i) => <option key={i} value={n} />)}
      </datalist>

      {/* Area Form Input */}
      {rows.length > 0 && (
        <div className="grid-container" style={{ overflowX: 'auto', marginBottom: '32px' }}>
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--primary-blue)" />
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Form Input Transaksi Baru</span>
          </div>
          <table className="grid-table" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Nama Barang</th>
                <th style={{ width: '15%' }}>Merek</th>
                <th style={{ width: '15%' }}>Tipe/Model</th>
                <th style={{ width: '10%' }}>Satuan</th>
                <th style={{ width: '10%', color: '#F59E0B' }}>- Jumlah Keluar</th>
                <th style={{ width: '10%' }}>Sumber Stok</th>
                <th style={{ width: '15%' }}>Peminjam / Keterangan</th>
                <th style={{ width: '5%', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rowId}>
                  <td>
                    <input type="text" className="cell-input" list="catalog-names" value={row.name} onChange={(e) => handleChange(row.rowId, 'name', e.target.value)} />
                  </td>
                  <td>
                    <input type="text" className="cell-input" value={row.brand} onChange={(e) => handleChange(row.rowId, 'brand', e.target.value)} />
                  </td>
                  <td>
                    <input type="text" className="cell-input" value={row.type} onChange={(e) => handleChange(row.rowId, 'type', e.target.value)} />
                  </td>
                  <td>
                    <input type="text" className="cell-input" value={row.unit} onChange={(e) => handleChange(row.rowId, 'unit', e.target.value)} readOnly={row.isMatched} style={{ backgroundColor: row.isMatched ? 'var(--bg-hover)' : 'transparent' }} />
                  </td>
                  <td>
                    <input type="number" className="cell-input" style={{ color: '#F59E0B', fontWeight: 'bold' }} value={row.qty_out} onChange={(e) => handleChange(row.rowId, 'qty_out', e.target.value)} min="1" />
                  </td>
                  <td>
                    <select className="cell-input" value={row.source} onChange={(e) => handleChange(row.rowId, 'source', e.target.value)}>
                      <option value="good">Stok Baik</option>
                      <option value="damaged">Stok Rusak</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" className="cell-input" value={row.notes} onChange={(e) => handleChange(row.rowId, 'notes', e.target.value)} placeholder="Contoh: Dipinjam Kelas 12A" />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-outline" onClick={() => removeRow(row.rowId)} style={{ padding: '6px', color: '#EF4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg-hover)', borderTop: '1px solid var(--border-color)' }}>
             <button className="btn btn-primary" onClick={handleSave}>Simpan Semua</button>
          </div>
        </div>
      )}

      {/* Area Tabel Riwayat */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: rows.length > 0 ? '0' : '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--text-muted)" /> Riwayat Barang Keluar / Dipakai
        </h3>
        <div>
          <CustomSelect value={filterMonth} onChange={setFilterMonth} options={monthOptions} width="180px" />
        </div>
      </div>

      <div className="grid-container" style={{ overflowX: 'auto' }}>
        <table className="grid-table" style={{ minWidth: '800px', width: '100%', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Tanggal</th>
              <th style={{ width: '25%' }}>Nama Barang</th>
              <th style={{ width: '15%' }}>Merek & Tipe</th>
              <th style={{ width: '15%' }}>Jumlah Keluar</th>
              <th style={{ width: '30%' }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada riwayat barang keluar pada periode ini.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => {
                const logDate = new Date(log.date);
                return (
                  <tr key={log.id} style={{ transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>
                      {logDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}<br/>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{logDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="cell-text" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                      {log.name}
                    </td>
                    <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>
                      {log.brand} {log.type}
                    </td>
                    <td className="cell-text" style={{ fontWeight: 'bold', color: '#EF4444' }}>
                      {log.qty_change} {log.unit}
                    </td>
                    <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>
                      {log.notes}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InputKeluar;
