import React, { useState } from 'react';
import { ArrowDownRight, Plus, Trash2 } from 'lucide-react';

import { useMockDB } from '../store/FirebaseDBContext';
import { toTitleCase } from '../utils';
import toast from 'react-hot-toast';

const InputRusak = () => {
  const { catalog, saveRusak } = useMockDB();
  const [rows, setRows] = useState([]);

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
        
        // Autocomplete check
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
    const validRows = rows.filter(r => r.name !== '' && r.qty_out !== '');
    if (validRows.length === 0) return toast.error('Belum ada data kerusakan/keluar yang valid.');
    
    saveRusak(validRows);
    
    toast.success('Disimpan: ' + validRows.length + ' baris transaksi');
    setRows([]);
  };

  return (
    <div>
      <div className="topbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h2 className="page-title">
            <ArrowDownRight size={20} color="#EF4444" /> Catat Barang Rusak
          </h2>
          <button className="btn btn-success" onClick={handleSave}>Simpan</button>
        </div>
        <button className="btn btn-outline" onClick={addRow}>
          <Plus size={16} /> Tambah Baris Barang
        </button>
      </div>

      <datalist id="catalog-names">
        {uniqueNames.map((n, i) => <option key={i} value={n} />)}
      </datalist>
      <datalist id="catalog-brands">
        {uniqueBrands.map((b, i) => <option key={i} value={b} />)}
      </datalist>
      <datalist id="catalog-types">
        {uniqueTypes.map((t, i) => <option key={i} value={t} />)}
      </datalist>

      {rows.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
          Belum ada data barang rusak. Tekan <b>+ Tambah Baris Barang</b> untuk memulai.
        </div>
      ) : (
        <div className="grid-container" style={{ overflowX: 'auto' }}>
          <table className="grid-table" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Nama Barang</th>
                <th style={{ width: '15%' }}>Merek</th>
                <th style={{ width: '15%' }}>Tipe/Model</th>
                <th style={{ width: '10%' }}>Satuan</th>
                <th style={{ width: '15%', color: '#EF4444' }}>Jumlah Rusak</th>
                <th style={{ width: '25%' }}>Keterangan</th>
                <th style={{ width: '5%', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rowId}>
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
                    <input 
                      type="text" 
                      className="cell-input" 
                      list="catalog-brands"
                      value={row.brand}
                      onChange={(e) => handleChange(row.rowId, 'brand', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="cell-input" 
                      list="catalog-types"
                      value={row.type}
                      onChange={(e) => handleChange(row.rowId, 'type', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="cell-input" 
                      value={row.unit}
                      disabled={row.isMatched}
                      onChange={(e) => handleChange(row.rowId, 'unit', e.target.value)}
                      style={{ color: row.isMatched ? 'var(--text-muted)' : 'var(--text-primary)' }}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      min="0"
                      className="cell-input" 
                      value={row.qty_out}
                      onChange={(e) => handleChange(row.rowId, 'qty_out', e.target.value)}
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
                    <button 
                      onClick={() => removeRow(row.rowId)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InputRusak;
