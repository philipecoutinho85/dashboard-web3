// DocumentUpload.jsx
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { ethers } from 'ethers';
import { auth } from '@/firebase';

export default function DocumentUpload({ docs, setDocs }) {
  const [file, setFile] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = () => {
    if (!file) return;
    const mockHash = `hash_${Math.random().toString(36).substring(2, 10)}`;
    const newDoc = {
      name: file.name,
      hash: mockHash,
      signatures: [],
      signed: false,
    };
    const updatedDocs = [...docs, newDoc];
    setDocs(updatedDocs);
    setFile(null);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
      const allDocs = JSON.parse(localStorage.getItem('hashsign_docs_by_user') || '{}');
      allDocs[uid] = updatedDocs;
      localStorage.setItem('hashsign_docs_by_user', JSON.stringify(allDocs));
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } else {
      alert('MetaMask não instalada');
    }
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
    const dateStamp = new Date().toISOString().split("T")[0];
    const pdfName = `documento-assinado-${dateStamp}-${doc.hash}.pdf`;
    const verificationUrl = `${window.location.origin}/validar/${doc.hash}`;

    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    const pdf = new jsPDF();
    pdf.text(`Documento: ${doc.name}`, 10, 20);
    pdf.text(`Hash: ${doc.hash}`, 10, 30);
    pdf.text(`Carteira que assinou: ${walletAddress}`, 10, 40);
    pdf.text(`Data: ${timestamp}`, 10, 50);
    pdf.text(`Assinatura: ${signature.slice(0, 40)}...`, 10, 60);
    pdf.text("Verifique escaneando o QR Code:", 10, 75);
    pdf.addImage(qrCodeDataUrl, 'PNG', 10, 80, 50, 50);

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    const updatedDocs = [...docs];
    const currentDoc = updatedDocs[index];

    if (!currentDoc.signatures) currentDoc.signatures = [];

    const alreadySigned = currentDoc.signatures.some(s => s.wallet === walletAddress);
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

  const handleDelete = (index) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const updatedDocs = [...docs];
    updatedDocs.splice(index, 1);
    setDocs(updatedDocs);
    localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
    const allDocs = JSON.parse(localStorage.getItem('hashsign_docs_by_user') || '{}');
    allDocs[uid] = updatedDocs;
    localStorage.setItem('hashsign_docs_by_user', JSON.stringify(allDocs));
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-10">
      <h2 className="text-xl font-bold text-[#ff385c] mb-6 flex items-center gap-2">📝 Assinatura de Documentos</h2>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={connectWallet}
          className="bg-[#ff385c] hover:bg-[#e03552] text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Conectar Carteira
        </button>
        <input
          type="file"
          onChange={handleFileChange}
          className="bg-gray-100 text-sm px-3 py-2 rounded border border-gray-300"
        />
        <button
          onClick={handleUpload}
          className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Upload
        </button>
      </div>

      {docs.map((doc, index) => (
        <div key={index} className="bg-gray-50 border rounded-lg p-4 mb-4">
          <p><strong>📄 Nome:</strong> {doc.name}</p>
          <p><strong>🔑 Hash:</strong> {doc.hash}</p>

          {doc.signed ? (
            <>
              <p className="text-green-600 font-medium mt-1">✅ Documento assinado</p>
              <p className="text-sm text-gray-600 mt-1">✍️ Assinado por:</p>
              <ul className="text-sm text-gray-600 ml-3">
                {doc.signatures?.map((s, i) => (
                  <li key={i}>• {s.wallet.slice(0, 6)}... em {s.signedAt}</li>
                ))}
              </ul>
            </>
          ) : (
            <button
              onClick={() => handleSign(index)}
              className="mt-3 bg-[#ff385c] text-white px-4 py-2 rounded text-sm hover:bg-[#e03552]"
            >
              🖊️ Assinar Documento
            </button>
          )}

          <div className="flex gap-4 mt-3 items-center">
            <button
              onClick={() => handleDelete(index)}
              className="text-sm text-gray-600 hover:text-red-600 flex items-center"
            >
              🗑️ Excluir
            </button>
            {doc.pdfUrl && (
              <a
                href={doc.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                📥 Baixar PDF
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
