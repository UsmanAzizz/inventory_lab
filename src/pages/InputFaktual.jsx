import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

import { useMockDB } from '../store/MockDBContext';

const InputFaktual = () => {
  const { catalog, saveFaktual, getFullInventory } = useMockDB();
  const [rows, setRows] = useState([]); // Mulai dengan kosong sesuai instruksi

  // Datalist options
  const uniqueNames = [...new Set(catalog.map(c => c.name))].filter(Boolean);
  const uniqueBrands = [...new Set(catalog.map(c => c.brand))].filter(Boolean);
  const uniqueTypes = [...new Set(catalog.map(c => c.type))].filter(Boolean);

  const addRow = () => {
    setRows([{ 
      rowId: Date.now(), 
      name: '', 
      brand: '', 
      type: '', 
      unit: 'Unit', 
      qty_good: '', 
      qty_damaged: '',
      isMatched: false
    }, ...rows]);
  };

  const loadLatestData = () => {
    const inventory = getFullInventory();
    if (inventory.length === 0) {
      alert('Belum ada data stok/katalog sebelumnya.');
      return;
    }
    
    const newRows = inventory.map(item => ({
      rowId: Date.now() + Math.random(),
      name: item.name,
      brand: item.brand,
      type: item.type,
      type: item.type,
      unit: item.unit,
      qty_good: item.qty_good,
      qty_damaged: item.qty_damaged,
      isMatched: true // Coming from inventory, so it's matched
    }));
    
    setRows(newRows);
  };

  const removeRow = (rowId) => {
    setRows(rows.filter(r => r.rowId !== rowId));
  };

  const handleChange = (rowId, field, value) => {
    setRows(rows.map(row => {
      if (row.rowId === rowId) {
        const updatedRow = { ...row, [field]: value };
        
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
    const validRows = rows.filter(r => r.name !== '' && (r.qty_good !== '' || r.qty_damaged !== ''));
    if (validRows.length === 0) return alert('Belum ada data valid yang diisi.');
    
    saveFaktual(validRows);
    
    alert('Disimpan: ' + validRows.length + ' baris barang ke Master Data');
    setRows([]); // Kosongkan lagi
  };

  return (
    <div>
      <div className="topbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h2 className="page-title">
            <CheckSquare size={20} color="var(--primary-blue)" /> Audit Faktual (Master Data)
          </h2>
          <button className="btn btn-success" onClick={handleSave}>Simpan</button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={loadLatestData}>
            Muat Data Terakhir
          </button>
          <button className="btn btn-outline" onClick={addRow}>
            <Plus size={16} /> Tambah Baris Barang
          </button>
        </div>
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
                <th style={{ width: '15%', textAlign: 'center' }}>Total</th>
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
                        value={row.qty_good}
                        onChange={(e) => handleChange(row.rowId, 'qty_good', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="0"
                        className="cell-input" 
                        value={row.qty_damaged}
                        onChange={(e) => handleChange(row.rowId, 'qty_damaged', e.target.value)}
                      />
                    </td>
                    <td className="cell-text" style={{ fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center' }}>
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
