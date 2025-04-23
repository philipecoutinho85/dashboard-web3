import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useWallet from '@/hooks/useWallet';
import { Moon, Sun, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { walletAddress, connectWallet } = useWallet();
  const [darkMode, setDarkMode] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const linkClass = (path) => `text-sm font-medium transition ${
    location.pathname === path
      ? 'text-[#ff385c] dark:text-[#ff385c] font-semibold'
      : 'text-gray-600 dark:text-gray-300 hover:text-[#ff385c] dark:hover:text-[#ff385c]'
  }`;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 flex items-center justify-between sm:justify-center sm:gap-6">
      <Link to="/dashboard" className="text-xl font-bold text-[#ff385c]">
        Hashsign
      </Link>

      <div className="hidden sm:flex items-center gap-6">
        <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
        <Link to="/explorer" className={linkClass('/explorer')}>Explorer</Link>
        <Link to="/admin" className={linkClass('/admin')}>Admin</Link>
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
          className="bg-[#ff385c] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-500 transition"
        >
          {walletAddress ? 'Carteira conectada' : 'Conectar Carteira'}
        </button>

        <button
          onClick={handleLogout}
          className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
