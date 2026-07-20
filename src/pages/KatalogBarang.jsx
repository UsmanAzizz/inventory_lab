import React, { useState } from 'react';
import { Box, Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import { useMockDB } from '../store/FirebaseDBContext';
import { toTitleCase } from '../utils';
import toast from 'react-hot-toast';

const KatalogBarang = () => {
  const { catalog, deleteCatalogItem, addCatalogItem, updateCatalogItem, loading } = useMockDB();
  
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', brand: '', type: '', unit: '' });
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', brand: '', type: '', unit: 'Unit' });

  const uniqueNames = [...new Set(catalog.map(c => c.name))].filter(Boolean);
  const uniqueBrands = [...new Set(catalog.map(c => c.brand))].filter(Boolean);
  const uniqueTypes = [...new Set(catalog.map(c => c.type))].filter(Boolean);

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
      toast.error("Nama barang wajib diisi!");
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
      toast.error("Nama barang wajib diisi!");
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
      <div className="topbar" style={{ height: '54px' }}>
        <h2 className="page-title">
          <Box size={20} color="var(--primary-blue)" /> Katalog Master Barang
        </h2>
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
              <th className="col-name">Nama Barang</th>
              <th className="col-brand-kat">Merek</th>
              <th className="col-model-kat">Tipe/Model</th>
              <th className="col-unit-kat">Satuan</th>
              <th className="col-action">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                <td>
                  <datalist id="catalog-names">
                    {uniqueNames.map((n, i) => <option key={i} value={n} />)}
                  </datalist>
                  <input className="cell-input" autoFocus list="catalog-names" placeholder="Nama barang..." value={addForm.name} onChange={e => setAddForm({...addForm, name: toTitleCase(e.target.value)})} />
                </td>
                <td>
                  <datalist id="add-brands">
                    {(addForm.name ? [...new Set(catalog.filter(c => c.name.toLowerCase() === addForm.name.toLowerCase() && c.brand).map(c => c.brand))] : uniqueBrands).map((b, i) => <option key={i} value={b} />)}
                  </datalist>
                  <input className="cell-input" list="add-brands" placeholder="Merek..." value={addForm.brand} onChange={e => setAddForm({...addForm, brand: toTitleCase(e.target.value)})} />
                </td>
                <td>
                  <datalist id="add-types">
                    {(addForm.name ? [...new Set(catalog.filter(c => c.name.toLowerCase() === addForm.name.toLowerCase() && c.brand).map(c => c.type))] : uniqueTypes).map((t, i) => <option key={i} value={t} />)}
                  </datalist>
                  <input className="cell-input" list="add-types" placeholder="Tipe/Model..." value={addForm.type} onChange={e => setAddForm({...addForm, type: toTitleCase(e.target.value)})} />
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
                        <input className="cell-input" autoFocus list="catalog-names" value={editForm.name} onChange={e => setEditForm({...editForm, name: toTitleCase(e.target.value)})} />
                      </td>
                      <td>
                        <datalist id={`edit-brands-${item.id}`}>
                          {(editForm.name ? [...new Set(catalog.filter(c => c.name.toLowerCase() === editForm.name.toLowerCase() && c.brand).map(c => c.brand))] : uniqueBrands).map((b, i) => <option key={i} value={b} />)}
                        </datalist>
                        <input className="cell-input" list={`edit-brands-${item.id}`} value={editForm.brand} onChange={e => setEditForm({...editForm, brand: toTitleCase(e.target.value)})} />
                      </td>
                      <td>
                        <datalist id={`edit-types-${item.id}`}>
                          {(editForm.name ? [...new Set(catalog.filter(c => c.name.toLowerCase() === editForm.name.toLowerCase() && c.brand).map(c => c.type))] : uniqueTypes).map((t, i) => <option key={i} value={t} />)}
                        </datalist>
                        <input className="cell-input" list={`edit-types-${item.id}`} value={editForm.type} onChange={e => setEditForm({...editForm, type: toTitleCase(e.target.value)})} />
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
