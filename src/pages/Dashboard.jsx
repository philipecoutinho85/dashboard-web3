import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import Header from '@/components/Header';

const Dashboard = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, 'documentos'), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((doc) => doc.uid === user.uid); // filtra pelo UID

      setDocumentos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      await deleteDoc(doc(db, 'documentos', id));
    }
  };

  if (loading) return <p className="text-center mt-10">Carregando seus documentos...</p>;

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">📁 Meus Documentos</h1>

        {documentos.length === 0 ? (
          <p className="text-center text-gray-500">Você ainda não enviou nenhum documento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documentos.map((doc) => (
              <div key={doc.id} className="bg-white shadow border rounded-xl p-4">
                <h3 className="text-md font-semibold text-indigo-700">{doc.name}</h3>
                <p className="text-xs text-gray-500 mb-1">Status: {doc.status}</p>
                <p className="text-xs break-words text-gray-400">Hash: {doc.hash}</p>
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

export default Dashboard;
