
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';

export default function VerificationPage() {
  const { hash } = useParams();
  const [doc, setDoc] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Busca no localStorage do usuário (simula consulta pública)
    const keys = Object.keys(localStorage).filter(k => k.startsWith("hashsign_docs_"));
    for (const key of keys) {
      const docs = JSON.parse(localStorage.getItem(key));
      const found = docs.find(d => d.hash === hash);
      if (found) {
        setDoc(found);
        break;
      }
    }
  }, [hash]);

  useEffect(() => {
    if (doc && canvasRef.current) {
      const url = `${window.location.origin}/validar/${hash}`;
      QRCode.toCanvas(canvasRef.current, url, { width: 160 }, function (err) {
        if (err) console.error("Erro ao gerar QR Code", err);
      });
    }
  }, [doc, hash]);

  if (!doc) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-gray-500 text-sm">Documento não encontrado para o hash: {hash}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gray-50">
      <div className="bg-white shadow-md rounded-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-bold text-indigo-700 mb-2">📄 {doc.name}</h2>
        <p className="text-sm text-gray-500 mb-1">Status: <span className="text-green-600">{doc.status}</span></p>
        <p className="text-xs text-gray-500 mb-1 break-all">Hash: {doc.hash}</p>
        <p className="text-sm font-medium mt-2">Assinaturas: {doc.signatures?.length || 0}</p>

        {doc.signatures?.length > 0 && (
          <ul className="text-xs mt-1 text-gray-700 list-disc ml-4">
            {doc.signatures.map((sig, i) => (
              <li key={i}>{sig.wallet} – {sig.date}</li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col items-center">
          <canvas ref={canvasRef} />
          <p className="text-xs text-gray-400 mt-2 text-center">
            Escaneie o QR Code para validar este documento
          </p>
        </div>
      </div>
    </div>
  );
}
