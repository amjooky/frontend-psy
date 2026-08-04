"use client";

import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader, MessageSquareQuote, Star } from 'lucide-react';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await api.get('/reviews/admin', { params: { page: 1, limit: 200 } });
      return res.data?.data || res.data;
    },
  });

  const reviews = data?.data || data || [];

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      api.patch(`/reviews/admin/${id}/visibility`, { isVisible }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-6xl font-outfit">
        <p className="text-sm text-slate-500">Moderation des avis patients et controle de leur visibilite publique.</p>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-[#1B2559]" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <MessageSquareQuote className="mx-auto mb-4 w-10 h-10 text-slate-300" />
            <h3 className="font-bold text-[#1B2559]">Aucun avis a moderer</h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-[#1B2559]">
                        {review.isAnonymous ? review.patient?.anonymousName || 'Anonyme' : `${review.patient?.firstName || ''} ${review.patient?.lastName || ''}`}
                      </h3>
                      <span className="text-sm text-slate-500">
                        pour Dr. {review.psychologist?.firstName} {review.psychologist?.lastName}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${review.isVisible ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {review.isVisible ? 'Visible' : 'Masque'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{review.comment || 'Aucun commentaire fourni.'}</p>
                  </div>

                  <button
                    onClick={() => toggleVisibility.mutate({ id: review.id, isVisible: !review.isVisible })}
                    disabled={toggleVisibility.isPending}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {review.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {review.isVisible ? 'Masquer' : 'Rendre visible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
