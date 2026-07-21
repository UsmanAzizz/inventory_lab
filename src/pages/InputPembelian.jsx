import React, { useState } from 'react';
import { ArrowUpRight, Plus, Trash2, Calendar, FileText } from 'lucide-react';
import { useMockDB } from '../store/FirebaseDBContext';
import { toTitleCase } from '../utils';
import toast from 'react-hot-toast';
import CustomSelect from '../components/CustomSelect';

const InputPembelian = () => {
  const { catalog, logs, savePembelian } = useMockDB();
  const [rows, setRows] = useState([]);

  // Filter Month Logic
  const currentMonthStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 7);
  const [filterMonth, setFilterMonth] = useState(currentMonthStr);

  const purchaseLogs = logs.filter(l => l.action === 'PURCHASE').sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const mappedLogs = purchaseLogs.map(log => {
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
      qty_in: '', 
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
    const validRows = rows.filter(r => r.name !== '' && r.qty_in !== '');
    if (validRows.length === 0) return toast.error('Belum ada data valid yang siap disimpan.');
    
    savePembelian(validRows);
    
    toast.success('Disimpan: ' + validRows.length + ' baris transaksi');
    setRows([]);
  };

  return (
    <div className="page-container">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
          <h2 className="page-title">
            <ArrowUpRight size={20} color="#10B981" /> Catat Barang Masuk (Pembelian)
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <CustomSelect 
            value={filterMonth} 
            onChange={setFilterMonth} 
            options={monthOptions} 
            width="160px"
          />
          <button className="btn btn-outline" onClick={addRow}>
            <Plus size={16} /> Tambah Baris Transaksi
          </button>
          {rows.length > 0 && <button className="btn btn-primary" onClick={handleSave}>Simpan</button>}
        </div>
      </div>

      <div className="page-content">

      <datalist id="catalog-names">
        {uniqueNames.map((n, i) => <option key={i} value={n} />)}
      </datalist>

      {/* Area Tabel Riwayat dan Input */}

      <div className="grid-container" style={{ overflowX: 'auto' }}>
        <table className="grid-table" style={{ minWidth: '700px', width: '100%', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Tanggal</th>
              <th style={{ width: '19%' }}>Nama Barang</th>
              <th style={{ width: '12%' }}>Merek</th>
              <th style={{ width: '12%' }}>Tipe/Model</th>
              <th style={{ width: '8%' }}>Satuan</th>
              <th style={{ width: '11%' }}>Jumlah</th>
              <th style={{ width: '20%' }}>Keterangan</th>
              <th style={{ width: '6%', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.rowId} style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                <td className="cell-text" style={{ verticalAlign: 'middle', position: 'relative', color: 'var(--text-secondary)' }}>
                  {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}<br/>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ position: 'absolute', bottom: '4px', right: '4px', display: 'inline-block', padding: '2px 6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '4px', fontSize: '9px', fontWeight: '600' }}>
                    Entri Baru
                  </span>
                </td>
                <td>
                  <input 
                    type="text" 
                    className="cell-input" 
                    list="catalog-names"
                    value={row.name}
                    onChange={(e) => handleChange(row.rowId, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <datalist id={`brands-${row.rowId}`}>
                    {(row.name ? [...new Set(catalog.filter(c => c.name.toLowerCase() === row.name.toLowerCase() && c.brand).map(c => c.brand))] : uniqueBrands).map((b, i) => <option key={i} value={b} />)}
                  </datalist>
                  <input 
                    type="text" 
                    className="cell-input" 
                    list={`brands-${row.rowId}`}
                    value={row.brand}
                    onChange={(e) => handleChange(row.rowId, 'brand', e.target.value)}
                  />
                </td>
                <td>
                  <datalist id={`types-${row.rowId}`}>
                    {(row.name ? [...new Set(catalog.filter(c => c.name.toLowerCase() === row.name.toLowerCase() && c.brand).map(c => c.type))] : uniqueTypes).map((t, i) => <option key={i} value={t} />)}
                  </datalist>
                  <input 
                    type="text" 
                    className="cell-input" 
                    list={`types-${row.rowId}`}
                    value={row.type}
                    onChange={(e) => handleChange(row.rowId, 'type', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    className="cell-input" 
                    value={row.unit}
                    onChange={(e) => handleChange(row.rowId, 'unit', e.target.value)}
                    readOnly={row.isMatched}
                    style={{ backgroundColor: row.isMatched ? 'var(--bg-hover)' : 'transparent' }}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    className="cell-input" 
                    style={{ color: '#10B981', fontWeight: 'bold' }}
                    value={row.qty_in}
                    onChange={(e) => handleChange(row.rowId, 'qty_in', e.target.value)}
                    min="1"
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    className="cell-input" 
                    value={row.notes}
                    onChange={(e) => handleChange(row.rowId, 'notes', e.target.value)}
                  />
                </td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <button onClick={() => removeRow(row.rowId)} style={{ padding: '6px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredLogs.length === 0 && rows.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada riwayat barang masuk pada periode ini.
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
                      {log.brand}
                    </td>
                    <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>
                      {log.type}
                    </td>
                    <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>
                      {log.unit}
                    </td>
                    <td className="cell-text" style={{ fontWeight: 'bold', color: '#10B981' }}>
                      +{String(log.qty_change).replace(/[^\d]/g, '')}
                    </td>
                    <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>
                      {log.notes}
                    </td>
                    <td className="cell-text" style={{ textAlign: 'center' }}>
                      {/* Placeholder for history action if needed */}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      </div>
    </div>
  );
};

export default InputPembelian;
