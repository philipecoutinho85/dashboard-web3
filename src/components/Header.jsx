// src/components/Header.jsx
import React from 'react';
import { auth } from '@/firebase';
import useWallet from '@/hooks/useWallet';

export default function Header() {
  const { walletAddress, connectWallet } = useWallet();
  const userEmail = auth.currentUser?.email || '';

  return (
    <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b">
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
        <a href="/dashboard" className="text-sm hover:underline flex items-center">🏠 Dashboard</a>
        <a href="/explorer" className="text-sm hover:underline flex items-center">📂 Explorer</a>
        <a href="/admin" className="text-sm hover:underline flex items-center">🛠️ Admin</a>
        <button
          onClick={connectWallet}
          className="bg-rose-500 text-white text-sm px-3 py-1 rounded hover:bg-rose-600"
        >
          {walletAddress ? 'Carteira Conectada' : 'Conectar Carteira'}
        </button>
        <a href="/login" className="text-sm text-rose-500 hover:underline">Sair</a>
      </div>
    </div>
  );
}
