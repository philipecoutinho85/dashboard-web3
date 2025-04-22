import React from 'react';
import { auth } from '@/firebase';

export default function Header({ walletAddress, connectWallet }) {
  const userEmail = auth.currentUser?.email || '';
  const isAdmin = userEmail === 'philipe@web3.com';

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
        <a href="/dashboard" className="text-sm hover:underline">🏠 Dashboard</a>
        <a href="/explorer" className="text-sm hover:underline">📂 Explorer</a>
        {isAdmin && (
          <a href="/admin" className="text-sm hover:underline">🛠️ Admin</a>
        )}
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
