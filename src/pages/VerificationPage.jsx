import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import QRCode from 'react-qr-code';
import useWallet from '@/hooks/useWallet';
import { downloadPDF } from '@/utils/pdfGenerator'; // Certifique-se que esse util está OK

export default function VerificationPage() {
  const { hash } = useParams();
  const [docData, setDocData] = useState(null);
  const { walletAddress, connectWallet } = useWallet();
  const userEmail = auth.currentUser?.email || '';

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, 'documentos', hash);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setDocData(snapshot.data());
      }
    };
    fetchData();
  }, [hash]);

  if (!docData) {
    return <p className="p-10 text-center text-gray-500">Carregando documento...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header igual ao dashboard/explorer */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b">
        <div>
          <h1 className="text-xl font-bold text-rose-600">HashSign</h1>
          <p className="text-sm text-gray-500">Bem-vindo, {userEmail}</p>
          {walletAddress && (
            <p className="text-xs text-green-600 mt-1">
              Carteira: <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <a href="/" className="text-sm hover:underline flex items-center">🏠 Dashboard</a>
          <a href="/explorer" className="text-sm hover:underline flex items-center">📂 Explorer</a>
          <button
            onClick={connectWallet}
            className="bg-rose-500 text-white text-sm px-3 py-1 rounded hover:bg-rose-600"
          >
            {walletAddress ? 'Carteira Conectada' : 'Conectar Carteira'}
          </button>
          <a href="/login" className="text-sm text-rose-500 hover:underline">Sair</a>
        </div>
      </div>

      {/* Conteúdo da verificação */}
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-semibold text-center mb-4">Verificação de Documento</h2>

        <h3 className="text-lg font-bold text-indigo-700 mb-1">📄 {docData.name}</h3>
        <p className="text-sm text-green-700 font-medium">Status: {docData.status}</p>
        <p className="text-xs text-gray-500 mt-1">Hash: {docData.hash}</p>

        <p className="text-sm mt-3 font-semibold">Assinaturas: {docData.signatures?.length || 0}</p>
        <ul className="text-xs text-gray-700 list-disc ml-4 mt-1">
          {docData.signatures?.map((sig, i) => (
            <li key={i}>{sig.wallet} – {sig.date}</li>
          ))}
        </ul>

        <div className="mt-6 mb-4 flex justify-center">
          <QRCode value={`https://dashboard-web3.onrender.com/validar/${docData.hash}`} size={160} />
        </div>

        <p className="text-center text-xs text-gray-400 mb-4">
          Escaneie o QR Code para validar este documento em outro dispositivo
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => downloadPDF(docData)}
            className="bg-black text-white px-6 py-2 rounded text-sm hover:bg-gray-800"
          >
            📥 Baixar PDF Assinado
          </button>
        </div>
      </div>
    </div>
  );
}
