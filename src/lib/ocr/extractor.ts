import { InvoiceExtraction } from '@/types/database';

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
}

export class OCRExtractionPipeline {
  /**
   * Parse extracted raw text using financial regular expressions and NLP pattern matching
   */
  static parseInvoiceText(rawText: string): ExtractedInvoiceData {
    const text = rawText || '';

    // 1. Invoice Number Extraction
    let invoice_number: string | undefined;
    const invNumMatch = text.match(
      /(?:invoice\s*(?:no\.?|num\.?|number|#)|inv\s*(?:no\.?|num\.?|#)|invoice\s*id)[:.\s#]+([a-zA-Z0-9\-_/]{3,30})/i
    );
    if (invNumMatch) {
      invoice_number = invNumMatch[1].trim();
    }

    // 2. GSTIN Extraction (15 character Indian GST format)
    let gstin: string | undefined;
    const gstinMatch = text.match(
      /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/
    );
    if (gstinMatch) {
      gstin = gstinMatch[1].trim();
    }

    // 3. PAN Extraction (10 character Indian PAN format)
    let pan: string | undefined;
    const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/);
    if (panMatch) {
      pan = panMatch[1].trim();
    }

    // 4. IFSC Extraction (11 character Indian IFSC format)
    let ifsc_code: string | undefined;
    const ifscMatch = text.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/);
    if (ifscMatch) {
      ifsc_code = ifscMatch[1].trim();
    }

    // 5. Bank Account Number Extraction
    let bank_account_number: string | undefined;
    const bankAccMatch = text.match(
      /(?:a\/c\s*no|acc(?:ount)?\s*(?:no|number)?|account)[:.\s]*([0-9]{9,18})\b/i
    );
    if (bankAccMatch) {
      bank_account_number = bankAccMatch[1].trim();
    }

    // 6. Bank Name
    let bank_name: string | undefined;
    const bankNameMatch = text.match(
      /(hdfc\s*bank|icici\s*bank|state\s*bank\s*of\s*india|sbi|axis\s*bank|kotak\s*bank|punjab\s*national\s*bank|bank\s*of\s*baroda)/i
    );
    if (bankNameMatch) {
      bank_name = bankNameMatch[1].trim();
    }

    // 7. PO Number
    let po_number: string | undefined;
    const poMatch = text.match(
      /(?:p\.?o\.?\s*(?:no|number|#)?|purchase\s*order\s*(?:no|#)?|order\s*#?)[:.\s]*([a-zA-Z0-9\-_/]{4,25})/i
    );
    if (poMatch) {
      po_number = poMatch[1].trim();
    }

    // 8. Dates (YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY)
    let invoice_date: string | undefined;
    const dateMatch = text.match(
      /(?:invoice\s*date|date)[:.\s]*([0-9]{1,4}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/i
    );
    if (dateMatch) {
      invoice_date = this.normalizeDate(dateMatch[1]);
    }

    // 9. Financial Amounts
    // Subtotal
    let subtotal: number | undefined;
    const subtotalMatch = text.match(
      /(?:sub\s*total|subtotal|net\s*amount|taxable\s*value)[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i
    );
    if (subtotalMatch) {
      subtotal = parseFloat(subtotalMatch[1].replace(/,/g, ''));
    }

    // Tax amount
    let tax_amount: number | undefined;
    const taxMatch = text.match(
      /(?:total\s*tax|gst\s*amount|tax\s*amount|cgst\s*\+\s*sgst)[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i
    );
    if (taxMatch) {
      tax_amount = parseFloat(taxMatch[1].replace(/,/g, ''));
    }

    // Total Amount
    let total_amount: number | undefined;
    const totalMatch = text.match(
      /(?:grand\s*total|total\s*amount|total|invoice\s*total|net\s*payable)[:.\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i
    );
    if (totalMatch) {
      total_amount = parseFloat(totalMatch[1].replace(/,/g, ''));
    }

    // Fallback math reconciliation
    if (!subtotal && total_amount && tax_amount) {
      subtotal = total_amount - tax_amount;
    } else if (subtotal && tax_amount && !total_amount) {
      total_amount = subtotal + tax_amount;
    } else if (total_amount && !tax_amount && !subtotal) {
      subtotal = Math.round((total_amount / 1.18) * 100) / 100;
      tax_amount = Math.round((total_amount - subtotal) * 100) / 100;
    }

    // Calculate extraction confidence
    let foundFields = 0;
    const tracked = [invoice_number, gstin, total_amount, subtotal, invoice_date, bank_account_number];
    for (const f of tracked) {
      if (f !== undefined) foundFields++;
    }
    const overall_confidence = Math.round((foundFields / tracked.length) * 100);

    return {
      raw_text: text,
      invoice_number,
      gstin,
      pan,
      ifsc_code,
      bank_account_number,
      bank_name,
      po_number,
      invoice_date: invoice_date || new Date().toISOString().split('T')[0],
      subtotal: subtotal || 0,
      tax_amount: tax_amount || 0,
      total_amount: total_amount || 0,
      overall_confidence,
    };
  }

  private static normalizeDate(dateStr: string): string {
    try {
      const parts = dateStr.split(/[-/.]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          // DD-MM-YYYY
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    } catch {
      // ignore
    }
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Convert extracted raw data into standard database InvoiceExtraction format
   */
  static formatForDatabase(invoiceId: string, extracted: ExtractedInvoiceData): InvoiceExtraction {
    return {
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      invoice_id: invoiceId,
      raw_text: extracted.raw_text,
      extracted_fields: {
        vendor_name: extracted.vendor_name ? { value: extracted.vendor_name, confidence: 85 } : undefined,
        gstin: extracted.gstin ? { value: extracted.gstin, confidence: 95 } : undefined,
        pan: extracted.pan ? { value: extracted.pan, confidence: 90 } : undefined,
        invoice_number: extracted.invoice_number ? { value: extracted.invoice_number, confidence: 92 } : undefined,
        invoice_date: extracted.invoice_date ? { value: extracted.invoice_date, confidence: 88 } : undefined,
        po_number: extracted.po_number ? { value: extracted.po_number, confidence: 85 } : undefined,
        subtotal: extracted.subtotal !== undefined ? { value: extracted.subtotal, confidence: 90 } : undefined,
        tax_amount: extracted.tax_amount !== undefined ? { value: extracted.tax_amount, confidence: 90 } : undefined,
        total_amount: extracted.total_amount !== undefined ? { value: extracted.total_amount, confidence: 94 } : undefined,
        bank_account_number: extracted.bank_account_number ? { value: extracted.bank_account_number, confidence: 89 } : undefined,
        ifsc_code: extracted.ifsc_code ? { value: extracted.ifsc_code, confidence: 92 } : undefined,
        bank_name: extracted.bank_name ? { value: extracted.bank_name, confidence: 88 } : undefined,
      },
      overall_confidence: extracted.overall_confidence,
      is_verified_by_user: false,
      created_at: new Date().toISOString(),
    };
  }
}
