import React, { useState } from 'react';
import QRCode from 'react-qr-code';

const HashVerifier = ({ documents }) => {
  const [hashInput, setHashInput] = useState('');
  const [match, setMatch] = useState(null);

  const handleVerify = () => {
    const found = documents.find((doc) => doc.hash === hashInput);
    setMatch(found || false);
  };

  return (
    <div style={{
      background: '#fff',
      padding: '2rem',
      borderRadius: '12px',
      marginTop: '2rem',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ color: '#4f46e5', marginBottom: '1rem' }}>🔎 Verificar Assinatura</h2>

      <input
        type="text"
        placeholder="Digite o hash (CID) do documento"
        value={hashInput}
        onChange={(e) => setHashInput(e.target.value)}
        style={{
          width: '100%',
          padding: '0.7rem',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginBottom: '1rem',
          fontSize: '1rem'
        }}
      />
      <button
        onClick={handleVerify}
        style={{
          backgroundColor: '#4f46e5',
          color: '#fff',
          padding: '0.6rem 1.2rem',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Verificar
      </button>

      {match === false && (
        <p style={{ color: '#ef4444', marginTop: '1rem' }}>
          ❌ Documento não encontrado ou ainda não assinado.
        </p>
      )}

      {match && (
        <div style={{ marginTop: '1rem' }}>
          <p><strong>Documento:</strong> {match.name}</p>
          <p><strong>Assinado em:</strong> {match.signedAt}</p>
          <p><strong>Hash:</strong> {match.hash}</p>
          <div style={{ background: '#fff', padding: '10px', display: 'inline-block', marginTop: '1rem' }}>
            <QRCode value={match.hash} size={128} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HashVerifier;
