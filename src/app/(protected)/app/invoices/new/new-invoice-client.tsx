'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  ScanText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Landmark,
  Building2,
  Sparkles,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Vendor, PurchaseOrder, OCRAttemptTrace } from '@/types/database';
import { ExtractedInvoiceData, OCRExtractionPipeline } from '@/lib/ocr/extractor';
import { extractPdfTextInBrowser, renderPdfPagesToImages, RenderedPDFPage } from '@/lib/ocr/pdf-client';

interface NewInvoiceClientProps {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  currentUserId: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Gemini API',
  mistral: 'Mistral OCR',
  openrouter: 'OpenRouter Free Vision',
  groq: 'Groq Vision/LLM Fallback',
  tesseract: 'Tesseract.js Local Fallback',
  'text-parser': 'Text Layer Parser',
};

export function NewInvoiceClient({
  vendors,
  purchaseOrders,
  currentUserId,
}: NewInvoiceClientProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [ocrNotice, setOcrNotice] = useState<string | null>(null);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedPoId, setSelectedPoId] = useState('');
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyExtractedFields = (parsed: ExtractedInvoiceData) => {
    if (parsed.invoice_number) setInvoiceNumber(parsed.invoice_number);
    if (parsed.invoice_date) setInvoiceDate(parsed.invoice_date);
    if (parsed.due_date) setDueDate(parsed.due_date);
    if (parsed.subtotal !== undefined && parsed.subtotal > 0) setSubtotal(parsed.subtotal);
    if (parsed.tax_amount !== undefined && parsed.tax_amount >= 0) setTaxAmount(parsed.tax_amount);
    if (parsed.total_amount !== undefined && parsed.total_amount > 0) {
      setTotalAmount(parsed.total_amount);
    }
    if (parsed.bank_account_number) setBankAccount(parsed.bank_account_number);
    if (parsed.ifsc_code) setIfscCode(parsed.ifsc_code);
    if (parsed.bank_name) setBankName(parsed.bank_name);

    // Auto-match registered vendor by GSTIN first, then vendor name
    const matchedVendor = vendors.find((v) => {
      if (parsed.gstin && v.tax_id && v.tax_id.trim().toUpperCase() === parsed.gstin.toUpperCase()) {
        return true;
      }
      if (parsed.vendor_name) {
        const extractedLower = parsed.vendor_name.toLowerCase();
        const vendorLower = v.name.toLowerCase();
        return vendorLower.includes(extractedLower) || extractedLower.includes(vendorLower);
      }
      return false;
    });
    if (matchedVendor) {
      setSelectedVendorId(matchedVendor.id);
    }

    // Auto-match Purchase Order reference if present
    if (parsed.po_number) {
      const matchedPo = purchaseOrders.find(
        (p) => p.po_number.trim().toUpperCase() === parsed.po_number!.trim().toUpperCase()
      );
      if (matchedPo) {
        setSelectedPoId(matchedPo.id);
      }
    }
  };

  const runLocalTesseractFallback = async (
    uploadedFile: File,
    isPdf: boolean,
    preRenderedPages: RenderedPDFPage[],
    attempts: OCRAttemptTrace[]
  ): Promise<ExtractedInvoiceData | null> => {
    setProcessingStage('Running local Tesseract.js OCR fallback...');

    let pageImages = preRenderedPages;
    if (isPdf && pageImages.length === 0) {
      pageImages = await renderPdfPagesToImages(uploadedFile, 3);
    }

    const ocrInputs: Array<File | string> = isPdf
      ? pageImages.map((p) => p.dataUrl)
      : [uploadedFile];

    if (ocrInputs.length === 0) {
      return null;
    }

    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const chunks: string[] = [];

    try {
      for (const input of ocrInputs) {
        const ret = await worker.recognize(input);
        if (ret?.data?.text?.trim()) {
          chunks.push(ret.data.text.trim());
        }
      }
    } finally {
      await worker.terminate();
    }

    const combinedText = chunks.join('\n\n').trim();
    if (!combinedText) {
      return null;
    }

    const updatedAttempts: OCRAttemptTrace[] = [
      ...attempts,
      {
        provider: 'tesseract',
        model: 'tesseract.js-eng',
        status: 'success',
        detail: `Extracted via local browser OCR (${ocrInputs.length} page/image)`,
      },
    ];

    return OCRExtractionPipeline.parseInvoiceText(combinedText, {
      ocr_provider: 'tesseract',
      ocr_model: 'tesseract.js-eng',
      fallback_used: true,
      attempts: updatedAttempts,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setExtractedData(null);
    setOcrNotice(null);
    setError(null);
    setIsProcessing(true);

    const isTextFile =
      uploadedFile.type === 'text/plain' ||
      uploadedFile.name.toLowerCase().endsWith('.txt') ||
      uploadedFile.name.toLowerCase().endsWith('.csv');
    const isPdf =
      uploadedFile.type === 'application/pdf' ||
      uploadedFile.name.toLowerCase().endsWith('.pdf');

    let browserRawText = '';
    let renderedPages: RenderedPDFPage[] = [];
    let attempts: OCRAttemptTrace[] = [];

    try {
      setProcessingStage('Preparing document for OCR...');
      if (isTextFile) {
        browserRawText = await uploadedFile.text();
      } else if (isPdf) {
        try {
          browserRawText = await extractPdfTextInBrowser(uploadedFile, 8);
        } catch (pdfErr) {
          console.warn('PDF text layer inspection skipped:', pdfErr);
        }
      }

      setProcessingStage('Extracting fields via Gemini → Mistral → OpenRouter → Groq OCR pipeline...');
      const ocrForm = new FormData();
      ocrForm.append('file', uploadedFile);
      if (browserRawText.trim()) {
        ocrForm.append('raw_text', browserRawText);
      }

      const res = await fetch('/api/ocr/extract', {
        method: 'POST',
        body: ocrForm,
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.error || 'Server OCR request failed');
      }

      let ocrResult = await res.json();
      attempts = Array.isArray(ocrResult.attempts) ? ocrResult.attempts : [];

      if (ocrResult.status === 'needs_client_pdf_render' && isPdf) {
        setProcessingStage('Rendering PDF pages for OpenRouter / Groq Vision / Tesseract fallback...');
        renderedPages = await renderPdfPagesToImages(uploadedFile, 3);

        if (renderedPages.length > 0) {
          const secondRes = await fetch('/api/ocr/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file_name: uploadedFile.name,
              mime_type: uploadedFile.type || 'application/pdf',
              raw_text: browserRawText || undefined,
              skip_gemini: true,
              skip_mistral: true,
              page_images: renderedPages.map((p) => ({
                mimeType: p.mimeType,
                base64: p.base64,
              })),
            }),
          });
          if (secondRes.ok) {
            ocrResult = await secondRes.json();
            attempts = Array.isArray(ocrResult.attempts) ? ocrResult.attempts : attempts;
          }
        }
      }

      let finalExtracted: ExtractedInvoiceData | null = null;
      if (ocrResult.status === 'extracted' && ocrResult.data) {
        finalExtracted = ocrResult.data as ExtractedInvoiceData;
      } else if (isTextFile && browserRawText.trim()) {
        finalExtracted = OCRExtractionPipeline.parseInvoiceText(browserRawText, {
          ocr_provider: 'text-parser',
          ocr_model: 'plain-text+regex',
          fallback_used: true,
          attempts,
        });
      } else if (!isTextFile) {
        finalExtracted = await runLocalTesseractFallback(
          uploadedFile,
          isPdf,
          renderedPages,
          attempts
        );
      }

      if (finalExtracted) {
        setExtractedData(finalExtracted);
        applyExtractedFields(finalExtracted);
        if (finalExtracted.fallback_used) {
          const skippedOrLimited = finalExtracted.attempts?.filter(
            (a) => a.status === 'rate_limited' || a.status === 'error' || a.status === 'skipped'
          );
          if (skippedOrLimited && skippedOrLimited.length > 0) {
            setOcrNotice(
              `Primary OCR bypassed (${skippedOrLimited.map((a) => `${a.provider}: ${a.detail || a.status}`).join('; ')}) — extracted with ${PROVIDER_LABELS[finalExtracted.ocr_provider || 'tesseract']}.`
            );
          }
        }
      } else {
        setOcrNotice(
          'Automatic OCR could not extract text cleanly from this file. Please fill or verify fields manually below.'
        );
      }
    } catch (err: unknown) {
      console.error('OCR processing error:', err);
      if (isTextFile && browserRawText.trim()) {
        const parsed = OCRExtractionPipeline.parseInvoiceText(browserRawText, {
          ocr_provider: 'text-parser',
          fallback_used: true,
          attempts,
        });
        setExtractedData(parsed);
        applyExtractedFields(parsed);
      } else if (!isTextFile) {
        try {
          const fallbackParsed = await runLocalTesseractFallback(
            uploadedFile,
            isPdf,
            renderedPages,
            attempts
          );
          if (fallbackParsed) {
            setExtractedData(fallbackParsed);
            applyExtractedFields(fallbackParsed);
            setOcrNotice('Cloud OCR unavailable; extracted locally via Tesseract.js fallback.');
          }
        } catch (tessErr) {
          console.error('Tesseract fallback error:', tessErr);
          setOcrNotice('OCR fallback could not read this document. Please enter fields manually.');
        }
      }
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber || !totalAmount) {
      setError('Please provide an invoice number and valid total amount.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('invoice_number', invoiceNumber);
      formData.append('invoice_date', invoiceDate);
      if (dueDate) formData.append('due_date', dueDate);
      if (selectedVendorId) formData.append('vendor_id', selectedVendorId);
      if (selectedPoId) formData.append('po_id', selectedPoId);
      formData.append('subtotal', String(subtotal));
      formData.append('tax_amount', String(taxAmount));
      formData.append('total_amount', String(totalAmount));
      formData.append('department', department);
      if (notes) formData.append('notes', notes);
      formData.append('submitted_by_id', currentUserId);
      formData.append(
        'bank_details',
        JSON.stringify({
          account_number: bankAccount,
          ifsc_code: ifscCode,
          bank_name: bankName,
        })
      );
      if (extractedData) {
        formData.append('extracted_data', JSON.stringify(extractedData));
        if (extractedData.raw_text) {
          formData.append('extracted_text', extractedData.raw_text);
        }
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register invoice');
      }

      // Navigate to detail page of newly created invoice with complete fraud findings
      router.push(`/app/invoices/${data.invoice.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <Link href="/app/invoices" className="text-xs text-blue-700 hover:underline mb-2 inline-block">
          ← Back to Invoices
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Upload & Register Supplier Invoice
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload invoices for automatic OCR extraction, math reconciliation, and multi-layered fraud analysis.
        </p>
      </div>

      {/* Segregation of Duties Governance Alert */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong>Maker-Checker Policy Enforcement:</strong> Invoices submitted by your account cannot be approved by you. They will be automatically routed to the designated approver matrix.
        </div>
      </div>

      {/* Upload Zone */}
      <Card className="bg-white border-slate-200 shadow-sm border-dashed border-2">
        <CardContent className="p-8 text-center">
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {file ? file.name : 'Click to select or drag & drop invoice document'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Supports PDF, PNG, JPG, TXT files up to 25MB • Gemini → Mistral OCR → OpenRouter → Groq → Tesseract
            </div>
          </label>

          {isProcessing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-700 font-medium">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-700 border-t-transparent animate-spin"></span>
              {processingStage || 'Extracting invoice fields...'}
            </div>
          )}

          {extractedData && !isProcessing && (
            <div className="mt-4 space-y-3 text-left max-w-2xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  OCR Extracted ({extractedData.overall_confidence}% Confidence)
                </span>
                <Badge variant="outline" className="text-[11px] bg-slate-50 text-slate-700 border-slate-200">
                  Engine: {PROVIDER_LABELS[extractedData.ocr_provider || 'text-parser'] || extractedData.ocr_provider}
                  {extractedData.ocr_model ? ` (${extractedData.ocr_model})` : ''}
                </Badge>
              </div>

              {(extractedData.vendor_name || extractedData.gstin || extractedData.pan || extractedData.po_number) && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {extractedData.vendor_name && (
                    <div>
                      <span className="text-slate-400 block">Detected Vendor</span>
                      <span className="font-semibold text-slate-900">{extractedData.vendor_name}</span>
                    </div>
                  )}
                  {extractedData.gstin && (
                    <div>
                      <span className="text-slate-400 block">GSTIN</span>
                      <span className="font-mono font-semibold text-slate-900">{extractedData.gstin}</span>
                    </div>
                  )}
                  {extractedData.pan && (
                    <div>
                      <span className="text-slate-400 block">PAN</span>
                      <span className="font-mono font-semibold text-slate-900">{extractedData.pan}</span>
                    </div>
                  )}
                  {extractedData.po_number && (
                    <div>
                      <span className="text-slate-400 block">PO Ref</span>
                      <span className="font-mono font-semibold text-slate-900">{extractedData.po_number}</span>
                    </div>
                  )}
                </div>
              )}

              {extractedData.raw_text && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowRawText((prev) => !prev)}
                    className="text-[11px] text-blue-700 hover:underline font-medium"
                  >
                    {showRawText ? 'Hide Raw OCR Text' : 'Inspect Raw OCR Text'}
                  </button>
                  {showRawText && (
                    <pre className="mt-2 p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] text-left max-h-48 overflow-auto whitespace-pre-wrap font-mono">
                      {extractedData.raw_text}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {ocrNotice && !isProcessing && (
            <div className="mt-3 max-w-2xl mx-auto p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 text-left flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{ocrNotice}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Registration Form */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
            Verify & Correct Invoice Information
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Review normalized extracted values before executing fraud analysis and routing for approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor & Invoice Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="vendor" className="text-xs">Supplier / Vendor *</Label>
                <Select value={selectedVendorId} onValueChange={(val) => setSelectedVendorId(val || '')}>
                  <SelectTrigger id="vendor" className="text-xs h-9">
                    <SelectValue placeholder={vendors.length === 0 ? 'No registered vendors' : 'Select Vendor'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" className="text-xs">
                      {vendors.length === 0 ? 'No registered vendors' : 'Direct Supplier / Unregistered'}
                    </SelectItem>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-xs">
                        {v.name} ({v.vendor_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invNum" className="text-xs">Invoice Number *</Label>
                <Input
                  id="invNum"
                  required
                  placeholder="e.g. INV-2026-9001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="poNum" className="text-xs">Purchase Order Reference</Label>
                <Select value={selectedPoId} onValueChange={(val) => setSelectedPoId(val || '')}>
                  <SelectTrigger id="poNum" className="text-xs h-9 font-mono">
                    <SelectValue placeholder="Select Linked PO (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" className="text-xs font-mono">None (Direct Invoicing)</SelectItem>
                    {purchaseOrders.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                        {p.po_number} (₹{p.total_amount.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invDate" className="text-xs">Invoice Date *</Label>
                <Input
                  id="invDate"
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dueDate" className="text-xs">Payment Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dept" className="text-xs">Department</Label>
                <Select value={department} onValueChange={(val) => setDepartment(val || 'Manufacturing')}>
                  <SelectTrigger id="dept" className="text-xs h-9">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="IT Infrastructure">IT Infrastructure</SelectItem>
                    <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Executive Finance">Executive Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Financial Amounts (With Auto-Calculation) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block mb-3 uppercase tracking-wider">
                Financial Amounts (₹ INR)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="subtotal" className="text-xs">Taxable Subtotal (₹) *</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    required
                    value={subtotal || ''}
                    onChange={(e) => {
                      const s = parseFloat(e.target.value) || 0;
                      setSubtotal(s);
                      setTotalAmount(s + taxAmount);
                    }}
                    className="text-xs h-9 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tax" className="text-xs">Tax Amount / GST (₹) *</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    required
                    value={taxAmount || ''}
                    onChange={(e) => {
                      const t = parseFloat(e.target.value) || 0;
                      setTaxAmount(t);
                      setTotalAmount(subtotal + t);
                    }}
                    className="text-xs h-9 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="total" className="text-xs">Total Payable (₹) *</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    required
                    value={totalAmount || ''}
                    onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                    className="text-xs h-9 font-bold text-blue-700 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Extracted Bank Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-3">
                <Landmark className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Payment Account Stated on Invoice
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                These banking details will be cross-referenced against the vendor master record for unauthorized redirection attempts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bankAcc" className="text-xs">Account Number</Label>
                  <Input
                    id="bankAcc"
                    placeholder="e.g. 50200012345678"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ifsc" className="text-xs">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    placeholder="e.g. HDFC0000123"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="text-xs h-9 font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bankName" className="text-xs">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g. HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs">Procurement / Review Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes for accounting or review team"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium h-10 shadow-sm"
            >
              {submitting ? 'Running Fraud Analysis & Registering...' : 'Submit Invoice for Verification & Review'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
