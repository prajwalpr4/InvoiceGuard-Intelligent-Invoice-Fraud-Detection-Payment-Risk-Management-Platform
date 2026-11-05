'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ReceiptText,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Invoice, Vendor } from '@/types/database';

interface InvoicesClientProps {
  initialInvoices: Invoice[];
  vendors: Vendor[];
}

export function InvoicesClient({ initialInvoices, vendors }: InvoicesClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');

  const filteredInvoices = initialInvoices.filter((inv) => {
    if (search) {
      const q = search.toLowerCase();
      const matchesNum = inv.invoice_number.toLowerCase().includes(q);
      const matchesVendor = inv.vendor?.name.toLowerCase().includes(q);
      const matchesDept = inv.department?.toLowerCase().includes(q);
      if (!matchesNum && !matchesVendor && !matchesDept) return false;
    }

    if (statusFilter !== 'all' && inv.workflow_status !== statusFilter) {
      return false;
    }

    if (riskFilter !== 'all' && inv.risk_level !== riskFilter) {
      return false;
    }

    if (vendorFilter !== 'all' && inv.vendor_id !== vendorFilter) {
      return false;
    }

    return true;
  });

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoice Registry & Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete inventory of ingested supplier invoices, extraction confidence, and fraud assessments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/invoices/new">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 shadow-sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Upload New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <Input
                placeholder="Search invoice #, vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Workflow Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workflow Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="on_hold">On Hold (Hard Stop)</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="ready_for_payment">Ready for Payment</SelectItem>
                <SelectItem value="paid">Settled / Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Risk Filter */}
            <Select value={riskFilter} onValueChange={(val) => setRiskFilter(val || 'all')}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk (0–29)</SelectItem>
                <SelectItem value="medium">Medium Risk (30–59)</SelectItem>
                <SelectItem value="high">High Risk (60–100)</SelectItem>
              </SelectContent>
            </Select>

            {/* Vendor Filter */}
            <Select value={vendorFilter} onValueChange={(val) => setVendorFilter(val || 'all')}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">PO Reference</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No invoices found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 font-mono">
                        <Link href={`/app/invoices/${inv.id}`} className="hover:text-blue-700 underline decoration-slate-300">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {inv.vendor?.name || 'Unregistered Vendor'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {inv.purchase_order?.po_number || inv.po_id || 'No PO'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {inv.invoice_date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
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
                          {inv.has_hard_stop ? (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1 py-0">
                              Hard Hold
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-slate-400 capitalize">({inv.risk_level})</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold uppercase ${
                            inv.workflow_status === 'on_hold'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : inv.workflow_status === 'pending_review'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : inv.workflow_status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : inv.workflow_status === 'ready_for_payment'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {inv.workflow_status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link href={`/app/invoices/${inv.id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-xs">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
