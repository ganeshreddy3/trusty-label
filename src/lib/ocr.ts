import Tesseract from 'tesseract.js';
import { ExtractedDetails } from '@/types/product';

/**
 * Preprocess image for better OCR results by creating a high-contrast canvas.
 */
function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Scale up small images for better OCR
      const scale = Math.max(1, 1500 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(url);
        return;
      }

      // Draw scaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to grayscale and increase contrast
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // Increase contrast
        const contrast = 1.5;
        const adjusted = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
        const val = Math.max(0, Math.min(255, adjusted));
        // Binarize with threshold
        const binary = val > 128 ? 255 : 0;
        data[i] = binary;
        data[i + 1] = binary;
        data[i + 2] = binary;
      }

      ctx.putImageData(imageData, 0, 0);
      
      // Apply sharpening via unsharp mask approach
      const sharpenedUrl = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url);
      resolve(sharpenedUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Extract FSSAI license number from OCR text.
 * FSSAI numbers are 14-digit numbers, often prefixed with "FSSAI" or "Lic. No."
 */
function extractFSSAINumber(text: string): string | undefined {
  const cleaned = text
    .replace(/[oO]/g, '0')
    .replace(/[lI|]/g, '1')
    .replace(/[sS]/g, '5')
    .replace(/[bB]/g, '8');

  const fssaiPatterns = [
    /FSSAI\s*(?:Lic(?:ense)?\.?\s*(?:No\.?)?\s*:?\s*)?(\d[\d\s]{12,}\d)/i,
    /Lic(?:ense)?\.?\s*(?:No\.?)?\s*:?\s*(\d[\d\s]{12,}\d)/i,
    /(?:License|Licence)\s*(?:Number|No\.?)?\s*:?\s*(\d[\d\s]{12,}\d)/i,
    /(?:Reg(?:istration)?\.?\s*(?:No\.?)?\s*:?\s*)(\d[\d\s]{12,}\d)/i,
  ];

  for (const pattern of fssaiPatterns) {
    const match = text.match(pattern) || cleaned.match(pattern);
    if (match) {
      const num = match[1].replace(/\s/g, '');
      if (num.length >= 10 && num.length <= 14) {
        return num.padStart(14, '0').slice(-14);
      }
    }
  }

  const allDigitGroups = text.match(/\d[\d\s]{12,}\d/g);
  if (allDigitGroups) {
    for (const group of allDigitGroups) {
      const num = group.replace(/\s/g, '');
      if (num.length === 14) {
        return num;
      }
    }
  }

  const digitSequences = text.match(/\d{10,}/g);
  if (digitSequences) {
    for (const seq of digitSequences) {
      if (seq.length >= 10 && seq.length <= 14) {
        return seq.padStart(14, '0').slice(-14);
      }
    }
  }

  return undefined;
}

/**
 * Extract batch number from OCR text.
 */
function extractBatchNumber(text: string): string | undefined {
  const patterns = [
    /Batch\s*(?:No\.?|Number|#)?\s*:?\s*([A-Z0-9][\w-]{4,})/i,
    /B(?:atch)?\.?\s*(?:No\.?)?\s*:?\s*([A-Z0-9][\w-]{4,})/i,
    /Lot\s*(?:No\.?|Number)?\s*:?\s*([A-Z0-9][\w-]{4,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return undefined;
}

/**
 * Extract manufacturer name from OCR text.
 */
function extractManufacturer(text: string): string | undefined {
  const patterns = [
    /(?:Mfg\.?\s*(?:by)?|Manufactured\s*by|Packed\s*by|Marketed\s*by)\s*:?\s*(.+?)(?:\n|,\s*(?:Plot|Survey|Block|Unit|Address))/i,
    /(?:Mfg\.?\s*(?:by)?|Manufactured\s*by|Packed\s*by|Marketed\s*by)\s*:?\s*(.+?)$/im,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const name = match[1].trim().replace(/[,.]$/, '').trim();
      if (name.length > 3) return name;
    }
  }
  return undefined;
}

/**
 * Extract product name (usually first prominent line of text).
 */
function extractProductName(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
  
  // Look for lines that seem like product names (not license info, not too long)
  for (const line of lines.slice(0, 5)) {
    if (
      line.length > 5 &&
      line.length < 60 &&
      !/license|fssai|batch|mfg|manufactured|packed|ingredients|weight|mrp/i.test(line) &&
      !/^\d+$/.test(line)
    ) {
      return line;
    }
  }
  return undefined;
}

/**
 * Extract date from text.
 */
function extractDate(text: string): string | undefined {
  const patterns = [
    /(?:Date|Dt\.?)\s*(?:of)?\s*(?:License|Lic\.?|Manufacture|Mfg\.?|Packing|Pkg\.?)\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    /(?:License|Lic\.?)\s*(?:Date|Dt\.?)\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Try to normalize to YYYY-MM-DD
      const parts = match[1].split(/[\/-]/);
      if (parts.length === 3) {
        let [d, m, y] = parts;
        if (y.length === 2) y = '20' + y;
        if (parseInt(d) > 12) {
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return `${y}-${d.padStart(2, '0')}-${m.padStart(2, '0')}`;
      }
    }
  }
  return undefined;
}

/**
 * Extract MRP from text.
 */
function extractMRP(text: string): string | undefined {
  const match = text.match(/(?:MRP|M\.R\.P\.?|Price)\s*:?\s*(?:Rs\.?|₹|INR)?\s*([\d,.]+)/i);
  return match ? `₹${match[1]}` : undefined;
}

/**
 * Extract net weight from text.
 */
function extractNetWeight(text: string): string | undefined {
  const match = text.match(/(?:Net\s*(?:Wt\.?|Weight)|Wt\.?)\s*:?\s*([\d.]+\s*(?:g|kg|ml|l|gm|gram|kilo)s?)/i);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract ingredients from text.
 */
function extractIngredients(text: string): string[] | undefined {
  const match = text.match(/Ingredients?\s*:?\s*(.+?)(?:\n\n|Nutritional|Net\s*W|MRP|Best|Use)/is);
  if (match) {
    return match[1]
      .split(/[,;]/)
      .map(i => i.trim())
      .filter(i => i.length > 1 && i.length < 50);
  }
  return undefined;
}

/**
 * Run real OCR using Tesseract.js and extract food product details.
 */
export async function performOCR(file: File): Promise<{ details: ExtractedDetails; rawText: string }> {
  const processedImage = await preprocessImage(file);

  const result = await Tesseract.recognize(processedImage, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round((m.progress || 0) * 100)}%`);
      }
    },
  });

  const rawText = result.data.text;
  console.log('OCR Raw Text:', rawText);

  const details: ExtractedDetails = {
    licenseNumber: extractFSSAINumber(rawText),
    manufacturer: extractManufacturer(rawText),
    batchNumber: extractBatchNumber(rawText),
    licenseDate: extractDate(rawText),
    productName: extractProductName(rawText),
    ingredients: extractIngredients(rawText),
    netWeight: extractNetWeight(rawText),
    mrp: extractMRP(rawText),
  };

  return { details, rawText };
}
