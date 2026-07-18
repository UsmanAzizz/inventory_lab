import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, onSnapshot, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const FirebaseDBContext = createContext();

export const useMockDB = () => useContext(FirebaseDBContext); // Keeping the hook name same to avoid refactoring all components

export const FirebaseDBProvider = ({ children }) => {
  const [catalog, setCatalog] = useState([]);
  const [stock, setStock] = useState([]);
  const [logs, setLogs] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time Listeners
  useEffect(() => {
    let cLoaded = false, sLoaded = false, lLoaded = false, snLoaded = false;
    const checkLoading = () => {
      if (cLoaded && sLoaded && lLoaded && snLoaded) setLoading(false);
    };

    const unsubCatalog = onSnapshot(collection(db, 'catalog'), (snap) => {
      setCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      cLoaded = true; checkLoading();
    });
    const unsubStock = onSnapshot(collection(db, 'stock'), (snap) => {
      setStock(snap.docs.map(d => ({ itemId: d.id, ...d.data() })));
      sLoaded = true; checkLoading();
    });
    const unsubLogs = onSnapshot(collection(db, 'logs'), (snap) => {
      const parsedLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      parsedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(parsedLogs);
      lLoaded = true; checkLoading();
    });
    const unsubSnapshots = onSnapshot(collection(db, 'snapshots'), (snap) => {
      const parsedSnaps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      parsedSnaps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setSnapshots(parsedSnaps);
      snLoaded = true; checkLoading();
    });

    return () => {
      unsubCatalog();
      unsubStock();
      unsubLogs();
      unsubSnapshots();
    };
  }, []);

  const generateId = (name, brand, type) => {
    return `${name}_${brand}_${type}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  const createSnapshotBatch = (batch, title, newStock, newCatalog) => {
    const snapRef = doc(collection(db, 'snapshots'));
    batch.set(snapRef, {
      title,
      timestamp: new Date().toISOString(),
      stock_state: newStock,
      catalog_state: newCatalog
    });
  };

  const saveFaktual = async (rows) => {
    const batch = writeBatch(db);
    const latestSnapshot = snapshots.length > 0 ? snapshots[0] : null;
    let tempCatalog = latestSnapshot ? JSON.parse(JSON.stringify(latestSnapshot.catalog_state)) : JSON.parse(JSON.stringify(catalog));
    let tempStock = latestSnapshot ? JSON.parse(JSON.stringify(latestSnapshot.stock_state)) : JSON.parse(JSON.stringify(stock));

    rows.forEach(row => {
      const id = generateId(row.name, row.brand, row.type);
      
      // Catalog
      if (!tempCatalog.find(c => c.id === id)) {
        const item = { name: row.name, brand: row.brand, type: row.type, unit: row.unit };
        batch.set(doc(db, 'catalog', id), item);
        tempCatalog.push({ id, ...item });
      }

      // Stock
      const goodQty = parseInt(row.qty_good) || 0;
      const damagedQty = parseInt(row.qty_damaged) || 0;
      
      const existingStock = tempStock.find(s => s.itemId === id);
      const prevGood = existingStock ? existingStock.qty_good : 0;
      const prevDamaged = existingStock ? existingStock.qty_damaged : 0;

      const stockData = {
        qty_good: goodQty,
        qty_damaged: damagedQty,
        last_updated: new Date().toISOString()
      };
      batch.set(doc(db, 'stock', id), stockData);

      if (existingStock) {
        existingStock.qty_good = goodQty;
        existingStock.qty_damaged = damagedQty;
      } else {
        tempStock.push({ itemId: id, ...stockData });
      }

      // Logs
      const logRef = doc(collection(db, 'logs'));
      batch.set(logRef, {
        itemId: id,
        action: 'AUDIT',
        qty_change: `Good: ${prevGood} -> ${goodQty} | Damaged: ${prevDamaged} -> ${damagedQty}`,
        notes: 'Penyesuaian Stok Opname',
        date: new Date().toISOString()
      });
    });

    createSnapshotBatch(batch, 'Audit Faktual', tempStock, tempCatalog);
    await batch.commit();
  };

  const savePembelian = async (rows) => {
    const batch = writeBatch(db);
    const latestSnapshot = snapshots.length > 0 ? snapshots[0] : null;
    let tempCatalog = latestSnapshot ? JSON.parse(JSON.stringify(latestSnapshot.catalog_state)) : JSON.parse(JSON.stringify(catalog));
    let tempStock = latestSnapshot ? JSON.parse(JSON.stringify(latestSnapshot.stock_state)) : JSON.parse(JSON.stringify(stock));

    rows.forEach(row => {
      const id = generateId(row.name, row.brand, row.type);
      const addQty = parseInt(row.qty_in) || 0;

      if (!tempCatalog.find(c => c.id === id)) {
        const item = { name: row.name, brand: row.brand, type: row.type, unit: row.unit };
        batch.set(doc(db, 'catalog', id), item);
        tempCatalog.push({ id, ...item });
      }

      const existingStockIndex = tempStock.findIndex(s => s.itemId === id);
      
      if (existingStockIndex >= 0) {
        tempStock[existingStockIndex].qty_good += addQty;
        tempStock[existingStockIndex].last_updated = new Date().toISOString();
        batch.set(doc(db, 'stock', id), {
          qty_good: tempStock[existingStockIndex].qty_good,
          qty_damaged: tempStock[existingStockIndex].qty_damaged,
          last_updated: tempStock[existingStockIndex].last_updated
        }, { merge: true });
      } else {
        const stockData = {
          qty_good: addQty,
          qty_damaged: 0,
          last_updated: new Date().toISOString()
        };
        batch.set(doc(db, 'stock', id), stockData);
        tempStock.push({ itemId: id, ...stockData });
      }

      const logRef = doc(collection(db, 'logs'));
      batch.set(logRef, {
        itemId: id,
        action: 'PURCHASE',
        qty_change: `+${addQty} (Good)`,
        notes: row.notes || 'Pembelian Barang Masuk',
        date: row.date || new Date().toISOString()
      });
    });

    createSnapshotBatch(batch, 'Barang Masuk', tempStock, tempCatalog);
    await batch.commit();
  };

  const saveRusak = async (rows) => {
    const batch = writeBatch(db);
    const latestSnapshot = snapshots.length > 0 ? snapshots[0] : null;
    let tempCatalog = latestSnapshot ? JSON.parse(JSON.stringify(latestSnapshot.catalog_state)) : JSON.parse(JSON.stringify(catalog));
    let tempStock = latestSnapshot ? JSON.parse(JSON.stringify(latestSnapshot.stock_state)) : JSON.parse(JSON.stringify(stock));

    rows.forEach(row => {
      const id = generateId(row.name, row.brand, row.type);
      const outQty = parseInt(row.qty_out) || 0;

      if (!tempCatalog.find(c => c.id === id)) {
        const item = { name: row.name, brand: row.brand, type: row.type, unit: row.unit };
        batch.set(doc(db, 'catalog', id), item);
        tempCatalog.push({ id, ...item });
      }

      const existingStockIndex = tempStock.findIndex(s => s.itemId === id);
      
      if (existingStockIndex >= 0) {
        tempStock[existingStockIndex].qty_good = Math.max(0, tempStock[existingStockIndex].qty_good - outQty);
        tempStock[existingStockIndex].last_updated = new Date().toISOString();
        
        batch.set(doc(db, 'stock', id), {
          qty_good: tempStock[existingStockIndex].qty_good,
          qty_damaged: tempStock[existingStockIndex].qty_damaged,
          last_updated: tempStock[existingStockIndex].last_updated
        }, { merge: true });
      } else {
        const stockData = {
          qty_good: 0,
          qty_damaged: 0,
          last_updated: new Date().toISOString()
        };
        batch.set(doc(db, 'stock', id), stockData);
        tempStock.push({ itemId: id, ...stockData });
      }

      const logRef = doc(collection(db, 'logs'));
      batch.set(logRef, {
        itemId: id,
        action: 'DAMAGE',
        qty_change: `-${outQty} (Good)`,
        notes: row.notes || 'Pencatatan Barang Keluar/Rusak',
        date: row.date || new Date().toISOString()
      });
    });

    createSnapshotBatch(batch, 'Barang Rusak/Keluar', tempStock, tempCatalog);
    await batch.commit();
  };

  const addCatalogItem = async (newItemData) => {
    const id = generateId(newItemData.name, newItemData.brand, newItemData.type);
    if (catalog.find(c => c.id === id)) {
      alert("Barang dengan Nama, Merek, dan Tipe ini sudah ada di Master Data.");
      return false;
    }

    const batch = writeBatch(db);
    batch.set(doc(db, 'catalog', id), newItemData);
    
    const stockData = { qty_good: 0, qty_damaged: 0, last_updated: new Date().toISOString() };
    batch.set(doc(db, 'stock', id), stockData);

    await batch.commit();
    return true;
  };

  const updateCatalogItem = async (id, updatedData) => {
    const batch = writeBatch(db);
    batch.update(doc(db, 'catalog', id), updatedData);
    
    await batch.commit();
    return true;
  };

  const deleteCatalogItem = async (itemId) => {
    if(window.confirm("Yakin ingin menghapus barang ini dari Master Data secara permanen? Stoknya juga akan hilang.")) {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'catalog', itemId));
      batch.delete(doc(db, 'stock', itemId));

      await batch.commit();
    }
  };

  const getDashboardData = (customStock = null, customCatalog = null) => {
    const targetStock = customStock || stock;
    const targetCatalog = customCatalog || catalog;
    const totalItems = targetCatalog.length;
    const totalGood = targetStock.reduce((sum, s) => sum + s.qty_good, 0);
    const totalDamaged = targetStock.reduce((sum, s) => sum + s.qty_damaged, 0);
    return { totalItems, totalGood, totalDamaged };
  };

  const getFullInventory = (customStock = null, customCatalog = null) => {
    const targetStock = customStock || stock;
    const targetCatalog = customCatalog || catalog;
    return targetCatalog.map(item => {
      const s = targetStock.find(st => st.itemId === item.id) || { qty_good: 0, qty_damaged: 0 };
      return { ...item, ...s };
    });
  };

  const clearData = async () => {
    if(window.confirm("Hapus seluruh pangkalan data secara massal? Ini tidak bisa dikembalikan.")) {
      const batch = writeBatch(db);
      catalog.forEach(c => batch.delete(doc(db, 'catalog', c.id)));
      stock.forEach(s => batch.delete(doc(db, 'stock', s.itemId)));
      logs.forEach(l => batch.delete(doc(db, 'logs', l.id)));
      snapshots.forEach(s => batch.delete(doc(db, 'snapshots', s.id)));
      await batch.commit();
    }
  };

  return (
    <FirebaseDBContext.Provider value={{ 
      catalog, stock, logs, snapshots, loading,
      saveFaktual, savePembelian, saveRusak, 
      getDashboardData, getFullInventory, clearData, deleteCatalogItem,
      addCatalogItem, updateCatalogItem
    }}>
      {children}
    </FirebaseDBContext.Provider>
  );
};
