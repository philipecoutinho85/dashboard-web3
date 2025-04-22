import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ValidarDocumento = () => {
  const { hash } = useParams();
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = React.useRef();

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, 'documentos', hash);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setDocumento(snapshot.data());
      }
      setLoading(false);
    };
    fetchData();
  }, [hash]);

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save(`documento-assinado-${new Date().toISOString().slice(0, 10)}-${hash}.pdf`);
  };

  if (loading) return <p className="text-center mt-10">Carregando documento...</p>;
  if (!documento) return <p className="text-center mt-10 text-red-500">Documento não encontrado.</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div ref={cardRef} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl border border-gray-300">
        <h2 className="text-2xl font-semibold text-center mb-4 text-black">Validação de Documento</h2>
        <p className="text-sm text-gray-700 mb-2">Nome: <strong>{documento.name}</strong></p>
        <p className="text-sm text-gray-700 mb-2">Hash: <span className="break-words text-xs">{documento.hash}</span></p>
        <p className="text-sm text-gray-700 mb-2">Status: <span className="text-green-600 font-medium">{documento.status}</span></p>

        {documento.signatures && documento.signatures.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-black">Assinaturas:</h3>
            <ul className="list-disc ml-4 text-sm text-gray-700 mt-1">
              {documento.signatures.map((sig, index) => (
                <li key={index}>{sig.wallet} — {sig.email || 'Sem e-mail'} — {sig.date}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <QRCode value={window.location.href} size={72} bgColor="#ffffff" fgColor="#000000" />
          <button
            onClick={handleDownloadPDF}
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
          >
            Baixar PDF assinado
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidarDocumento;
