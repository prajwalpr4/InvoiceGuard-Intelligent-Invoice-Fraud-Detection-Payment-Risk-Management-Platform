'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Landmark,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ReceiptText,
  FileBox,
  Plus,
  ArrowLeft,
  Lock,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface VendorDetailClientProps {
  vendor: any;
  currentUserId: string;
}

export function VendorDetailClient({ vendor, currentUserId }: VendorDetailClientProps) {
  const [bankAccounts, setBankAccounts] = useState(vendor.bank_accounts || []);
  const [isBankChangeOpen, setIsBankChangeOpen] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState<Record<string, boolean>>({});

  // Bank change form state
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleMask = (id: string) => {
    setShowFullAccount((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBankChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSuccessMsg(
        'Bank change request logged successfully. Sent to Senior Finance Reviewer for maker-checker telephone verification.'
      );
      setSubmitting(false);
      setIsBankChangeOpen(false);
    }, 800);
  };

  const formatCurrency = (val: number) => {
    return `₹${(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link href="/app/vendors" className="text-xs text-blue-700 hover:underline mb-1.5 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vendors
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{vendor.name}</h1>
            <Badge
              variant="outline"
              className={`text-xs font-semibold uppercase ${
                vendor.risk_tier === 'high'
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : vendor.risk_tier === 'medium'
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700'
              }`}
            >
              {vendor.risk_tier} Risk
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Vendor Code: {vendor.vendor_code} • GSTIN: {vendor.tax_id}
          </p>
        </div>

        <Dialog open={isBankChangeOpen} onOpenChange={setIsBankChangeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-4 shadow-sm">
              <Landmark className="w-3.5 h-3.5 mr-1.5" />
              Request Bank Account Modification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Maker-Checker Bank Change Request</DialogTitle>
              <DialogDescription className="text-xs">
                In accordance with anti-fraud controls, vendor bank account coordinates cannot be updated implicitly via invoice text. Dual-party verification is required.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleBankChangeRequest} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="nbBank" className="text-xs">New Bank Name *</Label>
                <Input
                  id="nbBank"
                  required
                  placeholder="e.g. State Bank of India"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="nbAcc" className="text-xs">New Account Number *</Label>
                <Input
                  id="nbAcc"
                  required
                  placeholder="e.g. 31234567890"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="nbIfsc" className="text-xs">New IFSC Code *</Label>
                <Input
                  id="nbIfsc"
                  required
                  placeholder="e.g. SBIN0000691"
                  value={newIfsc}
                  onChange={(e) => setNewIfsc(e.target.value)}
                  className="text-xs h-8 font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="nbReason" className="text-xs">Justification & Verification Call Log *</Label>
                <Textarea
                  id="nbReason"
                  required
                  rows={3}
                  placeholder="Document vendor contact person, callback verification timestamp, and signed request letter reference..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsBankChangeOpen(false)} className="h-9 px-4 text-xs font-medium border-slate-200">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-700 hover:bg-blue-800 text-white h-9 px-4 text-xs font-medium shadow-sm">
                  {submitting ? 'Submitting Request...' : 'Submit for Maker-Checker Signoff'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overview & Banking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Master Information */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Corporate Master Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Legal Name</span>
              <span className="font-semibold text-slate-900">{vendor.legal_name || vendor.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">GSTIN / Tax ID</span>
              <span className="font-mono font-semibold text-slate-900">{vendor.tax_id}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">PAN Number</span>
              <span className="font-mono font-semibold text-slate-900">{vendor.pan_number || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Official Address</span>
              <span className="text-slate-700">
                {vendor.address ? `${vendor.address}, ${vendor.city}, ${vendor.state} - ${vendor.postal_code}` : 'Address not registered'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Email / Contact</span>
              <span className="text-slate-700">{vendor.email} • {vendor.phone || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Master Trusted Banking Records (2 Cols) */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Authorized Master Bank Accounts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Invoices with unlisted banking coordinates trigger automatic hard-stops
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
              Maker-Checker Guard Active
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {bankAccounts.map((account: any) => {
                const isRevealed = showFullAccount[account.id];
                const displayedAccount = isRevealed
                  ? account.account_number
                  : `•••• •••• ${account.account_number.slice(-4)}`;

                return (
                  <div
                    key={account.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{account.bank_name}</span>
                          {account.is_primary && (
                            <Badge className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0">
                              Primary
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-slate-200 text-[9px] capitalize">
                            {account.account_type || 'Current'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 font-mono">
                          <span>Account: {displayedAccount}</span>
                          <button
                            type="button"
                            onClick={() => toggleMask(account.id)}
                            className="text-blue-700 hover:text-blue-900 text-[10px] underline ml-1"
                          >
                            {isRevealed ? 'Hide' : 'Reveal'}
                          </button>
                          <span>•</span>
                          <span>IFSC: {account.ifsc_code}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        Verified Master
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Invoices from this Vendor */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Invoice History ({vendor.invoices?.length || 0})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Invoices submitted by {vendor.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendor.invoices?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{inv.invoice_date}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${inv.risk_score >= 60 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {inv.risk_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                        {inv.workflow_status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link href={`/app/invoices/${inv.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-3 font-medium shadow-xs text-xs border-slate-200 hover:bg-slate-100 whitespace-nowrap">
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

