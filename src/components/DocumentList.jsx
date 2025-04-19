import React, { useEffect, useState } from 'react';
import { auth } from '@/firebase';

export default function DocumentList() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const unsubscribe = setTimeout(() => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const saved = localStorage.getItem(`hashsign_docs_${userId}`);
      if (saved) {
        setDocs(JSON.parse(saved));
      }
    }, 300); // atraso pequeno para garantir que o auth esteja pronto

    return () => clearTimeout(unsubscribe);
  }, []);

  if (docs.length === 0) {
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

          <p className="text-sm text-gray-600 mb-2">
            Status:{' '}
            {doc.signed ? (
              <span className="text-green-600 font-medium">Assinado</span>
            ) : (
              <span className="text-yellow-500 font-medium">Pendente</span>
            )}
          </p>

          <p className="text-xs text-gray-400 break-all mb-1">Hash: {doc.hash}</p>

          {/* Lista de assinaturas */}
          {doc.signatures?.length > 0 && (
            <div className="text-sm text-gray-700 mt-2">
              <p className="font-medium text-indigo-600 mb-1">🖊️ Assinado por:</p>
              <ul className="pl-4 space-y-1 list-disc">
                {doc.signatures.map((s, i) => (
                  <li key={i}>
                    <span className="font-mono text-xs text-gray-600">
                      {s.wallet.slice(0, 6)}...{s.wallet.slice(-4)}
                    </span>{' '}
                    <span className="text-gray-500 text-xs">em {s.signedAt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {doc.pdfUrl && (
            <a
              href={doc.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-indigo-600 text-sm hover:underline"
            >
              📎 Ver PDF Assinado
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
