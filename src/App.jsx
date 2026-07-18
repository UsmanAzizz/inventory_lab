import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InputFaktual from './pages/InputFaktual';
import InputPembelian from './pages/InputPembelian';
import InputRusak from './pages/InputRusak';
import HistoryLog from './pages/HistoryLog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="audit" element={<InputFaktual />} />
          <Route path="purchase" element={<InputPembelian />} />
          <Route path="damage" element={<InputRusak />} />
          <Route path="history" element={<HistoryLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
