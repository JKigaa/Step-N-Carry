import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { safeFileName } from '@/lib/format';

/**
 * Captures a DOM node (the CV preview) and renders it into a multi-page A4 PDF.
 * Uses html2canvas at 2x scale for crisp text, then slices the tall canvas
 * across A4 pages.
 */
export async function downloadCvPdf(
  element: HTMLElement,
  fullName: string
): Promise<void> {
  // Reset scroll so the top of the CV is captured
  element.scrollTop = 0;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Margin (in pt) — keeps text off the page edge
  const margin = 0;
  const printableWidth = pageWidth - margin * 2;

  // Scale image to page width
  const imgWidth = printableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // If the CV fits on one page, just draw it
  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', margin, 0, imgWidth, imgHeight);
  } else {
    // Multi-page: slice the source canvas by page height in source pixels
    const pageHeightSrc = (canvas.width * pageHeight) / imgWidth;
    let renderedHeight = 0;
    let page = 0;
    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pageHeightSrc, canvas.height - renderedHeight);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) break;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        renderedHeight,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );
      const sliceData = sliceCanvas.toDataURL('image/png');
      // Slice height in pt, on a full page
      const sliceHeightPt = (sliceHeight * imgWidth) / canvas.width;
      if (page > 0) pdf.addPage();
      // Vertically centre short final page so it doesn't sit at the very top
      const yOffset = (pageHeight - sliceHeightPt) / 2;
      pdf.addImage(
        sliceData,
        'PNG',
        margin,
        Math.max(0, yOffset),
        imgWidth,
        sliceHeightPt
      );
      renderedHeight += sliceHeight;
      page += 1;
    }
  }

  pdf.save(`CV-Chap-${safeFileName(fullName)}.pdf`);
}
