import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';

export default function Header() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-8">
      <div className="mb-2 sm:mb-0">
        <h1 className="text-xl font-bold text-indigo-700">HashSign</h1>
        {user?.email && (
          <p className="text-sm text-gray-500">Bem-vindo, {user.email}</p>
        )}
      </div>

      <nav className="flex flex-wrap gap-3">
        <Link
          to="/dashboard"
          className="text-sm text-indigo-700 font-medium hover:underline"
        >
          🏠 Dashboard
        </Link>
        <Link
          to="/explorer"
          className="text-sm text-indigo-700 font-medium hover:underline"
        >
          🗂️ Explorer
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline font-medium"
        >
          🚪 Sair
        </button>
      </nav>
    </header>
  );
}
