
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Eye,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Invoice, UserRole } from '@/types/database';

interface ReviewQueueClientProps {
  invoices: Invoice[];
  userRole: UserRole;
  currentUserId: string;
}

export function ReviewQueueClient({
  invoices: initialInvoices,
  userRole,
  currentUserId,
}: ReviewQueueClientProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'hold' | 'escalate'>('approve');
  const [actionReason, setActionReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDecision = (inv: Invoice, action: 'approve' | 'reject' | 'hold' | 'escalate') => {
    setSelectedInvoice(inv);
    setActionType(action);
    setActionReason('');
    setError(null);
    setIsDialogOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!selectedInvoice) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          reason: actionReason,
          userId: currentUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record decision');

      // Update local queue list
      setInvoices(invoices.filter((i) => i.id !== selectedInvoice.id));
      setIsDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fraud Investigation & Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized queue of invoices requiring human investigation before release to payment.
          </p>
        </div>

        <Badge variant="outline" className="text-xs font-mono border-slate-200">
          {invoices.length} Pending Cases
        </Badge>
      </div>

      {/* Decision Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionType === 'approve' ? 'Approve & Release to Payment' : `${actionType} Invoice`}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Invoice #{selectedInvoice?.invoice_number} • Total: {selectedInvoice ? formatCurrency(selectedInvoice.total_amount) : ''}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3 py-2">
            <Label htmlFor="auditReason" className="text-xs">
              Investigation Notes & Decision Rationale *
            </Label>
            <Textarea
              id="auditReason"
              required
              rows={3}
              placeholder="State the evidence or verification steps taken prior to this decision..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
            <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium border-slate-200" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={loading || !actionReason.trim()}
              onClick={handleConfirmDecision}
              className={`h-9 px-4 text-xs font-medium shadow-sm ${
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {loading ? 'Processing...' : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Queue Cards */}
      {invoices.length === 0 ? (
        <Card className="bg-white border-slate-200 shadow-sm p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Review Queue Cleared</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All flagged cases and held invoices have been evaluated. No pending reviews at this time.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const isSubmitter = inv.submitted_by_id === currentUserId;

            return (
              <Card
                key={inv.id}
                className={`bg-white border-slate-200 shadow-sm ${inv.risk_score >= 60 ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-amber-500'
                  }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-base text-slate-900 font-mono">
                          {inv.invoice_number}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold uppercase ${inv.workflow_status === 'on_hold'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                            }`}
                        >
                          {inv.workflow_status.replace(/_/g, ' ')}
                        </Badge>
                        {inv.has_hard_stop && (
                          <Badge className="bg-red-600 text-white text-[10px]">Hard Stop</Badge>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 font-medium">
                        Supplier: <strong className="text-slate-900">{inv.vendor?.name || 'Unregistered'}</strong> • Issued: {inv.invoice_date}
                      </div>

                      <div className="text-xs text-slate-500 font-mono pt-1">
                        Total Amount: <span className="font-bold text-slate-900 text-sm">{formatCurrency(inv.total_amount)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-slate-400">Risk Score:</span>
                        <span
                          className={`text-xl font-extrabold font-mono ${inv.risk_score >= 60 ? 'text-red-600' : 'text-amber-600'
                            }`}
                        >
                          {inv.risk_score}/100
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-3">
                        <Link href={`/app/invoices/${inv.id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-xs">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Inspect Findings
                          </Button>
                        </Link>

                        {!isSubmitter ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openDecision(inv, 'approve')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium h-8 px-3 shadow-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDecision(inv, 'reject')}
                              className="border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium h-8 px-3 shadow-xs"
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-medium px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md">
                            Submitted by you (Cannot self-approve)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

