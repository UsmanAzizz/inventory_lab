import React, { useState } from 'react';
import { BookOpen, Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import { useMockDB } from '../store/FirebaseDBContext';
import { toTitleCase } from '../utils';

const KatalogBarang = () => {
  const { catalog, deleteCatalogItem, addCatalogItem, updateCatalogItem, loading } = useMockDB();
  
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', brand: '', type: '', unit: '' });
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', brand: '', type: '', unit: 'Unit' });

  const startEdit = (item) => {
    setEditId(item.id);
    setEditForm({ name: item.name, brand: item.brand, type: item.type, unit: item.unit });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', brand: '', type: '', unit: '' });
  };

  const saveEdit = () => {
    if (!editForm.name) {
      alert("Nama barang wajib diisi!");
      return;
    }
    updateCatalogItem(editId, editForm);
    setEditId(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setAddForm({ name: '', brand: '', type: '', unit: 'Unit' });
  };

  const saveAdd = () => {
    if (!addForm.name) {
      alert("Nama barang wajib diisi!");
      return;
    }
    const success = addCatalogItem(addForm);
    if (success) {
      setIsAdding(false);
      setAddForm({ name: '', brand: '', type: '', unit: 'Unit' });
    }
  };

  return (
    <div>
      <div className="topbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h2 className="page-title">
            <BookOpen size={20} color="var(--primary-blue)" /> Katalog Master Barang
          </h2>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus size={16} /> Tambah Barang
        </button>
      </div>

      <div className="grid-container" style={{ overflowX: 'auto', marginTop: '24px' }}>
        <table className="grid-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Nama Barang</th>
              <th style={{ width: '25%' }}>Merek</th>
              <th style={{ width: '25%' }}>Tipe/Model</th>
              <th style={{ width: '10%' }}>Satuan</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                <td>
                  <input className="cell-input" autoFocus placeholder="Nama barang..." value={addForm.name} onChange={e => setAddForm({...addForm, name: toTitleCase(e.target.value)})} />
                </td>
                <td>
                  <input className="cell-input" placeholder="Merek..." value={addForm.brand} onChange={e => setAddForm({...addForm, brand: toTitleCase(e.target.value)})} />
                </td>
                <td>
                  <input className="cell-input" placeholder="Tipe/Model..." value={addForm.type} onChange={e => setAddForm({...addForm, type: toTitleCase(e.target.value)})} />
                </td>
                <td>
                  <input className="cell-input" placeholder="Satuan..." value={addForm.unit} onChange={e => setAddForm({...addForm, unit: toTitleCase(e.target.value)})} />
                </td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={saveAdd} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer' }} title="Simpan">
                      <Check size={18} />
                    </button>
                    <button onClick={cancelAdd} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Batal">
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            
            {loading && !isAdding ? (
              <tr>
                <td colSpan="5" className="cell-text" style={{ textAlign: 'center', color: 'var(--primary-blue)', padding: '32px 0' }}>
                  Sedang memuat data dari pangkalan data...
                </td>
              </tr>
            ) : catalog.length === 0 && !isAdding ? (
              <tr>
                <td colSpan="5" className="cell-text" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada Master Data tercatat di katalog.
                </td>
              </tr>
            ) : (
              catalog.map(item => {
                if (editId === item.id) {
                  return (
                    <tr key={item.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                      <td>
                        <input className="cell-input" autoFocus value={editForm.name} onChange={e => setEditForm({...editForm, name: toTitleCase(e.target.value)})} />
                      </td>
                      <td>
                        <input className="cell-input" value={editForm.brand} onChange={e => setEditForm({...editForm, brand: toTitleCase(e.target.value)})} />
                      </td>
                      <td>
                        <input className="cell-input" value={editForm.type} onChange={e => setEditForm({...editForm, type: toTitleCase(e.target.value)})} />
                      </td>
                      <td>
                        <input className="cell-input" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: toTitleCase(e.target.value)})} />
                      </td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={saveEdit} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer' }} title="Simpan">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Batal">
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                return (
                  <tr key={item.id}>
                    <td className="cell-text" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{item.name}</td>
                    <td className="cell-text">{item.brand}</td>
                    <td className="cell-text">{item.type}</td>
                    <td className="cell-text"><span className="badge badge-blue">{item.unit}</span></td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => startEdit(item)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer' }}
                          title="Edit Barang"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteCatalogItem(item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                          title="Hapus Barang"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KatalogBarang;
