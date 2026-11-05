'use client';

import { useState } from 'react';
import {
  Sliders,
  ShieldAlert,
  Save,
  CheckCircle2,
  Info,
  Layers,
  Landmark,
  Coins,
  Building2,
  Scale,
  FileCheck2,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FraudRulesClient() {
  const [saved, setSaved] = useState(false);

  // Editable rules state
  const [rules, setRules] = useState([
    {
      code: 'RULE_DUPLICATE_EXACT',
      name: 'Exact Duplicate Invoice Detection',
      weight: 40,
      hardStop: true,
      enabled: true,
      desc: 'Matches SHA-256 document file hashes or exact Vendor + Invoice # + Amount combinations.',
    },
    {
      code: 'RULE_BANK_MISMATCH',
      name: 'Bank Account Mismatch Protection',
      weight: 35,
      hardStop: true,
      enabled: true,
      desc: 'Flags unverified bank account numbers differing from registered vendor master records.',
    },
    {
      code: 'RULE_INVOICE_SPLITTING',
      name: 'Invoice Splitting / Threshold Manipulation',
      weight: 20,
      hardStop: false,
      enabled: true,
      desc: 'Detects multiple invoices clustering just below the ₹1,00,000 executive approval threshold within a 7-day window.',
    },
    {
      code: 'RULE_SUSPICIOUS_VENDOR',
      name: 'Suspicious & Unverified Vendor Profiling',
      weight: 15,
      hardStop: true,
      enabled: true,
      desc: 'Flags newly registered vendors (<30 days) and entities sharing tax IDs (GSTIN/PAN).',
    },
    {
      code: 'RULE_PO_MISMATCH',
      name: 'Purchase Order Limit Verification',
      weight: 15,
      hardStop: false,
      enabled: true,
      desc: 'Checks line items, quantities, and flags invoices exceeding approved PO balance by >5%.',
    },
    {
      code: 'RULE_THREE_WAY_MATCH',
      name: 'Three-Way Matching (PO - Invoice - GRN)',
      weight: 20,
      hardStop: true,
      enabled: true,
      desc: 'Cross-validates billed line item quantities against warehouse goods receipt notes.',
    },
    {
      code: 'RULE_AMOUNT_ANOMALY',
      name: 'Statistical Transaction Amount Outlier (Z-Score)',
      weight: 15,
      hardStop: false,
      enabled: true,
      desc: 'Flags transactions exceeding 3 standard deviations from vendor historical billing median.',
    },
    {
      code: 'RULE_TAX_VALIDATION',
      name: 'Tax Checksums & Financial Arithmetic',
      weight: 10,
      hardStop: false,
      enabled: true,
      desc: 'Validates GSTIN/PAN formatting structure and confirms Subtotal + Tax = Total Billed.',
    },
  ]);

  const toggleRule = (code: string) => {
    setRules(
      rules.map((r) => (r.code === code ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updateWeight = (code: string, weight: number) => {
    setRules(
      rules.map((r) => (r.code === code ? { ...r, weight } : r))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fraud Rule Engine Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure risk scoring weights, activate/deactivate detectors, and enforce hard-stop overrides.
          </p>
        </div>

        <Button
          onClick={handleSave}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-4 gap-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" /> Save Rule Parameters
        </Button>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Fraud rule parameters successfully persisted to database. Active telemetry updated.</span>
        </div>
      )}

      {/* Rules Configuration List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.code} className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-slate-900">{rule.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-slate-200">
                    {rule.code}
                  </Badge>
                  {rule.hardStop && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                      Hard-Stop Policy
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{rule.desc}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`weight-${rule.code}`} className="text-xs text-slate-500">
                    Weight:
                  </Label>
                  <Input
                    id={`weight-${rule.code}`}
                    type="number"
                    min="5"
                    max="50"
                    value={rule.weight}
                    onChange={(e) => updateWeight(rule.code, parseInt(e.target.value) || 10)}
                    className="w-16 h-8 text-xs font-mono font-bold text-center"
                  />
                  <span className="text-xs text-slate-400">pts</span>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                  <Label htmlFor={`switch-${rule.code}`} className="text-xs text-slate-600">
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </Label>
                  <Switch
                    id={`switch-${rule.code}`}
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.code)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

