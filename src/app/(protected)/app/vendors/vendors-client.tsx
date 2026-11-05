'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Vendor } from '@/types/database';

interface VendorsClientProps {
  initialVendors: Vendor[];
}

export function VendorsClient({ initialVendors }: VendorsClientProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [search, setSearch] = useState('');
  const [isNewVendorOpen, setIsNewVendorOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState(`VND-${Math.floor(1000 + Math.random() * 9000)}`);
  const [taxId, setTaxId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = vendors.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.vendor_code.toLowerCase().includes(q) ||
      v.tax_id.toLowerCase().includes(q)
    );
  });

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_code: code,
          name,
          tax_id: taxId,
          pan_number: panNumber,
          email,
          phone,
          city,
          state,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create vendor');

      setVendors([data.vendor, ...vendors]);
      setIsNewVendorOpen(false);
      // Reset form
      setName('');
      setTaxId('');
      setAccountNumber('');
      setIfscCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vendor Master Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain trusted vendor profiles, verified bank accounts, and compliance risk ratings.
          </p>
        </div>

        <Dialog open={isNewVendorOpen} onOpenChange={setIsNewVendorOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-4 shadow-sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Onboard Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Onboard New Commercial Vendor</DialogTitle>
              <DialogDescription className="text-xs">
                Register master profile and initial verified banking coordinates.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateVendor} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="vName" className="text-xs">Vendor Legal Name *</Label>
                  <Input
                    id="vName"
                    required
                    placeholder="e.g. Acme Tooling Pvt Ltd"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vCode" className="text-xs">Vendor Code *</Label>
                  <Input
                    id="vCode"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="text-xs h-8 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="vTax" className="text-xs">GSTIN Identifier *</Label>
                  <Input
                    id="vTax"
                    required
                    placeholder="27AAACP1234A1Z5"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="text-xs h-8 font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vPan" className="text-xs">PAN Number</Label>
                  <Input
                    id="vPan"
                    placeholder="AAACP1234A"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    className="text-xs h-8 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="vEmail" className="text-xs">Accounts Email *</Label>
                  <Input
                    id="vEmail"
                    type="email"
                    required
                    placeholder="billing@vendor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vPhone" className="text-xs">Phone Number</Label>
                  <Input
                    id="vPhone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              {/* Master Banking Coordinates */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Trusted Master Bank Account
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="vBankName" className="text-xs">Bank</Label>
                    <Input
                      id="vBankName"
                      placeholder="HDFC Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vAccNum" className="text-xs">Account # *</Label>
                    <Input
                      id="vAccNum"
                      required
                      placeholder="50200012345678"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vIfsc" className="text-xs">IFSC Code *</Label>
                    <Input
                      id="vIfsc"
                      required
                      placeholder="HDFC0000123"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="text-xs h-8 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsNewVendorOpen(false)} className="h-9 px-4 text-xs font-medium border-slate-200">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-700 hover:bg-blue-800 text-white h-9 px-4 text-xs font-medium shadow-sm">
                  {submitting ? 'Registering...' : 'Save & Onboard Vendor'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search by vendor name, code, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vendor Directory Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
            <h3 className="font-semibold text-slate-900 text-sm">No Vendors Registered</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Onboard verified suppliers and their master bank coordinates to enable automated invoice matching and maker-checker protection.
            </p>
            <Button
              size="sm"
              onClick={() => setIsNewVendorOpen(true)}
              className="mt-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-4 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Onboard First Vendor
            </Button>
          </div>
        ) : (
          filtered.map((vendor) => (
          <Card key={vendor.id} className="bg-white border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{vendor.name}</h3>
                  <span className="text-xs font-mono text-slate-400 mt-0.5 block">{vendor.vendor_code}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold uppercase ${
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

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">GSTIN</span>
                  <span className="font-mono font-medium text-slate-900">{vendor.tax_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Compliance</span>
                  <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700">
                    {vendor.verification_status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Invoices</span>
                  <span className="font-semibold text-slate-900">{vendor.total_invoices_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Disbursed Spend</span>
                  <span className="font-bold text-slate-900">{formatCurrency(vendor.total_amount_paid)}</span>
                </div>
              </div>

              {/* Master Bank Masked Preview */}
              {vendor.bank_accounts && vendor.bank_accounts.length > 0 && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Landmark className="w-3.5 h-3.5 text-blue-700" />
                    <span className="font-medium">{vendor.bank_accounts[0].bank_name}</span>
                  </div>
                  <span className="font-mono text-slate-800 text-[11px]">
                    •••• {vendor.bank_accounts[0].account_number.slice(-4)}
                  </span>
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-end">
              <Link href={`/app/vendors/${vendor.id}`}>
                <Button variant="ghost" size="sm" className="text-xs font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 h-8 px-3 gap-1.5">
                  View Profile & Banking <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        )))}
      </div>
    </div>
  );
}

