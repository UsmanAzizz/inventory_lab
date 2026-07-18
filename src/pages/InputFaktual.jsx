import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';

const InputFaktual = () => {
  const [items, setItems] = useState([
    { id: '1', name: 'Monitor Samsung 24"', current_stock: 45, actual_qty: '', notes: '' },
    { id: '2', name: 'Mouse Logitech B100', current_stock: 120, actual_qty: '', notes: '' },
    { id: '3', name: 'Keyboard Fantech', current_stock: 80, actual_qty: '', notes: '' },
  ]);

  const handleChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleUseLastData = () => {
    setItems(items.map(item => ({
      ...item,
      actual_qty: item.current_stock.toString()
    })));
  };

  const handleSave = () => {
    const modifications = items.filter(i => i.actual_qty !== '');
    if (modifications.length === 0) return alert('Belum ada data faktual yang diisi.');
    console.log('Simpan Audit Faktual:', modifications);
    alert('Disimpan: ' + modifications.length + ' riwayat baru');
  };

  return (
    <div>
      <div className="topbar">
        <h2 className="page-title">
          <CheckSquare size={20} color="var(--primary-blue)" /> Audit Faktual
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={handleUseLastData}>Isi Semua dgn Data Terakhir</button>
          <button className="btn btn-accent" onClick={handleSave}>Simpan Faktual</button>
        </div>
      </div>

      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Nama Barang</th>
              <th style={{ width: '15%' }}>Stok Sistem (Terakhir)</th>
              <th style={{ width: '20%' }}>Jumlah Fisik (Faktual)</th>
              <th style={{ width: '10%' }}>Selisih</th>
              <th style={{ width: '30%' }}>Keterangan / Catatan</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const diff = item.actual_qty !== '' ? parseInt(item.actual_qty) - item.current_stock : null;
              return (
                <tr key={item.id}>
                  <td className="cell-text">{item.name}</td>
                  <td className="cell-text" style={{ color: 'var(--text-secondary)' }}>{item.current_stock} Unit</td>
                  <td>
                    <input 
                      type="number" 
                      className="cell-input" 
                      placeholder="0"
                      value={item.actual_qty}
                      onChange={(e) => handleChange(item.id, 'actual_qty', e.target.value)}
                    />
                  </td>
                  <td className="cell-text">
                    {diff !== null && diff !== 0 && (
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
                      value={item.notes}
                      onChange={(e) => handleChange(item.id, 'notes', e.target.value)}
                    />
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
