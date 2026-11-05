'use client';

import { useState } from 'react';
import {
  ScrollText,
  Search,
  Download,
  Filter,
  ShieldCheck,
  Calendar,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuditLog } from '@/types/database';

interface AuditLogsClientProps {
  initialLogs: AuditLog[];
}

export function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState('');

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      log.entity_id.toLowerCase().includes(q) ||
      log.reason?.toLowerCase().includes(q) ||
      log.user_email?.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User Email', 'Audit Reason'];
    const rows = filtered.map((l) => [
      l.created_at,
      l.action,
      l.entity_type,
      l.entity_id,
      l.user_email || 'system',
      `"${(l.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InvoiceGuard_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Immutable Compliance Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-resistant append-only ledger recording all state transitions, user approvals, overrides, and payment records.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          className="text-xs h-9 border-slate-200 gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Export Audit Trail (CSV)
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search action, entity ID, user email, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Audit Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                      <ScrollText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-900">No Audit Events Logged</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">All actions and status transitions will be captured here in real-time.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {log.created_at}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono border-slate-200">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-sans font-semibold text-slate-900 capitalize">{log.entity_type}</span>{' '}
                      <span className="text-slate-400 text-[11px]">({log.entity_id})</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">
                      {log.user_email || 'system'}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 max-w-md">
                      {log.reason || 'Standard operational transition'}
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

