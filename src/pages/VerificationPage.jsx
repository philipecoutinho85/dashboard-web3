import React from 'react';
import { useParams } from 'react-router-dom';

export default function VerificationPage() {
  const { hash } = useParams();
  const documentos = JSON.parse(localStorage.getItem('hashsign_docs')) || [];
  const doc = documentos.find((d) => d.hash === hash);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4">🔍 Verificação de Documento</h1>

        {!doc ? (
          <p className="text-red-600 font-medium">❌ Documento não encontrado.</p>
        ) : (
          <>
            <p className="text-green-600 font-semibold mb-4">✅ Documento verificado com sucesso!</p>
            <div className="text-left text-gray-700 text-sm space-y-2">
              <p><strong>📄 Nome:</strong> {doc.name}</p>
              <p><strong>🔑 Hash:</strong> {doc.hash}</p>
              <p><strong>✍️ Assinaturas:</strong></p>
              <ul className="pl-4 list-disc">
                {doc.signatures.map((sig, i) => (
                  <li key={i}>
                    {sig.wallet.slice(0, 8)}... — {sig.signedAt}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
