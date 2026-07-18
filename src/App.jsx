import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import KatalogBarang from './pages/KatalogBarang';
import InputFaktual from './pages/InputFaktual';
import InputPembelian from './pages/InputPembelian';
import InputRusak from './pages/InputRusak';
import HistoryLog from './pages/HistoryLog';
import { MockDBProvider } from './store/MockDBContext';

function App() {
  return (
    <MockDBProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="katalog" element={<KatalogBarang />} />
            <Route path="audit" element={<InputFaktual />} />
            <Route path="purchase" element={<InputPembelian />} />
            <Route path="damage" element={<InputRusak />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MockDBProvider>
  );
}

export default App;
