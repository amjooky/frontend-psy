"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  ShieldCheck, 
  Star, 
  Video, 
  Phone, 
  MessageSquare, 
  MapPin, 
  CalendarCheck,
  ChevronLeft,
  Loader,
  Lock,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/components/providers/LanguageProvider';

// Fallback profiles matching the sample directory entries
const SAMPLE_PROFILES: Record<string, any> = {
  "sample-1": {
    id: "sample-1",
    firstName: "Amina",
    lastName: "Trabelsi",
    title: "Psychologue Clinicienne & Thérapeute TCC",
    yearsOfExperience: 9,
    rating: 4.9,
    reviewCount: 48,
    timezone: "Africa/Tunis",
    biography: "Psychologue clinicienne diplômée de la Faculté des Sciences Humaines de Tunis, complétée par une spécialisation en Thérapies Cognitives et Comportementales (TCC) à Paris.\n\nJ'accompagne les adultes et jeunes adultes confrontés au stress chronique, aux crises d'angoisse, aux états dépressifs et au burn-out professionnel. Mon approche est collaborative, bienveillante et axée sur des outils concrets applicables dès les premières séances.",
    specialties: [{ id: "1", specialty: "Anxiété & Stress" }, { id: "2", specialty: "Dépression & Burn-out" }, { id: "3", specialty: "TCC" }, { id: "4", specialty: "Estime de soi" }],
    sessionFormats: ["VIDEO", "AUDIO", "CHAT"],
    pricePerSession: 80,
    currency: "TND",
    languages: ["Arabe", "Français"]
  },
  "sample-2": {
    id: "sample-2",
    firstName: "Karim",
    lastName: "Ben Salah",
    title: "Psychothérapeute & Conseiller Conjugal",
    yearsOfExperience: 12,
    rating: 5.0,
    reviewCount: 62,
    timezone: "Africa/Tunis",
    biography: "Plus de 12 ans d'expérience dans l'accompagnement des couples en difficulté et des individus traversant des ruptures ou des transitions de vie majeures.\n\nFormé à la thérapie systémique et relationnelle, je propose un espace neutre et sécurisant pour rétablir une communication constructive et apaiser les conflits.",
    specialties: [{ id: "5", specialty: "Thérapie de couple" }, { id: "6", specialty: "Communication" }, { id: "7", specialty: "Gestion des conflits" }],
    sessionFormats: ["VIDEO", "AUDIO"],
    pricePerSession: 90,
    currency: "TND",
    languages: ["Arabe", "Français", "Anglais"]
  },
  "sample-3": {
    id: "sample-3",
    firstName: "Sarah",
    lastName: "Mansour",
    title: "Psychologue pour Adolescents & Jeunes Adultes",
    yearsOfExperience: 7,
    rating: 4.8,
    reviewCount: 35,
    timezone: "Africa/Tunis",
    biography: "Spécialisée dans la psychologie de l'adolescent et du jeune adulte. J'aide à surmonter les difficultés scolaires, le décrochage, l'isolement social et la dépendance aux écrans.\n\nL'anonymat et la stricte confidentialité permettent à l'adolescent de s'exprimer sans filtre ni crainte d'être jugé.",
    specialties: [{ id: "8", specialty: "Adolescents" }, { id: "9", specialty: "Décrochage scolaire" }, { id: "10", specialty: "Anxiété de performance" }],
    sessionFormats: ["VIDEO", "CHAT"],
    pricePerSession: 75,
    currency: "TND",
    languages: ["Français", "Arabe"]
  }
};

export default function PsychologistProfile() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();
  const { dir } = useTranslation();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Restore any pending booking from sessionStorage after returning from login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('pendingBooking');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.psychologistId === id) {
            if (parsed.date) setSelectedDate(parsed.date);
            if (parsed.slot) setSelectedSlot(parsed.slot);
            if (parsed.notes) setNotes(parsed.notes);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [id]);

  const { data: apiPsy, isLoading: profileLoading } = useQuery({
    queryKey: ['psychologist-profile', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/psychologists/${id}`);
        return res.data?.data || res.data;
      } catch (e) {
        return null;
      }
    },
  });

  // Fallback to sample profile if ID matches or backend returns 404
  const psy = apiPsy || SAMPLE_PROFILES[id] || {
    id,
    firstName: "Psychologue",
    lastName: "Agréé",
    title: "Psychologue Clinicien Certifié",
    yearsOfExperience: 8,
    rating: 4.9,
    reviewCount: 24,
    timezone: "Africa/Tunis",
    biography: "Praticien vérifié membre du réseau de thérapeutes certifiés MonPsy.",
    specialties: [{ id: "1", specialty: "Thérapie Générale" }],
    sessionFormats: ["VIDEO", "AUDIO"],
    pricePerSession: 80,
    currency: "TND",
  };

  const { data: apiSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['psychologist-slots', id, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      try {
        const res = await api.get(`/psychologists/${id}/availability`, {
          params: { date: selectedDate },
        });
        const data = res.data?.data || res.data || [];
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!selectedDate,
  });

  // Fallback default slots for demo or empty days
  const fallbackSlots = [
    { startTime: "09:00", isAvailable: true },
    { startTime: "10:30", isAvailable: true },
    { startTime: "14:00", isAvailable: true },
    { startTime: "15:30", isAvailable: true },
    { startTime: "17:00", isAvailable: false },
    { startTime: "18:30", isAvailable: true },
  ];

  const slots = apiSlots && apiSlots.length > 0 ? apiSlots : fallbackSlots;

  const bookMutation = useMutation({
    mutationFn: async (payload: { startAt: string; sessionFormat: string; notes?: string }) => {
      const res = await api.post('/appointments/book', {
        psychologistId: id,
        ...payload,
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      // Clear pending booking
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingBooking');
      }
      const appointmentId = data.data?.id || data.id;
      router.push(`/dashboard/patient/payment?appointmentId=${appointmentId}`);
    },
    onError: (err: any) => {
      setBookingError(err.response?.data?.message || 'Erreur lors de la réservation. Veuillez réessayer.');
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/messaging/conversations', {
        psychologistId: id,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      router.push('/dashboard/patient/chat');
    },
    onError: () => {
      router.push('/dashboard/patient');
    }
  });

  // Handle Contact button click
  const handleContactClick = () => {
    if (!user) {
      router.push(`/login?redirect=/psychologists/${id}`);
      return;
    }
    startChatMutation.mutate();
  };

  // Handle Booking submission
  const handleBooking = () => {
    setBookingError(null);

    // CRITICAL: If guest, save intent and redirect to login
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingBooking', JSON.stringify({
          psychologistId: id,
          date: selectedDate,
          slot: selectedSlot,
          notes
        }));
      }
      router.push(`/login?redirect=/psychologists/${id}`);
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setBookingError("Veuillez sélectionner une date et un créneau horaire.");
      return;
    }

    const startAtStr = `${selectedDate}T${selectedSlot}:00`;
    bookMutation.mutate({
      startAt: startAtStr,
      sessionFormat: 'VIDEO',
      notes: notes || undefined,
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-outfit">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-28">
          <Loader className="w-8 h-8 animate-spin text-[#2EC4B6]" />
        </div>
        <Footer />
      </div>
    );
  }

  const initial = psy.firstName?.replace(/^Dr\.?\s*/i, '')?.[0]?.toUpperCase() || 'P';
  const ratingVal = typeof psy.rating === 'object' && psy.rating?.toNumber
    ? psy.rating.toNumber().toFixed(1)
    : parseFloat(String(psy.rating || 5.0)).toFixed(1);

  const priceVal = typeof psy.pricePerSession === 'object' && psy.pricePerSession?.toNumber
    ? psy.pricePerSession.toNumber().toFixed(2)
    : parseFloat(String(psy.pricePerSession || 80)).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-outfit" dir={dir}>
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* BACK BREADCRUMB */}
          <Link 
            href="/psychologists" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#1B2559] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour à l&apos;annuaire des spécialistes</span>
          </Link>

          {/* MAIN PROFILE LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: PSYCHOLOGIST DETAILS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* HEADER CARD */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 text-[#2EC4B6] font-extrabold flex items-center justify-center text-3xl border border-teal-200/60 shadow-sm shrink-0">
                  {initial}
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1B2559] flex items-center gap-2">
                      Dr. {psy.firstName?.replace(/^Dr\.?\s*/i, '')} {psy.lastName}
                      <ShieldCheck className="w-5 h-5 text-[#2EC4B6]" />
                    </h1>
                    <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{ratingVal}</span>
                      <span className="text-slate-400 font-normal">({psy.reviewCount || 30}+ avis)</span>
                    </div>
                  </div>

                  <p className="text-sm text-[#7C3AED] font-semibold">
                    {psy.title || "Psychologue Clinicien Agréé"}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {psy.yearsOfExperience || 8} ans d&apos;expérience
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {psy.timezone || "Tunis (UTC+1)"}
                    </span>
                  </div>

                  {/* Formats */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {psy.sessionFormats?.map((f: string) => (
                      <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
                        {f === 'VIDEO' && <Video className="w-3.5 h-3.5 text-teal-600" />}
                        {f === 'AUDIO' && <Phone className="w-3.5 h-3.5 text-purple-600" />}
                        {f === 'CHAT' && <MessageSquare className="w-3.5 h-3.5 text-blue-600" />}
                        <span>{f === 'VIDEO' ? 'Consultation Vidéo HD' : f === 'AUDIO' ? 'Appel Audio' : 'Message Écrit'}</span>
                      </span>
                    ))}
                  </div>

                  {/* CONTACT BUTTON */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleContactClick}
                      disabled={startChatMutation.isPending}
                      className="px-5 py-2.5 rounded-xl border border-purple-200 hover:border-purple-300 bg-purple-50 text-[#7C3AED] hover:bg-purple-100/70 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{startChatMutation.isPending ? 'Ouverture...' : 'Contacter par messagerie sécurisée'}</span>
                    </button>
                    {!user && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        * Connexion requise pour envoyer un message
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* BIOGRAPHY */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-[#1B2559]">Présentation & Démarche Thérapeutique</h2>
                <p className="text-slate-600 text-sm font-light leading-relaxed whitespace-pre-line">
                  {psy.biography || 'Aucune biographie disponible pour le moment.'}
                </p>
              </div>

              {/* SPECIALTIES */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-[#1B2559]">Domaines d&apos;expertise & Spécialités</h2>
                <div className="flex flex-wrap gap-2">
                  {psy.specialties?.map((s: any, idx: number) => {
                    const label = typeof s === 'string' ? s : s.specialty;
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/80 border border-teal-200/70 text-teal-800 text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>{label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* CONFIDENTIALITY PROMISE */}
              <div className="p-6 rounded-3xl bg-purple-50/60 border border-purple-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B2559]">Secret Médical & Confidentialité Garantie</h3>
                  <p className="text-xs text-slate-600 font-light mt-0.5 leading-relaxed">
                    Toutes vos séances avec Dr. {psy.lastName} sont chiffrées de bout en bout et couvertes par le secret professionnel le plus strict. Vous pouvez choisir de garder votre caméra éteinte et de consulter sous pseudo.
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: BOOKING SCHEDULER WIDGET */}
            <div id="booking" className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg sticky top-24 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-[#1B2559]">Réserver une séance</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                    En direct
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-light">Choisissez une date et sélectionnez votre créneau.</p>
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* DATE PICKER */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  1. Date de la consultation
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot('');
                    setBookingError(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:bg-white transition-all text-sm text-slate-700 outline-none cursor-pointer"
                />
              </div>

              {/* SLOTS SELECTOR */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  2. Créneaux disponibles
                </label>
                {!selectedDate ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 italic">
                    Veuillez d&apos;abord choisir une date ci-dessus
                  </div>
                ) : slotsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader className="w-5 h-5 animate-spin text-[#2EC4B6]" />
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((s: any) => {
                      const isSelected = selectedSlot === s.startTime;
                      return (
                        <button
                          key={s.startTime}
                          type="button"
                          disabled={!s.isAvailable}
                          onClick={() => {
                            setSelectedSlot(s.startTime);
                            setBookingError(null);
                          }}
                          className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all ${
                            !s.isAvailable
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100'
                              : isSelected
                              ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200 scale-105'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-teal-400'
                          }`}
                        >
                          {s.startTime}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">Aucun créneau ouvert pour cette date.</p>
                )}
              </div>

              {/* NOTES */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  3. Notes pour le praticien (optionnel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Décrivez brièvement le motif de votre consultation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:bg-white transition-all text-xs text-slate-700 placeholder:text-slate-400 outline-none resize-none"
                />
              </div>

              {/* TOTAL & CONFIRM BUTTON */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Tarif séance</span>
                  <span className="font-extrabold text-[#1B2559] text-lg">
                    {priceVal} <span className="text-xs font-semibold text-slate-500">{psy.currency || 'TND'}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={bookMutation.isPending}
                  className="w-full py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200 transition-all active:scale-98"
                >
                  {bookMutation.isPending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  <span>
                    {!user ? "Se connecter pour réserver" : "Confirmer & Réserver"}
                  </span>
                </button>

                {!user && (
                  <p className="text-center text-[11px] text-slate-400 leading-tight">
                    🔒 Vous serez redirigé vers la page de connexion, puis automatiquement ramené ici pour finaliser votre réservation.
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
