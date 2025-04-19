import React, { useState } from 'react';
import { ethers } from 'ethers';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { auth } from '@/firebase';

const DocumentUpload = ({ docs, setDocs }) => {
  const [file, setFile] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } else {
      alert('Metamask não encontrada.');
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;

    const mockHash = `bafkreihash${Math.random().toString(36).substring(7)}`;
    const newDoc = {
      name: file.name,
      hash: mockHash,
      signed: false,
    };

    const updatedDocs = [...docs, newDoc];
    setDocs(updatedDocs);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
    }

    setFile(null);
  };

  const handleSign = async (index) => {
    if (!walletAddress) {
      alert('Conecte sua carteira antes de assinar.');
      return;
    }

    const doc = docs[index];
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const message = `Assinatura do documento ${doc.name} com hash ${doc.hash}`;
    const signature = await signer.signMessage(message);

    const timestamp = new Date().toLocaleString();
    const dateStamp = new Date().toISOString().split('T')[0];
    const pdfName = `documento-assinado-${dateStamp}-${doc.hash}.pdf`;
    const verificationUrl = `${window.location.origin}/validar/${doc.hash}`;

    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    const pdf = new jsPDF();
    pdf.text(`Documento: ${doc.name}`, 10, 20);
    pdf.text(`Hash: ${doc.hash}`, 10, 30);
    pdf.text(`Carteira que assinou: ${walletAddress}`, 10, 40);
    pdf.text(`Data: ${timestamp}`, 10, 50);
    pdf.text(`Assinatura: ${signature.slice(0, 40)}...`, 10, 60);
    pdf.text('Verifique escaneando o QR Code:', 10, 75);
    pdf.addImage(qrCodeDataUrl, 'PNG', 10, 80, 50, 50);

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    const updatedDocs = [...docs];
    const currentDoc = updatedDocs[index];

    if (!currentDoc.signatures) {
      currentDoc.signatures = [];
    }

    const alreadySigned = currentDoc.signatures.some((s) => s.wallet === walletAddress);
    if (alreadySigned) {
      alert('Esta carteira já assinou este documento.');
      return;
    }

    currentDoc.signatures.push({ wallet: walletAddress, signedAt: timestamp, signature });
    currentDoc.pdfUrl = url;
    currentDoc.pdfName = pdfName;
    currentDoc.signed = true;

    setDocs(updatedDocs);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
      const allDocs = JSON.parse(localStorage.getItem('hashsign_docs_by_user') || '{}');
      allDocs[uid] = updatedDocs;
      localStorage.setItem('hashsign_docs_by_user', JSON.stringify(allDocs));
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#ff385c]">
        📝 Assinatura de Documentos
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <button
          onClick={connectWallet}
          className="bg-[#ff385c] hover:bg-[#e63950] text-white font-medium px-5 py-2.5 rounded-lg transition duration-200 shadow-sm"
        >
          {walletAddress ? `Carteira: ${walletAddress.slice(0, 6)}...` : 'Conectar Carteira'}
        </button>

        <label className="cursor-pointer">
          <input type="file" onChange={handleFileChange} className="hidden" />
          <span className="inline-block bg-black text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-900 transition duration-150">
            Escolher Arquivo
          </span>
        </label>

        <button
          onClick={handleUpload}
          className="bg-black hover:bg-gray-900 text-white font-medium px-5 py-2.5 rounded-lg transition duration-200 shadow-sm"
        >
          Upload
        </button>
      </div>

      {docs.length > 0 && (
        <div className="mt-6 space-y-5">
          {docs.map((doc, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-700">
                <strong>Nome:</strong> {doc.name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Hash:</strong> {doc.hash}
              </p>

              {doc.signed ? (
                <div className="mt-3 space-y-1">
                  <p className="text-green-600 font-medium text-sm">✅ Assinado em: {doc.signatures?.[0]?.signedAt}</p>
                  <a
                    href={doc.pdfUrl}
                    download={doc.pdfName}
                    className="text-indigo-600 hover:underline text-sm font-medium"
                  >
                    📥 Baixar PDF Assinado
                  </a>
                </div>
              ) : (
                <button
                  onClick={() => handleSign(index)}
                  className="mt-3 bg-[#ff385c] hover:bg-[#e63950] text-white px-4 py-2 text-sm font-semibold rounded-lg shadow transition duration-200"
                >
                  Assinar Documento
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
