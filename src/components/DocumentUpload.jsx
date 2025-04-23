import React, { useState } from 'react';
import { auth, db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import useWallet from '@/hooks/useWallet';

const DocumentUpload = ({ docs, setDocs }) => {
  const [file, setFile] = useState(null);
  const [assinaturaMultipla, setAssinaturaMultipla] = useState('única');
  const [emailSegundo, setEmailSegundo] = useState('');
  const { walletAddress } = useWallet();

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
      uid: auth.currentUser?.uid || null
    };

    const updatedDocs = [...docs, newDoc];
    setDocs(updatedDocs);
    await setDoc(doc(db, 'documentos', mockHash), newDoc);

    if (auth.currentUser?.uid) {
      localStorage.setItem(`hashsign_docs_${auth.currentUser.uid}`, JSON.stringify(updatedDocs));
    }

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
    const limiteAssinaturas = isMultipla ? 2 : 1;

    if (!autorizadoComoSegundo) {
      alert('Você não está autorizado a assinar como segunda parte neste documento.');
      return;
    }

    if (alreadySigned || existingDoc.signatures.length >= limiteAssinaturas) return;

    const newSignature = {
      wallet: walletAddress,
      date: new Date().toLocaleString(),
      email: currentEmail,
    };

    const updatedSignatures = [...existingDoc.signatures, newSignature];
    const updatedStatus = updatedSignatures.length >= limiteAssinaturas ? 'Assinado' : 'Pendente';

    const updatedDoc = {
      ...existingDoc,
      signatures: updatedSignatures,
      status: updatedStatus
    };

    await setDoc(ref, updatedDoc);
    const updatedDocs = [...docs];
    updatedDocs[index] = updatedDoc;
    setDocs(updatedDocs);

    if (auth.currentUser?.uid) {
      localStorage.setItem(`hashsign_docs_${auth.currentUser.uid}`, JSON.stringify(updatedDocs));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📤 Enviar Novo Documento</h2>
      <form onSubmit={handleUpload} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de assinatura</label>
          <select
            value={assinaturaMultipla}
            onChange={(e) => setAssinaturaMultipla(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
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
        const totalAssinaturas = doc.assinaturaMultipla === 'múltipla' ? 2 : 1;

        return (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <h3 className="text-md font-bold text-indigo-700 truncate">{doc.name}</h3>
            <p className="text-sm text-gray-600">Status: <span className="font-medium">{doc.status}</span></p>
            <p className="text-xs text-gray-400 break-words">Hash: {doc.hash}</p>
            <p className="text-xs mt-1">Assinaturas: {doc.signatures.length} de {totalAssinaturas}</p>

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
                  </div>
                )}
              </>
            )}

            <button
              disabled={!walletAddress || alreadySigned || doc.signatures.length >= totalAssinaturas}
              onClick={() => handleSign(index)}
              className={`mt-4 px-3 py-1 rounded text-sm ${
                !walletAddress || alreadySigned || doc.signatures.length >= totalAssinaturas
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {alreadySigned
                ? '✔️ Já assinado por você'
                : doc.signatures.length >= totalAssinaturas
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
