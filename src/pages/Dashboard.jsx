// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth } from '@/firebase';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';
import useWallet from '@/hooks/useWallet';
import Header from '@/components/Header';

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const { walletAddress, connectWallet } = useWallet();
  const user = auth.currentUser;

  useEffect(() => {
    const userId = user?.uid;
    if (!userId) return;

    const savedDocs = localStorage.getItem(`hashsign_docs_${userId}`);
    if (savedDocs) {
      setDocs(JSON.parse(savedDocs));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Header walletAddress={walletAddress} connectWallet={connectWallet} />

        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-lg font-semibold mb-4">Upload de Documento</h2>
          <DocumentUpload docs={docs} setDocs={setDocs} walletAddress={walletAddress} />
        </div>

        <div>
          <h3 className="text-md font-semibold mb-3">📁 Meus Documentos</h3>
          <DocumentList docs={docs} setDocs={setDocs} />
        </div>
      </div>
    </div>
  );
}
