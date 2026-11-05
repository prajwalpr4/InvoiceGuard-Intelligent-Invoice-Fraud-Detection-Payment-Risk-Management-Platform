import { InvoiceGuardRepository } from '@/lib/data/repository';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, CheckCircle2, Box } from 'lucide-react';

export const metadata = {
  title: 'Goods Receipts — Warehouse Deliveries (GRN)',
};

export default async function GoodsReceiptsPage() {
  const goodsReceipts = await InvoiceGuardRepository.getGoodsReceipts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Goods Receipt Notes (GRN) & Delivery Slips
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical receipt verifications used for automated 3-way matching before releasing payment approval.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {goodsReceipts.length === 0 ? (
          <Card className="bg-white border-slate-200 shadow-sm p-12 text-center">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
            <h3 className="font-semibold text-slate-900 text-sm">No Goods Receipts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Warehouse receiving notes (GRN) and delivery slips will appear here to verify physical fulfillment prior to invoice payment.
            </p>
          </Card>
        ) : (
          goodsReceipts.map((grn) => (
          <Card key={grn.id} className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-mono text-slate-900">
                  {grn.grn_number}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Linked PO: {grn.purchase_order?.po_number} • Received Date: {grn.received_date}
                </CardDescription>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1">
                <CheckCircle2 className="w-3 h-3" /> Physically Verified
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <p className="text-xs text-slate-600 italic">
                &quot;{grn.notes}&quot;
              </p>

              {grn.items && grn.items.length > 0 && (
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-right">Qty Received</th>
                        <th className="py-2 px-3 text-right">Qty Accepted</th>
                        <th className="py-2 px-3 text-right">Qty Rejected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {grn.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{item.quantity_received}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold">{item.quantity_accepted}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-red-600">{item.quantity_rejected}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )))}
      </div>
    </div>
  );
}

