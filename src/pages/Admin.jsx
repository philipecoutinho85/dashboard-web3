import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
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
    if (!user) return alert('Usuário não autenticado.');

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

    alert(`✅ ${atualizados} documentos atualizados com seu UID.`);
  };

  const total = documentos.length;
  const assinados = documentos.filter((doc) => doc.status === 'Assinado').length;
  const pendentes = documentos.filter((doc) => doc.status === 'Pendente').length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      <main className="flex-grow px-4 pb-20 pt-4 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#ff385c]">🔐 Painel Administrativo</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-100 dark:bg-gray-800 border rounded-xl p-4 text-center shadow"
          >
            <FileText className="mx-auto text-gray-600 dark:text-gray-300 mb-1" size={28} />
            <p className="text-sm text-gray-600 dark:text-gray-300">Total de Documentos</p>
            <p className="text-2xl font-bold text-black dark:text-white">{total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-100 dark:bg-green-800 border rounded-xl p-4 text-center shadow"
          >
            <CheckCircle className="mx-auto text-green-700 mb-1" size={28} />
            <p className="text-sm text-gray-600 dark:text-gray-300">Assinados</p>
            <p className="text-2xl font-bold text-green-700 dark:text-white">{assinados}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-100 dark:bg-yellow-700 border rounded-xl p-4 text-center shadow"
          >
            <Clock className="mx-auto text-yellow-700 mb-1" size={28} />
            <p className="text-sm text-gray-600 dark:text-gray-300">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-white">{pendentes}</p>
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

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-300">Carregando documentos...</p>
        ) : documentos.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-300">Nenhum documento encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white dark:bg-gray-800 shadow border rounded-xl p-4"
              >
                <h3 className="text-md font-semibold text-indigo-700 dark:text-white">{doc.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Status: {doc.status}</p>
                <p className="text-xs break-words text-gray-400 dark:text-gray-400 mb-2">Hash: {doc.hash}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Assinaturas: {doc.signatures?.length || 0} de 2</p>
                <p className="text-xs text-gray-400 mb-1">Criado por: {doc.uid || 'desconhecido'}</p>
                <div className="mt-2 flex justify-between">
                  <a
                    href={`/validar/${doc.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-[#ff385c] text-white px-3 py-1 rounded hover:bg-red-500"
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
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Admin;
