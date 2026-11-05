'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 py-4 px-6 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
            <span>Invoice<span className="text-blue-700">Guard</span></span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contact Enterprise Sales & Support</h1>
          <p className="mt-3 text-sm text-slate-600">
            Have questions regarding our invoice fraud detection platform, ERP integration readiness, or custom approval policies? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Direct Email</h3>
                <p className="text-xs text-slate-500 mt-1">Our finance security team responds within 24 hours.</p>
                <a href="mailto:support@invoiceguard.io" className="text-sm font-medium text-blue-700 hover:underline block mt-3">
                  support@invoiceguard.io
                </a>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Enterprise Desk</h3>
                <p className="text-xs text-slate-500 mt-1">Monday – Friday from 9am to 6pm IST.</p>
                <span className="text-sm font-medium text-slate-900 block mt-3">
                  +91 (080) 4567-8900
                </span>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Headquarters</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  InvoiceGuard Technology Labs<br />
                  Level 14, Prestige Tech Park IV<br />
                  Outer Ring Road, Bengaluru 560103
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-8">
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Inquiry Received</h3>
                    <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                      Thank you for contacting InvoiceGuard. An enterprise solutions specialist will follow up with your finance department shortly.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" required placeholder="Marcus Vance" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Work Email</Label>
                        <Input id="email" type="email" required placeholder="m.vance@company.com" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="company">Company / Organization</Label>
                        <Input id="company" required placeholder="Acme Global Industries" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="volume">Monthly Invoice Volume</Label>
                        <Input id="volume" placeholder="e.g. 500 – 2,000 invoices/mo" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message">How can our fraud prevention team help you?</Label>
                      <Textarea id="message" rows={5} required placeholder="Tell us about your current AP workflow or specific fraud risks..." />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium">
                      {loading ? 'Submitting...' : 'Send Message'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

