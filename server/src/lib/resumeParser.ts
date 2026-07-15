const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

/**
 * Extracts raw text from a given Cloudinary resume URL.
 * Supports .pdf and .doc/.docx by reading the extension from the URL.
 * Never throws an error — returns an empty string on failure to ensure
 * the main application process is not blocked.
 */
export const extractTextFromUrl = async (url: string): Promise<string> => {
  try {
    if (!url) return '';

    // Fetch the file as an array buffer
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch resume from URL: ${url}, status: ${response.status}`);
      return '';
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Basic extension check from URL
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      return data.text || '';
    } 
    
    if (lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.doc')) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }

    console.warn(`Unsupported file type for text extraction: ${url}`);
    return '';

  } catch (error) {
    console.error('Error extracting text from resume:', error);
    return ''; // Degrade gracefully, don't crash
  }
};
