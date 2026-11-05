'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ReceiptText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  TrendingDown,
  Building2,
  ArrowUpRight,
  Filter,
  FileCheck2,
  CreditCard,
  Layers,
  Landmark,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardClientProps {
  summary: {
    totalInvoices: number;
    totalValue: number;
    pendingReview: number;
    onHold: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    paid: number;
    highRisk: number;
    duplicatesCaught: number;
    bankMismatchesCaught: number;
    potentialExposure: number;
    currency: string;
  };
  analytics: {
    monthlyData: Array<{ month: string; count: number; spend: number; flagged: number }>;
    riskDistribution: Array<{ name: string; value: number; color: string }>;
    alertsByCategory: Array<{ category: string; count: number }>;
    vendorSpend: Array<{ vendorName: string; totalSpend: number; riskTier: string }>;
  };
  recentInvoices: any[];
}

export function DashboardClient({ summary, analytics, recentInvoices }: DashboardClientProps) {
  const [timeRange, setTimeRange] = useState('6m');

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Fraud & AP Risk Radar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry on invoices, anomaly detection, vendor compliance, and cash disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/app/invoices/new">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-4 shadow-sm">
              <ReceiptText className="w-3.5 h-3.5 mr-1.5" />
              Upload Invoice
            </Button>
          </Link>
          <Link href="/app/review-queue">
            <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium h-9 px-3.5 shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-red-600" />
              Review Queue ({summary.onHold + summary.pendingReview})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Invoiced Volume
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(summary.totalValue)}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <ReceiptText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] text-slate-500 gap-1.5">
              <span className="font-semibold text-slate-700">{summary.totalInvoices} Invoices</span>
              <span>across active vendors</span>
            </div>
          </CardContent>
        </Card>

        {/* Potential Duplicate & Fraud Exposure Blocked */}
        <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-red-600">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-600" />
                  Exposure Intercepted
                </span>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(summary.potentialExposure)}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] text-slate-500 gap-1.5">
              <span className="font-semibold text-red-600">{summary.onHold} Invoices on Hard Hold</span>
            </div>
          </CardContent>
        </Card>

        {/* Bank Mismatches & Duplicate Interceptions */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Critical Safeguards
                </span>
                <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">
                  <span>{summary.duplicatesCaught + summary.bankMismatchesCaught}</span>
                  <span className="text-xs font-normal text-slate-500">Alerts</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] text-slate-500 gap-2">
              <span className="text-amber-700 font-medium">{summary.bankMismatchesCaught} Bank Mismatches</span>
              <span>•</span>
              <span className="text-blue-700 font-medium">{summary.duplicatesCaught} Duplicates</span>
            </div>
          </CardContent>
        </Card>

        {/* Cleared for Payment */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Disbursed & Settled
                </span>
                <div className="text-2xl font-bold text-emerald-700">
                  {summary.paid} Invoices
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] text-slate-500 gap-1.5">
              <span className="font-semibold text-emerald-700">{summary.approved} Approved</span>
              <span>ready for batch pay</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoiced Spending & Volume Trends (2 Cols) */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Monthly Invoicing Volume & Exposure Trend
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Historical intake versus flagged invoices over trailing 6 months
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono font-normal">
                Rolling 180 Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e40af" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1e40af" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name === 'spend' ? `₹${Number(val).toLocaleString()}` : val,
                      name === 'spend' ? 'Spend Volume' : 'Invoices Flagged',
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#1e40af" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" name="spend" />
                  <Bar dataKey="flagged" fill="#dc2626" radius={[4, 4, 0, 0]} name="flagged" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Donut (1 Col) */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Risk Tier Composition
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Classification of active invoices by 0–100 score
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.riskDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 pt-2">
              {analytics.riskDistribution.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.value} Invoices</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts: Fraud Category Breakdown & Top Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Category Frequency */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Triggered Fraud Safeguards by Category
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Frequency of rule interceptions across all 8 detection modules
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.alertsByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#334155' }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Spend Breakdown */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Supplier Spend & Risk Profile
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Cumulative disbursements per verified vendor record
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {analytics.vendorSpend.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Building2 className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-medium text-slate-600">No vendor spend recorded yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Disbursements to suppliers will populate here.</p>
                </div>
              ) : (
                analytics.vendorSpend.map((v, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-900">{v.vendorName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">{formatCurrency(v.totalSpend)}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold uppercase ${
                          v.riskTier === 'high'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : v.riskTier === 'medium'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {v.riskTier} risk
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Flagged Invoices Table */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Active Invoices Requiring Investigation
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Invoices placed on hold or awaiting secondary review
            </CardDescription>
          </div>
          <Link href="/app/invoices">
            <Button variant="ghost" size="sm" className="text-xs text-blue-700 hover:text-blue-800 gap-1">
              View All Invoices <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice Number</th>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Risk Assessment</th>
                  <th className="py-2.5 px-3">Workflow Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <ReceiptText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 text-xs">No Flagged Invoices</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Uploaded invoices requiring secondary review or placed on hold will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {inv.vendor?.name || 'Unregistered Vendor'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{inv.invoice_date}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            inv.risk_score >= 60
                              ? 'text-red-600'
                              : inv.risk_score >= 30
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {inv.risk_score}/100
                        </span>
                        {inv.has_hard_stop && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5 py-0">
                            Hard Hold
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold uppercase ${
                          inv.workflow_status === 'on_hold'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : inv.workflow_status === 'pending_review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : inv.workflow_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {inv.workflow_status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Link href={`/app/invoices/${inv.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-xs">
                          Inspect
                        </Button>
                      </Link>
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

