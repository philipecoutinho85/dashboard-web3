import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function Header({ walletAddress, connectWallet }) {
  const navigate = useNavigate();
  const userEmail = auth.currentUser?.email || '';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b mb-6 rounded-xl">
      <div>
        <h1 className="text-xl font-bold text-rose-600">HashSign</h1>
        <p className="text-sm text-gray-500">Bem-vindo, {userEmail}</p>
        {walletAddress && (
          <p className="text-xs text-green-600 mt-1">
            Carteira: <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          </p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="text-sm hover:underline flex items-center">🏠 Dashboard</Link>
        <Link to="/explorer" className="text-sm hover:underline flex items-center">📂 Explorer</Link>
        <Link to="/admin" className="text-sm hover:underline flex items-center">⚙️ Admin</Link>

        <button
          onClick={connectWallet}
          className="bg-rose-500 text-white text-sm px-3 py-1 rounded hover:bg-rose-600"
        >
          {walletAddress ? 'Carteira Conectada' : 'Conectar Carteira'}
        </button>

        <button
          onClick={handleLogout}
          className="text-sm text-rose-500 hover:underline"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
