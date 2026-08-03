"use client";

import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Search, Filter, ShieldCheck, Heart, Star, Compass, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

export default function PsychologistDirectory() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [format, setFormat] = useState('');

  const { data: list, isLoading, error } = useQuery({
    queryKey: ['psychologists-list', search, specialty, format],
    queryFn: async () => {
      const res = await api.get('/psychologists', {
        params: {
          search: search || undefined,
          specialty: specialty || undefined,
          sessionFormat: format || undefined,
        },
      });
      return res.data?.data?.data || [];
    },
  });

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-6xl">
        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-bold text-[#1B2559] tracking-tight">Nos Spécialistes</h2>
          <p className="text-slate-500 text-sm font-light mt-1.5">Des psychothérapeutes certifiés, qualifiés et vérifiés pour vous accompagner.</p>
        </div>

        {/* FILTERS AND SEARCH BOX */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un psychologue par nom, biographie, spécialité..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] transition-all text-sm placeholder:text-slate-400 text-slate-800 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:border-[#2EC4B6] outline-none w-full md:w-auto"
            >
              <option value="">Toutes les Spécialités</option>
              <option value="Anxiety">Anxiété</option>
              <option value="Depression">Dépression</option>
              <option value="Cognitive Behavioral Therapy">TCC</option>
            </select>

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:border-[#2EC4B6] outline-none w-full md:w-auto"
            >
              <option value="">Tous les Formats</option>
              <option value="VIDEO">Consultation Vidéo</option>
              <option value="AUDIO">Appel Audio</option>
              <option value="CHAT">Message Écrit</option>
            </select>
          </div>
        </div>

        {/* CARDS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : list && list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((psy: any) => (
              <div 
                key={psy.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-full bg-teal-50 text-[#2EC4B6] font-bold flex items-center justify-center border border-teal-100">
                      {psy.firstName?.replace(/^Dr\.?\s*/i, '')?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {(() => {
                        if (!psy.rating) return '5.0';
                        const val = typeof psy.rating === 'object' 
                          ? (typeof psy.rating.toNumber === 'function' ? psy.rating.toNumber() : parseFloat(psy.rating.toString()))
                          : parseFloat(psy.rating);
                        return isNaN(val) ? '5.0' : val.toFixed(1);
                      })()}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1B2559] group-hover:text-[#2EC4B6] transition-colors flex items-center gap-1.5">
                      Dr. {psy.firstName?.replace(/^Dr\.?\s*/i, '')} {psy.lastName}
                      <ShieldCheck className="w-4 h-4 text-[#2EC4B6]" />
                    </h3>
                    <p className="text-xs text-slate-400 font-light mt-1">{psy.yearsOfExperience || 0} ans d&apos;expérience</p>
                  </div>

                  <p className="text-xs text-slate-500 font-light line-clamp-3 leading-relaxed">
                    {psy.biography || 'Aucune biographie disponible pour le moment.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {psy.specialties?.slice(0, 2).map((s: any) => (
                      <span key={s.id} className="text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        {s.specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                  <div className="text-sm font-bold text-[#1B2559]">
                    {(() => {
                      const raw = psy.pricePerSession;
                      if (raw === null || raw === undefined) return <span className="text-slate-400 font-normal text-xs">Tarif non défini</span>;
                      let val: number;
                      if (typeof raw === 'object') {
                        val = typeof raw.toNumber === 'function' ? raw.toNumber() : parseFloat(String(raw));
                      } else {
                        val = parseFloat(String(raw));
                      }
                      if (isNaN(val)) return <span className="text-slate-400 font-normal text-xs">Tarif non défini</span>;
                      return <>{val.toFixed(2)} <span className="text-[10px] text-slate-400 font-light">{psy.currency || 'TND'} / session</span></>;
                    })()}
                  </div>
                  <Link
                    href={`/psychologists/${psy.id}`}
                    className="px-4 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md shadow-purple-100 hover:shadow-purple-200 transition-all"
                  >
                    Voir le Profil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h4 className="text-slate-700 font-bold text-lg">Aucun spécialiste trouvé</h4>
            <p className="text-slate-400 text-sm font-light mt-1">Essayez d&apos;ajuster vos filtres de recherche.</p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
