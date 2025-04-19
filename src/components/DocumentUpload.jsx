import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { ethers } from 'ethers';
import { auth } from '@/firebase';

const DocumentUpload = ({ docs, setDocs }) => {
  const [file, setFile] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Instale uma carteira MetaMask!');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const [account] = await provider.send("eth_requestAccounts", []);
    setWalletAddress(account);
  };

  const handleUpload = async () => {
    if (!file) return;
    const hash = `hash_${Math.random().toString(36).substring(2, 10)}`;
    const newDoc = {
      name: file.name,
      hash,
      signed: false,
      signatures: [],
    };

    const updatedDocs = [...docs, newDoc];
    setDocs(updatedDocs);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
      const allDocs = JSON.parse(localStorage.getItem('hashsign_docs_by_user') || '{}');
      allDocs[uid] = updatedDocs;
      localStorage.setItem('hashsign_docs_by_user', JSON.stringify(allDocs));
    }

    setFile(null);
  };

  const handleSign = async (index) => {
    if (!walletAddress) return alert('Conecte sua carteira.');

    const doc = docs[index];
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const message = `Assinatura do documento ${doc.name} com hash ${doc.hash}`;
    let signature;
    try {
      signature = await signer.signMessage(message);
    } catch (err) {
      return alert('Erro ao assinar o documento.');
    }

    const timestamp = new Date().toLocaleString();
    const date = new Date().toISOString().split("T")[0];
    const pdfName = `documento-assinado-${date}-${doc.hash}.pdf`;
    const qrData = `${window.location.origin}/validar/${doc.hash}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const pdf = new jsPDF();
    pdf.text(`Documento: ${doc.name}`, 10, 20);
    pdf.text(`Hash: ${doc.hash}`, 10, 30);
    pdf.text(`Carteira que assinou: ${walletAddress}`, 10, 40);
    pdf.text(`Data: ${timestamp}`, 10, 50);
    pdf.text(`Assinatura: ${signature.slice(0, 40)}...`, 10, 60);
    pdf.text("Verifique escaneando o QR Code:", 10, 75);
    pdf.addImage(qrCodeUrl, 'PNG', 10, 80, 50, 50);

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    const updatedDocs = [...docs];
    const current = updatedDocs[index];

    if (!current.signatures) current.signatures = [];
    const alreadySigned = current.signatures.some(s => s.wallet === walletAddress);
    if (alreadySigned) return alert('Esta carteira já assinou.');

    current.signatures.push({ wallet: walletAddress, signedAt: timestamp, signature });
    current.signed = true;
    current.pdfUrl = url;
    current.pdfName = pdfName;

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
    const updated = docs.filter((_, i) => i !== index);
    setDocs(updated);
    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updated));
      const allDocs = JSON.parse(localStorage.getItem('hashsign_docs_by_user') || '{}');
      allDocs[uid] = updated;
      localStorage.setItem('hashsign_docs_by_user', JSON.stringify(allDocs));
    }
  };

  return (
    <div className="bg-[#fefdfb] rounded-xl p-6 border border-[#e7e7e7] shadow-md">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <button onClick={connectWallet} className="bg-[#ff5a5f] text-white px-4 py-2 rounded-lg shadow hover:bg-[#e94b50]">
          {walletAddress ? `🔗 ${walletAddress.slice(0, 6)}...` : 'Conectar Carteira'}
        </button>

        <input type="file" onChange={handleFileChange} className="hidden" id="file" />
        <label htmlFor="file" className="cursor-pointer bg-[#f2f2f2] text-gray-800 px-4 py-2 rounded hover:bg-[#e6e6e6]">Escolher Arquivo</label>

        <button onClick={handleUpload} className="bg-[#00a699] text-white px-4 py-2 rounded hover:bg-[#008f86]">Upload</button>
      </div>

      {docs.length > 0 && (
        <div className="space-y-4">
          {docs.map((doc, i) => (
            <div key={i} className="border border-[#dddddd] p-4 rounded-xl bg-white">
              <p className="text-sm text-gray-700"><strong>📄 Nome:</strong> {doc.name}</p>
              <p className="text-sm text-gray-700"><strong>Hash:</strong> {doc.hash}</p>

              {doc.signed ? (
                <div className="mt-2">
                  <p className="text-green-600 text-sm">✅ Assinado</p>
                  <a href={doc.pdfUrl} download={doc.pdfName} className="text-indigo-600 hover:underline text-sm">📥 Baixar PDF</a>
                </div>
              ) : (
                <button onClick={() => handleSign(i)} className="mt-2 bg-[#007a87] text-white px-4 py-1 rounded hover:bg-[#005f66] text-sm">
                  ✍️ Assinar Documento
                </button>
              )}

              <button onClick={() => handleDelete(i)} className="mt-2 ml-4 text-red-500 text-sm hover:underline">
                🗑️ Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
