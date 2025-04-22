import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const Explorer = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  useEffect(() => {
    const fetchDocumentos = async () => {
      const snapshot = await getDocs(collection(db, 'documentos'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocumentos(data);
      setLoading(false);
    };
    fetchDocumentos();
  }, []);

  const documentosFiltrados = documentos.filter((doc) => {
    const nome = doc.name?.toLowerCase() || '';
    const hash = doc.hash?.toLowerCase() || '';
    const emailAssinaturas = doc.signatures?.map(sig => sig.email?.toLowerCase() || '').join(' ') || '';

    const matchBusca = [nome, hash, emailAssinaturas].some(campo =>
      campo.includes(busca.toLowerCase().trim())
    );

    const matchStatus =
      filtroStatus === 'todos' ||
      (filtroStatus === 'pendente' && doc.status === 'Pendente') ||
      (filtroStatus === 'assinado' && doc.status === 'Assinado');

    return matchBusca && matchStatus;
  });

  if (loading) return <p className="text-center mt-10">Carregando documentos...</p>;

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">📂 Explorer de Documentos Assinados</h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar por nome, hash ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-md"
          />

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="assinado">Assinados</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentosFiltrados.map((doc, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow border border-gray-200">
              <h3 className="font-semibold text-indigo-700 text-sm truncate">{doc.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Hash:</p>
              <p className="text-xs text-gray-700 break-words mb-2">{doc.hash}</p>
              <p className="text-sm font-medium text-gray-800 mb-1">
                Status: <span className={doc.status === 'Assinado' ? 'text-green-600' : 'text-yellow-600'}>{doc.status}</span>
              </p>
              <p className="text-xs text-gray-500">Assinaturas: {doc.signatures?.length || 0} de 2</p>
              <Link to={`/validar/${doc.hash}`} className="inline-block mt-3 text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition">
                Ver Documento
              </Link>
            </div>
          ))}
        </div>

        {documentosFiltrados.length === 0 && (
          <p className="text-center text-gray-500 mt-6">Nenhum documento encontrado com os critérios aplicados.</p>
        )}
      </div>
    </>
  );
};

export default Explorer;
