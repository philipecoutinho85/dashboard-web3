// src/App.jsx
import React, { useEffect, useState, Suspense } from 'react';
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
          element={
            user ? (
              <Suspense fallback={<div className="text-center mt-20 text-gray-500">🔄 Carregando painel...</div>}>
                <Dashboard />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/explorer"
          element={
            user ? (
              <Suspense fallback={<div className="text-center mt-20 text-gray-500">🔎 Carregando documentos...</div>}>
                <Explorer />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            user ? (
              <Suspense fallback={<div className="text-center mt-20 text-gray-500">⚙️ Carregando painel admin...</div>}>
                <Admin />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/validar/:hash"
          element={<VerificationPage />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
