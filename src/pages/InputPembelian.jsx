import React, { useState } from 'react';
import { ArrowUpRight, Plus, Trash2 } from 'lucide-react';

const InputPembelian = () => {
  // Master data barang (nantinya dari Firebase)
  const masterItems = [
    { id: '1', name: 'Monitor Samsung 24"', current_stock: 45 },
    { id: '2', name: 'Mouse Logitech B100', current_stock: 120 },
    { id: '3', name: 'Keyboard Fantech', current_stock: 80 },
  ];

  // Baris dinamis yang diinput user
  const [rows, setRows] = useState([
    { rowId: Date.now(), itemId: '', current_stock: 0, add_qty: '', notes: '' }
  ]);

  const addRow = () => {
    setRows([...rows, { rowId: Date.now(), itemId: '', current_stock: 0, add_qty: '', notes: '' }]);
  };

  const removeRow = (rowId) => {
    setRows(rows.filter(r => r.rowId !== rowId));
  };

  const handleChange = (rowId, field, value) => {
    setRows(rows.map(row => {
      if (row.rowId === rowId) {
        const updatedRow = { ...row, [field]: value };
        // Jika user memilih barang, otomatis update stok sistem
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
    const validRows = rows.filter(r => r.itemId !== '' && r.add_qty !== '' && parseInt(r.add_qty) > 0);
    if (validRows.length === 0) return alert('Tidak ada data valid yang siap disimpan.');
    
    console.log('Simpan Pembelian:', validRows);
    alert('Disimpan: ' + validRows.length + ' baris transaksi');
    // Kosongkan form setelah simpan
    setRows([{ rowId: Date.now(), itemId: '', current_stock: 0, add_qty: '', notes: '' }]);
  };

  return (
    <div>
      <div className="topbar">
        <h2 className="page-title">
          <ArrowUpRight size={20} color="#10B981" /> Catat Barang Masuk / Pembelian
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={addRow}>
            <Plus size={16} /> Tambah Baris
          </button>
          <button className="btn btn-accent" onClick={handleSave}>Simpan Transaksi</button>
        </div>
      </div>

      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Nama Barang</th>
              <th style={{ width: '15%' }}>Stok Sistem (Sblmnya)</th>
              <th style={{ width: '20%' }}>Jumlah Masuk (+Unit)</th>
              <th style={{ width: '35%' }}>Keterangan / No. Kuitansi</th>
              <th style={{ width: '5%', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
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
                    placeholder="Contoh: 10"
                    value={row.add_qty}
                    onChange={(e) => handleChange(row.rowId, 'add_qty', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    className="cell-input" 
                    placeholder="INV-..."
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

export default InputPembelian;
