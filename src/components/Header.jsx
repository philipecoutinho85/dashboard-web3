import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function Header() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center mb-10 border rounded-xl bg-white px-6 py-3 shadow">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#ff385c' }}>HashSign</h1>
        <p className="text-sm text-gray-600">
          Bem-vindo, <span className="font-semibold">{user?.email}</span>
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/dashboard" className="text-black hover:underline">🏠 Dashboard</Link>
        <Link to="/explorer" className="text-black hover:underline">📁 Explorer</Link>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          🚪 Sair
        </button>
      </div>
    </header>
  );
}
