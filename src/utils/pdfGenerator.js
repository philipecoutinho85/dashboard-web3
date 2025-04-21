import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadPDF(docData) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Comprovante de Assinatura', 20, 20);

  doc.setFontSize(10);
  doc.text(`Nome do Documento: ${docData.name}`, 20, 30);
  doc.text(`Hash: ${docData.hash}`, 20, 36);
  doc.text(`Status: ${docData.status}`, 20, 42);

  const tableData = docData.signatures?.map(sig => [sig.wallet, sig.date]) || [];

  autoTable(doc, {
    startY: 50,
    head: [['Carteira', 'Data da Assinatura']],
    body: tableData
  });

  const filename = `documento-assinado-${docData.hash}.pdf`;
  doc.save(filename);
}
