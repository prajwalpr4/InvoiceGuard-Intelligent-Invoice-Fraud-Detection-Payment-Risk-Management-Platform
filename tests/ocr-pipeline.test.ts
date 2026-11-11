import { describe, it, expect } from 'vitest';
import { OCRExtractionPipeline } from '../src/lib/ocr/extractor';
import { runServerOCRPipeline } from '../src/lib/ocr/provider-chain';

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

  it('formats extracted fields and metadata cleanly for database persistence', () => {
    const formatted = OCRExtractionPipeline.formatForDatabase(
      'inv-123',
      {
        raw_text: 'Invoice No: INV-100',
        vendor_name: 'Zenith Logistics Ltd',
        invoice_number: 'INV-100',
        total_amount: 59000,
        overall_confidence: 96,
        ocr_provider: 'gemini',
        ocr_model: 'gemini-2.5-flash',
        fallback_used: false,
      },
      { isVerified: true, verifiedById: 'usr-1', sourceFileType: 'application/pdf' }
    );

    expect(formatted.invoice_id).toBe('inv-123');
    expect(formatted.overall_confidence).toBe(96);
    expect(formatted.is_verified_by_user).toBe(true);
    expect(formatted.verified_by_id).toBe('usr-1');
    expect(formatted.extracted_fields.invoice_number?.value).toBe('INV-100');
    expect(formatted.extracted_fields.total_amount?.value).toBe(59000);
    expect(formatted.extracted_fields._meta?.provider).toBe('gemini');
    expect(formatted.extracted_fields._meta?.model).toBe('gemini-2.5-flash');
  });
});

describe('runServerOCRPipeline fallback chain', () => {
  it('uses Gemini API as primary extraction engine for PDF uploads', async () => {
    const calledUrls: string[] = [];
    const mockFetch: typeof fetch = async (input) => {
      calledUrls.push(String(input));
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      vendor_name: 'Acme Precision Pvt Ltd',
                      gstin: '27AAACR5055K1Z7',
                      invoice_number: 'INV-GEM-01',
                      invoice_date: '2026-11-10',
                      subtotal: 50000,
                      tax_amount: 9000,
                      total_amount: 59000,
                      bank_account_number: '998877665544',
                      ifsc_code: 'ICIC0000234',
                      bank_name: 'ICICI Bank',
                      raw_text: 'Acme Precision Invoice INV-GEM-01 Total 59000',
                      overall_confidence: 97,
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const result = await runServerOCRPipeline({
      fileBuffer: Buffer.from('%PDF-1.4 fake pdf binary'),
      mimeType: 'application/pdf',
      fileName: 'invoice.pdf',
      fetchImpl: mockFetch,
      env: { GEMINI_API_KEY: 'test-gemini', GROQ_API_KEY: 'test-groq' },
    });

    expect(result.status).toBe('extracted');
    expect(result.data?.ocr_provider).toBe('gemini');
    expect(result.data?.invoice_number).toBe('INV-GEM-01');
    expect(result.data?.total_amount).toBe(59000);
    expect(result.data?.fallback_used).toBe(false);
    expect(calledUrls.some((u) => u.includes('generativelanguage.googleapis.com'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('api.groq.com'))).toBe(false);
  });

  it('falls back to Groq Vision when Gemini returns HTTP 429 rate limits', async () => {
    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes('generativelanguage.googleapis.com')) {
        return new Response('RESOURCE_EXHAUSTED', { status: 429 });
      }
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  vendor_name: 'Fallback Supplies LLP',
                  invoice_number: 'INV-GROQ-77',
                  invoice_date: '2026-11-09',
                  subtotal: 10000,
                  tax_amount: 1800,
                  total_amount: 11800,
                  raw_text: 'Invoice INV-GROQ-77 Total 11800',
                  overall_confidence: 91,
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const result = await runServerOCRPipeline({
      fileBuffer: Buffer.from('fake-png-bytes'),
      mimeType: 'image/png',
      fileName: 'scan.png',
      fetchImpl: mockFetch,
      env: { GEMINI_API_KEY: 'test-gemini', GROQ_API_KEY: 'test-groq' },
    });

    expect(result.status).toBe('extracted');
    expect(result.data?.ocr_provider).toBe('groq');
    expect(result.data?.invoice_number).toBe('INV-GROQ-77');
    expect(result.data?.fallback_used).toBe(true);
    expect(result.attempts.some((a) => a.provider === 'gemini' && a.status === 'rate_limited')).toBe(
      true
    );
  });

  it('requests client PDF page rendering for scanned PDFs when Gemini cannot satisfy request', async () => {
    const result = await runServerOCRPipeline({
      fileBuffer: Buffer.from('%PDF-1.4 scanned image pdf'),
      mimeType: 'application/pdf',
      fileName: 'scanned.pdf',
      fetchImpl: async () => new Response('quota exceeded', { status: 429 }),
      env: { GEMINI_API_KEY: 'test-gemini', GROQ_API_KEY: 'test-groq' },
    });

    expect(result.status).toBe('needs_client_pdf_render');
  });

  it('falls back to Mistral OCR natively for PDFs when Gemini hits 429', async () => {
    const calledUrls: string[] = [];
    const mistralBodies: Array<Record<string, unknown>> = [];

    const mockFetch: typeof fetch = async (input, init) => {
      const url = String(input);
      calledUrls.push(url);

      if (url.includes('generativelanguage.googleapis.com')) {
        return new Response('RESOURCE_EXHAUSTED', { status: 429 });
      }
      if (url.includes('api.mistral.ai/v1/ocr')) {
        mistralBodies.push(JSON.parse(String(init?.body || '{}')));
        return new Response(
          JSON.stringify({
            pages: [
              {
                index: 0,
                markdown: '# Tax Invoice\nZenith Robotics Pvt Ltd\nInvoice No: INV-MIST-501\nTotal: 59000',
              },
            ],
            document_annotation: JSON.stringify({
              vendor_name: 'Zenith Robotics Pvt Ltd',
              gstin: '27AAACZ1234A1Z9',
              invoice_number: 'INV-MIST-501',
              invoice_date: '2026-11-11',
              subtotal: 50000,
              tax_amount: 9000,
              total_amount: 59000,
              bank_account_number: '112233445566',
              ifsc_code: 'HDFC0000456',
              bank_name: 'HDFC Bank',
            }),
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Unexpected downstream call: ${url}`);
    };

    const result = await runServerOCRPipeline({
      fileBuffer: Buffer.from('%PDF-1.4 scanned pdf payload'),
      mimeType: 'application/pdf',
      fileName: 'scanned-vendor.pdf',
      fetchImpl: mockFetch,
      env: {
        GEMINI_API_KEY: 'test-gemini',
        MISTRAL_API_KEY: 'test-mistral',
        OPENROUTER_API_KEY: 'test-openrouter',
        GROQ_API_KEY: 'test-groq',
      },
    });

    expect(result.status).toBe('extracted');
    expect(result.data?.ocr_provider).toBe('mistral');
    expect(result.data?.ocr_model).toBe('mistral-ocr-latest');
    expect(result.data?.invoice_number).toBe('INV-MIST-501');
    expect(result.data?.total_amount).toBe(59000);
    expect(result.data?.fallback_used).toBe(true);
    expect(mistralBodies[0]?.model).toBe('mistral-ocr-latest');
    expect((mistralBodies[0]?.document as Record<string, string>)?.type).toBe('document_url');
    expect(calledUrls.some((u) => u.includes('openrouter.ai'))).toBe(false);
    expect(calledUrls.some((u) => u.includes('api.groq.com'))).toBe(false);
  });

  it('retries Mistral OCR without annotation schema on 422 and parses markdown output', async () => {
    let mistralCalls = 0;
    const mockFetch: typeof fetch = async (input, init) => {
      const url = String(input);
      if (url.includes('api.mistral.ai/v1/ocr')) {
        mistralCalls += 1;
        const body = JSON.parse(String(init?.body || '{}'));
        if (body.document_annotation_format) {
          return new Response('Annotation page limit exceeded', { status: 422 });
        }
        return new Response(
          JSON.stringify({
            pages: [
              {
                index: 0,
                markdown:
                  'Aether Logistics LLP\nGSTIN: 27AAACA8888B1Z2\nInvoice No: INV-MIST-MD2\nInvoice Date: 2026-11-10\nSubtotal: Rs. 20000\nTotal Tax: Rs. 3600\nGrand Total: Rs. 23600',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Unexpected call: ${url}`);
    };

    const result = await runServerOCRPipeline({
      fileBuffer: Buffer.from('%PDF-1.4 multi-page pdf'),
      mimeType: 'application/pdf',
      fileName: 'long.pdf',
      fetchImpl: mockFetch,
      env: { MISTRAL_API_KEY: 'test-mistral' },
    });

    expect(mistralCalls).toBe(2);
    expect(result.status).toBe('extracted');
    expect(result.data?.ocr_provider).toBe('mistral');
    expect(result.data?.invoice_number).toBe('INV-MIST-MD2');
    expect(result.data?.total_amount).toBe(23600);
  });

  it('falls back to OpenRouter Free Vision (with openrouter/free retry) when Gemini & Mistral fail', async () => {
    const requestedOpenRouterModels: string[] = [];

    const mockFetch: typeof fetch = async (input, init) => {
      const url = String(input);
      if (url.includes('generativelanguage.googleapis.com') || url.includes('api.mistral.ai')) {
        return new Response('rate limited', { status: 429 });
      }
      if (url.includes('openrouter.ai/api/v1/chat/completions')) {
        const body = JSON.parse(String(init?.body || '{}'));
        requestedOpenRouterModels.push(String(body.model));
        if (body.model === 'qwen/qwen3.8-27b:free') {
          return new Response('upstream busy', { status: 429 });
        }
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    vendor_name: 'Nova Components India',
                    invoice_number: 'INV-OR-302',
                    invoice_date: '2026-11-11',
                    subtotal: 40000,
                    tax_amount: 7200,
                    total_amount: 47200,
                    raw_text: 'Nova Components India INV-OR-302 Total 47200',
                    overall_confidence: 92,
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Unexpected call: ${url}`);
    };

    const result = await runServerOCRPipeline({
      fileBuffer: Buffer.from('fake-png-bytes'),
      mimeType: 'image/png',
      fileName: 'scan.png',
      fetchImpl: mockFetch,
      env: {
        GEMINI_API_KEY: 'test-gemini',
        MISTRAL_API_KEY: 'test-mistral',
        OPENROUTER_API_KEY: 'test-openrouter',
        GROQ_API_KEY: 'test-groq',
      },
    });

    expect(requestedOpenRouterModels).toEqual(['qwen/qwen3.8-27b:free', 'openrouter/free']);
    expect(result.status).toBe('extracted');
    expect(result.data?.ocr_provider).toBe('openrouter');
    expect(result.data?.ocr_model).toBe('openrouter/free');
    expect(result.data?.invoice_number).toBe('INV-OR-302');
    expect(result.data?.fallback_used).toBe(true);
  });

  it('caps Groq Vision to 3 images, tries qwen/qwen3.8-27b first, and falls back to Llama 4 Scout', async () => {
    const groqCalls: Array<{ model: string; imageCount: number }> = [];

    const mockFetch: typeof fetch = async (input, init) => {
      const url = String(input);
      if (url.includes('api.groq.com/openai/v1/chat/completions')) {
        const body = JSON.parse(String(init?.body || '{}'));
        const content = body.messages?.[1]?.content;
        const imageCount = Array.isArray(content)
          ? content.filter((part: { type?: string }) => part.type === 'image_url').length
          : 0;
        groqCalls.push({ model: String(body.model), imageCount });

        if (body.model === 'qwen/qwen3.8-27b') {
          return new Response('rate limit exceeded', { status: 429 });
        }

        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    vendor_name: 'Kestrel Industrial',
                    invoice_number: 'INV-GROQ-QW3',
                    invoice_date: '2026-11-11',
                    subtotal: 15000,
                    tax_amount: 2700,
                    total_amount: 17700,
                    raw_text: 'Kestrel Industrial INV-GROQ-QW3',
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Unexpected call: ${url}`);
    };

    const fourPages = [1, 2, 3, 4].map(() => ({
      mimeType: 'image/jpeg',
      base64: Buffer.from('jpeg-page').toString('base64'),
    }));

    const result = await runServerOCRPipeline({
      mimeType: 'application/pdf',
      fileName: '4page-scan.pdf',
      skipGemini: true,
      skipMistral: true,
      pageImages: fourPages,
      fetchImpl: mockFetch,
      env: { GROQ_API_KEY: 'test-groq' },
    });

    expect(groqCalls).toEqual([
      { model: 'qwen/qwen3.8-27b', imageCount: 3 },
      { model: 'meta-llama/llama-4-scout-17b-16e-instruct', imageCount: 3 },
    ]);
    expect(result.status).toBe('extracted');
    expect(result.data?.ocr_provider).toBe('groq');
    expect(result.data?.ocr_model).toBe('meta-llama/llama-4-scout-17b-16e-instruct');
    expect(result.data?.invoice_number).toBe('INV-GROQ-QW3');
    expect(result.data?.fallback_used).toBe(true);
  });

  it('signals fallback_to_tesseract for images when all cloud OCR tiers hit limits', async () => {
    const result = await runServerOCRPipeline({
      fileBuffer: Buffer.from('fake-jpg-bytes'),
      mimeType: 'image/jpeg',
      fileName: 'receipt.jpg',
      fetchImpl: async () => new Response('rate limit', { status: 429 }),
      env: {
        GEMINI_API_KEY: 'test-gemini',
        MISTRAL_API_KEY: 'test-mistral',
        OPENROUTER_API_KEY: 'test-openrouter',
        GROQ_API_KEY: 'test-groq',
      },
    });

    expect(result.status).toBe('fallback_to_tesseract');
    expect(result.attempts.some((a) => a.provider === 'gemini' && a.status === 'rate_limited')).toBe(
      true
    );
    expect(result.attempts.some((a) => a.provider === 'mistral' && a.status === 'rate_limited')).toBe(
      true
    );
    expect(
      result.attempts.some((a) => a.provider === 'openrouter' && a.status === 'rate_limited')
    ).toBe(true);
    expect(result.attempts.some((a) => a.provider === 'groq' && a.status === 'rate_limited')).toBe(
      true
    );
  });
});


