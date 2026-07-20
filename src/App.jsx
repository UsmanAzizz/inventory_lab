import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import KatalogBarang from './pages/KatalogBarang';
import InputFaktual from './pages/InputFaktual';
import InputPembelian from './pages/InputPembelian';
import InputRusak from './pages/InputRusak';
import InputKeluar from './pages/InputKeluar';
import Laporan from './pages/Laporan';
import Login from './pages/Login';
import { FirebaseDBProvider } from './store/FirebaseDBContext';
import { ConfirmDialogProvider } from './store/ConfirmDialogContext';

const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('auth_token') === 'verified';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ConfirmDialogProvider>
      <FirebaseDBProvider>
        <Toaster 
          position="top-center" 
          toastOptions={{ 
            style: { 
              background: 'var(--bg-surface)', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            } 
          }} 
        />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="katalog" element={<KatalogBarang />} />
              <Route path="audit" element={<InputFaktual />} />
              <Route path="purchase" element={<InputPembelian />} />
              <Route path="damage" element={<InputRusak />} />
              <Route path="outbound" element={<InputKeluar />} />
              <Route path="laporan" element={<Laporan />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FirebaseDBProvider>
    </ConfirmDialogProvider>
  );
}

export default App;
