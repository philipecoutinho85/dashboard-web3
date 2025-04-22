import React, { useState } from 'react';
import { auth, db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import useWallet from '@/hooks/useWallet';

const DocumentUpload = ({ docs, setDocs }) => {
  const [file, setFile] = useState(null);
  const [assinaturaMultipla, setAssinaturaMultipla] = useState('única');
  const [emailSegundo, setEmailSegundo] = useState('');
  const { walletAddress, connectWallet } = useWallet();

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
      signatures: [],
      createdAt: new Date().toISOString(),
      assinaturaMultipla,
      emailSegundo: assinaturaMultipla === 'múltipla' ? emailSegundo : null,
    };

    const updatedDocs = [...docs, newDoc];
    setDocs(updatedDocs);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
    }

    await setDoc(doc(db, 'documentos', newDoc.hash), newDoc);
    setFile(null);
    setEmailSegundo('');
  };

  const handleSign = async (index) => {
    if (!walletAddress || !auth.currentUser) return;

    const currentEmail = auth.currentUser.email;
    const docToSign = docs[index];
    const ref = doc(db, 'documentos', docToSign.hash);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;

    const existingDoc = snapshot.data();
    const alreadySigned = existingDoc.signatures.some(sig => sig.wallet === walletAddress);

    const isMultipla = existingDoc.assinaturaMultipla === 'múltipla';
    const segundoEmail = existingDoc.emailSegundo;

    const ehSegundo = isMultipla && existingDoc.signatures.length === 1;
    const autorizadoComoSegundo = !ehSegundo || (ehSegundo && currentEmail === segundoEmail);

    if (!autorizadoComoSegundo) {
      alert('Você não está autorizado a assinar como segunda parte neste documento.');
      return;
    }

    if (alreadySigned || existingDoc.signatures.length >= 2) return;

    const newSignature = {
      wallet: walletAddress,
      date: new Date().toLocaleString(),
      email: currentEmail,
    };

    const updatedSignatures = [...existingDoc.signatures, newSignature];
    const updatedStatus = updatedSignatures.length >= 2 ? 'Assinado' : 'Pendente';

    const updatedDoc = {
      ...existingDoc,
      signatures: updatedSignatures,
      status: updatedStatus
    };

    await setDoc(ref, updatedDoc);

    const updatedDocs = [...docs];
    updatedDocs[index] = updatedDoc;
    setDocs(updatedDocs);

    const uid = auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
    }
  };

  return (
    <div>
      <form onSubmit={handleUpload} className="mb-4 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de assinatura</label>
          <select
            value={assinaturaMultipla}
            onChange={(e) => setAssinaturaMultipla(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
          >
            <option value="única">Apenas uma pessoa irá assinar</option>
            <option value="múltipla">Haverá outra pessoa para assinar</option>
          </select>
        </div>

        {assinaturaMultipla === 'múltipla' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail da segunda parte</label>
            <input
              type="email"
              placeholder="exemplo@email.com"
              value={emailSegundo}
              onChange={(e) => setEmailSegundo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <input type="file" onChange={handleFileChange} className="text-sm" />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
        >
          Upload
        </button>
      </form>

      {docs.map((doc, index) => {
        const alreadySigned = doc.signatures.some(sig => sig.wallet === walletAddress);

        return (
          <div key={index} className="bg-white shadow-md border border-gray-200 rounded-xl p-4 mb-4">
            <h3 className="text-md font-bold text-indigo-700">{doc.name}</h3>
            <p className="text-sm text-gray-600">Status: <span className="text-yellow-700">{doc.status}</span></p>
            <p className="text-xs text-gray-400">Hash: {doc.hash}</p>
            <p className="text-xs mt-1">Assinaturas: {doc.signatures.length} de 2</p>

            {doc.assinaturaMultipla === 'múltipla' && doc.emailSegundo && (
              <>
                <p className="text-xs text-gray-500 mt-1">
                  Segundo signatário: <strong>{doc.emailSegundo}</strong>
                </p>

                {doc.signatures.length < 2 && (
                  <div className="mt-2">
                    <button
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl"
                      onClick={() => alert(`Convite enviado para ${doc.emailSegundo}`)}
                    >
                      📩 Enviar convite para segundo signatário
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Aguardando assinatura de: <strong>{doc.emailSegundo}</strong>
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              disabled={
                !walletAddress ||
                alreadySigned ||
                doc.signatures.length >= 2
              }
              onClick={() => handleSign(index)}
              className={`mt-4 px-3 py-1 rounded text-sm ${
                !walletAddress || alreadySigned || doc.signatures.length >= 2
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {alreadySigned
                ? '✔️ Já assinado por você'
                : doc.signatures.length >= 2
                ? '🔒 Assinaturas completas'
                : '✍️ Assinar Documento'}
            </button>

            {doc.signatures.length > 0 && (
              <ul className="text-xs text-gray-700 list-disc ml-4 mt-2">
                {doc.signatures.map((sig, i) => (
                  <li key={i}>
                    {sig.wallet} – {sig.date} {sig.email && `(email: ${sig.email})`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DocumentUpload;
