import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useWallet from '@/hooks/useWallet';
import { Moon, Sun } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const { walletAddress, connectWallet } = useWallet();
  const [darkMode, setDarkMode] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 flex items-center justify-between sm:justify-center sm:gap-6">
      <Link to="/dashboard" className="text-xl font-bold text-black dark:text-white">
        Hashsign
      </Link>

      <div className="hidden sm:flex items-center gap-6">
        <Link to="/dashboard" className={`text-sm font-medium ${location.pathname === '/dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>Dashboard</Link>
        <Link to="/explorer" className={`text-sm font-medium ${location.pathname === '/explorer' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>Explorer</Link>
        <Link to="/admin" className={`text-sm font-medium ${location.pathname === '/admin' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>Admin</Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={connectWallet}
          className="bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
        >
          {walletAddress ? 'Carteira conectada' : 'Conectar Carteira'}
        </button>
      </div>
    </header>
  );
};

export default Header;
