import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';

export default function Explorer() {
  const [docs, setDocs] = useState([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);

  const uid = auth.currentUser?.uid;
  const navigate = useNavigate();

  useEffect(() => {
    if (uid) {
      const allDocs = JSON.parse(localStorage.getItem('hashsign_docs_by_user') || '{}');
      const userDocs = allDocs[uid] || [];
      setDocs(userDocs);
      setFiltered(userDocs);
    }
  }, [uid]);

  useEffect(() => {
    const term = query.toLowerCase();
    const filteredDocs = docs.filter(
      (doc) =>
        doc.name.toLowerCase().includes(term) ||
        doc.hash.toLowerCase().includes(term)
    );
    setFiltered(filteredDocs);
  }, [query, docs]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🗂️ Seus Documentos Assinados
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg shadow"
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-gray-300 hover:bg-gray-400 text-sm px-4 py-2 rounded-lg shadow"
            >
              🔐 Login
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="🔍 Buscar por nome ou hash..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-lg mx-auto block mb-8 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum documento encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition duration-200 p-5 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-indigo-700 truncate">
                    📄 {doc.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Hash:</strong> {doc.hash.slice(0, 10)}...
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Assinaturas:</strong> {doc.signatures?.length || 0}
                  </p>

                  {doc.signatures?.map((sig, i) => (
                    <div key={i} className="text-xs text-gray-500 mt-1 ml-2">
                      • {sig.wallet.slice(0, 6)}... — {sig.signedAt}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {doc.ipfsUrl && (
                    <a
                      href={doc.ipfsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      🌐 Ver no IPFS
                    </a>
                  )}
                  <Link
                    to={`/validar/${doc.hash}`}
                    className="text-indigo-600 text-sm hover:underline font-medium"
                  >
                    🔍 Verificar Assinatura
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
