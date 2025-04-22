import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'react-qr-code';
import Header from '@/components/Header';
import useWallet from '@/hooks/useWallet';

export default function VerificationPage() {
  const { hash } = useParams();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { walletAddress, connectWallet } = useWallet();

  useEffect(() => {
    const fetchDoc = async () => {
      const ref = doc(db, 'documentos', hash);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setDocData(snap.data());
      }
      setLoading(false);
    };

    fetchDoc();
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        🔄 Carregando verificação...
      </div>
    );
  }

  if (!docData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        ❌ Documento não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header walletAddress={walletAddress} connectWallet={connectWallet} />

      <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
        <h2 className="text-xl font-bold text-center mb-6">Verificação de Documento</h2>

        <div className="text-center mb-4">
          <a
            href={docData.cidUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-700 text-lg font-medium hover:underline"
          >
            📄 {docData.name}
          </a>
        </div>

        <p className="text-sm text-center mb-1">
          <span className="text-gray-600">Status:</span>{' '}
          <span className={docData.status === 'Assinado' ? 'text-green-600' : 'text-yellow-600'}>
            {docData.status}
          </span>
        </p>
        <p className="text-xs text-center text-gray-400 mb-4">Hash: {docData.hash}</p>

        <p className="text-sm text-center font-medium mb-2">
          Assinaturas: {docData.signatures?.length || 0}
        </p>
        <ul className="text-xs text-gray-700 list-disc list-inside mb-4">
          {docData.signatures?.map((sig, i) => (
            <li key={i}>{sig.wallet} – {sig.date}</li>
          ))}
        </ul>

        <div className="flex justify-center">
          <QRCode value={docData.hash} size={128} />
        </div>

        <p className="text-xs text-center text-gray-400 mt-3">
          Escaneie o QR Code para validar este documento em outro dispositivo
        </p>

        <div className="text-center mt-6">
          <a
            href={`/api/pdf/${docData.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
          >
            📥 Baixar PDF Assinado
          </a>
        </div>
      </div>
    </div>
  );
}
