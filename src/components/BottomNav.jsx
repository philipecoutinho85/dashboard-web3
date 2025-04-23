import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FolderOpen, ShieldCheck, Wallet, LogOut } from 'lucide-react';
import useWallet from '@/hooks/useWallet';
import { auth } from '@/firebase';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { walletAddress, connectWallet } = useWallet();

  const navItems = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/explorer', icon: <FolderOpen size={20} />, label: 'Explorer' },
    { to: '/admin', icon: <ShieldCheck size={20} />, label: 'Admin' },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 shadow-inner z-50 sm:hidden">
      <div className="flex justify-around items-center text-xs py-2">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className={`flex flex-col items-center transition ${
              location.pathname === item.to ? 'text-[#ff385c] font-semibold' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={connectWallet}
          className={`flex flex-col items-center transition ${
            walletAddress ? 'text-green-600' : 'text-[#ff385c]'
          }`}
        >
          <Wallet size={20} />
          <span>{walletAddress ? 'Conectado' : 'Carteira'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-600 transition"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
