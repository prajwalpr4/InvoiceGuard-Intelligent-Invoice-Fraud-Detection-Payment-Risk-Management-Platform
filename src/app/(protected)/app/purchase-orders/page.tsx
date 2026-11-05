import { InvoiceGuardRepository } from '@/lib/data/repository';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileBox, Building2, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Purchase Orders — Procurement Commitments',
};

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await InvoiceGuardRepository.getPurchaseOrders();

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Purchase Orders & Procurement Commitments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorizations used for 3-way matching and quantity/price discrepancy validation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {purchaseOrders.length === 0 ? (
          <Card className="bg-white border-slate-200 shadow-sm p-12 text-center col-span-full">
            <FileBox className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
            <h3 className="font-semibold text-slate-900 text-sm">No Purchase Orders Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Procurement commitments and authorized order amounts will be cataloged here for automated 3-way matching.
            </p>
          </Card>
        ) : (
          purchaseOrders.map((po) => (
          <Card key={po.id} className="bg-white border-slate-200 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-bold font-mono text-slate-900">
                    {po.po_number}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    {po.vendor?.name}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold uppercase ${
                    po.status === 'fully_billed'
                      ? 'bg-slate-100 text-slate-700'
                      : po.status === 'partially_billed'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {po.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department</span>
                  <span className="font-semibold text-slate-900">{po.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issue Date</span>
                  <span className="text-slate-700">{po.issue_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Approved</span>
                  <span className="font-bold text-slate-900">{formatCurrency(po.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Billed to Date</span>
                  <span className="font-semibold text-blue-700">{formatCurrency(po.billed_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining Ceiling</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(po.remaining_amount)}</span>
                </div>
              </div>

              {/* Progress bar of utilization */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-700 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((po.billed_amount / po.total_amount) * 100))}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{Math.round((po.billed_amount / po.total_amount) * 100)}% Billed</span>
                  <span>{formatCurrency(po.remaining_amount)} Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
    </div>
  );
}

