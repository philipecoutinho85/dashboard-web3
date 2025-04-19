import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const userId = user?.uid;
    if (!userId) return;

    const saved = localStorage.getItem(`hashsign_docs_${userId}`);
    if (saved) setDocs(JSON.parse(saved));
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10 border rounded-xl bg-white px-6 py-3 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#ff385c' }}>HashSign</h1>
            <p className="text-sm text-gray-600">
              Bem-vindo, <span className="font-semibold">{user?.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/dashboard" className="text-black hover:underline">🏠 Dashboard</Link>
            <Link to="/explorer" className="text-black hover:underline">📁 Explorer</Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              🚪 Sair
            </button>
          </div>
        </header>

        {/* Upload e Assinatura */}
        <section className="mb-12">
          <DocumentUpload docs={docs} setDocs={setDocs} />
        </section>

        {/* Lista de Documentos */}
        <section>
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            📁 Meus Documentos
          </h2>
          <DocumentList docs={docs} />
        </section>
      </div>
    </div>
  );
}
