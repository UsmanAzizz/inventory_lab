import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

const InputFaktual = () => {
  const [rows, setRows] = useState([]); // Mulai dengan kosong sesuai instruksi

  const addRow = () => {
    setRows([...rows, { 
      rowId: Date.now(), 
      name: '', 
      brand: '', 
      type: '', 
      unit: 'Unit', 
      qty_good: '', 
      qty_damaged: '' 
    }]);
  };

  const removeRow = (rowId) => {
    setRows(rows.filter(r => r.rowId !== rowId));
  };

  const handleChange = (rowId, field, value) => {
    setRows(rows.map(row => {
      if (row.rowId === rowId) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleSave = () => {
    const validRows = rows.filter(r => r.name !== '' && (r.qty_good !== '' || r.qty_damaged !== ''));
    if (validRows.length === 0) return alert('Belum ada data valid yang diisi.');
    console.log('Simpan Audit Faktual:', validRows);
    alert('Disimpan: ' + validRows.length + ' baris barang');
    setRows([]); // Kosongkan lagi
  };

  return (
    <div>
      <div className="topbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h2 className="page-title">
            <CheckSquare size={20} color="var(--primary-blue)" /> Audit Faktual (Master Data)
          </h2>
          <button className="btn btn-accent" onClick={handleSave}>Simpan Semua</button>
        </div>
        
        <button className="btn btn-outline" onClick={addRow}>
          <Plus size={16} /> Tambah Baris Barang
        </button>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
          Belum ada data audit. Tekan <b>+ Tambah Baris Barang</b> di atas untuk mulai mendata inventaris.
        </div>
      ) : (
        <div className="grid-container" style={{ overflowX: 'auto' }}>
          <table className="grid-table" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Nama Barang</th>
                <th style={{ width: '15%' }}>Merek</th>
                <th style={{ width: '15%' }}>Tipe/Model</th>
                <th style={{ width: '10%' }}>Satuan</th>
                <th style={{ width: '12%', color: '#10B981' }}>Jml. Baik</th>
                <th style={{ width: '12%', color: '#EF4444' }}>Jml. Rusak</th>
                <th style={{ width: '15%' }}>Total</th>
                <th style={{ width: '6%', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const good = parseInt(row.qty_good) || 0;
                const damaged = parseInt(row.qty_damaged) || 0;
                const total = good + damaged;

                return (
                  <tr key={row.rowId}>
                    <td>
                      <input 
                        type="text" 
                        className="cell-input" 
                        placeholder="Contoh: Monitor"
                        value={row.name}
                        onChange={(e) => handleChange(row.rowId, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="cell-input" 
                        placeholder="Samsung"
                        value={row.brand}
                        onChange={(e) => handleChange(row.rowId, 'brand', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="cell-input" 
                        placeholder="24 Inch"
                        value={row.type}
                        onChange={(e) => handleChange(row.rowId, 'type', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="cell-input" 
                        placeholder="Unit, Pcs..."
                        value={row.unit}
                        onChange={(e) => handleChange(row.rowId, 'unit', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="cell-input" 
                        placeholder="0"
                        value={row.qty_good}
                        onChange={(e) => handleChange(row.rowId, 'qty_good', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="cell-input" 
                        placeholder="0"
                        value={row.qty_damaged}
                        onChange={(e) => handleChange(row.rowId, 'qty_damaged', e.target.value)}
                      />
                    </td>
                    <td className="cell-text" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {total} {row.unit}
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <button 
                        onClick={() => removeRow(row.rowId)}
                        style={{ 
                          background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
                        }}
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
      )}
    </div>
  );
};

export default InputFaktual;
