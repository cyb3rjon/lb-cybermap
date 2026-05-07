// Real PDF + PPTX exporters that capture the live report DOM as images so the
// graphics in the export look identical to the platform.
//
// Both run entirely in-browser:
//   - PDF: html2canvas snapshots each .report-page, stitched into a landscape A4 PDF.
//   - PPTX: html2canvas snapshots each section, embedded as a slide image.

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';

interface ExportPDFOpts {
  filename: string;
  sectionSelector: string;
}

const NAVY_BG = '#0A1628';

async function snapshot(node: HTMLElement): Promise<HTMLCanvasElement> {
  // Width/height capped to keep canvas memory reasonable but quality high.
  return html2canvas(node, {
    backgroundColor: NAVY_BG,
    scale: Math.min(2, window.devicePixelRatio || 1.5),
    useCORS: true,
    logging: false,
    windowWidth: Math.max(1400, node.scrollWidth),
  });
}

export async function exportReportToPDF(opts: ExportPDFOpts): Promise<void> {
  const sections = Array.from(document.querySelectorAll<HTMLElement>(opts.sectionSelector));
  if (sections.length === 0) return;

  // A4 landscape: 297 × 210 mm
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const innerW = pageW - margin * 2;
  const innerH = pageH - margin * 2;

  for (let i = 0; i < sections.length; i++) {
    const canvas = await snapshot(sections[i]);
    const aspect = canvas.width / canvas.height;
    let drawW = innerW;
    let drawH = drawW / aspect;
    if (drawH > innerH) {
      drawH = innerH;
      drawW = drawH * aspect;
    }
    const offsetX = (pageW - drawW) / 2;
    const offsetY = (pageH - drawH) / 2;
    if (i > 0) pdf.addPage('a4', 'landscape');
    // Fill page with brand background so the captured navy aligns
    pdf.setFillColor(NAVY_BG);
    pdf.rect(0, 0, pageW, pageH, 'F');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', offsetX, offsetY, drawW, drawH, undefined, 'FAST');
  }

  pdf.save(opts.filename);
}

interface ExportPPTXOpts {
  filename: string;
  sectionSelector: string;
  meta?: { title?: string; subtitle?: string };
}

export async function exportReportToPPTX(opts: ExportPPTXOpts): Promise<void> {
  const sections = Array.from(document.querySelectorAll<HTMLElement>(opts.sectionSelector));
  if (sections.length === 0) return;

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE'; // 13.333 × 7.5 inches landscape
  pptx.theme = { headFontFace: 'Inter', bodyFontFace: 'Inter' };

  pptx.title = opts.meta?.title ?? 'LB CyberMAP — Cyber Maturity Assessment';
  pptx.subject = opts.meta?.subtitle ?? '';
  pptx.author = 'LB CyberMAP';
  pptx.company = 'Internal use only';

  for (const section of sections) {
    const canvas = await snapshot(section);
    const dataUrl = canvas.toDataURL('image/png');
    const slide = pptx.addSlide();
    slide.background = { color: '0A1628' };
    // Cover the slide while preserving aspect ratio
    const slideW = 13.333; const slideH = 7.5;
    const aspect = canvas.width / canvas.height;
    let drawW = slideW; let drawH = slideW / aspect;
    if (drawH > slideH) { drawH = slideH; drawW = slideH * aspect; }
    const x = (slideW - drawW) / 2;
    const y = (slideH - drawH) / 2;
    slide.addImage({ data: dataUrl, x, y, w: drawW, h: drawH });
  }

  await pptx.writeFile({ fileName: opts.filename });
}
