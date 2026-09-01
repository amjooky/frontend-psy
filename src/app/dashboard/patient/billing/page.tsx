"use client";

import SidebarLayout from '@/components/layout/SidebarLayout';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, FileText, Loader } from 'lucide-react';

export default function PatientBillingPage() {
  const queryClient = useQueryClient();
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['patient-invoices'],
    queryFn: async () => {
      const res = await api.get('/payments/invoices');
      return res.data?.data || res.data || [];
    },
  });

  const generatePdf = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await api.get(`/payments/invoices/${invoiceId}/pdf`);
      return res.data?.data || res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient-invoices'] }),
  });

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-5xl font-outfit">
        <p className="text-sm text-slate-500">Retrouvez vos factures et telechargez leur version PDF.</p>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[240px]">
            <Loader className="w-8 h-8 animate-spin text-[#2EC4B6]" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-[#1B2559]">Aucune facture disponible</h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice: any) => (
              <div key={invoice.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-bold text-[#1B2559]">{invoice.invoiceNumber}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Dr. {invoice.appointment?.psychologist?.firstName} {invoice.appointment?.psychologist?.lastName}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Emise le {new Date(invoice.issuedAt).toLocaleDateString()} · {Number(invoice.total).toFixed(2)} {invoice.currency}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const result = await generatePdf.mutateAsync(invoice.id);
                          const rawUrl = result?.url || result;
                          if (rawUrl) {
                            const finalUrl =
                              typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
                                ? String(rawUrl).replace(/http:\/\/localhost:\d+/, 'https://backend-psy-upv7.onrender.com')
                                : String(rawUrl);
                            window.open(finalUrl, '_blank');
                          }
                        } catch (e) {
                          console.error('Invoice fetch error:', e);
                        }
                      }}
                      disabled={generatePdf.isPending}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#2EC4B6] hover:bg-[#25aa9d] px-4 py-2 text-sm font-semibold text-white shadow-xs disabled:opacity-60 transition-all"
                    >
                      {generatePdf.isPending ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                      <span>Ouvrir / Télécharger le PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
