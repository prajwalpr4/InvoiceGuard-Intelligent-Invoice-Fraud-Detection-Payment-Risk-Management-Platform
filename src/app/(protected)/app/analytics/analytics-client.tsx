'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingDown, ShieldAlert, Building2 } from 'lucide-react';

interface AnalyticsClientProps {
  analytics: {
    monthlyData: Array<{ month: string; count: number; spend: number; flagged: number }>;
    riskDistribution: Array<{ name: string; value: number; color: string }>;
    alertsByCategory: Array<{ category: string; count: number }>;
    vendorSpend: Array<{ vendorName: string; totalSpend: number; riskTier: string }>;
  };
  summary: any;
}

export function AnalyticsClient({ analytics, summary }: AnalyticsClientProps) {
  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const deptDiscrepancies = summary?.totalInvoices > 0 ? [
    { department: 'Operations', flags: summary?.highRisk || 0, spend: summary?.totalValue || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fraud Risk & Procurement Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deep-dive financial metrics, department discrepancy rates, and historical anomaly distributions.
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Departmental Discrepancy & Alert Frequency
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Number of fraud rule triggers per organizational operating unit
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-60 w-full flex items-center justify-center">
              {deptDiscrepancies.length === 0 ? (
                <div className="text-center text-slate-400 text-xs">
                  <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-600">No Department Telemetry Available</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Ingest invoices to visualize departmental risk profiles.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptDiscrepancies} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="flags" fill="#1e40af" radius={[4, 4, 0, 0]} name="Rule Alerts" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Triggered Safeguards Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Incidence count across all active fraud detectors
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-60 w-full flex items-center justify-center">
              {summary?.totalInvoices === 0 ? (
                <div className="text-center text-slate-400 text-xs">
                  <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-600">No Safeguard Incidents Triggered</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rules will record triggers as invoices are scanned.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.alertsByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#334155' }} width={120} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="count" fill="#dc2626" radius={[0, 4, 4, 0]} name="Trigger Count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

