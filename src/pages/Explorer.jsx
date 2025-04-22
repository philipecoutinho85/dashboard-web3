import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Link } from 'react-router-dom';

const ExplorerDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentos = async () => {
      const snapshot = await getDocs(collection(db, 'documentos'));
      const data = snapshot.docs.map(doc => doc.data());
      setDocumentos(data);
      setLoading(false);
    };
    fetchDocumentos();
  }, []);

  if (loading) return <p className="text-center mt-10">Carregando documentos...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">📂 Explorer de Documentos Assinados</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentos.map((doc, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <h3 className="font-semibold text-indigo-700 text-sm truncate">{doc.name}</h3>
            <p className="text-xs text-gray-500 mt-1">Hash:</p>
            <p className="text-xs text-gray-700 break-words mb-2">{doc.hash}</p>
            <p className="text-sm font-medium text-gray-800 mb-1">Status: <span className="text-green-600">{doc.status}</span></p>
            <p className="text-xs text-gray-500">Assinaturas: {doc.signatures?.length || 0} de 2</p>
            <Link to={`/validar/${doc.hash}`} className="inline-block mt-3 text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition">
              Ver Documento
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorerDocumentos;
