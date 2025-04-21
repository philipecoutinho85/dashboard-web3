import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Explorer() {
  const [docs, setDocs] = useState([]);
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

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📂 Documentos Públicos</h1>

      {docs.length === 0 && (
        <p className="text-gray-500 text-sm">Nenhum documento disponível.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {docs.map((doc, index) => (
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
    </div>
  );
}
