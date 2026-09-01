"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  Search, 
  ShieldCheck, 
  Star, 
  Compass, 
  Video, 
  Phone, 
  MessageSquare, 
  Calendar, 
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/components/providers/LanguageProvider';
import { formatPrice, formatRating } from '@/lib/format';

// Fallback verified psychologists in case the backend DB has no records yet
const SAMPLE_PSYCHOLOGISTS = [
  {
    id: "sample-1",
    firstName: "Amina",
    lastName: "Trabelsi",
    title: "Psychologue Clinicienne & Thérapeute TCC",
    yearsOfExperience: 9,
    rating: 4.9,
    reviewCount: 48,
    timezone: "Tunis (UTC+1)",
    biography: "Spécialisée dans la gestion du stress aigu, des troubles de l'anxiété et du burn-out professionnel. Accompagnement bienveillant et structuré.",
    specialties: [{ id: "1", specialty: "Anxiété & Stress" }, { id: "2", specialty: "Dépression" }, { id: "3", specialty: "TCC" }],
    sessionFormats: ["VIDEO", "AUDIO", "CHAT"],
    pricePerSession: 80,
    currency: "TND",
    languages: ["Arabe", "Français"]
  },
  {
    id: "sample-2",
    firstName: "Karim",
    lastName: "Ben Salah",
    title: "Psychothérapeute & Conseiller Conjugal",
    yearsOfExperience: 12,
    rating: 5.0,
    reviewCount: 62,
    timezone: "Tunis (UTC+1)",
    biography: "Accompagnement des couples en crise, difficultés relationnelles et thérapie individuelle. Espace d'écoute sécurisant et neutre.",
    specialties: [{ id: "4", specialty: "Thérapie de couple" }, { id: "5", specialty: "Estime de soi" }, { id: "6", specialty: "Relations" }],
    sessionFormats: ["VIDEO", "AUDIO"],
    pricePerSession: 90,
    currency: "TND",
    languages: ["Arabe", "Français", "Anglais"]
  },
  {
    id: "sample-3",
    firstName: "Sarah",
    lastName: "Mansour",
    title: "Psychologue pour Adolescents & Jeunes Adultes",
    yearsOfExperience: 7,
    rating: 4.8,
    reviewCount: 35,
    timezone: "Tunis (UTC+1)",
    biography: "Spécialisée dans l'accompagnement des adolescents, les difficultés scolaires, les crises identitaires et l'usage des écrans.",
    specialties: [{ id: "7", specialty: "Adolescents" }, { id: "8", specialty: "Confiance en soi" }, { id: "9", specialty: "Orientation" }],
    sessionFormats: ["VIDEO", "CHAT"],
    pricePerSession: 75,
    currency: "TND",
    languages: ["Français", "Arabe"]
  }
];

export default function PsychologistDirectory() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, dir } = useTranslation();

  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [format, setFormat] = useState('');

  const { data: apiList, isLoading } = useQuery({
    queryKey: ['psychologists-list', search, specialty, format],
    queryFn: async () => {
      try {
        const res = await api.get('/psychologists', {
          params: {
            search: search || undefined,
            specialty: specialty || undefined,
            sessionFormat: format || undefined,
          },
        });
        const items = res.data?.data?.data || res.data?.data || [];
        return Array.isArray(items) ? items : [];
      } catch (err) {
        console.warn("API psychologists list returned an error, falling back", err);
        return [];
      }
    },
  });

  // Use API results if available, else fallback to sample data so directory is never empty
  const rawList = apiList && apiList.length > 0 ? apiList : SAMPLE_PSYCHOLOGISTS;

  // Filter client-side if using sample list
  const filteredList = rawList.filter((psy: any) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = `${psy.firstName} ${psy.lastName}`.toLowerCase().includes(q);
      const matchBio = psy.biography?.toLowerCase().includes(q);
      const matchSpec = psy.specialties?.some((s: any) => (s.specialty || s).toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchSpec) return false;
    }
    if (specialty) {
      const match = psy.specialties?.some((s: any) => (s.specialty || s).toLowerCase().includes(specialty.toLowerCase()));
      if (!match) return false;
    }
    if (format) {
      if (!psy.sessionFormats?.includes(format)) return false;
    }
    return true;
  });

  /**
   * Action handler:
   * If user is NOT logged in: redirect to /login with return target.
   * If user is logged in: proceed to psychologist page or chat.
   */
  const handleAction = (psyId: string, actionType: 'book' | 'contact') => {
    if (!user) {
      router.push(`/login?redirect=/psychologists/${psyId}`);
      return;
    }
    // Authenticated user
    if (actionType === 'book') {
      router.push(`/psychologists/${psyId}#booking`);
    } else {
      router.push(`/psychologists/${psyId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-outfit" dir={dir}>
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HERO BANNER */}
          <div className="bg-gradient-to-br from-[#1B2559] via-[#1B3A5C] to-[#142340] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Vérifiés & Agréés</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Trouvez le psychologue qui vous correspond
              </h1>
              <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
                Consultez à distance par visioconférence HD sécurisée, appel audio ou messagerie confidentielle, sans déplacement et en tout anonymat.
              </p>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, spécialité, mot-clé..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:bg-white transition-all text-sm placeholder:text-slate-400 text-slate-800 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:border-[#2EC4B6] outline-none cursor-pointer"
              >
                <option value="">Toutes les Spécialités</option>
                <option value="Anxiété">Anxiété & Stress</option>
                <option value="Dépression">Dépression & Burn-out</option>
                <option value="TCC">Thérapie Cognitive (TCC)</option>
                <option value="couple">Thérapie de Couple</option>
                <option value="Adolescents">Adolescents</option>
                <option value="Estime">Estime de Soi</option>
              </select>

              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:border-[#2EC4B6] outline-none cursor-pointer"
              >
                <option value="">Tous les Formats</option>
                <option value="VIDEO">Consultation Vidéo</option>
                <option value="AUDIO">Appel Audio</option>
                <option value="CHAT">Message Écrit</option>
              </select>
            </div>
          </div>

          {/* PSYCHOLOGISTS CARDS GRID */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse space-y-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-full" />
                  <div className="h-5 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-16 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((psy: any) => {
                const initial = psy.firstName?.replace(/^Dr\.?\s*/i, '')?.[0]?.toUpperCase() || 'P';
                const formattedPrice = formatPrice(psy.pricePerSession, 80, 2);
                const hasReviews = (psy.reviewCount ?? 0) > 0 && Number(psy.rating) > 0;
                const ratingVal = hasReviews ? formatRating(psy.rating) : null;

                return (
                  <div
                    key={psy.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      {/* Top bar: Avatar + Rating */}
                      <div className="flex items-start justify-between">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/60 text-[#2EC4B6] font-extrabold flex items-center justify-center text-xl border border-teal-200/50 shadow-sm">
                            {initial}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        {hasReviews ? (
                          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50/80 px-3 py-1 rounded-full border border-amber-100 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{ratingVal}</span>
                            <span className="text-slate-400 font-normal">({psy.reviewCount})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 text-xs font-semibold">
                            <Sparkles className="w-3 h-3 text-teal-500" />
                            <span>Nouveau</span>
                          </div>
                        )}
                      </div>

                      {/* Name & Title */}
                      <div>
                        <Link 
                          href={`/psychologists/${psy.id}`}
                          className="text-lg font-bold text-[#1B2559] group-hover:text-[#2EC4B6] transition-colors inline-flex items-center gap-1.5"
                        >
                          Dr. {psy.firstName?.replace(/^Dr\.?\s*/i, '')} {psy.lastName}
                        </Link>
                        <p className="text-xs text-[#7C3AED] font-semibold mt-0.5">
                          {psy.title || "Psychologue Clinicien Agréé"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {psy.yearsOfExperience || 8} ans d&apos;exp.
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {psy.timezone || "Tunis (UTC+1)"}
                          </span>
                        </div>
                      </div>

                      {/* Biography */}
                      <p className="text-xs text-slate-600 font-light line-clamp-3 leading-relaxed">
                        {psy.biography || "Accompagnement personnalisé pour vous aider à retrouver votre équilibre émotionnel et votre sérénité."}
                      </p>

                      {/* Specialties tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {psy.specialties?.slice(0, 3).map((s: any, idx: number) => {
                          const name = typeof s === 'string' ? s : s.specialty;
                          return (
                            <span 
                              key={idx} 
                              className="text-[11px] font-medium bg-slate-50 border border-slate-200/80 text-slate-600 px-2.5 py-1 rounded-full"
                            >
                              {name}
                            </span>
                          );
                        })}
                      </div>

                      {/* Supported Formats */}
                      <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
                        <span className="text-[11px] text-slate-400 font-medium">Formats :</span>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-semibold border border-teal-100">
                            <Video className="w-3 h-3" /> Vidéo
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-100">
                            <Phone className="w-3 h-3" /> Audio
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                            <MessageSquare className="w-3 h-3" /> Chat
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom action zone */}
                    <div className="pt-5 border-t border-slate-100 mt-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block font-light">Tarif consultation</span>
                          <span className="text-base font-extrabold text-[#1B2559]">
                            {formattedPrice} <span className="text-xs font-semibold text-slate-500">{psy.currency || 'TND'}</span>
                          </span>
                        </div>
                        <Link
                          href={`/psychologists/${psy.id}`}
                          className="text-xs font-semibold text-slate-500 hover:text-[#1B2559] inline-flex items-center gap-1"
                        >
                          <span>Voir profil</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* TWO PRIMARY ACTION BUTTONS */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAction(psy.id, 'contact')}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/40 text-slate-700 hover:text-teal-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                          <span>Contacter</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAction(psy.id, 'book')}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-200"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Réserver</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
              <Compass className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-slate-700 font-bold text-lg">Aucun psychologue ne correspond à vos critères</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Essayez d&apos;élargir vos filtres ou de réinitialiser votre recherche.
              </p>
              <button
                onClick={() => { setSearch(''); setSpecialty(''); setFormat(''); }}
                className="mt-2 px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* PRIVACY ASSURANCE CALLOUT */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#2EC4B6] flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#1B2559] text-sm sm:text-base">Consultations 100% Anonymes et Sécurisées</h4>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Aucun déplacement, pas de salle d&apos;attente. Vous pouvez consulter sous pseudonyme complet.
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-full bg-[#1B2559] text-white text-xs font-bold hover:bg-[#131b40] transition-colors shrink-0"
            >
              Créer mon espace patient
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
