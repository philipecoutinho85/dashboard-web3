import React from 'react';
import { auth } from '@/firebase';

export default function DocumentList({ docs, setDocs }) {
  const handleDelete = (index) => {
    const updatedDocs = docs.filter((_, i) => i !== index);
    setDocs(updatedDocs);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
    }
  };

  if (!docs || docs.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum documento encontrado.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {docs.map((doc, index) => (
        <div
          key={index}
          className="bg-white shadow-md border border-gray-200 rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">📄 {doc.name}</h2>
          <p className="text-sm text-yellow-600 font-medium">
            Status: {doc.status} ({doc.signatures.length}/2 assinaturas)
          </p>
          <p className="text-xs text-gray-500 mt-1 break-all">Hash: {doc.hash}</p>

          {doc.signatures?.length > 0 && (
            <ul className="mt-2 text-xs text-gray-600 list-disc ml-4">
              {doc.signatures.map((sig, i) => (
                <li key={i}>{sig.wallet} – {sig.date}</li>
              ))}
            </ul>
          )}

          <button
            onClick={() => handleDelete(index)}
            className="mt-3 text-sm text-red-600 hover:underline"
          >
            🗑️ Excluir
          </button>
        </div>
      ))}
    </div>
  );
}
