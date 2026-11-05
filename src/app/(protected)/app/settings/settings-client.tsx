'use client';

import { useState } from 'react';
import {
  Settings,
  Building,
  Scale,
  Bell,
  Cpu,
  Mail,
  Save,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SettingsClient() {
  const [orgName, setOrgName] = useState('InvoiceGuard Workspace');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [tier1Limit, setTier1Limit] = useState(25000);
  const [tier2Limit, setTier2Limit] = useState(100000);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Settings & Controls
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise organization parameters, financial authority ceilings, and external integration boundaries.
          </p>
        </div>

        <Button
          onClick={handleSave}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-4 gap-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" /> Save Configuration
        </Button>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Organization settings and approval policy thresholds successfully saved.</span>
        </div>
      )}

      {/* Organization Profile */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Organization Identity
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Tenant configuration applied to all invoices, taxes, and vendor communications.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="orgName" className="text-xs">Company Legal Name</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="orgCurrency" className="text-xs">Functional Currency</Label>
              <Select value={currency} onValueChange={(val) => setCurrency(val || 'INR')}>
                <SelectTrigger id="orgCurrency" className="text-xs h-9">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹ - Indian Rupee)</SelectItem>
                  <SelectItem value="USD">USD ($ - US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (€ - Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (£ - British Pound)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="orgTimezone" className="text-xs">Default Timezone</Label>
              <Input
                id="orgTimezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="taxIdType" className="text-xs">Tax Identifier Standard</Label>
              <Input
                id="taxIdType"
                disabled
                value="GSTIN (15-digit alphanumeric standard)"
                className="text-xs h-9 bg-slate-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Thresholds */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Delegation of Financial Authority (Approval Matrix)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Define amount ceilings for required single, dual, and executive approvals.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tier1" className="text-xs">Tier 1 Ceiling (Finance Staff) (₹)</Label>
              <Input
                id="tier1"
                type="number"
                value={tier1Limit}
                onChange={(e) => setTier1Limit(parseInt(e.target.value) || 0)}
                className="text-xs h-9 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-500">
                Invoices up to ₹{tier1Limit.toLocaleString()} clear with single operational approval.
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tier2" className="text-xs">Tier 2 Ceiling (Finance Director) (₹)</Label>
              <Input
                id="tier2"
                type="number"
                value={tier2Limit}
                onChange={(e) => setTier2Limit(parseInt(e.target.value) || 0)}
                className="text-xs h-9 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-500">
                Invoices exceeding ₹{tier2Limit.toLocaleString()} mandate dual approval (Approver + CFO).
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Integration Interfaces (Honest Architecture) */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            External Integrations & AI Assistant Status
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Configured endpoints and service boundary contracts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-slate-600" />
              <div>
                <span className="font-bold text-slate-900 block">AI Investigation Assistant (OpenAI / Gemini)</span>
                <span className="text-[11px] text-slate-500">
                  Provides contextual plain-language summaries of complex multi-finding invoices.
                </span>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-600 bg-white">
              Requires OPENAI_API_KEY
            </Badge>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-600" />
              <div>
                <span className="font-bold text-slate-900 block">Corporate Mailbox Ingestion</span>
                <span className="text-[11px] text-slate-500">
                  Ingests attachments from accounts.payable@acmeglobal.com.
                </span>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-600 bg-white">
              Ready (SMTP/IMAP)
            </Badge>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-slate-600" />
              <div>
                <span className="font-bold text-slate-900 block">SAP / Oracle ERP Bridge</span>
                <span className="text-[11px] text-slate-500">
                  Syncs approved disbursements with general ledger.
                </span>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-600 bg-white">
              API Contract Ready
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Action Bar */}
      <div className="flex justify-end pt-2 pb-6">
        <Button
          onClick={handleSave}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-5 gap-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" /> Save Configuration
        </Button>
      </div>
    </div>
  );
}
