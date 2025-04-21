import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Explorer() {
  const [docs, setDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      const querySnapshot = await getDocs(collection(db, 'documentos'));
      const results = [];
      querySnapshot.forEach((d) => {
        results.push(d.data());
      });
      setDocs(results);
    };
    fetchDocs();
  }, []);

  const handleDelete = async (hash) => {
    await deleteDoc(doc(db, 'documentos', hash));
    setDocs(docs.filter((d) => d.hash !== hash));
  };

  const handleVerify = (hash) => {
    navigate(`/validar/${hash}`);
  };

  const filteredDocs = docs.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.hash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Menu */}
      <header className="bg-black text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🔍 Explorer | HashSign</h1>
          <nav>
            <a href="/" className="text-sm hover:underline mr-4">🏠 Dashboard</a>
            <a href="/explorer" className="text-sm hover:underline">📂 Explorer</a>
          </nav>
        </div>
      </header>

      {/* Campo de busca */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <input
          type="text"
          placeholder="Buscar por nome ou hash..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* Lista de documentos */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {filteredDocs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">Nenhum documento encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredDocs.map((doc, index) => (
              <div key={index} className="bg-white shadow-md border border-gray-200 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">📄 {doc.name}</h2>
                <p className="text-sm text-yellow-600 font-medium">Status: {doc.status}</p>
                <p className="text-xs text-gray-500 mt-1 break-all">Hash: {doc.hash}</p>
                <p className="text-sm mt-2">Assinaturas: {doc.signatures?.length || 0}</p>
                <ul className="text-xs text-gray-600 list-disc ml-4 mt-1">
                  {doc.signatures?.map((sig, i) => (
                    <li key={i}>{sig.wallet} – {sig.date}</li>
                  ))}
                </ul>

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => handleVerify(doc.hash)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    🔍 Verificar Assinatura
                  </button>

                  <button
                    onClick={() => handleDelete(doc.hash)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    🗑️ Excluir Documento
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
