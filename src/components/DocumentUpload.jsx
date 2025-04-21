import React, { useState } from 'react';
import { auth, db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const DocumentUpload = ({ docs, setDocs }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const mockHash = `hash_${Math.random().toString(36).substring(7)}`;
    const newDoc = {
      name: file.name,
      hash: mockHash,
      cidUrl: `https://gateway.pinata.cloud/ipfs/${mockHash}`,
      status: 'Pendente',
      signatures: []
    };

    const uid = auth.currentUser?.uid;
    const updatedDocs = [...docs, newDoc];
    setDocs(updatedDocs);

    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
    }

    // Salva no Firestore com o hash como ID
    await setDoc(doc(db, 'documentos', newDoc.hash), newDoc);
    setFile(null);
  };

  const handleSign = async (index) => {
    const updatedDocs = [...docs];
    const docToSign = updatedDocs[index];

    const newSignature = {
      wallet: '0x' + Math.random().toString(16).substr(2, 40),
      date: new Date().toLocaleString()
    };

    docToSign.signatures.push(newSignature);
    docToSign.status = 'Assinado';
    setDocs(updatedDocs);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
    }

    // Atualiza no Firestore
    await setDoc(doc(db, 'documentos', docToSign.hash), docToSign);
  };

  return (
    <div>
      <form onSubmit={handleUpload} className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded text-sm">
          Upload
        </button>
      </form>

      {docs.map((doc, index) => (
        <div key={index} className="bg-white shadow-md border border-gray-200 rounded-xl p-4 mb-4">
          <h3 className="text-md font-bold text-indigo-700">{doc.name}</h3>
          <p className="text-sm text-gray-600">Status: <span className="text-green-700">{doc.status}</span></p>
          <p className="text-xs text-gray-400">Hash: {doc.hash}</p>

          <button
            onClick={() => handleSign(index)}
            className="mt-2 bg-gray-800 text-white px-3 py-1 rounded text-sm"
          >
            ✍️ Assinar Documento
          </button>

          <p className="text-xs mt-2">Assinaturas:</p>
          <ul className="text-xs text-gray-700 list-disc ml-4">
            {doc.signatures.map((sig, i) => (
              <li key={i}>{sig.wallet} – {sig.date}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DocumentUpload;
