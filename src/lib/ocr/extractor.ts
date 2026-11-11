import {
  ExtractionMetadata,
  InvoiceExtraction,
  OCRAttemptTrace,
  OCRProviderName,
} from '@/types/database';

export interface ExtractedInvoiceData {
  raw_text: string;
  vendor_name?: string;
  vendor_address?: string;
  gstin?: string;
  pan?: string;
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  po_number?: string;
  subtotal?: number;
  tax_amount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total_amount?: number;
  bank_account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  overall_confidence: number;
  field_confidences?: Record<string, number>;
  ocr_provider?: OCRProviderName;
  ocr_model?: string;
  fallback_used?: boolean;
  attempts?: OCRAttemptTrace[];
}

const DEFAULT_FIELD_CONFIDENCE: Record<string, number> = {
  vendor_name: 85,
  vendor_address: 82,
  gstin: 95,
  pan: 90,
  invoice_number: 92,
  invoice_date: 88,
  due_date: 85,
  po_number: 85,
  subtotal: 90,
  tax_amount: 90,
  cgst: 88,
  sgst: 88,
  igst: 88,
  total_amount: 94,
  bank_account_number: 89,
  ifsc_code: 92,
  bank_name: 88,
};

const CORE_CONFIDENCE_FIELDS = [
  'invoice_number',
  'gstin',
  'total_amount',
  'subtotal',
  'invoice_date',
  'bank_account_number',
] as const;

const EXTRACTED_FIELD_KEYS = [
  'vendor_name',
  'vendor_address',
  'gstin',
  'pan',
  'invoice_number',
  'invoice_date',
  'due_date',
  'po_number',
  'subtotal',
  'tax_amount',
  'cgst',
  'sgst',
  'igst',
  'total_amount',
  'bank_account_number',
  'ifsc_code',
  'bank_name',
] as const;

export class OCRExtractionPipeline {
  /**
   * Parse extracted raw text using financial regular expressions and NLP pattern matching
   */
  static parseInvoiceText(
    rawText: string,
    meta?: {
      ocr_provider?: OCRProviderName;
      ocr_model?: string;
      fallback_used?: boolean;
      attempts?: OCRAttemptTrace[];
    }
  ): ExtractedInvoiceData {
    const text = rawText || '';

    // 1. Vendor Name heuristic (first header line resembling an organization name)
    let vendor_name: string | undefined;
    const explicitVendor = text.match(
      /(?:vendor|supplier|billed\s*by|from)[:.\s]+([A-Za-z0-9][A-Za-z0-9\s&.,'()-]{2,80})/i
    );
    if (explicitVendor) {
      vendor_name = explicitVendor[1].split('\n')[0].trim();
    } else {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 8);
      for (const line of lines) {
        if (/^(tax\s*invoice|invoice|bill\s*of\s*supply|original|duplicate|page\s+\d)/i.test(line)) {
          continue;
        }
        if (/(?:pvt\.?\s*ltd|private\s*limited|limited|llp|inc\.?|corp\.?|enterprises|solutions|supplies|industries|logistics)/i.test(line)) {
          vendor_name = line;
          break;
        }
      }
    }

    // 2. Invoice Number Extraction
    let invoice_number: string | undefined;
    const invNumMatch = text.match(
      /(?:invoice\s*(?:no\.?|num\.?|number|#)|inv\s*(?:no\.?|num\.?|#)|invoice\s*id)[:.\s#]+([a-zA-Z0-9\-_/]{3,30})/i
    );
    if (invNumMatch) {
      invoice_number = invNumMatch[1].trim();
    }

    // 3. GSTIN Extraction (15 character Indian GST format)
    let gstin: string | undefined;
    const gstinMatch = text.match(
      /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/
    );
    if (gstinMatch) {
      gstin = gstinMatch[1].trim();
    }

    // 4. PAN Extraction (10 character Indian PAN format)
    let pan: string | undefined;
    const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/);
    if (panMatch) {
      pan = panMatch[1].trim();
    }

    // 5. IFSC Extraction (11 character Indian IFSC format)
    let ifsc_code: string | undefined;
    const ifscMatch = text.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/);
    if (ifscMatch) {
      ifsc_code = ifscMatch[1].trim();
    }

    // 6. Bank Account Number Extraction
    let bank_account_number: string | undefined;
    const bankAccMatch = text.match(
      /(?:a\/c\s*no|acc(?:ount)?\s*(?:no|number)?|account)[:.\s]*([0-9]{9,18})\b/i
    );
    if (bankAccMatch) {
      bank_account_number = bankAccMatch[1].trim();
    }

    // 7. Bank Name
    let bank_name: string | undefined;
    const bankNameMatch = text.match(
      /(hdfc\s*bank|icici\s*bank|state\s*bank\s*of\s*india|sbi|axis\s*bank|kotak\s*(?:mahindra\s*)?bank|punjab\s*national\s*bank|bank\s*of\s*baroda|yes\s*bank|indusind\s*bank)/i
    );
    if (bankNameMatch) {
      bank_name = bankNameMatch[1].trim();
    }

    // 8. PO Number
    let po_number: string | undefined;
    const poMatch = text.match(
      /(?:p\.?o\.?\s*(?:no|number|#)?|purchase\s*order\s*(?:no|#)?|order\s*#?)[:.\s]*([a-zA-Z0-9\-_/]{4,25})/i
    );
    if (poMatch) {
      po_number = poMatch[1].trim();
    }

    // 9. Dates (YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY)
    let invoice_date: string | undefined;
    const dateMatch = text.match(
      /(?:invoice\s*date|inv\.?\s*date|dated?)[:.\s]*([0-9]{1,4}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/i
    );
    if (dateMatch) {
      invoice_date = this.normalizeDateString(dateMatch[1]);
    }

    let due_date: string | undefined;
    const dueMatch = text.match(
      /(?:due\s*date|payment\s*due)[:.\s]*([0-9]{1,4}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/i
    );
    if (dueMatch) {
      due_date = this.normalizeDateString(dueMatch[1]);
    }

    // 10. Financial Amounts
    const parseAmount = (pattern: RegExp): number | undefined => {
      const m = text.match(pattern);
      if (!m) return undefined;
      const cleaned = parseFloat(m[1].replace(/,/g, ''));
      return Number.isFinite(cleaned) ? cleaned : undefined;
    };

    const subtotalRaw = parseAmount(
      /(?:sub\s*total|subtotal|net\s*amount|taxable\s*(?:value|amount))[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
    );
    const cgst = parseAmount(
      /\bcgst(?:\s*\([^)]+\))?[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
    );
    const sgst = parseAmount(
      /\bsgst(?:\s*\([^)]+\))?[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
    );
    const igst = parseAmount(
      /\bigst(?:\s*\([^)]+\))?[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
    );
    let taxRaw = parseAmount(
      /(?:total\s*tax|gst\s*amount|tax\s*amount|cgst\s*\+\s*sgst)(?:\s*\([^)]+\))?[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
    );
    if (taxRaw === undefined && (cgst !== undefined || sgst !== undefined || igst !== undefined)) {
      taxRaw = (cgst || 0) + (sgst || 0) + (igst || 0);
    }

    const totalRaw =
      parseAmount(
        /\b(?:grand\s*total|total\s*amount|invoice\s*total|net\s*payable|amount\s*payable)\b[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
      ) ??
      parseAmount(
        /\btotal(?!\s*tax)\b[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
      );

    const reconciled = this.reconcileAmounts({
      subtotal: subtotalRaw,
      tax_amount: taxRaw,
      total_amount: totalRaw,
    });

    const overall_confidence = this.computeConfidence({
      invoice_number,
      gstin,
      total_amount: totalRaw,
      subtotal: subtotalRaw,
      invoice_date,
      bank_account_number,
    });

    return {
      raw_text: text,
      vendor_name,
      invoice_number,
      gstin,
      pan,
      ifsc_code,
      bank_account_number,
      bank_name,
      po_number,
      invoice_date: invoice_date || new Date().toISOString().split('T')[0],
      due_date,
      subtotal: reconciled.subtotal ?? 0,
      tax_amount: reconciled.tax_amount ?? 0,
      cgst,
      sgst,
      igst,
      total_amount: reconciled.total_amount ?? 0,
      overall_confidence,
      ocr_provider: meta?.ocr_provider || 'text-parser',
      ocr_model: meta?.ocr_model,
      fallback_used: meta?.fallback_used,
      attempts: meta?.attempts,
    };
  }

  static reconcileAmounts(input: {
    subtotal?: number;
    tax_amount?: number;
    total_amount?: number;
  }): { subtotal?: number; tax_amount?: number; total_amount?: number } {
    let { subtotal, tax_amount, total_amount } = input;
    if (subtotal === undefined && total_amount !== undefined && tax_amount !== undefined) {
      subtotal = Math.round((total_amount - tax_amount) * 100) / 100;
    } else if (subtotal !== undefined && tax_amount !== undefined && total_amount === undefined) {
      total_amount = Math.round((subtotal + tax_amount) * 100) / 100;
    } else if (total_amount !== undefined && tax_amount === undefined && subtotal === undefined) {
      subtotal = Math.round((total_amount / 1.18) * 100) / 100;
      tax_amount = Math.round((total_amount - subtotal) * 100) / 100;
    } else if (subtotal !== undefined && total_amount !== undefined && tax_amount === undefined) {
      tax_amount = Math.max(0, Math.round((total_amount - subtotal) * 100) / 100);
    }
    return { subtotal, tax_amount, total_amount };
  }

  static computeConfidence(fields: Record<string, unknown>): number {
    let found = 0;
    for (const key of CORE_CONFIDENCE_FIELDS) {
      const v = fields[key];
      if (v !== undefined && v !== null && v !== '' && v !== 0) {
        found++;
      }
    }
    return Math.round((found / CORE_CONFIDENCE_FIELDS.length) * 100);
  }

  static normalizeDateString(dateStr?: string | null): string | undefined {
    if (!dateStr) return undefined;
    const trimmed = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    try {
      const parts = trimmed.split(/[-/.]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        if (year.length === 4) {
          return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch {
      // ignore invalid date string
    }
    return undefined;
  }

  /**
   * Convert extracted raw data into standard database InvoiceExtraction format
   */
  static formatForDatabase(
    invoiceId: string,
    extracted: ExtractedInvoiceData,
    options?: {
      isVerified?: boolean;
      verifiedById?: string | null;
      sourceFileType?: string;
    }
  ): InvoiceExtraction {
    const extractedFields: InvoiceExtraction['extracted_fields'] = {};

    for (const key of EXTRACTED_FIELD_KEYS) {
      const rawValue = extracted[key];
      if (rawValue === undefined || rawValue === null || rawValue === '') {
        continue;
      }
      const confidence =
        extracted.field_confidences?.[key] ??
        DEFAULT_FIELD_CONFIDENCE[key] ??
        Math.max(50, Math.min(99, Math.round(extracted.overall_confidence || 80)));

      (extractedFields as Record<string, unknown>)[key] = {
        value: rawValue,
        confidence,
      };
    }

    const meta: ExtractionMetadata = {
      provider: extracted.ocr_provider || 'text-parser',
      model: extracted.ocr_model,
      fallback_used: Boolean(extracted.fallback_used),
      attempts: extracted.attempts,
      source_file_type: options?.sourceFileType,
      processed_at: new Date().toISOString(),
    };
    extractedFields._meta = meta;

    const now = new Date().toISOString();
    const isVerified = options?.isVerified ?? false;

    return {
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      invoice_id: invoiceId,
      raw_text: extracted.raw_text || '',
      extracted_fields: extractedFields,
      overall_confidence: Math.round((extracted.overall_confidence || 0) * 100) / 100,
      is_verified_by_user: isVerified,
      verified_by_id: isVerified ? options?.verifiedById || null : null,
      verified_at: isVerified ? now : null,
      created_at: now,
    };
  }
}
