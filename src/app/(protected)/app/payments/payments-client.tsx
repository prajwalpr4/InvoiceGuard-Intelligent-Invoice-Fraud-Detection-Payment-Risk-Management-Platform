'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PaymentRecord, Invoice, UserRole } from '@/types/database';

interface PaymentsClientProps {
  initialPayments: PaymentRecord[];
  readyInvoices: Invoice[];
  userRole: UserRole;
  currentUserId: string;
}

export function PaymentsClient({
  initialPayments,
  readyInvoices,
  userRole,
  currentUserId,
}: PaymentsClientProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  // Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState('neft_rtgs');
  const [reference, setReference] = useState(`NEFT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [bankAccountUsed, setBankAccountUsed] = useState('Corporate Main Settlement A/C');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedInvoice = readyInvoices.find((i) => i.id === selectedInvoiceId);

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = readyInvoices.find((i) => i.id === id);
    if (inv) {
      setAmount(inv.balance_due);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || !amount || !reference) {
      setError('Please select an invoice and enter amount and reference.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: selectedInvoiceId,
          amount: Number(amount),
          payment_method: method,
          payment_reference: reference,
          bank_account_used: bankAccountUsed,
          notes,
          userId: currentUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment execution failed');

      setPayments([data.payment, ...payments]);
      setIsRecordOpen(false);
      setSelectedInvoiceId('');
      setAmount(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const exportPaymentBatchCSV = () => {
    const headers = ['Payment Reference', 'Invoice Number', 'Amount', 'Currency', 'Method', 'Date', 'Status'];
    const rows = payments.map((p) => [
      p.payment_reference,
      p.invoice?.invoice_number || p.invoice_id,
      p.amount,
      p.currency,
      p.payment_method,
      p.payment_date,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InvoiceGuard_Payment_Batch_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => `₹${(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payment Tracking & Disbursement Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulated payment execution, duplicate transaction protection, and batch reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportPaymentBatchCSV}
            className="text-xs font-medium h-9 px-4 border-slate-200 gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export Payment Batch (CSV)
          </Button>

          <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-4 shadow-sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Record Authorized Disbursement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log Payment Disbursement</DialogTitle>
                <DialogDescription className="text-xs">
                  Payments can only be logged against invoices with cleared approval status.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleRecordPayment} className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="payInv" className="text-xs">Select Approved Invoice *</Label>
                  <Select value={selectedInvoiceId} onValueChange={(val) => handleSelectInvoice(val || '')}>
                    <SelectTrigger id="payInv" className="text-xs h-9 font-mono">
                      <SelectValue placeholder="Select Ready Invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {readyInvoices.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id} className="text-xs font-mono">
                          {inv.invoice_number} — Due: {formatCurrency(inv.balance_due)} ({inv.vendor?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="payAmount" className="text-xs">
                    Disbursement Amount (₹) *
                  </Label>
                  <Input
                    id="payAmount"
                    type="number"
                    step="0.01"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="text-xs h-9 font-bold"
                  />
                  {selectedInvoice && (
                    <span className="text-[10px] text-slate-500">
                      Approved Outstanding Ceiling: {formatCurrency(selectedInvoice.balance_due)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="payMethod" className="text-xs">Payment Rail</Label>
                    <Select value={method} onValueChange={(val) => setMethod(val || 'neft_rtgs')}>
                      <SelectTrigger id="payMethod" className="text-xs h-9">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neft_rtgs">NEFT / RTGS</SelectItem>
                        <SelectItem value="bank_transfer">Direct Bank Transfer</SelectItem>
                        <SelectItem value="wire">Corporate Wire</SelectItem>
                        <SelectItem value="check">Commercial Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="payRef" className="text-xs">Transaction Reference # *</Label>
                    <Input
                      id="payRef"
                      required
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                </div>

                <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsRecordOpen(false)} className="h-9 px-4 text-xs font-medium border-slate-200">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={submitting} className="bg-blue-700 hover:bg-blue-800 text-white h-9 px-4 text-xs font-medium shadow-sm">
                    {submitting ? 'Verifying & Recording...' : 'Confirm Payment'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Disbursed Payments Table */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Transaction Ref #</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Settled Amount</th>
                  <th className="py-3 px-4">Rail / Method</th>
                  <th className="py-3 px-4">Settlement Date</th>
                  <th className="py-3 px-4">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-900">No Payments Recorded Yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Approved invoices will appear in the disbursement dialog.</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {p.payment_reference}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-700">
                      {p.invoice?.invoice_number || p.invoice_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-600 font-medium">
                      {p.payment_method.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.payment_date}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase">
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
