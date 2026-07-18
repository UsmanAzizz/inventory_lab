import React, { useState } from 'react';
import { ArrowDownRight, Plus, Trash2 } from 'lucide-react';

const InputRusak = () => {
  // Master data barang
  const masterItems = [
    { id: '1', name: 'Monitor Samsung 24"', current_stock: 45 },
    { id: '2', name: 'Mouse Logitech B100', current_stock: 120 },
    { id: '3', name: 'Keyboard Fantech', current_stock: 80 },
  ];

  // Baris dinamis yang diinput user
  const [rows, setRows] = useState([
    { rowId: Date.now(), itemId: '', current_stock: 0, subtract_qty: '', notes: '' }
  ]);

  const addRow = () => {
    setRows([...rows, { rowId: Date.now(), itemId: '', current_stock: 0, subtract_qty: '', notes: '' }]);
  };

  const removeRow = (rowId) => {
    setRows(rows.filter(r => r.rowId !== rowId));
  };

  const handleChange = (rowId, field, value) => {
    setRows(rows.map(row => {
      if (row.rowId === rowId) {
        const updatedRow = { ...row, [field]: value };
        if (field === 'itemId') {
          const selectedItem = masterItems.find(i => i.id === value);
          updatedRow.current_stock = selectedItem ? selectedItem.current_stock : 0;
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const handleSave = () => {
    const validRows = rows.filter(r => r.itemId !== '' && r.subtract_qty !== '' && parseInt(r.subtract_qty) > 0);
    if (validRows.length === 0) return alert('Tidak ada data kerusakan/pengurangan yang valid.');
    
    console.log('Simpan Barang Rusak:', validRows);
    alert('Disimpan: ' + validRows.length + ' baris transaksi');
    setRows([{ rowId: Date.now(), itemId: '', current_stock: 0, subtract_qty: '', notes: '' }]);
  };

  return (
    <div>
      <div className="topbar">
        <h2 className="page-title">
          <ArrowDownRight size={20} color="#EF4444" /> Catat Barang Rusak / Keluar
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={addRow}>
            <Plus size={16} /> Tambah Baris
          </button>
          <button className="btn btn-accent" onClick={handleSave}>Simpan Perubahan</button>
        </div>
      </div>

      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Nama Barang</th>
              <th style={{ width: '15%' }}>Stok Sistem</th>
              <th style={{ width: '20%' }}>Jumlah Keluar (-Unit)</th>
              <th style={{ width: '35%' }}>Keterangan</th>
              <th style={{ width: '5%', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.rowId}>
                <td>
                  <select 
                    className="cell-input" 
                    value={row.itemId}
                    onChange={(e) => handleChange(row.rowId, 'itemId', e.target.value)}
                  >
                    <option value="" disabled>Pilih Barang...</option>
                    {masterItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </td>
                <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>
                  {row.itemId ? `${row.current_stock} Unit` : '-'}
                </td>
                <td>
                  <input 
                    type="number" 
                    className="cell-input" 
                    placeholder="Contoh: 2"
                    value={row.subtract_qty}
                    onChange={(e) => handleChange(row.rowId, 'subtract_qty', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    className="cell-input" 
                    placeholder="Keterangan..."
                    value={row.notes}
                    onChange={(e) => handleChange(row.rowId, 'notes', e.target.value)}
                  />
                </td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <button 
                    onClick={() => removeRow(row.rowId)}
                    style={{ 
                      background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                      opacity: rows.length === 1 ? 0.3 : 1
                    }}
                    disabled={rows.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InputRusak;
