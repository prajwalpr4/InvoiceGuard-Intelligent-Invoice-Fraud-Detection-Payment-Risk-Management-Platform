import { InvoiceGuardRepository } from '@/lib/data/repository';
import { getCurrentUserSession } from '@/lib/auth/session';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCheck, ShieldCheck, Scale, ArrowRight, Eye, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Approvals — Multi-Level Governance Matrix',
};

export default async function ApprovalsPage() {
  const invoices = await InvoiceGuardRepository.getInvoices();
  const session = await getCurrentUserSession();

  // Pending approval invoices
  const pendingApprovals = invoices.filter(
    (i) => i.workflow_status === 'pending_approval' || i.workflow_status === 'ready_for_payment'
  );

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Multi-Tier Approval Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tiered delegation of financial authority based on invoice value thresholds.
          </p>
        </div>
      </div>

      {/* Threshold Policies Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tier 1 Authority
            </span>
            <div className="text-base font-bold text-slate-900">Up to ₹25,000</div>
            <p className="text-xs text-slate-500">
              Requires 1 signoff: Accounts Payable Manager or Finance Staff.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Tier 2 Authority
            </span>
            <div className="text-base font-bold text-slate-900">₹25,001 — ₹1,00,000</div>
            <p className="text-xs text-slate-500">
              Requires Finance Director / Manager approval.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
              Tier 3 Authority (Executive)
            </span>
            <div className="text-base font-bold text-slate-900">Above ₹1,00,000</div>
            <p className="text-xs text-slate-500">
              Dual-authorization required: Finance Director AND Chief Financial Officer.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices in Approval Flow */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Active Invoices Pending Release ({pendingApprovals.length})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Invoices awaiting authorized electronic signoff
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Required Authority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <CheckCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-900">All Approvals Cleared</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">No invoices currently awaiting signoff.</p>
                    </td>
                  </tr>
                ) : (
                  pendingApprovals.map((inv) => {
                  let requiredTier = 'Tier 1 (Finance)';
                  if (inv.total_amount > 100000) requiredTier = 'Tier 3 (Finance + CFO)';
                  else if (inv.total_amount > 25000) requiredTier = 'Tier 2 (Approver)';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {inv.vendor?.name}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[10px] font-mono border-slate-200">
                          {requiredTier}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold uppercase ${
                            inv.workflow_status === 'ready_for_payment'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {inv.workflow_status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link href={`/app/invoices/${inv.id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-3 font-medium shadow-xs text-xs border-slate-200 hover:bg-slate-100 whitespace-nowrap">
                            Review & Sign
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

