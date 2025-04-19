import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-10 bg-black py-4 px-6 rounded-xl shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-white">HashSign</h1>
            <p className="text-sm text-gray-300 mt-1">
              Bem-vindo, <span className="font-semibold text-white">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-[#ff385c] hover:bg-[#e0334e] text-white px-5 py-2 rounded-lg shadow-sm"
          >
            Sair
          </button>
        </header>

        {/* Upload e Assinatura */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#ff385c] mb-4 flex items-center gap-2">
            📝 Assinatura de Documentos
          </h2>
          <DocumentUpload docs={docs} setDocs={setDocs} />
        </section>

        {/* Lista de Documentos */}
        <section>
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
            📁 Meus Documentos
          </h2>
          <DocumentList docs={docs} />
        </section>
      </div>
    </div>
  );
}
