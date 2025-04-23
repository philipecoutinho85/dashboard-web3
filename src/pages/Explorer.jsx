import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

const Explorer = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  useEffect(() => {
    const fetchDocumentos = async () => {
      const snapshot = await getDocs(collection(db, 'documentos'));
      const data = snapshot.docs.map(doc => doc.data());
      setDocumentos(data);
      setLoading(false);
    };
    fetchDocumentos();
  }, []);

  const documentosFiltrados = documentos.filter((doc) => {
    const matchBusca = doc.name.toLowerCase().includes(busca.toLowerCase()) ||
      doc.hash.toLowerCase().includes(busca.toLowerCase()) ||
      doc.signatures?.some(sig => sig.email?.toLowerCase().includes(busca.toLowerCase()));

    const matchStatus =
      filtroStatus === 'todos' ||
      (filtroStatus === 'pendente' && doc.status === 'Pendente') ||
      (filtroStatus === 'assinado' && doc.status === 'Assinado');

    return matchBusca && matchStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      <main className="flex-grow px-4 pb-28 pt-4 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#ff385c]">📂 Explorer de Documentos Assinados</h1>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar por nome, hash ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-md text-sm"
          />

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="assinado">Assinados</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Carregando documentos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentosFiltrados.map((doc, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200">
                <h3 className="font-semibold text-[#ff385c] text-sm truncate dark:text-white">{doc.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Hash:</p>
                <p className="text-xs text-gray-700 break-words mb-2 dark:text-gray-300">{doc.hash}</p>
                <p className="text-sm font-medium text-gray-800 mb-1 dark:text-gray-200">Status: <span className={doc.status === 'Assinado' ? 'text-green-600' : 'text-yellow-600'}>{doc.status}</span></p>
                <p className="text-xs text-gray-500">Assinaturas: {doc.signatures?.length || 0} de 2</p>
                <Link
                  to={`/validar/${doc.hash}`}
                  className="inline-block mt-3 text-sm bg-[#ff385c] text-white px-3 py-1 rounded hover:bg-red-500 transition"
                >
                  Ver Documento
                </Link>
              </div>
            ))}
          </div>
        )}

        {documentosFiltrados.length === 0 && !loading && (
          <p className="text-center text-gray-500 mt-6">Nenhum documento encontrado com os critérios aplicados.</p>
        )}

        <footer className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400">
          🔎 Esta é uma ferramenta de verificação pública. Todos os documentos aqui exibidos foram assinados digitalmente e podem ser consultados via blockchain. <br />
          MVP desenvolvido por Philipe Coutinho — <a href="https://p.coutinho.com.br" className="underline">p.coutinho.com.br</a>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
};

export default Explorer;
