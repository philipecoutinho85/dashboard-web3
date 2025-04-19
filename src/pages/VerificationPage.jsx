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
    <div className="min-h-screen bg-[#f7f7f7] py-10 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">HashSign</h1>
            <p className="text-sm text-gray-600 mt-1">
              Bem-vindo, <span className="font-semibold">{user?.email}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/explorer"
              className="text-sm bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg shadow hover:bg-indigo-50"
            >
              🌐 Explorer Público
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Upload e Assinatura */}
        <section className="mb-12 bg-white p-6 rounded-xl shadow">
          <DocumentUpload docs={docs} setDocs={setDocs} />
        </section>

        {/* Lista de Documentos */}
        <section>
          <h2 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
            📁 Meus Documentos
          </h2>
          <div className="bg-white p-6 rounded-xl shadow">
            <DocumentList docs={docs} />
          </div>
        </section>
      </div>
    </div>
  );
}
