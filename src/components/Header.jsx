import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';

export default function Header({ walletAddress, connectWallet }) {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const truncateAddress = (address) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <header className="flex justify-between items-center mb-10 border-b bg-white px-6 py-4 shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-[#ff385c]">HashSign</h1>
        {user?.email && (
          <p className="text-sm text-gray-700">Bem-vindo, {user.email}</p>
        )}
        {walletAddress && (
          <p className="text-sm text-green-600">
            Carteira: {truncateAddress(walletAddress)}
          </p>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <Link to="/dashboard" className="text-sm text-black hover:underline">
          🏠 Dashboard
        </Link>
        <Link to="/explorer" className="text-sm text-black hover:underline">
          📁 Explorer
        </Link>

        {connectWallet && (
          <button
            onClick={connectWallet}
            className="bg-[#ff385c] text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition"
          >
            {walletAddress ? 'Carteira Conectada' : 'Conectar Carteira'}
          </button>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Sair
          </button>
        )}
      </div>
    </header>
  );
}
