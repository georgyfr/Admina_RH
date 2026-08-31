import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Capture un element DOM et genere un PDF A4 multi-pages.
 * @param {HTMLElement} element - L'element a capturer
 * @param {string} filename - Nom du fichier (sans extension)
 */
export async function exportPosteAsPdf(element, filename = 'fiche_poste') {
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth() - 20;
  const pageHeight = pdf.internal.pageSize.getHeight() - 20;
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const safeName = (filename || 'fiche_poste').replace(/[^a-zA-Z0-9\-_\s]/g, '').replace(/\s+/g, '_');
  pdf.save(`${safeName}_fiche_poste.pdf`);
}
