import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import Header from '@/components/Header';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const corrigirDocumentosSemUid = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Usuário não autenticado.');
      return;
    }

    const uid = user.uid;
    const snapshot = await getDocs(collection(db, 'documentos'));
    const documentos = snapshot.docs;

    let atualizados = 0;

    for (const d of documentos) {
      const data = d.data();
      if (!data.uid) {
        const ref = doc(db, 'documentos', d.id);
        await updateDoc(ref, { uid });
        atualizados++;
      }
    }

    alert(`✅ ${atualizados} documentos atualizados com sucesso com seu UID.`);
  };

  const total = documentos.length;
  const assinados = documentos.filter(doc => doc.status === 'Assinado').length;
  const pendentes = documentos.filter(doc => doc.status === 'Pendente').length;

  if (loading) return <p className="text-center mt-10">Carregando documentos...</p>;

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">🔐 Painel Administrativo</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="bg-gray-100 border rounded-xl p-4 text-center shadow"
          >
            <FileText className="mx-auto text-gray-600 mb-1" size={28} />
            <p className="text-sm text-gray-600">Total de Documentos</p>
            <p className="text-2xl font-bold text-black">{total}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-green-100 border rounded-xl p-4 text-center shadow"
          >
            <CheckCircle className="mx-auto text-green-700 mb-1" size={28} />
            <p className="text-sm text-gray-600">Assinados</p>
            <p className="text-2xl font-bold text-green-700">{assinados}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-yellow-100 border rounded-xl p-4 text-center shadow"
          >
            <Clock className="mx-auto text-yellow-700 mb-1" size={28} />
            <p className="text-sm text-gray-600">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-700">{pendentes}</p>
          </motion.div>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={corrigirDocumentosSemUid}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Corrigir documentos sem UID
          </button>
        </div>

        {documentos.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum documento encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((doc) => (
              <motion.div 
                key={doc.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.05 }}
                className="bg-white shadow border rounded-xl p-4"
              >
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Admin;
