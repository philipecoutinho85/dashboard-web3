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

  if (!currentDoc.signatures) {
    currentDoc.signatures = [];
  }

  const alreadySigned = currentDoc.signatures.some(s => s.wallet === walletAddress);
  if (alreadySigned) {
    alert('Esta carteira já assinou este documento.');
    return;
  }

  currentDoc.signatures.push({
    wallet: walletAddress,
    signedAt: timestamp,
    signature,
  });

  currentDoc.pdfUrl = url;
  currentDoc.pdfName = pdfName;

  setDocs(updatedDocs);

  // 🔒 Salva para o usuário logado
  const uid = auth.currentUser?.uid;
  if (uid) {
    localStorage.setItem(`hashsign_docs_${uid}`, JSON.stringify(updatedDocs));
  }

  // 🌍 Salva também no Explorer (hashsign_docs_by_user)
  const allDocs = JSON.parse(localStorage.getItem('hashsign_docs_by_user') || '{}');
  allDocs[uid] = updatedDocs;
  localStorage.setItem('hashsign_docs_by_user', JSON.stringify(allDocs));
};
