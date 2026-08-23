"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, X, Share2, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('MonPsy PWA ServiceWorker active:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA registration error:', err);
          });
      });
    }

    // 2. Check if already running in standalone mode (installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('monpsy_pwa_dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 1000 * 60 * 60 * 24 * 7) {
      // Dismissed within last 7 days
      return;
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice && isSafari) {
      setIsIos(true);
      const timer = setTimeout(() => setShowIosPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // 4. Android / Chrome / Edge BeforeInstallPrompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowIosPrompt(false);
    localStorage.setItem('monpsy_pwa_dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {/* Android / Desktop Chrome Install Banner */}
      {showInstallBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#1B2559]/95 backdrop-blur-xl border border-purple-500/30 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 font-outfit"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center shrink-0">
              <Image src="/logo.png" alt="MonPsy" width={28} height={28} className="object-contain" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-white truncate">Installer l'application MonPsy</div>
              <div className="text-xs text-purple-200/80 truncate">Accès rapide, consultations fluides</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Installer
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Fermer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* iOS Safari Add to Home Screen Instructions */}
      {showIosPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 bg-[#1B2559]/95 backdrop-blur-xl border border-purple-500/30 text-white p-4 rounded-2xl shadow-2xl font-outfit"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center shrink-0">
                <Image src="/logo.png" alt="MonPsy" width={22} height={22} className="object-contain" />
              </div>
              <span className="text-sm font-bold text-white">Installer l'application sur votre iPhone</span>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Fermer"
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-purple-200/90 leading-relaxed">
            Pour installer MonPsy : appuyez sur le bouton Partager <Share2 className="w-3.5 h-3.5 inline mx-1 text-purple-300" /> dans Safari, puis sélectionnez <span className="font-semibold text-white">"Sur l'écran d'accueil"</span> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-purple-300" />.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
