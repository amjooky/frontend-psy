"use client";

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader, AlertCircle, PhoneOff } from 'lucide-react';
import api from '@/lib/api';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

function PsyConsultationRoomContent() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!appointmentId) return;

    let disposed = false;

    const start = async () => {
      try {
        // 1. Get meeting credentials from backend (unpacked via NestJS TransformInterceptor format res.data.data)
        const res = await api.get(`/consultations/appointments/${appointmentId}/access`);
        const { roomName, token, domain, userInfo } = res.data?.data || res.data || {};

        if (disposed) return;

        // 2. Load Jitsi External API script
        const scriptId = 'jitsi-external-api-script';
        const existingScript = document.getElementById(scriptId);

        const initJitsi = () => {
          if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) return;

          if (apiRef.current) {
            apiRef.current.dispose();
          }

          try {
            const jitsiApi = new window.JitsiMeetExternalAPI(domain || 'meet.jit.si', {
              roomName,
              jwt: token || undefined,
              userInfo: userInfo || undefined,
              width: '100%',
              height: '100%',
              parentNode: containerRef.current,
              configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                prejoinPageEnabled: false,
                disableDeepLinking: true,
                enableLobby: true,
                lobby: {
                  enabled: true,
                  autoKnock: true,
                  enableChat: true,
                },
                toolbarButtons: [
                  'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                  'fodeviceselection', 'hangup', 'profile', 'chat',
                  'videoquality', 'tileview', 'mute-everyone', 'security', 'participants-pane',
                ],
                disableWelcomePage: true,
                enableClosePage: false,
                enableWelcomePage: false,
                hideConferenceTimer: false,
                hideConferenceSubject: true,
                hideSelfView: false,
              },
              interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                DEFAULT_BACKGROUND: '#0F172A',
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                DISPLAY_WELCOME_PAGE_CONTENT: false,
                GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
                HIDE_DEEP_LINKING_LOGO: true,
                MOBILE_APP_PROMO: false,
                PROVIDER_NAME: 'Monpsy',
                SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
              },
            });

            apiRef.current = jitsiApi;
            setStatus('ready');

            // Automatically enable Lobby (Waiting Room) so participants must be accepted by the psychologist
            jitsiApi.addEventListener('videoConferenceJoined', () => {
              jitsiApi.executeCommand('toggleLobby', true);
            });

            jitsiApi.addEventListener('videoConferenceLeft', () => {
              router.push('/dashboard/psychologist');
            });
          } catch (err: any) {
            if (!disposed) setError('Impossible de démarrer l’interface vidéo. Vérifiez votre matériel de communication.');
            console.error('Jitsi init error:', err);
          }
        };

        if (existingScript && window.JitsiMeetExternalAPI) {
          initJitsi();
        } else {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://${domain || 'meet.jit.si'}/external_api.js`;
          script.async = true;
          script.onload = initJitsi;
          script.onerror = () => {
            if (!disposed) {
              setError(
                `Impossible de charger le module vidéo depuis ${domain || 'meet.jit.si'}. Vérifiez votre connexion Internet et réessayez.`
              );
            }
          };
          document.body.appendChild(script);
        }
      } catch (err: any) {
        if (!disposed) {
          const status = err?.response?.status;
          let msg = 'Une erreur de connexion est survenue. Veuillez réessayer.';
          if (status === 403) msg = 'Accès refusé. Vous n\'êtes pas autorisé à rejoindre cette consultation.';
          else if (status === 404) msg = 'Cette consultation est introuvable.';
          else if (status === 409) msg = 'La séance est déjà ouverte sur un autre appareil.';
          else if (status === 400) msg = err?.response?.data?.message || 'Cette consultation n\'est pas encore ouverte ou a déjà expiré.';
          else if (err?.response?.data?.message) msg = err.response.data.message;
          setError(msg);
        }
      }
    };

    start();

    return () => {
      disposed = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [appointmentId, router, retryKey]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-outfit text-slate-100 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Accès à la séance impossible</h3>
        <p className="text-slate-400 text-sm max-w-md leading-relaxed whitespace-pre-line mb-6">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => { setError(null); setStatus('loading'); setRetryKey((k) => k + 1); }}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push('/dashboard/psychologist')}
            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-sm font-semibold transition-all"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 font-outfit">
      <header className="h-14 border-b border-slate-900 bg-slate-950 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow shadow-emerald-500/50" />
          <span className="text-xs text-slate-300 font-semibold tracking-wider uppercase">
            Consultation sécurisée — Espace Psychologue
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
            Salle d'attente active
          </span>
        </div>
        <button
          onClick={() => {
            if (apiRef.current) apiRef.current.executeCommand('hangup');
            router.push('/dashboard/psychologist');
          }}
          className="px-4 py-2 rounded-xl bg-red-950/20 border border-red-900/30 hover:bg-red-900/20 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <PhoneOff className="w-4 h-4" />
          Terminer la séance
        </button>
      </header>

      {status === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm">Connexion à la séance sécurisée en cours...</p>
        </div>
      )}

      <div ref={containerRef} className={`flex-1 w-full bg-slate-950 ${status !== 'ready' ? 'hidden' : ''}`} />
    </div>
  );
}

export default function PsyConsultationRoom() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-outfit text-slate-100">
        <Loader className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400 text-sm">Chargement de la séance en cours...</p>
      </div>
    }>
      <PsyConsultationRoomContent />
    </Suspense>
  );
}
