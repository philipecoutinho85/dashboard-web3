// src/components/DocumentUpload.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { auth } from '@/firebase';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export default function DocumentUpload() {
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const userId = auth.currentUser?.uid;
  const storageKey = `hashsign_docs_${userId}`;

  useEffect(() => {
    if (!userId) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) setDocs(JSON.parse(saved));
  }, [userId]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(account);
    } else {
      alert('MetaMask não detectada.');
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    const hash = 'hash_' + Math.random().toString(36).substring(2, 12);
    const newDoc = {
      name: file.name,
      hash,
      signed: false,
      signatures: [],
      owner: userId,
    };
    const updated = [...docs, newDoc];
    setDocs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
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
    const dateStamp = new Date().toISOString().split("T")[0];
    const pdfName = `documento-assinado-${dateStamp}-${doc.hash}.pdf`;
    const verificationUrl = `${window.location.origin}/validar/${doc.hash}`;

    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    const pdf = new jsPDF();
    pdf.text(`Documento: ${doc.name}`, 10, 20);
    pdf.text(`Hash: ${doc.hash}`, 10, 30);
    pdf.text(`Carteira: ${walletAddress}`, 10, 40);
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
    localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
  };

  const handleDelete = (index) => {
    const updated = [...docs];
    updated.splice(index, 1);
    setDocs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📝 Assinatura de Documentos
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <button
          onClick={connectWallet}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          {walletAddress ? `Carteira: ${walletAddress.slice(0, 6)}...` : 'Conectar Carteira'}
        </button>

        <label className="relative inline-block">
          <input type="file" onChange={handleFileChange} className="sr-only" />
          <span className="inline-block bg-gray-200 text-sm text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300">
            Escolher arquivo
          </span>
        </label>

        <button
          onClick={handleUpload}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Upload
        </button>
      </div>

      {docs.length > 0 && (
        <div className="space-y-4 mt-4">
          {docs.map((doc, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md border">
              <p className="text-sm text-gray-700"><strong>Nome:</strong> {doc.name}</p>
              <p className="text-sm text-gray-700"><strong>Hash:</strong> {doc.hash}</p>
              {doc.signed && (
                <p className="text-green-600 text-sm font-medium">✅ Documento assinado</p>
              )}

              {doc.signatures?.length > 0 && (
                <div className="mt-2 text-sm text-gray-700">
                  <p className="text-indigo-600 font-medium">🖊️ Assinado por:</p>
                  <ul className="pl-4 space-y-1 list-disc">
                    {doc.signatures.map((s, i) => (
                      <li key={i}>
                        <span className="font-mono text-xs text-gray-600">{s.wallet.slice(0, 6)}...{s.wallet.slice(-4)}</span>{' '}
                        <span className="text-gray-500 text-xs">em {s.signedAt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4 mt-4">
                {!doc.signed && (
                  <button
                    onClick={() => handleSign(index)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    Assinar Documento
                  </button>
                )}
                <button
                  onClick={() => handleDelete(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                >
                  Excluir
                </button>
                {doc.pdfUrl && (
                  <a
                    href={doc.pdfUrl}
                    download={doc.pdfName}
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    Baixar PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
