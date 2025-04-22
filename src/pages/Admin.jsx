import React, { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import useWallet from '@/hooks/useWallet';

export default function Admin() {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();
  const { walletAddress, connectWallet } = useWallet();
  const userEmail = auth.currentUser?.email || '';

  // 🔐 Definição de admin
  const isAdmin = userEmail === 'philipecoutinho85@gmail.com';

  useEffect(() => {
    const fetchDocs = async () => {
      if (!isAdmin) return;
      const snapshot = await getDocs(collection(db, 'documentos'));
      const documentos = snapshot.docs.map((d) => d.data());
      setDocs(documentos);
    };

    fetchDocs();
  }, [isAdmin]);

  const handleDelete = async (hash) => {
    await deleteDoc(doc(db, 'documentos', hash));
    const updated = docs.filter((d) => d.hash !== hash);
    setDocs(updated);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updated));
    }
  };

  const handleVerify = (hash) => {
    navigate(`/validar/${hash}`);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Acesso restrito ao administrador.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔝 Topo padronizado com botão Admin */}
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
          <a href="/" className="text-sm hover:underline">🏠 Dashboard</a>
          <a href="/explorer" className="text-sm hover:underline">📂 Explorer</a>
          <a href="/admin" className="text-sm hover:underline font-semibold text-rose-600">🛠️ Admin</a>
          <button
            onClick={connectWallet}
            className="bg-rose-500 text-white text-sm px-3 py-1 rounded hover:bg-rose-600"
          >
            {walletAddress ? 'Carteira Conectada' : 'Conectar Carteira'}
          </button>
          <a href="/login" className="text-sm text-rose-500 hover:underline">Sair</a>
        </div>
      </div>

      {/* 📋 Lista de documentos */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold mb-4">📋 Painel Administrativo – Documentos Assinados</h2>

        {docs.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum documento encontrado.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">Nome</th>
                  <th className="px-4 py-2">Hash</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Assinaturas</th>
                  <th className="px-4 py-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{doc.name}</td>
                    <td className="px-4 py-2 break-all text-gray-600">{doc.hash}</td>
                    <td className="px-4 py-2">{doc.status}</td>
                    <td className="px-4 py-2">{doc.signatures?.length || 0}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleVerify(doc.hash)}
                        className="text-blue-600 hover:underline"
                      >
                        🔍 Verificar
                      </button>
                      <button
                        onClick={() => handleDelete(doc.hash)}
                        className="text-red-600 hover:underline"
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
