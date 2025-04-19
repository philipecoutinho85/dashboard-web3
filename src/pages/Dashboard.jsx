import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';
import Header from '@/components/Header'; // ✅ Importação do novo Header

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ✅ Novo cabeçalho global */}
        <Header />

        {/* Upload e Assinatura */}
        <section className="mb-12 mt-8">
          <DocumentUpload docs={docs} setDocs={setDocs} />
        </section>

        {/* Lista de Documentos */}
        <section>
          <h2 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
            📁 Meus Documentos
          </h2>
          <DocumentList docs={docs} />
        </section>
      </div>
    </div>
  );
}
