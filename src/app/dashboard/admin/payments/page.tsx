"use client";

import React from 'react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DollarSign, X, AlertCircle, Download, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/format';

function safeDecimal(val: any, fallback = '80.00'): string {
  return formatPrice(val, parseFloat(fallback) || 80, 2);
}

export default function AdminPayments() {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      const res = await api.get('/payments/admin/all-invoices');
      return res.data?.data || res.data || [];
    },
  });

  const refundMutation = useMutation({
    mutationFn: async (invoice: any) => {
      return api.post('/payments/refund', {
        paymentId: invoice.paymentId,
        amount: Number(invoice.total),
        reason: 'Admin refund requested from billing console.',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      alert('Payment refunded successfully');
    },
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-5xl font-outfit">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <p className="text-sm text-slate-500 font-medium">Monitor platform billing transactions, invoices, and process refunds.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-20 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60" />
            ))}
          </div>
        ) : invoices.length > 0 ? (
          <div className="grid gap-4">
            {invoices.map((inv: any) => (
              <div
                key={inv.id}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1B2559] text-base">{inv.invoiceNumber}</h4>
                    <div className="text-xs text-slate-500 mt-2 font-medium flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span>Patient: <strong className="text-slate-700">{inv.patient?.isAnonymous ? inv.patient?.anonymousName || 'Anonymous' : `${inv.patient?.firstName || ''} ${inv.patient?.lastName || ''}`}</strong></span>
                      <span className="hidden sm:inline text-slate-300">·</span>
                      <span>Montant: <strong className="text-[#1B2559]">{safeDecimal(inv.total, '80')} {inv.currency}</strong></span>
                      <span className="hidden sm:inline text-slate-300">·</span>
                      <span>Praticien: Dr. {inv.appointment?.psychologist?.firstName} {inv.appointment?.psychologist?.lastName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${
                    inv.payment?.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    'bg-slate-50 border border-slate-200 text-slate-500'
                  }`}>
                    {inv.payment?.status || 'PENDING'}
                  </span>

                  {inv.pdfUrl && (
                    <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 text-slate-700 hover:bg-slate-50">
                      <ExternalLink className="w-4 h-4" />
                      PDF
                    </a>
                  )}

                  <button
                    onClick={async () => {
                      const res = await api.get(`/payments/invoices/${inv.id}/pdf`);
                      const url = res.data?.data?.url || res.data?.url;
                      if (url) window.open(url, '_blank');
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="w-4 h-4" />
                    Generate
                  </button>

                  {inv.payment?.status === 'COMPLETED' && (
                    <button
                      onClick={() => refundMutation.mutate(inv)}
                      disabled={refundMutation.isPending}
                      className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h4 className="text-[#1B2559] font-bold text-sm">No Transactions Found</h4>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
