import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const InputPembelian = () => {
  const [items, setItems] = useState([
    { id: '1', name: 'Monitor Samsung 24"', current_stock: 45, add_qty: '', notes: '' },
    { id: '2', name: 'Mouse Logitech B100', current_stock: 120, add_qty: '', notes: '' },
    { id: '3', name: 'Keyboard Fantech', current_stock: 80, add_qty: '', notes: '' },
  ]);

  const handleChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    const modifications = items.filter(i => i.add_qty !== '' && parseInt(i.add_qty) > 0);
    if (modifications.length === 0) return alert('Tidak ada data pembelian yang diisi.');
    
    console.log('Simpan Pembelian:', modifications);
    alert('Disimpan: ' + modifications.length + ' item');
  };

  return (
    <div>
      <div className="topbar">
        <h2 className="page-title">
          <ArrowUpRight size={20} color="#10B981" /> Catat Barang Masuk / Pembelian
        </h2>
        <button className="btn btn-accent" onClick={handleSave}>Simpan Semua Pembelian</button>
      </div>

      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Nama Barang</th>
              <th style={{ width: '15%' }}>Stok Sistem (Sblmnya)</th>
              <th style={{ width: '20%' }}>Jumlah Masuk (+Unit)</th>
              <th style={{ width: '40%' }}>Keterangan / No. Kuitansi</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="cell-text">{item.name}</td>
                <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>{item.current_stock} Unit</td>
                <td>
                  <input 
                    type="number" 
                    className="cell-input" 
                    placeholder="Contoh: 10"
                    value={item.add_qty}
                    onChange={(e) => handleChange(item.id, 'add_qty', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    className="cell-input" 
                    placeholder="INV-..."
                    value={item.notes}
                    onChange={(e) => handleChange(item.id, 'notes', e.target.value)}
                  />
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
