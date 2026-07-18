import React, { useState } from 'react';
import { ArrowDownRight } from 'lucide-react';

const InputRusak = () => {
  const [items, setItems] = useState([
    { id: '1', name: 'Monitor Samsung 24"', current_stock: 45, subtract_qty: '', notes: '' },
    { id: '2', name: 'Mouse Logitech B100', current_stock: 120, subtract_qty: '', notes: '' },
    { id: '3', name: 'Keyboard Fantech', current_stock: 80, subtract_qty: '', notes: '' },
  ]);

  const handleChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    const modifications = items.filter(i => i.subtract_qty !== '' && parseInt(i.subtract_qty) > 0);
    if (modifications.length === 0) return alert('Tidak ada data kerusakan yang diisi.');
    
    console.log('Simpan Barang Rusak:', modifications);
    alert('Disimpan: ' + modifications.length + ' item');
  };

  return (
    <div>
      <div className="topbar">
        <h2 className="page-title">
          <ArrowDownRight size={20} color="#EF4444" /> Catat Barang Rusak / Habis Pakai
        </h2>
        <button className="btn btn-accent" onClick={handleSave}>Simpan Semua Perubahan</button>
      </div>

      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Nama Barang</th>
              <th style={{ width: '15%' }}>Stok Sistem</th>
              <th style={{ width: '20%' }}>Jumlah Rusak / Keluar</th>
              <th style={{ width: '40%' }}>Keterangan</th>
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
                    placeholder="Contoh: 2"
                    value={item.subtract_qty}
                    onChange={(e) => handleChange(item.id, 'subtract_qty', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    className="cell-input" 
                    placeholder="Keterangan..."
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

export default InputRusak;
