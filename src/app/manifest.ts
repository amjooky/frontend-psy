import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MonPsy — Téléconsultation Psychologie',
    short_name: 'MonPsy',
    description: 'Prenez rendez-vous et consultez un psychologue certifié en ligne en toute confidentialité.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#7C3AED',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['medical', 'health', 'lifestyle'],
    shortcuts: [
      {
        name: 'Prendre rendez-vous',
        short_name: 'Rendez-vous',
        description: 'Trouver un psychologue et réserver une séance',
        url: '/psychologists',
        icons: [{ src: '/logo.png', sizes: '96x96' }],
      },
      {
        name: 'Mes consultations',
        short_name: 'Mes RDV',
        description: 'Voir mes rendez-vous à venir',
        url: '/dashboard/patient/appointments',
        icons: [{ src: '/logo.png', sizes: '96x96' }],
      },
      {
        name: 'Messagerie',
        short_name: 'Messages',
        description: 'Discuter avec mon psychologue',
        url: '/dashboard/patient/chat',
        icons: [{ src: '/logo.png', sizes: '96x96' }],
      },
    ],
  };
}
