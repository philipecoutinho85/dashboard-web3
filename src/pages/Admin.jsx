import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import Header from '@/components/Header';

const Admin = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'documentos'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDocumentos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      await deleteDoc(doc(db, 'documentos', id));
    }
  };

  if (loading) return <p className="text-center mt-10">Carregando documentos...</p>;

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">🔐 Painel Administrativo</h1>

        {documentos.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum documento encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((doc) => (
              <div key={doc.id} className="bg-white shadow border rounded-xl p-4">
                <h3 className="text-md font-semibold text-indigo-700">{doc.name}</h3>
                <p className="text-xs text-gray-500 mb-1">Status: {doc.status}</p>
                <p className="text-xs break-words text-gray-400 mb-2">Hash: {doc.hash}</p>
                <p className="text-xs text-gray-600">Assinaturas: {doc.signatures?.length || 0} de 2</p>
                <p className="text-xs text-gray-400 mb-1">Criado por: {doc.uid || 'desconhecido'}</p>
                <div className="mt-2 flex justify-between">
                  <a
                    href={`/validar/${doc.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                  >
                    Ver
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Admin;
