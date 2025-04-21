import React, { useState } from 'react';
import { auth } from '@/firebase';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export default function DocumentUpload({ docs, setDocs, walletAddress }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = () => {
    if (!walletAddress) {
      alert('Conecte a carteira antes de fazer upload.');
      return;
    }

    if (!file) return;

    const mockHash = `hash_${Math.random().toString(36).substring(2, 10)}`;
    const newDoc = {
      name: file.name,
      hash: mockHash,
      status: 'Pendente',
      signatures: [],
    };

    const updatedDocs = [...docs, newDoc];
    setDocs(updatedDocs);
    setFile(null);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
    }
  };

  const handleSign = async (index) => {
    if (!walletAddress) return;

    const updatedDocs = [...docs];
    const doc = updatedDocs[index];

    const alreadySigned = doc.signatures.some(sig => sig.wallet === walletAddress);
    if (alreadySigned) {
      alert('Você já assinou este documento.');
      return;
    }

    const now = new Date().toLocaleString();
    const newSignature = {
      wallet: walletAddress,
      date: now,
      hash: doc.hash,
    };

    doc.signatures.push(newSignature);
    doc.status = 'Assinado';
    setDocs(updatedDocs);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
    }

    // 👉 Geração do PDF com QR Code
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text(`📄 Documento: ${doc.name}`, 20, 30);
    pdf.setFontSize(12);
    pdf.text(`Hash: ${doc.hash}`, 20, 45);
    pdf.text(`Assinado por:`, 20, 60);

    doc.signatures.forEach((sig, i) => {
      pdf.text(`- ${sig.wallet} em ${sig.date}`, 20, 70 + (i * 10));
    });

    // Gerar QR Code com link de verificação
    const qrText = `${window.location.origin}/validar/${doc.hash}`;
    const qrImage = await QRCode.toDataURL(qrText);
    pdf.addImage(qrImage, 'PNG', 140, 240, 50, 50);

    const filename = `documento-assinado-${doc.hash}.pdf`;
    pdf.save(filename);
  };

  return (
    <div className="border rounded-lg p-4 shadow-md bg-white">
    <input type="file" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        className="bg-black text-white px-4 py-2 rounded mr-4"
      >
        Upload
      </button>

      {docs.map((doc, index) => (
        <div key={index} className="border rounded-lg p-4 mt-4 bg-gray-50">
          <h3 className="text-md font-semibold text-indigo-700 mb-1">📄 {doc.name}</h3>
          <p className="text-sm text-yellow-600 font-medium">Status: {doc.status}</p>
          <p className="text-xs text-gray-500">Hash: {doc.hash}</p>
          <button
            onClick={() => handleSign(index)}
            disabled={!walletAddress}
            className={`mt-3 px-4 py-2 rounded text-white ${walletAddress ? 'bg-[#ff385c]' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            Assinar Documento
          </button>

          {doc.signatures.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Assinaturas:</p>
              <ul className="text-xs text-gray-600 list-disc ml-4">
                {doc.signatures.map((sig, i) => (
                  <li key={i}>{sig.wallet} – {sig.date}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
