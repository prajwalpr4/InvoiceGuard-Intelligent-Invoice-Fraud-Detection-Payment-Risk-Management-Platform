import { OCRAttemptTrace, OCRProviderName } from '@/types/database';
import { ExtractedInvoiceData, OCRExtractionPipeline } from './extractor';

export interface OCRPageImage {
  mimeType: string;
  base64: string;
}

export interface RunServerOCRInput {
  fileBuffer?: Buffer;
  mimeType?: string;
  fileName?: string;
  rawText?: string;
  pageImages?: OCRPageImage[];
  skipGemini?: boolean;
  skipMistral?: boolean;
  skipOpenRouter?: boolean;
  fetchImpl?: typeof fetch;
  env?: {
    GEMINI_API_KEY?: string;
    MISTRAL_API_KEY?: string;
    OPENROUTER_API_KEY?: string;
    GROQ_API_KEY?: string;
  };
}

export interface RunServerOCRResult {
  status: 'extracted' | 'needs_client_pdf_render' | 'fallback_to_tesseract';
  data?: ExtractedInvoiceData;
  attempts: OCRAttemptTrace[];
  message?: string;
}

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;
const MISTRAL_OCR_MODEL = 'mistral-ocr-latest';
const OPENROUTER_MODELS = ['qwen/qwen3.8-27b:free', 'openrouter/free'] as const;
const GROQ_VISION_MODELS = [
  'qwen/qwen3.8-27b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
] as const;
const GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile';

const MAX_INLINE_FILE_BYTES = 18 * 1024 * 1024;
const MAX_MISTRAL_FILE_BYTES = 25 * 1024 * 1024;
const MAX_VISION_IMAGE_BYTES = 3.5 * 1024 * 1024;
// qwen/qwen3.8-27b accepts up to 3 images per chat request
const MAX_VISION_IMAGES = 3;

const INVOICE_EXTRACTION_PROMPT = `You are a precision financial AP invoice OCR parser. Extract every visible field from this supplier invoice and return ONLY a valid JSON object matching this exact schema (use null for fields not present, never invent values):
{
  "vendor_name": string | null,
  "vendor_address": string | null,
  "gstin": string | null,
  "pan": string | null,
  "invoice_number": string | null,
  "invoice_date": "YYYY-MM-DD" | null,
  "due_date": "YYYY-MM-DD" | null,
  "po_number": string | null,
  "subtotal": number | null,
  "tax_amount": number | null,
  "cgst": number | null,
  "sgst": number | null,
  "igst": number | null,
  "total_amount": number | null,
  "bank_account_number": string | null,
  "ifsc_code": string | null,
  "bank_name": string | null,
  "raw_text": "verbatim readable text transcribed from the document",
  "overall_confidence": number,
  "field_confidences": {
    "vendor_name": number,
    "gstin": number,
    "pan": number,
    "invoice_number": number,
    "invoice_date": number,
    "due_date": number,
    "po_number": number,
    "subtotal": number,
    "tax_amount": number,
    "total_amount": number,
    "bank_account_number": number,
    "ifsc_code": number,
    "bank_name": number
  }
}
Rules:
- Convert currency amounts into plain numbers (no commas, no currency symbols).
- Normalize dates to YYYY-MM-DD when identifiable.
- Confidence scores must be numbers between 0 and 100.
- Return raw JSON only.`;

const MISTRAL_DOCUMENT_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'invoice_extraction',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        vendor_name: { type: ['string', 'null'] },
        vendor_address: { type: ['string', 'null'] },
        gstin: { type: ['string', 'null'] },
        pan: { type: ['string', 'null'] },
        invoice_number: { type: ['string', 'null'] },
        invoice_date: { type: ['string', 'null'] },
        due_date: { type: ['string', 'null'] },
        po_number: { type: ['string', 'null'] },
        subtotal: { type: ['number', 'null'] },
        tax_amount: { type: ['number', 'null'] },
        cgst: { type: ['number', 'null'] },
        sgst: { type: ['number', 'null'] },
        igst: { type: ['number', 'null'] },
        total_amount: { type: ['number', 'null'] },
        bank_account_number: { type: ['string', 'null'] },
        ifsc_code: { type: ['string', 'null'] },
        bank_name: { type: ['string', 'null'] },
      },
      required: [
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
      ],
    },
  },
} as const;

function parseNumber(val: unknown): number | undefined {
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : undefined;
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    if (!cleaned) return undefined;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : undefined;
  }
  return undefined;
}

function cleanString(val: unknown): string | undefined {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  if (!trimmed || /^null$/i.test(trimmed) || /^n\/?a$/i.test(trimmed)) return undefined;
  return trimmed;
}

function parseJsonObjectSafe(raw: string): Record<string, unknown> | null {
  if (!raw) return null;
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed: unknown = JSON.parse(stripped);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    const start = stripped.indexOf('{');
    const end = stripped.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        const parsed: unknown = JSON.parse(stripped.slice(start, end + 1));
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function extractChatMessageText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
          return part.text;
        }
        return '';
      })
      .join('\n');
  }
  return '';
}

function isRateLimitError(status: number, bodyText: string): boolean {
  return (
    status === 429 ||
    /resource_exhausted|rate[_\s-]*limit|quota|too many requests/i.test(bodyText)
  );
}

function isPdfInput(mimeType?: string, fileName?: string): boolean {
  return (
    mimeType === 'application/pdf' ||
    Boolean(fileName && fileName.toLowerCase().endsWith('.pdf'))
  );
}

function isSupportedImageMime(mimeType?: string): boolean {
  return Boolean(
    mimeType &&
      ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(mimeType.toLowerCase())
  );
}

function normalizeMimeType(mimeType?: string, fileName?: string): string {
  const lower = (mimeType || '').toLowerCase();
  if (lower === 'image/jpg') return 'image/jpeg';
  if (lower) return lower;
  const name = (fileName || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.webp')) return 'image/webp';
  return 'text/plain';
}

function normalizeStructuredResult(
  json: Record<string, unknown>,
  fallbackRawText: string,
  meta: {
    provider: OCRProviderName;
    model: string;
    fallbackUsed: boolean;
    attempts: OCRAttemptTrace[];
  }
): ExtractedInvoiceData {
  const rawText = cleanString(json.raw_text) || fallbackRawText || '';
  const regexBackup = rawText ? OCRExtractionPipeline.parseInvoiceText(rawText) : undefined;

  const vendor_name = cleanString(json.vendor_name) || regexBackup?.vendor_name;
  const vendor_address = cleanString(json.vendor_address);
  const gstin = (cleanString(json.gstin) || regexBackup?.gstin)?.toUpperCase();
  const pan = (cleanString(json.pan) || regexBackup?.pan)?.toUpperCase();
  const invoice_number = cleanString(json.invoice_number) || regexBackup?.invoice_number;
  const invoice_date =
    OCRExtractionPipeline.normalizeDateString(cleanString(json.invoice_date)) ||
    regexBackup?.invoice_date ||
    new Date().toISOString().split('T')[0];
  const due_date =
    OCRExtractionPipeline.normalizeDateString(cleanString(json.due_date)) || regexBackup?.due_date;
  const po_number = cleanString(json.po_number) || regexBackup?.po_number;

  const cgst = parseNumber(json.cgst) ?? regexBackup?.cgst;
  const sgst = parseNumber(json.sgst) ?? regexBackup?.sgst;
  const igst = parseNumber(json.igst) ?? regexBackup?.igst;
  let taxRaw = parseNumber(json.tax_amount);
  if (taxRaw === undefined && (cgst !== undefined || sgst !== undefined || igst !== undefined)) {
    taxRaw = (cgst || 0) + (sgst || 0) + (igst || 0);
  }

  const reconciled = OCRExtractionPipeline.reconcileAmounts({
    subtotal: parseNumber(json.subtotal) ?? (regexBackup?.subtotal || undefined),
    tax_amount: taxRaw ?? (regexBackup?.tax_amount || undefined),
    total_amount: parseNumber(json.total_amount) ?? (regexBackup?.total_amount || undefined),
  });

  const bank_account_number =
    cleanString(json.bank_account_number) || regexBackup?.bank_account_number;
  const ifsc_code = (cleanString(json.ifsc_code) || regexBackup?.ifsc_code)?.toUpperCase();
  const bank_name = cleanString(json.bank_name) || regexBackup?.bank_name;

  const rawFieldConfs: Record<string, number> = {};
  if (json.field_confidences && typeof json.field_confidences === 'object') {
    for (const [k, v] of Object.entries(json.field_confidences)) {
      const n = parseNumber(v);
      if (n !== undefined) {
        rawFieldConfs[k] = Math.max(0, Math.min(100, Math.round(n)));
      }
    }
  }

  const calculatedConfidence = OCRExtractionPipeline.computeConfidence({
    invoice_number,
    gstin,
    total_amount: reconciled.total_amount,
    subtotal: reconciled.subtotal,
    invoice_date,
    bank_account_number,
  });

  const modelConfidence = parseNumber(json.overall_confidence);
  const overall_confidence =
    modelConfidence !== undefined
      ? Math.max(0, Math.min(100, Math.round(modelConfidence)))
      : Math.max(calculatedConfidence, 85);

  return {
    raw_text: rawText,
    vendor_name,
    vendor_address,
    gstin,
    pan,
    invoice_number,
    invoice_date,
    due_date,
    po_number,
    subtotal: reconciled.subtotal ?? 0,
    tax_amount: reconciled.tax_amount ?? 0,
    cgst,
    sgst,
    igst,
    total_amount: reconciled.total_amount ?? 0,
    bank_account_number,
    ifsc_code,
    bank_name,
    overall_confidence,
    field_confidences: Object.keys(rawFieldConfs).length > 0 ? rawFieldConfs : undefined,
    ocr_provider: meta.provider,
    ocr_model: meta.model,
    fallback_used: meta.fallbackUsed,
    attempts: meta.attempts,
  };
}

async function tryGeminiExtraction(params: {
  apiKey: string;
  fileBuffer?: Buffer;
  mimeType: string;
  rawText?: string;
  pageImages?: OCRPageImage[];
  fetchImpl: typeof fetch;
  attempts: OCRAttemptTrace[];
}): Promise<ExtractedInvoiceData | null> {
  const { apiKey, fileBuffer, mimeType, rawText, pageImages, fetchImpl, attempts } = params;

  const parts: Array<Record<string, unknown>> = [];
  if (fileBuffer && fileBuffer.length > 0 && (isPdfInput(mimeType) || isSupportedImageMime(mimeType))) {
    if (fileBuffer.length > MAX_INLINE_FILE_BYTES) {
      attempts.push({
        provider: 'gemini',
        status: 'error',
        detail: 'File exceeds inline payload threshold (18MB)',
      });
      return null;
    }
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: fileBuffer.toString('base64'),
      },
    });
  } else if (pageImages && pageImages.length > 0) {
    for (const img of pageImages.slice(0, 4)) {
      parts.push({
        inline_data: {
          mime_type: normalizeMimeType(img.mimeType),
          data: img.base64,
        },
      });
    }
  }

  const promptText = rawText?.trim()
    ? `${INVOICE_EXTRACTION_PROMPT}\n\nDocument text:\n${rawText.slice(0, 30000)}`
    : INVOICE_EXTRACTION_PROMPT;
  parts.push({ text: promptText });

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(25000),
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        const rateLimited = isRateLimitError(response.status, errBody);
        attempts.push({
          provider: 'gemini',
          model,
          status: rateLimited ? 'rate_limited' : 'error',
          detail: `HTTP ${response.status}${rateLimited ? ' (quota/rate limit reached)' : ''}`,
        });
        continue;
      }

      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const contentText = payload?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text || '')
        .join('\n')
        .trim();

      const parsedJson = parseJsonObjectSafe(contentText || '');
      if (!parsedJson) {
        attempts.push({
          provider: 'gemini',
          model,
          status: 'error',
          detail: 'Returned invalid JSON payload',
        });
        continue;
      }

      attempts.push({
        provider: 'gemini',
        model,
        status: 'success',
        detail: 'Extracted via Gemini API',
      });

      return normalizeStructuredResult(parsedJson, rawText || '', {
        provider: 'gemini',
        model,
        fallbackUsed: model !== GEMINI_MODELS[0],
        attempts,
      });
    } catch (err: unknown) {
      const errObj = err instanceof Error ? err : null;
      attempts.push({
        provider: 'gemini',
        model,
        status: 'error',
        detail:
          errObj?.name === 'TimeoutError'
            ? 'Request timed out'
            : errObj?.message || 'Network failure',
      });
    }
  }

  return null;
}

async function tryMistralOCRExtraction(params: {
  apiKey: string;
  fileBuffer?: Buffer;
  mimeType: string;
  fileName?: string;
  rawText?: string;
  pageImages?: OCRPageImage[];
  fetchImpl: typeof fetch;
  attempts: OCRAttemptTrace[];
  fallbackUsed: boolean;
  hasDownstreamTextLlm: boolean;
}): Promise<{ data: ExtractedInvoiceData | null; markdownText?: string }> {
  const {
    apiKey,
    fileBuffer,
    mimeType,
    fileName,
    rawText,
    pageImages,
    fetchImpl,
    attempts,
    fallbackUsed,
    hasDownstreamTextLlm,
  } = params;

  let document: Record<string, string> | null = null;
  if (fileBuffer && fileBuffer.length > 0 && isPdfInput(mimeType, fileName)) {
    if (fileBuffer.length > MAX_MISTRAL_FILE_BYTES) {
      attempts.push({
        provider: 'mistral',
        model: MISTRAL_OCR_MODEL,
        status: 'error',
        detail: 'PDF exceeds Mistral 25MB payload threshold',
      });
      return { data: null };
    }
    document = {
      type: 'document_url',
      document_url: `data:application/pdf;base64,${fileBuffer.toString('base64')}`,
    };
  } else if (fileBuffer && fileBuffer.length > 0 && isSupportedImageMime(mimeType)) {
    if (fileBuffer.length > MAX_MISTRAL_FILE_BYTES) {
      attempts.push({
        provider: 'mistral',
        model: MISTRAL_OCR_MODEL,
        status: 'error',
        detail: 'Image exceeds Mistral 25MB payload threshold',
      });
      return { data: null };
    }
    document = {
      type: 'image_url',
      image_url: `data:${mimeType};base64,${fileBuffer.toString('base64')}`,
    };
  } else if (pageImages && pageImages.length > 0) {
    const first = pageImages[0];
    document = {
      type: 'image_url',
      image_url: `data:${normalizeMimeType(first.mimeType)};base64,${first.base64}`,
    };
  }

  if (!document) {
    return { data: null };
  }

  const postMistral = (withAnnotationSchema: boolean) =>
    fetchImpl('https://api.mistral.ai/v1/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify(
        withAnnotationSchema
          ? {
              model: MISTRAL_OCR_MODEL,
              document,
              document_annotation_format: MISTRAL_DOCUMENT_SCHEMA,
              document_annotation_prompt:
                'Extract supplier invoice vendor_name, vendor_address, gstin, pan, invoice_number, invoice_date (YYYY-MM-DD), due_date (YYYY-MM-DD), po_number, numeric totals (subtotal, tax_amount, cgst, sgst, igst, total_amount), and bank details (bank_account_number, ifsc_code, bank_name). Leave absent fields null.',
              include_image_base64: false,
            }
          : {
              model: MISTRAL_OCR_MODEL,
              document,
              include_image_base64: false,
            }
      ),
    });

  try {
    let response = await postMistral(true);

    // Retry once without annotation schema if endpoint/plan rejects structured annotation (e.g. >8 PDF pages)
    if (response.status === 400 || response.status === 422) {
      response = await postMistral(false);
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      const rateLimited = isRateLimitError(response.status, errBody);
      attempts.push({
        provider: 'mistral',
        model: MISTRAL_OCR_MODEL,
        status: rateLimited ? 'rate_limited' : 'error',
        detail: `HTTP ${response.status}${rateLimited ? ' (rate limit/quota reached)' : ''}`,
      });
      return { data: null };
    }

    const payload = (await response.json()) as {
      pages?: Array<{ index?: number; markdown?: string }>;
      document_annotation?: unknown;
    };

    const markdownText = (payload.pages || [])
      .map((p) => (typeof p?.markdown === 'string' ? p.markdown : ''))
      .filter(Boolean)
      .join('\n\n')
      .trim();

    let annotationJson: Record<string, unknown> | null = null;
    if (typeof payload.document_annotation === 'string') {
      annotationJson = parseJsonObjectSafe(payload.document_annotation);
    } else if (
      payload.document_annotation &&
      typeof payload.document_annotation === 'object' &&
      !Array.isArray(payload.document_annotation)
    ) {
      annotationJson = payload.document_annotation as Record<string, unknown>;
    }

    const combinedRawText = markdownText || rawText || '';
    const hasAnnotationFields = Boolean(
      annotationJson &&
        (cleanString(annotationJson.invoice_number) ||
          cleanString(annotationJson.vendor_name) ||
          parseNumber(annotationJson.total_amount) !== undefined)
    );

    if (hasAnnotationFields && annotationJson) {
      attempts.push({
        provider: 'mistral',
        model: MISTRAL_OCR_MODEL,
        status: 'success',
        detail: 'Extracted structured fields & markdown via Mistral OCR',
      });
      return {
        data: normalizeStructuredResult(annotationJson, combinedRawText, {
          provider: 'mistral',
          model: MISTRAL_OCR_MODEL,
          fallbackUsed,
          attempts,
        }),
      };
    }

    if (markdownText.replace(/\s+/g, '').length >= 20) {
      const regexCheck = OCRExtractionPipeline.parseInvoiceText(markdownText);
      if (
        (regexCheck.invoice_number && (regexCheck.total_amount ?? 0) > 0) ||
        !hasDownstreamTextLlm
      ) {
        attempts.push({
          provider: 'mistral',
          model: MISTRAL_OCR_MODEL,
          status: 'success',
          detail: 'Extracted markdown via Mistral OCR + deterministic parser',
        });
        return {
          data: normalizeStructuredResult({}, combinedRawText, {
            provider: 'mistral',
            model: MISTRAL_OCR_MODEL,
            fallbackUsed,
            attempts,
          }),
        };
      }

      attempts.push({
        provider: 'mistral',
        model: MISTRAL_OCR_MODEL,
        status: 'success',
        detail: 'Transcribed OCR markdown via Mistral; passing text to LLM structurer',
      });
      return { data: null, markdownText };
    }

    attempts.push({
      provider: 'mistral',
      model: MISTRAL_OCR_MODEL,
      status: 'error',
      detail: 'Mistral OCR returned empty content',
    });
    return { data: null };
  } catch (err: unknown) {
    const errObj = err instanceof Error ? err : null;
    attempts.push({
      provider: 'mistral',
      model: MISTRAL_OCR_MODEL,
      status: 'error',
      detail:
        errObj?.name === 'TimeoutError'
          ? 'Request timed out'
          : errObj?.message || 'Network failure',
    });
    return { data: null };
  }
}

async function tryOpenAICompatibleExtraction(params: {
  provider: 'openrouter' | 'groq';
  endpoint: string;
  apiKey: string;
  extraHeaders?: Record<string, string>;
  models: readonly string[];
  images: OCRPageImage[];
  rawText?: string;
  fetchImpl: typeof fetch;
  attempts: OCRAttemptTrace[];
  fallbackUsed: boolean;
  successLabel: string;
}): Promise<ExtractedInvoiceData | null> {
  const {
    provider,
    endpoint,
    apiKey,
    extraHeaders,
    models,
    images,
    rawText,
    fetchImpl,
    attempts,
    fallbackUsed,
    successLabel,
  } = params;

  const cappedImages = images.slice(0, MAX_VISION_IMAGES);
  const useVision = cappedImages.length > 0;
  if (!useVision && !rawText?.trim()) {
    return null;
  }

  const userContent: Array<Record<string, unknown>> | string = useVision
    ? [
        {
          type: 'text',
          text: rawText?.trim()
            ? `${INVOICE_EXTRACTION_PROMPT}\n\nSupplementary extracted text:\n${rawText.slice(0, 15000)}`
            : INVOICE_EXTRACTION_PROMPT,
        },
        ...cappedImages.map((img) => ({
          type: 'image_url',
          image_url: {
            url: `data:${normalizeMimeType(img.mimeType)};base64,${img.base64}`,
          },
        })),
      ]
    : `${INVOICE_EXTRACTION_PROMPT}\n\nInvoice raw text:\n${(rawText || '').slice(0, 28000)}`;

  const messages = [
    {
      role: 'system',
      content:
        'You extract structured invoice fields accurately and always respond with a single valid JSON object.',
    },
    {
      role: 'user',
      content: userContent,
    },
  ];

  const postChat = (model: string, withJsonFormat: boolean) =>
    fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify(
        withJsonFormat
          ? { model, temperature: 0.1, response_format: { type: 'json_object' }, messages }
          : { model, temperature: 0.1, messages }
      ),
    });

  for (const model of models) {
    try {
      let response = await postChat(model, true);

      // Some open-weight routed vision endpoints reject response_format=json_object with HTTP 400
      if (response.status === 400) {
        response = await postChat(model, false);
      }

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        const rateLimited = isRateLimitError(response.status, errBody);
        attempts.push({
          provider,
          model,
          status: rateLimited ? 'rate_limited' : 'error',
          detail: `HTTP ${response.status}${rateLimited ? ' (rate limit/quota reached)' : ''}`,
        });
        continue;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: unknown } }>;
      };
      const messageContent = extractChatMessageText(payload?.choices?.[0]?.message?.content);
      const parsedJson = parseJsonObjectSafe(messageContent);
      if (!parsedJson) {
        attempts.push({
          provider,
          model,
          status: 'error',
          detail: 'Returned invalid JSON payload',
        });
        continue;
      }

      attempts.push({
        provider,
        model,
        status: 'success',
        detail: successLabel,
      });

      return normalizeStructuredResult(parsedJson, rawText || '', {
        provider,
        model,
        fallbackUsed,
        attempts,
      });
    } catch (err: unknown) {
      const errObj = err instanceof Error ? err : null;
      attempts.push({
        provider,
        model,
        status: 'error',
        detail:
          errObj?.name === 'TimeoutError'
            ? 'Request timed out'
            : errObj?.message || 'Network failure',
      });
    }
  }

  return null;
}

/**
 * Orchestrates 4-tier free-tier OCR extraction with deterministic fallback:
 * Gemini (native PDF/image/text)
 * -> Mistral OCR (native PDF/image)
 * -> OpenRouter Free Vision (qwen/qwen3.8-27b:free -> openrouter/free, max 3 images)
 * -> Groq (qwen/qwen3.8-27b -> llama-4-scout / llama-3.3-70b-versatile, max 3 images)
 * -> Client PDF render / Deterministic text parser / Browser Tesseract.js
 */
export async function runServerOCRPipeline(input: RunServerOCRInput): Promise<RunServerOCRResult> {
  const attempts: OCRAttemptTrace[] = [];
  const fetchImpl = input.fetchImpl || fetch;

  const readKey = (name: keyof NonNullable<RunServerOCRInput['env']>) =>
    (input.env ? input.env[name] : process.env[name])?.trim() || '';

  const geminiKey = readKey('GEMINI_API_KEY');
  const mistralKey = readKey('MISTRAL_API_KEY');
  const openrouterKey = readKey('OPENROUTER_API_KEY');
  const groqKey = readKey('GROQ_API_KEY');

  const mimeType = normalizeMimeType(input.mimeType, input.fileName);
  let effectiveRawText = input.rawText?.trim() || '';
  const isPdf = isPdfInput(mimeType, input.fileName);
  const initialHasMeaningfulText = effectiveRawText.replace(/\s+/g, '').length >= 30;

  // Build capped image list for Vision LLMs (uploaded image or client-rendered PDF pages, max 3)
  const visionImages: OCRPageImage[] = [];
  if (input.pageImages && input.pageImages.length > 0) {
    for (const img of input.pageImages.slice(0, MAX_VISION_IMAGES)) {
      if (Buffer.byteLength(img.base64, 'base64') <= MAX_VISION_IMAGE_BYTES) {
        visionImages.push({ mimeType: normalizeMimeType(img.mimeType), base64: img.base64 });
      }
    }
  } else if (
    input.fileBuffer &&
    isSupportedImageMime(mimeType) &&
    input.fileBuffer.length <= MAX_VISION_IMAGE_BYTES
  ) {
    visionImages.push({ mimeType, base64: input.fileBuffer.toString('base64') });
  }

  // Tier 1: Primary — Gemini API (native PDF, image, text)
  if (input.skipGemini) {
    attempts.push({
      provider: 'gemini',
      status: 'skipped',
      detail: 'Already attempted prior to PDF page rendering',
    });
  } else if (!geminiKey) {
    attempts.push({
      provider: 'gemini',
      status: 'skipped',
      detail: 'GEMINI_API_KEY is not configured',
    });
  } else {
    const geminiResult = await tryGeminiExtraction({
      apiKey: geminiKey,
      fileBuffer: input.fileBuffer,
      mimeType,
      rawText: initialHasMeaningfulText || !input.fileBuffer ? effectiveRawText : undefined,
      pageImages: input.pageImages,
      fetchImpl,
      attempts,
    });
    if (geminiResult) {
      return {
        status: 'extracted',
        data: geminiResult,
        attempts,
      };
    }
  }

  const priorUpstreamFailure = () =>
    attempts.some((a) => a.status === 'rate_limited' || a.status === 'error');

  // Tier 2a: Mistral OCR (native PDF and image)
  const mistralHasMediaInput = Boolean(
    (input.fileBuffer && input.fileBuffer.length > 0 && (isPdf || isSupportedImageMime(mimeType))) ||
      (input.pageImages && input.pageImages.length > 0)
  );

  if (input.skipMistral) {
    attempts.push({
      provider: 'mistral',
      status: 'skipped',
      detail: 'Already attempted prior to PDF page rendering',
    });
  } else if (!mistralKey) {
    attempts.push({
      provider: 'mistral',
      status: 'skipped',
      detail: 'MISTRAL_API_KEY is not configured',
    });
  } else if (!mistralHasMediaInput) {
    attempts.push({
      provider: 'mistral',
      status: 'skipped',
      detail: 'Mistral OCR applies to PDF and image documents',
    });
  } else {
    const mistralOutcome = await tryMistralOCRExtraction({
      apiKey: mistralKey,
      fileBuffer: input.fileBuffer,
      mimeType,
      fileName: input.fileName,
      rawText: effectiveRawText || undefined,
      pageImages: input.pageImages,
      fetchImpl,
      attempts,
      fallbackUsed: priorUpstreamFailure() || Boolean(input.skipGemini),
      hasDownstreamTextLlm: Boolean(openrouterKey || groqKey),
    });

    if (mistralOutcome.data) {
      return {
        status: 'extracted',
        data: mistralOutcome.data,
        attempts,
      };
    }
    if (mistralOutcome.markdownText) {
      effectiveRawText = mistralOutcome.markdownText;
    }
  }

  const effectiveHasText = effectiveRawText.replace(/\s+/g, '').length >= 30;

  // Scanned PDF without text layer and without rendered page images yet: ask client to render up to 3 pages
  if (isPdf && visionImages.length === 0 && !effectiveHasText) {
    const hasImageFallback = Boolean(openrouterKey || groqKey);
    return {
      status: 'needs_client_pdf_render',
      attempts,
      message: hasImageFallback
        ? 'Render scanned PDF pages to images for OpenRouter / Groq Vision / Tesseract fallback'
        : 'Render scanned PDF pages to images for Tesseract OCR fallback',
    };
  }

  const usedFallback =
    priorUpstreamFailure() || Boolean(input.skipGemini) || Boolean(input.skipMistral);

  // Tier 2b: OpenRouter Free Vision/Text (qwen/qwen3.8-27b:free -> openrouter/free)
  if (input.skipOpenRouter) {
    attempts.push({
      provider: 'openrouter',
      status: 'skipped',
      detail: 'OpenRouter bypassed for this request',
    });
  } else if (!openrouterKey) {
    attempts.push({
      provider: 'openrouter',
      status: 'skipped',
      detail: 'OPENROUTER_API_KEY is not configured',
    });
  } else if (visionImages.length > 0 || effectiveHasText) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const openrouterResult = await tryOpenAICompatibleExtraction({
      provider: 'openrouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: openrouterKey,
      extraHeaders: {
        'HTTP-Referer': appUrl,
        'X-Title': 'InvoiceGuard OCR',
      },
      models: OPENROUTER_MODELS,
      images: visionImages,
      rawText: effectiveHasText ? effectiveRawText : undefined,
      fetchImpl,
      attempts,
      fallbackUsed: usedFallback,
      successLabel: 'Extracted via OpenRouter Free API',
    });
    if (openrouterResult) {
      return {
        status: 'extracted',
        data: openrouterResult,
        attempts,
      };
    }
  } else {
    attempts.push({
      provider: 'openrouter',
      status: 'skipped',
      detail: 'Image exceeds 3.5MB vision payload threshold',
    });
  }

  const usedGroqFallback =
    priorUpstreamFailure() || Boolean(input.skipGemini) || Boolean(input.skipMistral);

  // Tier 3: Groq API (Images via Qwen 3.8 Vision -> Llama 4 Scout; text via Llama 3.3 70B)
  if (!groqKey) {
    attempts.push({
      provider: 'groq',
      status: 'skipped',
      detail: 'GROQ_API_KEY is not configured',
    });
  } else if (visionImages.length > 0 || effectiveHasText) {
    const groqResult = await tryOpenAICompatibleExtraction({
      provider: 'groq',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: groqKey,
      models: visionImages.length > 0 ? GROQ_VISION_MODELS : [GROQ_TEXT_MODEL],
      images: visionImages,
      rawText: effectiveHasText ? effectiveRawText : undefined,
      fetchImpl,
      attempts,
      fallbackUsed: usedGroqFallback,
      successLabel: 'Extracted via Groq API fallback',
    });
    if (groqResult) {
      return {
        status: 'extracted',
        data: groqResult,
        attempts,
      };
    }
  } else {
    attempts.push({
      provider: 'groq',
      status: 'skipped',
      detail: 'Image exceeds 3.5MB vision payload threshold',
    });
  }

  // Tier 4a: Deterministic text parser when plain text, PDF text layer, or Mistral markdown exists
  if (effectiveRawText.length > 0) {
    const parsed = OCRExtractionPipeline.parseInvoiceText(effectiveRawText, {
      ocr_provider: 'text-parser',
      ocr_model: isPdf ? 'pdfjs-text+regex' : 'plain-text+regex',
      fallback_used: true,
      attempts,
    });
    attempts.push({
      provider: 'text-parser',
      status: 'success',
      detail: 'Extracted from text layer using deterministic parser',
    });
    return {
      status: 'extracted',
      data: parsed,
      attempts,
    };
  }

  // Tier 4b: Ask browser to run local Tesseract.js OCR on image or rendered PDF pages
  return {
    status: 'fallback_to_tesseract',
    attempts,
    message: 'Cloud OCR unavailable or rate-limited; use browser Tesseract.js fallback.',
  };
}
