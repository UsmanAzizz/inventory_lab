import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDocRef = doc(db, 'admins', user.email);
          const adminSnap = await getDoc(adminDocRef);
          
          if (adminSnap.exists()) {
            setCurrentUser(user);
          } else {
            await signOut(auth);
            setCurrentUser(null);
            toast.error('Akses ditolak: Email Anda belum didaftarkan sebagai admin.');
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          await signOut(auth);
          setCurrentUser(null);
          toast.error('Gagal memverifikasi akses admin.');
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Pengecekan sukses/gagal secara spesifik ditangani oleh onAuthStateChanged
    } catch (error) {
      console.error(error);
      toast.error('Gagal masuk dengan Google: ' + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Berhasil keluar');
    } catch (error) {
      console.error(error);
      toast.error('Gagal keluar');
    }
  };

  const value = {
    currentUser,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
