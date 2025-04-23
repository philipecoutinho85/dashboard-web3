// ValidarDocumento.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import useWallet from '@/hooks/useWallet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Share2 } from 'lucide-react';

const ValidarDocumento = () => {
  const { hash } = useParams();
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef();
  const { walletAddress } = useWallet();

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

  const handleShare = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert('🔗 Link de verificação copiado para a área de transferência!');
  };

  const handleSign = async () => {
    if (!walletAddress || !auth.currentUser || !documento) return;

    const currentEmail = auth.currentUser.email;
    const alreadySigned = documento.signatures.some(sig => sig.wallet === walletAddress);
    const isMultipla = documento.assinaturaMultipla === 'múltipla';
    const segundoEmail = documento.emailSegundo;
    const ehSegundo = isMultipla && documento.signatures.length === 1;
    const autorizadoComoSegundo = !ehSegundo || (ehSegundo && currentEmail === segundoEmail);

    if (!autorizadoComoSegundo) {
      alert('Você não está autorizado a assinar como segunda parte neste documento.');
      return;
    }

    if (alreadySigned || documento.signatures.length >= 2) return;

    const newSignature = {
      wallet: walletAddress,
      date: new Date().toLocaleString(),
      email: currentEmail,
    };

    const updatedSignatures = [...documento.signatures, newSignature];
    const updatedStatus =
      documento.assinaturaMultipla === 'única' || updatedSignatures.length >= 2
        ? 'Assinado'
        : 'Pendente';

    const updatedDoc = {
      ...documento,
      signatures: updatedSignatures,
      status: updatedStatus,
    };

    const ref = doc(db, 'documentos', hash);
    await setDoc(ref, updatedDoc);
    setDocumento(updatedDoc);
  };

  if (loading) return <p className="text-center mt-10">Carregando documento...</p>;
  if (!documento) return <p className="text-center mt-10 text-red-500">Documento não encontrado.</p>;

  const currentEmail = auth.currentUser?.email || '';
  const alreadySigned = documento.signatures.some(sig => sig.wallet === walletAddress);
  const isMultipla = documento.assinaturaMultipla === 'múltipla';
  const segundoEmail = documento.emailSegundo;
  const ehSegundo = isMultipla && documento.signatures.length === 1;
  const autorizadoComoSegundo = !ehSegundo || (ehSegundo && currentEmail === segundoEmail);

  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div ref={cardRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-xl border border-gray-300 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-center mb-4 text-black dark:text-white">📄 Verificação de Documento</h2>
          <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">Nome: <strong>{documento.name}</strong></p>
          <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">Hash: <span className="break-words text-xs">{documento.hash}</span></p>
          <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">Status: <span className="text-green-600 font-medium">{documento.status}</span></p>

          {documento.signatures && documento.signatures.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-black dark:text-white">Assinaturas:</h3>
              <ul className="list-disc ml-4 text-sm text-gray-700 dark:text-gray-200 mt-1">
                {documento.signatures.map((sig, index) => (
                  <li key={index}>{sig.wallet} — {sig.email || 'Sem e-mail'} — {sig.date}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-between items-center mt-6">
            <QRCode value={window.location.href} size={72} bgColor="#ffffff" fgColor="#000000" />
            <button
              onClick={handleDownloadPDF}
              className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
            >
              Baixar PDF assinado
            </button>
            <button
              onClick={handleShare}
              className="text-sm flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
            >
              <Share2 size={16} /> Copiar link de verificação
            </button>
          </div>

          {!alreadySigned && documento.signatures.length < 2 && autorizadoComoSegundo && (
            <div className="mt-6 text-center">
              <button
                onClick={handleSign}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition"
              >
                ✍️ Assinar como segundo signatário
              </button>
            </div>
          )}

          <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
            🔒 Este documento possui validade jurídica conforme <strong>Medida Provisória nº 2.200-2/2001</strong> — ICP-Brasil.
            <br />MVP desenvolvido por <strong>Philipe Coutinho</strong> —{' '}
            <a
              href="https://p.coutinho.com.br"
              className="text-[#ff385c] underline hover:text-red-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              p.coutinho.com.br
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ValidarDocumento;
