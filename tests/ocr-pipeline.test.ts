import { describe, it, expect } from 'vitest';
import { OCRExtractionPipeline } from '../src/lib/ocr/extractor';

describe('OCRExtractionPipeline', () => {
  it('correctly parses raw invoice text into normalized financial and bank fields', () => {
    const rawInvoiceText = `
      TAX INVOICE / BILL OF SUPPLY
      Precision Metalworks Private Limited
      Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093
      GSTIN: 27AAACP1234A1Z5
      PAN: AAACP1234A

      Invoice No: INV-2026-9088
      Invoice Date: 2026-02-18
      PO Number: PO-2026-089

      Taxable Amount: Rs. 1,50,000.00
      Total Tax (18%): Rs. 27,000.00
      Grand Total: Rs. 1,77,000.00

      Banking Details:
      Bank Name: HDFC Bank
      Account No: 50200012345678
      IFSC Code: HDFC0000123
    `;

    const parsed = OCRExtractionPipeline.parseInvoiceText(rawInvoiceText);

    expect(parsed.invoice_number).toBe('INV-2026-9088');
    expect(parsed.gstin).toBe('27AAACP1234A1Z5');
    expect(parsed.pan).toBe('AAACP1234A');
    expect(parsed.subtotal).toBe(150000);
    expect(parsed.tax_amount).toBe(27000);
    expect(parsed.total_amount).toBe(177000);
    expect(parsed.bank_account_number).toBe('50200012345678');
    expect(parsed.ifsc_code).toBe('HDFC0000123');
    expect(parsed.overall_confidence).toBeGreaterThanOrEqual(80);
  });
});

