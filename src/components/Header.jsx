// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import useWallet from '@/hooks/useWallet';
import Header from '@/components/Header';

export default function Admin() {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();
  const { walletAddress } = useWallet();
  const userEmail = auth.currentUser?.email || '';

  const isAdmin = userEmail === 'philipe@web3.com';

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

  const totalDocs = docs.length;
  const signedDocs = docs.filter(doc => doc.status === 'Assinado').length;
  const unsignedDocs = totalDocs - signedDocs;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Acesso restrito ao administrador.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold mb-4">📊 Painel Administrativo</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border text-center">
            <h3 className="text-sm text-gray-500">Total de Documentos</h3>
            <p className="text-xl font-bold text-gray-800">{totalDocs}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border text-center">
            <h3 className="text-sm text-gray-500">Assinados</h3>
            <p className="text-xl font-bold text-green-600">{signedDocs}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border text-center">
            <h3 className="text-sm text-gray-500">Pendentes</h3>
            <p className="text-xl font-bold text-yellow-600">{unsignedDocs}</p>
          </div>
        </div>

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
      </div>
    </div>
  );
}
