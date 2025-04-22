// ✅ HashVerifier.jsx com layout padronizado e Tailwind aplicado
import React, { useState } from 'react';
import QRCode from 'react-qr-code';

const HashVerifier = ({ documents }) => {
  const [hashInput, setHashInput] = useState('');
  const [match, setMatch] = useState(null);

  const handleVerify = () => {
    const found = documents.find((doc) => doc.hash === hashInput);
    setMatch(found || false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">🔎 Verificar Assinatura</h2>

      <input
        type="text"
        placeholder="Digite o hash (CID) do documento"
        value={hashInput}
        onChange={(e) => setHashInput(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring focus:ring-indigo-200 mb-4"
      />

      <button
        onClick={handleVerify}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
      >
        Verificar
      </button>

      {match === false && (
        <p className="text-red-500 mt-4">❌ Documento não encontrado ou ainda não assinado.</p>
      )}

      {match && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-sm text-gray-700"><strong>📄 Documento:</strong> {match.name}</p>
          <p className="text-sm text-gray-700"><strong>📅 Assinado em:</strong> {match.signedAt || 'N/A'}</p>
          <p className="text-sm text-gray-700"><strong>🔗 Hash:</strong> {match.hash}</p>

          <div className="mt-4 flex justify-center">
            <div className="bg-white p-2 border rounded shadow">
              <QRCode value={match.hash} size={128} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HashVerifier;
