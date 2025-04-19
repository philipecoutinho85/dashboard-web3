import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '@/firebase';

export default function Explorer() {
  const [docs, setDocs] = useState([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (uid) {
      const stored = JSON.parse(localStorage.getItem('hashsign_docs_by_user') || '{}');
      const userDocs = stored[uid] || [];
      setDocs(userDocs);
      setFiltered(userDocs);
    }
  }, [uid]);

  useEffect(() => {
    const search = query.toLowerCase();
    const result = docs.filter(
      (doc) =>
        doc.name.toLowerCase().includes(search) ||
        doc.hash.toLowerCase().includes(search)
    );
    setFiltered(result);
  }, [query, docs]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          📂 Meus Documentos Assinados
        </h1>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Buscar por nome ou hash..."
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum documento encontrado.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((doc, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-700"><strong>📄 Nome:</strong> {doc.name}</p>
                <p className="text-sm text-gray-700"><strong>🔑 Hash:</strong> {doc.hash}</p>
                <p className="text-sm text-gray-700"><strong>✍️ Assinaturas:</strong> {doc.signatures?.length || 0}</p>

                {doc.signatures?.map((sig, i) => (
                  <div key={i} className="text-xs text-gray-600 ml-3 mt-1">
                    {i + 1}. {sig.wallet.slice(0, 8)}... — {sig.signedAt}
                  </div>
                ))}

                {doc.ipfsUrl && (
                  <a
                    href={doc.ipfsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm block mt-2"
                  >
                    🌐 Ver no IPFS
                  </a>
                )}

                <Link
                  to={`/validar/${doc.hash}`}
                  className="inline-block mt-3 text-indigo-600 text-sm hover:underline font-medium"
                >
                  🔍 Verificar Assinatura
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
