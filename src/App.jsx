import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Explorer from './pages/Explorer';
import VerificationPage from './pages/VerificationPage'; // ✅ Rota pública
import Admin from './pages/Admin'; // ✅ Novo import

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500">
        ⏳ Carregando sessão...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/explorer"
          element={user ? <Explorer /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin"
          element={user ? <Admin /> : <Navigate to="/login" replace />} // ✅ Protegido
        />
        <Route
          path="/validar/:hash"
          element={<VerificationPage />} // ✅ Acesso público
        />
        <Route
          path="*"
          element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
