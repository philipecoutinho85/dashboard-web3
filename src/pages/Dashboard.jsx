// src/pages/Dashboard.jsx
import React from 'react';
import useWallet from '@/hooks/useWallet';

export default function Dashboard() {
  const { walletAddress, connectWallet } = useWallet();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-xl text-gray-700 mb-4">✅ Dashboard com useWallet</h1>
      <p className="text-sm text-gray-600 mb-4">Carteira: {walletAddress || 'não conectada'}</p>
      <button
        onClick={connectWallet}
        className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
      >
        Conectar Carteira
      </button>
    </div>
  );
}
