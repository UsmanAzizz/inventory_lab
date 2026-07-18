import React, { createContext, useContext, useState, useEffect } from 'react';

const MockDBContext = createContext();

export const useMockDB = () => useContext(MockDBContext);

export const MockDBProvider = ({ children }) => {
  // Load initial state from localStorage to persist across reloads
  const [catalog, setCatalog] = useState(() => JSON.parse(localStorage.getItem('lab_catalog')) || []);
  const [stock, setStock] = useState(() => JSON.parse(localStorage.getItem('lab_stock')) || []);
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('lab_logs')) || []);
  const [snapshots, setSnapshots] = useState(() => JSON.parse(localStorage.getItem('lab_snapshots')) || []);

  useEffect(() => {
    localStorage.setItem('lab_catalog', JSON.stringify(catalog));
    localStorage.setItem('lab_stock', JSON.stringify(stock));
    localStorage.setItem('lab_logs', JSON.stringify(logs));
    localStorage.setItem('lab_snapshots', JSON.stringify(snapshots));
  }, [catalog, stock, logs, snapshots]);

  const createSnapshot = (title, newStock, newCatalog) => {
    const snap = {
      id: Date.now().toString(),
      title,
      timestamp: new Date().toISOString(),
      stock_state: JSON.parse(JSON.stringify(newStock)),
      catalog_state: JSON.parse(JSON.stringify(newCatalog))
    };
    setSnapshots(prev => [...prev, snap]);
  };

  // Helper to generate a consistent ID
  const generateId = (name, brand, type) => {
    return `${name}_${brand}_${type}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  // Helper to find or create an item in catalog synchronously during a transaction
  const findOrCreateItem = (name, brand, type, unit, currentCatalog) => {
    const id = generateId(name, brand, type);
    let item = currentCatalog.find(i => i.id === id);
    if (!item) {
      item = { id, name, brand, type, unit };
      currentCatalog.push(item);
    }
    return item;
  };

  // Prioritas 1: Audit Faktual (Overwrite stock)
  const saveFaktual = (rows) => {
    const newLogs = [];
    let updatedStock = [...stock];
    let updatedCatalog = [...catalog];

    rows.forEach(row => {
      const item = findOrCreateItem(row.name, row.brand, row.type, row.unit, updatedCatalog);
      
      const goodQty = parseInt(row.qty_good) || 0;
      const damagedQty = parseInt(row.qty_damaged) || 0;

      // Find existing stock
      const existingStockIndex = updatedStock.findIndex(s => s.itemId === item.id);
      
      let prevGood = 0;
      let prevDamaged = 0;

      if (existingStockIndex >= 0) {
        prevGood = updatedStock[existingStockIndex].qty_good;
        prevDamaged = updatedStock[existingStockIndex].qty_damaged;
        
        // Overwrite
        updatedStock[existingStockIndex] = {
          ...updatedStock[existingStockIndex],
          qty_good: goodQty,
          qty_damaged: damagedQty,
          last_updated: new Date().toISOString()
        };
      } else {
        // Create new stock entry
        updatedStock.push({
          itemId: item.id,
          qty_good: goodQty,
          qty_damaged: damagedQty,
          last_updated: new Date().toISOString()
        });
      }

      // Log the action
      newLogs.push({
        id: Date.now() + Math.random().toString(),
        itemId: item.id,
        action: 'AUDIT',
        qty_change: `Good: ${prevGood} -> ${goodQty} | Damaged: ${prevDamaged} -> ${damagedQty}`,
        notes: 'Penyesuaian Stok Opname',
        date: new Date().toISOString()
      });
    });

    createSnapshot('Audit Faktual', updatedStock, updatedCatalog);
    setCatalog(updatedCatalog);
    setStock(updatedStock);
    setLogs(prev => [...newLogs, ...prev]);
  };

  // Prioritas 2: Pembelian (Add to good stock)
  const savePembelian = (rows) => {
    const newLogs = [];
    let updatedStock = [...stock];
    let updatedCatalog = [...catalog];

    rows.forEach(row => {
      const item = findOrCreateItem(row.name, row.brand, row.type, row.unit, updatedCatalog);
      const addQty = parseInt(row.qty_in) || 0;

      const existingStockIndex = updatedStock.findIndex(s => s.itemId === item.id);
      
      if (existingStockIndex >= 0) {
        updatedStock[existingStockIndex].qty_good += addQty;
        updatedStock[existingStockIndex].last_updated = new Date().toISOString();
      } else {
        updatedStock.push({
          itemId: item.id,
          qty_good: addQty,
          qty_damaged: 0,
          last_updated: new Date().toISOString()
        });
      }

      newLogs.push({
        id: Date.now() + Math.random().toString(),
        itemId: item.id,
        action: 'PURCHASE',
        qty_change: `+${addQty} (Good)`,
        notes: row.notes || 'Pembelian Barang Masuk',
        date: new Date().toISOString()
      });
    });

    createSnapshot('Barang Masuk', updatedStock, updatedCatalog);
    setCatalog(updatedCatalog);
    setStock(updatedStock);
    setLogs(prev => [...newLogs, ...prev]);
  };

  // Prioritas 2: Rusak/Keluar (Subtract from good, optionally add to damaged)
  // For UI logic: If user enters qty_out, we subtract from good.
  const saveRusak = (rows) => {
    const newLogs = [];
    let updatedStock = [...stock];
    let updatedCatalog = [...catalog];

    rows.forEach(row => {
      const item = findOrCreateItem(row.name, row.brand, row.type, row.unit, updatedCatalog);
      const outQty = parseInt(row.qty_out) || 0;

      const existingStockIndex = updatedStock.findIndex(s => s.itemId === item.id);
      
      if (existingStockIndex >= 0) {
        // Subtract from good, add to damaged (as an assumption for "Rusak")
        // If it's just "Keluar" (thrown away), they might just want to subtract.
        // For now, let's just subtract from Good stock as the primary action.
        updatedStock[existingStockIndex].qty_good = Math.max(0, updatedStock[existingStockIndex].qty_good - outQty);
        updatedStock[existingStockIndex].qty_damaged += outQty; 
        updatedStock[existingStockIndex].last_updated = new Date().toISOString();
      } else {
        // If it didn't exist, we just register it as damaged
        updatedStock.push({
          itemId: item.id,
          qty_good: 0,
          qty_damaged: outQty,
          last_updated: new Date().toISOString()
        });
      }

      newLogs.push({
        id: Date.now() + Math.random().toString(),
        itemId: item.id,
        action: 'DAMAGE',
        qty_change: `-${outQty} (Good) -> +${outQty} (Damaged)`,
        notes: row.notes || 'Pencatatan Barang Rusak/Keluar',
        date: new Date().toISOString()
      });
    });

    createSnapshot('Barang Rusak/Keluar', updatedStock, updatedCatalog);
    setCatalog(updatedCatalog);
    setStock(updatedStock);
    setLogs(prev => [...newLogs, ...prev]);
  };

  // Get aggregated dashboard data
  const getDashboardData = (customStock = null, customCatalog = null) => {
    const targetStock = customStock || stock;
    const targetCatalog = customCatalog || catalog;
    const totalItems = targetCatalog.length;
    const totalGood = targetStock.reduce((sum, s) => sum + s.qty_good, 0);
    const totalDamaged = targetStock.reduce((sum, s) => sum + s.qty_damaged, 0);

    return { totalItems, totalGood, totalDamaged };
  };

  // Helper to join catalog and stock for displaying full info
  const getFullInventory = (customStock = null, customCatalog = null) => {
    const targetStock = customStock || stock;
    const targetCatalog = customCatalog || catalog;
    return targetCatalog.map(item => {
      const s = targetStock.find(st => st.itemId === item.id) || { qty_good: 0, qty_damaged: 0 };
      return { ...item, ...s };
    });
  };

  const clearData = () => {
    if(window.confirm("Hapus semua data simulasi?")) {
      setCatalog([]);
      setStock([]);
      setLogs([]);
      setSnapshots([]);
    }
  };

  const addCatalogItem = (newItemData) => {
    // Generate an ID for the new item
    const id = generateId(newItemData.name, newItemData.brand, newItemData.type);
    
    // Check if it already exists
    if (catalog.find(c => c.id === id)) {
      alert("Barang dengan Nama, Merek, dan Tipe ini sudah ada di Master Data.");
      return false;
    }

    const newItem = { id, ...newItemData };
    const updatedCatalog = [...catalog, newItem];
    const updatedStock = [...stock, { itemId: id, qty_good: 0, qty_damaged: 0, last_updated: new Date().toISOString() }];

    createSnapshot('Tambah Master Data', updatedStock, updatedCatalog);
    setCatalog(updatedCatalog);
    setStock(updatedStock);
    return true;
  };

  const updateCatalogItem = (id, updatedData) => {
    // Note: We keep the old ID for relational integrity with stock/logs,
    // even if they change the name/brand/type. We just update the fields.
    const updatedCatalog = catalog.map(c => c.id === id ? { ...c, ...updatedData } : c);
    
    createSnapshot('Edit Master Data', stock, updatedCatalog);
    setCatalog(updatedCatalog);
    return true;
  };

  const deleteCatalogItem = (itemId) => {
    if(window.confirm("Yakin ingin menghapus barang ini dari Master Data secara permanen? Stoknya juga akan hilang.")) {
      const updatedCatalog = catalog.filter(c => c.id !== itemId);
      const updatedStock = stock.filter(s => s.itemId !== itemId);
      
      createSnapshot('Hapus Master Data', updatedStock, updatedCatalog);
      setCatalog(updatedCatalog);
      setStock(updatedStock);
    }
  };

  return (
    <MockDBContext.Provider value={{ 
      catalog, stock, logs, snapshots,
      saveFaktual, savePembelian, saveRusak, 
      getDashboardData, getFullInventory, clearData, deleteCatalogItem,
      addCatalogItem, updateCatalogItem
    }}>
      {children}
    </MockDBContext.Provider>
  );
};
