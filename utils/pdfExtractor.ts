import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

// Set up the worker from CDN - matching version 5.4.449
GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.449/build/pdf.worker.min.mjs';

export interface PDFExtractionResult {
  success: boolean;
  text: string;
  pageCount: number;
  error?: string;
}

/**
 * Extracts text content from a PDF file URL
 */
export async function extractPDFText(pdfUrl: string): Promise<PDFExtractionResult> {
  try {
    // Load the PDF document
    const loadingTask = getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    
    const pageCount = pdf.numPages;
    const textParts: string[] = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items into a single string
      const pageText = textContent.items
        .filter((item): item is TextItem => 'str' in item)
        .map((item) => item.str)
        .join(' ');
      
      textParts.push(`--- Page ${pageNum} ---\n${pageText}`);
    }

    const fullText = textParts.join('\n\n');

    return {
      success: true,
      text: fullText,
      pageCount
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      success: false,
      text: '',
      pageCount: 0,
      error: error instanceof Error ? error.message : 'Failed to extract PDF text'
    };
  }
}

/**
 * Truncates text to fit within token limits (roughly 4 chars per token)
 * Keeps first and last portions for context
 */
export function truncateForContext(text: string, maxChars: number = 30000): string {
  if (text.length <= maxChars) {
    return text;
  }

  const halfMax = Math.floor(maxChars / 2);
  const start = text.substring(0, halfMax);
  const end = text.substring(text.length - halfMax);

  return `${start}\n\n[... content truncated for length ...]\n\n${end}`;
}

