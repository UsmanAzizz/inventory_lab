import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, onSnapshot, writeBatch, deleteDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { useConfirm } from './ConfirmDialogContext';

const FirebaseDBContext = createContext();

export const useMockDB = () => useContext(FirebaseDBContext);

export const FirebaseDBProvider = ({ children }) => {
  const [catalog, setCatalog] = useState([]);
  const [stock, setStock] = useState([]);
  const [logs, setLogs] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirm();

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

  const getSnapshotRef = (dateStr) => {
    const snapId = 'snap_' + dateStr.substring(0, 7).replace('-', '_');
    return doc(db, 'snapshots', snapId);
  };

  const saveFaktual = async (rows) => {
    const batch = writeBatch(db);
    const dateStr = new Date().toISOString();
    const snapRef = getSnapshotRef(dateStr);
    batch.set(snapRef, { timestamp: dateStr }, { merge: true });

    rows.forEach(row => {
      const id = generateId(row.name, row.brand, row.type);
      const item = { name: row.name, brand: row.brand, type: row.type, unit: row.unit };
      const goodQty = parseInt(row.qty_good) || 0;
      const damagedQty = parseInt(row.qty_damaged) || 0;

      // Update Catalog (Merge to ensure exists)
      batch.set(doc(db, 'catalog', id), item, { merge: true });

      // Update Stock (Overwrite values)
      batch.set(doc(db, 'stock', id), {
        qty_good: goodQty,
        qty_damaged: damagedQty,
        last_updated: dateStr
      }, { merge: true });

      // Update Snapshot (Map format)
      batch.set(snapRef, {
        catalog_state: { [id]: { id, ...item } },
        stock_state: {
          [id]: { itemId: id, qty_good: goodQty, qty_damaged: damagedQty, last_updated: dateStr }
        }
      }, { merge: true });

      // Add Log
      const logId = `log_${dateStr.replace(/[:.-]/g, '')}_${id}`;
      batch.set(doc(db, 'logs', logId), {
        itemId: id,
        itemSnapshot: item,
        action: 'AUDIT',
        qty_change: `Penyesuaian: Baik=${goodQty}, Rusak=${damagedQty}`,
        notes: row.notes || 'Penyesuaian Stok Opname',
        date: dateStr
      });
    });

    await batch.commit();
  };

  const savePembelian = async (rows) => {
    const batch = writeBatch(db);
    
    rows.forEach(row => {
      const dateStr = row.date || new Date().toISOString();
      const snapRef = getSnapshotRef(dateStr);
      batch.set(snapRef, { timestamp: dateStr }, { merge: true });

      const id = generateId(row.name, row.brand, row.type);
      const item = { name: row.name, brand: row.brand, type: row.type, unit: row.unit };
      const addQty = parseInt(row.qty_in) || 0;

      // Update Catalog
      batch.set(doc(db, 'catalog', id), item, { merge: true });

      // Update Stock (Increment)
      batch.set(doc(db, 'stock', id), {
        qty_good: increment(addQty),
        qty_damaged: increment(0),
        last_updated: dateStr
      }, { merge: true });

      // Update Snapshot
      batch.set(snapRef, {
        catalog_state: { [id]: { id, ...item } },
        stock_state: {
          [id]: { itemId: id, qty_good: increment(addQty), qty_damaged: increment(0), last_updated: dateStr }
        }
      }, { merge: true });

      // Add Log
      const logId = `log_${dateStr.replace(/[:.-]/g, '')}_${id}`;
      batch.set(doc(db, 'logs', logId), {
        itemId: id,
        itemSnapshot: item,
        action: 'PURCHASE',
        qty_change: `+${addQty} (Good)`,
        notes: row.notes || 'Pembelian Barang Masuk',
        date: dateStr
      });
    });

    await batch.commit();
  };

  const saveRusak = async (rows) => {
    const batch = writeBatch(db);
    
    rows.forEach(row => {
      const dateStr = row.date || new Date().toISOString();
      const snapRef = getSnapshotRef(dateStr);
      batch.set(snapRef, { timestamp: dateStr }, { merge: true });

      const id = generateId(row.name, row.brand, row.type);
      const item = { name: row.name, brand: row.brand, type: row.type, unit: row.unit };
      const outQty = parseInt(row.qty_out) || 0;

      // Update Catalog
      batch.set(doc(db, 'catalog', id), item, { merge: true });

      // Update Stock
      batch.set(doc(db, 'stock', id), {
        qty_good: increment(-outQty),
        qty_damaged: increment(outQty),
        last_updated: dateStr
      }, { merge: true });

      // Update Snapshot
      batch.set(snapRef, {
        catalog_state: { [id]: { id, ...item } },
        stock_state: {
          [id]: { itemId: id, qty_good: increment(-outQty), qty_damaged: increment(outQty), last_updated: dateStr }
        }
      }, { merge: true });

      // Add Log
      const logId = `log_${dateStr.replace(/[:.-]/g, '')}_${id}`;
      batch.set(doc(db, 'logs', logId), {
        itemId: id,
        itemSnapshot: item,
        action: 'DAMAGE',
        qty_change: `-${outQty} (Good) -> +${outQty} (Damaged)`,
        notes: row.notes || 'Pencatatan Barang Rusak',
        date: dateStr
      });
    });

    await batch.commit();
  };

  const saveKeluar = async (rows) => {
    const batch = writeBatch(db);
    
    rows.forEach(row => {
      const dateStr = row.date || new Date().toISOString();
      const snapRef = getSnapshotRef(dateStr);
      batch.set(snapRef, { timestamp: dateStr }, { merge: true });

      const id = generateId(row.name, row.brand, row.type);
      const item = { name: row.name, brand: row.brand, type: row.type, unit: row.unit };
      const outQty = parseInt(row.qty_out) || 0;
      const source = row.source || 'good';
      
      const goodInc = source === 'good' ? -outQty : 0;
      const damagedInc = source === 'damaged' ? -outQty : 0;

      // Update Catalog
      batch.set(doc(db, 'catalog', id), item, { merge: true });

      // Update Stock
      batch.set(doc(db, 'stock', id), {
        qty_good: increment(goodInc),
        qty_damaged: increment(damagedInc),
        last_updated: dateStr
      }, { merge: true });

      // Update Snapshot
      batch.set(snapRef, {
        catalog_state: { [id]: { id, ...item } },
        stock_state: {
          [id]: { itemId: id, qty_good: increment(goodInc), qty_damaged: increment(damagedInc), last_updated: dateStr }
        }
      }, { merge: true });

      // Add Log
      const logId = `log_${dateStr.replace(/[:.-]/g, '')}_${id}`;
      batch.set(doc(db, 'logs', logId), {
        itemId: id,
        itemSnapshot: item,
        action: 'OUTBOUND',
        qty_change: `-${outQty} (Stok ${source === 'good' ? 'Baik' : 'Rusak'})`,
        notes: row.notes,
        date: dateStr
      });
    });

    await batch.commit();
  };

  const addCatalogItem = async (newItemData) => {
    const id = generateId(newItemData.name, newItemData.brand, newItemData.type);
    if (catalog.find(c => c.id === id)) {
      toast.error("Barang dengan Nama, Merek, dan Tipe ini sudah ada di Master Data.");
      return false;
    }

    const batch = writeBatch(db);
    batch.set(doc(db, 'catalog', id), newItemData);
    batch.set(doc(db, 'stock', id), { qty_good: 0, qty_damaged: 0, last_updated: new Date().toISOString() });
    
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
    const item = catalog.find(c => c.id === itemId);
    const itemName = item ? item.name : 'Barang';
    
    const isConfirmed = await confirm({
      title: `Hapus ${itemName}?`,
      message: 'Barang ini akan dihapus dari daftar (Soft Delete).',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      danger: true
    });
    
    if(isConfirmed) {
      const batch = writeBatch(db);
      batch.update(doc(db, 'catalog', itemId), { is_deleted: true });
      await batch.commit();
      toast.success('Barang berhasil dihapus dari katalog');
    }
  };

  const getDashboardData = (customStock = null, customCatalog = null) => {
    const targetStock = customStock || stock;
    const targetCatalog = customCatalog || catalog;
    const totalItems = targetCatalog.length;
    const totalGood = targetStock.reduce((sum, s) => sum + (s.qty_good || 0), 0);
    const totalDamaged = targetStock.reduce((sum, s) => sum + (s.qty_damaged || 0), 0);
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
    const isConfirmed = await confirm({
      title: 'Hapus Seluruh Data',
      message: 'PERINGATAN: Tindakan ini akan menghapus seluruh isi pangkalan data. Aksi ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      danger: true
    });
    
    if(isConfirmed) {
      const batch = writeBatch(db);
      catalog.forEach(c => batch.delete(doc(db, 'catalog', c.id)));
      stock.forEach(s => batch.delete(doc(db, 'stock', s.itemId)));
      logs.forEach(l => batch.delete(doc(db, 'logs', l.id)));
      snapshots.forEach(s => batch.delete(doc(db, 'snapshots', s.id)));
      await batch.commit();
      toast.success('Seluruh data berhasil dihapus');
    }
  };

  const deleteLog = async (logId) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return false;

    if (log.action === 'FAKTUAL') {
      toast.error('Riwayat Audit Faktual tidak dapat dihapus.');
      return false;
    }

    let goodInc = 0;
    let damagedInc = 0;

    if (log.action === 'PURCHASE') {
      const match = log.qty_change.match(/\+(\d+)/);
      if (match) goodInc = -parseInt(match[1], 10);
    } else if (log.action === 'OUTBOUND') {
      const match = log.qty_change.match(/-(\d+)\s*\(Stok\s*(Baik|Rusak)\)/i);
      if (match) {
        const qty = parseInt(match[1], 10);
        if (match[2].toLowerCase() === 'baik') goodInc = qty;
        else damagedInc = qty;
      }
    } else if (log.action === 'DAMAGE') {
      const match = log.qty_change.match(/-(\d+)\s*\(Good\)/i);
      if (match) {
        const qty = parseInt(match[1], 10);
        goodInc = qty;
        damagedInc = -qty;
      }
    }

    const batch = writeBatch(db);
    batch.delete(doc(db, 'logs', log.id));
    
    if (goodInc !== 0 || damagedInc !== 0) {
      batch.set(doc(db, 'stock', log.itemId), {
        qty_good: increment(goodInc),
        qty_damaged: increment(damagedInc),
        last_updated: new Date().toISOString()
      }, { merge: true });
      
      const snapRef = getSnapshotRef(log.date);
      batch.set(snapRef, {
        stock_state: {
          [log.itemId]: { 
            qty_good: increment(goodInc), 
            qty_damaged: increment(damagedInc)
          }
        }
      }, { merge: true });
    }

    try {
      await batch.commit();
      toast.success('Riwayat berhasil dihapus dan stok dikembalikan.');
      return true;
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus riwayat.');
      return false;
    }
  };

  const seedDatabase = async () => {
    toast.loading('Menghapus data lama...', { id: 'seed' });
    const batch = writeBatch(db);
    catalog.forEach(c => batch.delete(doc(db, 'catalog', c.id)));
    stock.forEach(s => batch.delete(doc(db, 'stock', s.itemId)));
    logs.forEach(l => batch.delete(doc(db, 'logs', l.id)));
    snapshots.forEach(s => batch.delete(doc(db, 'snapshots', s.id)));
    await batch.commit();
    await new Promise(r => setTimeout(r, 1000));

    toast.loading('Menyimpan Audit Faktual...', { id: 'seed' });
    await saveFaktual([
      { name: 'Mikrotik Router', brand: 'Routerboard', type: 'RB951', unit: 'Unit', qty_good: 5, qty_damaged: 1, notes: 'Stok awal' },
      { name: 'Kabel UTP', brand: 'Belden', type: 'Cat 6', unit: 'Roll', qty_good: 10, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Switch', brand: 'TP-Link', type: '16 Port', unit: 'Unit', qty_good: 3, qty_damaged: 1, notes: 'Stok awal' },
      { name: 'Konektor RJ45', brand: 'Zimm', type: 'Cat 6', unit: 'Pcs', qty_good: 150, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Access Point', brand: 'Ubiquiti', type: 'UniFi AC Lite', unit: 'Unit', qty_good: 4, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Tang Crimping', brand: 'AMP', type: 'Standar', unit: 'Pcs', qty_good: 8, qty_damaged: 2, notes: 'Stok awal' },
      { name: 'LAN Tester', brand: 'Noyafa', type: 'NF-811', unit: 'Unit', qty_good: 5, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Server Tower', brand: 'Dell', type: 'PowerEdge T440', unit: 'Unit', qty_good: 2, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'RAM Server', brand: 'Samsung', type: '16GB DDR4 ECC', unit: 'Keping', qty_good: 4, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Harddisk NAS', brand: 'Seagate', type: 'IronWolf 4TB', unit: 'Unit', qty_good: 6, qty_damaged: 1, notes: 'Stok awal' },
      { name: 'UPS', brand: 'APC', type: '1000VA', unit: 'Unit', qty_good: 3, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Kabel Fiber Optik', brand: 'ZTE', type: 'Drop Core 1 Core', unit: 'Roll', qty_good: 2, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Splicer FO', brand: 'Fujikura', type: '70S', unit: 'Unit', qty_good: 1, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Cleaver FO', brand: 'Fujikura', type: 'CT-30', unit: 'Unit', qty_good: 1, qty_damaged: 1, notes: 'Stok awal' },
      { name: 'Optical Power Meter', brand: 'Joinwit', type: 'JW3208', unit: 'Unit', qty_good: 2, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Visual Fault Locator', brand: 'Joinwit', type: '10mW', unit: 'Unit', qty_good: 2, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Optical Dist. Point', brand: 'PAZ', type: '8 Core', unit: 'Unit', qty_good: 5, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Pigtail', brand: 'ZTE', type: 'SC/UPC', unit: 'Pcs', qty_good: 50, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Patchcord', brand: 'ZTE', type: 'SC/UPC to SC/APC', unit: 'Pcs', qty_good: 30, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Modem ONT', brand: 'ZTE', type: 'F609', unit: 'Unit', qty_good: 10, qty_damaged: 2, notes: 'Stok awal' },
      { name: 'Rack Server', brand: 'Indorack', type: '12U', unit: 'Unit', qty_good: 2, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Patch Panel', brand: 'Commscope', type: 'Cat 6 24 Port', unit: 'Unit', qty_good: 3, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Kabel Power', brand: 'Howell', type: 'C13 to Schuko', unit: 'Pcs', qty_good: 20, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Obeng Set', brand: 'Jakemy', type: 'JM-8139', unit: 'Set', qty_good: 4, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Solder', brand: 'Dekko', type: '40W', unit: 'Unit', qty_good: 5, qty_damaged: 1, notes: 'Stok awal' },
      { name: 'Timah Solder', brand: 'Pancing', type: '0.8mm', unit: 'Roll', qty_good: 10, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Multimeter Digital', brand: 'Sanwa', type: 'CD800a', unit: 'Unit', qty_good: 3, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Access Point', brand: 'TP-Link', type: 'EAP110', unit: 'Unit', qty_good: 6, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Switch Hub Gigabit', brand: 'D-Link', type: '8 Port', unit: 'Unit', qty_good: 4, qty_damaged: 0, notes: 'Stok awal' },
      { name: 'Router Wireless', brand: 'TP-Link', type: 'Archer C7', unit: 'Unit', qty_good: 3, qty_damaged: 0, notes: 'Stok awal' }
    ]);
    await new Promise(r => setTimeout(r, 500));

    toast.loading('Menyimpan Barang Masuk...', { id: 'seed' });
    await savePembelian([
      { name: 'Mikrotik Router', brand: 'Routerboard', type: 'RB951', unit: 'Unit', qty_in: 5, notes: 'Pengadaan BOS' },
      { name: 'Konektor RJ45', brand: 'Zimm', type: 'Cat 6', unit: 'Pcs', qty_in: 200, notes: 'Restock' },
      { name: 'Tang Crimping', brand: 'AMP', type: 'Standar', unit: 'Pcs', qty_in: 2, notes: 'Pengganti alat rusak' }
    ]);
    await new Promise(r => setTimeout(r, 500));

    toast.loading('Menyimpan Barang Rusak...', { id: 'seed' });
    await saveRusak([
      { name: 'LAN Tester', brand: 'Noyafa', type: 'NF-811', unit: 'Unit', qty_out: 1, notes: 'Lampu indikator mati' },
      { name: 'Access Point', brand: 'Ubiquiti', type: 'UniFi AC Lite', unit: 'Unit', qty_out: 1, notes: 'Sering restart sendiri' }
    ]);
    await new Promise(r => setTimeout(r, 500));

    toast.loading('Menyimpan Barang Keluar...', { id: 'seed' });
    await saveKeluar([
      { name: 'Kabel UTP', brand: 'Belden', type: 'Cat 6', unit: 'Roll', qty_out: 1, source: 'good', notes: 'Dipakai praktek UKK' },
      { name: 'Cleaver FO', brand: 'Fujikura', type: 'CT-30', unit: 'Unit', qty_out: 1, source: 'damaged', notes: 'Dikirim ke tempat servis' },
      { name: 'Solder', brand: 'Dekko', type: '40W', unit: 'Unit', qty_out: 1, source: 'damaged', notes: 'Dibuang' }
    ]);

    toast.success('Database berhasil di-seed!', { id: 'seed' });
  };

  return (
    <FirebaseDBContext.Provider value={{ 
      catalog, stock, logs, snapshots, loading,
      saveFaktual, savePembelian, saveRusak, saveKeluar,
      getDashboardData, getFullInventory, clearData, deleteCatalogItem,
      addCatalogItem, updateCatalogItem, seedDatabase, deleteLog
    }}>
      {children}
    </FirebaseDBContext.Provider>
  );
};
