'use client';

import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface RenderedPDFPage {
  page: number;
  dataUrl: string;
  base64: string;
  mimeType: 'image/jpeg';
}

async function withPdfDocument<T>(
  file: File,
  fn: (doc: PDFDocumentProxy) => Promise<T>
): Promise<T> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  let doc: PDFDocumentProxy | null = null;
  try {
    doc = await loadingTask.promise;
    return await fn(doc);
  } finally {
    await doc?.cleanup().catch(() => {});
    await loadingTask.destroy().catch(() => {});
  }
}

/**
 * Extracts embedded text from digital PDFs in the browser without rendering canvases.
 */
export async function extractPdfTextInBrowser(file: File, maxPages = 8): Promise<string> {
  return withPdfDocument(file, async (doc) => {
    const totalPages = Math.min(doc.numPages, maxPages);
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const textContent = await page.getTextContent();
      let pageLine = '';
      for (const item of textContent.items as Array<{ str?: string; hasEOL?: boolean }>) {
        if (!item?.str) continue;
        pageLine += item.str;
        pageLine += item.hasEOL ? '\n' : ' ';
      }
      if (pageLine.trim()) {
        pageTexts.push(pageLine.trim());
      }
    }

    return pageTexts.join('\n\n');
  });
}

/**
 * Renders up to maxPages of a PDF into compressed JPEG images for vision/OCR fallbacks.
 */
export async function renderPdfPagesToImages(
  file: File,
  maxPages = 3
): Promise<RenderedPDFPage[]> {
  return withPdfDocument(file, async (doc) => {
    const totalPages = Math.min(doc.numPages, maxPages);
    const rendered: RenderedPDFPage[] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });
      const targetScale =
        baseViewport.width > 0 ? Math.min(2, Math.max(1.2, 1300 / baseViewport.width)) : 1.5;
      const viewport = page.getViewport({ scale: targetScale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({ canvas, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1] || '';
      if (base64) {
        rendered.push({
          page: pageNum,
          dataUrl,
          base64,
          mimeType: 'image/jpeg',
        });
      }

      canvas.width = 0;
      canvas.height = 0;
    }

    return rendered;
  });
}
