import React from 'react';
import Header from '@/components/Header';
import useWallet from '@/hooks/useWallet';

export default function Dashboard() {
  const { walletAddress, connectWallet } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Header walletAddress={walletAddress} connectWallet={connectWallet} />
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-lg font-semibold">✅ Dashboard carregado com sucesso</h2>
          <p className="text-sm text-gray-600">Carteira conectada: {walletAddress || 'Nenhuma'}</p>
        </div>
      </div>
    </div>
  );
}
