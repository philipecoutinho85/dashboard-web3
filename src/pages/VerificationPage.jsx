import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

export default function VerificationPage() {
  const { hash } = useParams();
  const [doc, setDoc] = useState(null);
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("hashsign_docs_"));
    for (const key of keys) {
      const docs = JSON.parse(localStorage.getItem(key));
      const found = docs.find(d => d.hash === hash);
      if (found) {
        setDoc(found);
        break;
      }
    }
  }, [hash]);

  useEffect(() => {
    if (doc) {
      const url = `${window.location.origin}/validar/${hash}`;
      QRCode.toDataURL(url, { width: 160 }, function (err, url) {
        if (err) console.error("Erro ao gerar QR Code", err);
        else setQrDataUrl(url);
      });
    }
  }, [doc, hash]);

  const generatePDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Documento: " + doc.name, 10, 20);
    pdf.setFontSize(10);
    pdf.text("Status: " + doc.status, 10, 30);
    pdf.text("Hash: " + doc.hash, 10, 40);
    pdf.text("Verificação: " + `${window.location.origin}/validar/${hash}`, 10, 50);

    if (doc.signatures?.length > 0) {
      pdf.text("Assinaturas:", 10, 60);
      doc.signatures.forEach((sig, i) => {
        pdf.text(`${sig.wallet} – ${sig.date}`, 10, 70 + i * 10);
      });
    }

    if (qrDataUrl) {
      pdf.addImage(qrDataUrl, 'PNG', 140, 20, 50, 50);
    }

    pdf.save(`documento-assinado-${hash}.pdf`);
  };

  if (!doc) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-gray-500 text-sm">Documento não encontrado para o hash: {hash}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Verificação de Documento</h1>
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl w-full border border-gray-200">
        <h2 className="text-lg font-bold text-indigo-700 mb-2">📄 {doc.name}</h2>
        <p className="text-sm text-gray-600 mb-1">Status: <span className="text-green-600">{doc.status}</span></p>
        <p className="text-xs text-gray-500 mb-1 break-all">Hash: {doc.hash}</p>
        <p className="text-sm font-medium mt-2">Assinaturas: {doc.signatures?.length || 0}</p>

        {doc.signatures?.length > 0 && (
          <ul className="text-xs mt-1 text-gray-700 list-disc ml-4">
            {doc.signatures.map((sig, i) => (
              <li key={i}>{sig.wallet} – {sig.date}</li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col items-center justify-center">
          <canvas ref={canvasRef} className="border border-gray-300 rounded" />
          <p className="text-xs text-gray-400 mt-2 text-center">
            Escaneie o QR Code para validar este documento em outro dispositivo
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={generatePDF} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
            📥 Baixar PDF Assinado
          </button>
        </div>
      </div>
    </div>
  );
}
