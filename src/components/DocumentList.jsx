import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const VerificationPage = () => {
  const { hash } = useParams();
  const canvasRef = useRef(null);
  const [signatures, setSignatures] = useState([]);

  const verificationUrl = `${window.location.origin}/validar/${hash}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, verificationUrl, { width: 160 }, (err) => {
        if (err) console.error(err);
      });
    }

    const fetchDoc = async () => {
      const docRef = doc(db, 'documentos', hash); // ajuste o nome da coleção se necessário
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSignatures(data.signatures || []);
      }
    };

    fetchDoc();
  }, [verificationUrl, hash]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Verificação de Documento</h1>
      <p className="text-sm text-gray-600 mb-1">
        Hash verificado: <span className="font-mono">{hash}</span>
      </p>

      <div className="my-6">
        <canvas ref={canvasRef} />
        <p className="text-xs text-gray-500 mt-2 text-center">
          Escaneie o QR Code para validar este documento em outro dispositivo
        </p>
      </div>

      <p className="text-sm text-gray-800 font-medium mt-4">
        📄 Assinaturas: {signatures.length}
      </p>
    </div>
  );
};

export default VerificationPage;
