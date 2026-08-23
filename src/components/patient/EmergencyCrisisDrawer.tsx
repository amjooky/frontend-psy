"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, ShieldAlert, X, HeartHandshake, AlertCircle } from 'lucide-react';
import { haptic } from '@/lib/haptics';

const HELPLINES = [
  {
    name: "SAMU / Urgences Médicales",
    number: "190",
    phoneUrl: "tel:190",
    desc: "En cas d'urgence médicale vitale immédiate",
    badge: "24h/24 · Gratuit",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    name: "Ligne d'Écoute & Soutien Psychologique",
    number: "80 10 50 50",
    phoneUrl: "tel:80105050",
    desc: "Écoute bienveillante, anonyme et gratuite par des spécialistes",
    badge: "Anonyme & Gratuit",
    color: "bg-teal-50 text-teal-800 border-teal-200",
  },
  {
    name: "SOS Amitié & Prévention",
    number: "71 88 88 88",
    phoneUrl: "tel:71888888",
    desc: "Pour parler en toute liberté sans aucun jugement",
    badge: "Confidentialité totale",
    color: "bg-blue-50 text-blue-800 border-blue-200",
  },
];

export function EmergencyCrisisDrawer() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    haptic.medium();
    setOpen((o) => !o);
  };

  return (
    <>
      {/* Floating or Header SOS Trigger Button */}
      <button
        onClick={toggle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold transition-all shadow-sm active:scale-95"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        <span>Besoin d'aide urgente ?</span>
      </button>

      {/* Slide-up SOS Drawer Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl border-t border-slate-200 p-6 md:p-8 max-w-xl mx-auto max-h-[90vh] overflow-y-auto font-outfit shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-sm">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1B2559]">Lignes d'Écoute & Urgences</h3>
                    <p className="text-xs text-slate-500 font-medium">Vous n'êtes pas seul(e). Des spécialistes sont là pour vous.</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Emergency Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">MonPsy n'est pas un service d'urgence médicale immédiate.</strong>
                  <p className="mt-1 text-amber-800">
                    Si vous ou un proche êtes en détresse critique ou en danger immédiat, veuillez contacter l'un des numéros gratuits ci-dessous sans attendre.
                  </p>
                </div>
              </div>

              {/* Direct Dial Helpline Cards */}
              <div className="space-y-3 mb-6">
                {HELPLINES.map((line, idx) => (
                  <a
                    key={idx}
                    href={line.phoneUrl}
                    onClick={() => haptic.warning()}
                    className={`block p-4 rounded-2xl border transition-all hover:scale-101 active:scale-98 shadow-sm ${line.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#1B2559]">{line.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                            {line.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{line.desc}</p>
                      </div>

                      <div className="px-4 py-2.5 rounded-xl bg-[#1B2559] text-white font-mono font-bold text-sm flex items-center gap-2 shadow-sm shrink-0 ml-3">
                        <PhoneCall className="w-4 h-4" />
                        {line.number}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Fermer
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
