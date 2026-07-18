import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, List } from 'lucide-react';

const InputFaktual = () => {
  // Master data barang
  const masterItems = [
    { id: '1', name: 'Monitor Samsung 24"', current_stock: 45 },
    { id: '2', name: 'Mouse Logitech B100', current_stock: 120 },
    { id: '3', name: 'Keyboard Fantech', current_stock: 80 },
  ];

  const [rows, setRows] = useState([
    { rowId: Date.now(), itemId: '', current_stock: 0, actual_qty: '', notes: '' }
  ]);

  const addRow = () => {
    setRows([...rows, { rowId: Date.now(), itemId: '', current_stock: 0, actual_qty: '', notes: '' }]);
  };

  const removeRow = (rowId) => {
    setRows(rows.filter(r => r.rowId !== rowId));
  };

  const loadAllItems = () => {
    const allRows = masterItems.map((item, index) => ({
      rowId: Date.now() + index,
      itemId: item.id,
      current_stock: item.current_stock,
      actual_qty: item.current_stock.toString(),
      notes: ''
    }));
    setRows(allRows);
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
    const validRows = rows.filter(r => r.itemId !== '' && r.actual_qty !== '');
    if (validRows.length === 0) return alert('Belum ada data faktual yang diisi.');
    console.log('Simpan Audit Faktual:', validRows);
    alert('Disimpan: ' + validRows.length + ' baris audit');
    setRows([{ rowId: Date.now(), itemId: '', current_stock: 0, actual_qty: '', notes: '' }]);
  };

  return (
    <div>
      <div className="topbar">
        <h2 className="page-title">
          <CheckSquare size={20} color="var(--primary-blue)" /> Stok Opname (Rekap Fisik)
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={loadAllItems}>
            <List size={16} /> Muat Semua Barang
          </button>
          <button className="btn btn-outline" onClick={addRow}>
            <Plus size={16} /> Tambah Baris
          </button>
          <button className="btn btn-accent" onClick={handleSave}>Simpan Opname</button>
        </div>
      </div>

      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Nama Barang</th>
              <th style={{ width: '15%' }}>Stok Sistem</th>
              <th style={{ width: '15%' }}>Jumlah Fisik</th>
              <th style={{ width: '10%' }}>Selisih</th>
              <th style={{ width: '30%' }}>Keterangan</th>
              <th style={{ width: '5%', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const diff = row.actual_qty !== '' ? parseInt(row.actual_qty) - row.current_stock : null;
              return (
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
                      placeholder="0"
                      value={row.actual_qty}
                      onChange={(e) => handleChange(row.rowId, 'actual_qty', e.target.value)}
                    />
                  </td>
                  <td className="cell-text">
                    {diff !== null && diff !== 0 && !isNaN(diff) && (
                      <span className={`badge ${diff > 0 ? 'badge-green' : 'badge-red'}`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    )}
                    {diff === 0 && <span className="badge badge-blue">Klop</span>}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InputFaktual;
