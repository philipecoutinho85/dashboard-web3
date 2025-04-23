import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, ShieldCheck, Wallet } from 'lucide-react';
import useWallet from '@/hooks/useWallet';

const BottomNav = () => {
  const location = useLocation();
  const { walletAddress, connectWallet } = useWallet();

  const navItems = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/explorer', icon: <FolderOpen size={20} />, label: 'Explorer' },
    { to: '/admin', icon: <ShieldCheck size={20} />, label: 'Admin' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner z-50 sm:hidden">
      <div className="flex justify-around items-center text-xs py-2">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className={`flex flex-col items-center ${location.pathname === item.to ? 'text-indigo-600' : 'text-gray-600'}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={connectWallet}
          className={`flex flex-col items-center ${walletAddress ? 'text-green-600' : 'text-gray-600'}`}
        >
          <Wallet size={20} />
          <span>{walletAddress ? 'Conectado' : 'Carteira'}</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
