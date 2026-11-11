import { NextRequest, NextResponse } from 'next/server';
import { OCRPageImage, runServerOCRPipeline } from '@/lib/ocr/provider-chain';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export async function GET() {
  return NextResponse.json({
    providers: {
      gemini: Boolean(process.env.GEMINI_API_KEY?.trim()),
      mistral: Boolean(process.env.MISTRAL_API_KEY?.trim()),
      openrouter: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
      groq: Boolean(process.env.GROQ_API_KEY?.trim()),
      tesseract: true,
    },
  });
}

function parsePageImages(raw: unknown): OCRPageImage[] {
  if (!raw) return [];
  let arr: unknown = raw;
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  const valid: OCRPageImage[] = [];
  for (const item of arr) {
    if (
      item &&
      typeof item === 'object' &&
      'base64' in item &&
      'mimeType' in item &&
      typeof item.base64 === 'string' &&
      item.base64.length > 0 &&
      typeof item.mimeType === 'string'
    ) {
      valid.push({ mimeType: item.mimeType, base64: item.base64 });
      if (valid.length >= 4) break;
    }
  }
  return valid;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let fileBuffer: Buffer | undefined;
    let mimeType: string | undefined;
    let fileName: string | undefined;
    let rawText: string | undefined;
    let pageImages: OCRPageImage[] = [];
    let skipGemini = false;
    let skipMistral = false;
    let skipOpenRouter = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        if (file.size > MAX_UPLOAD_BYTES) {
          return NextResponse.json(
            { error: 'File exceeds the 25MB upload limit.' },
            { status: 400 }
          );
        }
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        fileName = file.name;
        mimeType = file.type || undefined;
      }

      const textVal = formData.get('raw_text');
      if (typeof textVal === 'string' && textVal.trim()) {
        rawText = textVal;
      }

      pageImages = parsePageImages(formData.get('page_images'));
      skipGemini = formData.get('skip_gemini') === '1' || formData.get('skip_gemini') === 'true';
      skipMistral = formData.get('skip_mistral') === '1' || formData.get('skip_mistral') === 'true';
      skipOpenRouter =
        formData.get('skip_openrouter') === '1' || formData.get('skip_openrouter') === 'true';
    } else {
      const body = await request.json();
      fileName = typeof body.file_name === 'string' ? body.file_name : undefined;
      mimeType = typeof body.mime_type === 'string' ? body.mime_type : undefined;
      rawText = typeof body.raw_text === 'string' ? body.raw_text : undefined;
      pageImages = parsePageImages(body.page_images);
      skipGemini = Boolean(body.skip_gemini);
      skipMistral = Boolean(body.skip_mistral);
      skipOpenRouter = Boolean(body.skip_openrouter);
    }

    if (!fileBuffer && !rawText && pageImages.length === 0) {
      return NextResponse.json(
        { error: 'Please supply an invoice file, extracted text, or rendered page images.' },
        { status: 400 }
      );
    }

    const result = await runServerOCRPipeline({
      fileBuffer,
      mimeType,
      fileName,
      rawText,
      pageImages,
      skipGemini,
      skipMistral,
      skipOpenRouter,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('OCR extract route error:', error);
    const message = error instanceof Error ? error.message : 'OCR extraction request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
