"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useTranslation, Language } from '@/components/providers/LanguageProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  ArrowRight, 
  Shield, 
  Calendar, 
  MessageSquare, 
  Video, 
  Users, 
  Award,
  CheckCircle2,
  Lock,
  MonitorSmartphone,
  CalendarCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
  ChevronDown,
  Info,
  Globe,
  Check,
  Star,
  Clock,
  Heart,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  EyeOff,
  CreditCard,
  Zap,
  Activity,
  ArrowUpRight,
  SmilePlus,
  Play
} from 'lucide-react';

/* ─── Animation variants ─── */
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" }
  })
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

// Verified mock psychologists for showcase
const FEATURED_PSYCHOLOGISTS = [
  {
    id: "1",
    name: "Dr. Cyrine Ben Salem",
    title: "Psychologue Clinicienne & Psychothérapeute TCC",
    specialties: ["Anxiété & Dépression", "Gestion du Stress", "Thérapie TCC"],
    rating: 4.95,
    reviewsCount: 128,
    experience: "9 ans d'expérience",
    priceTND: "70 TND",
    priceEUR: "35 €",
    languages: ["Arabe", "Français", "Anglais"],
    avatar: "https://images.unsplash.com/photo-1594824813581-229d4791a823?auto=format&fit=crop&q=80&w=400",
    nextSlot: "Aujourd'hui à 16:30",
    verified: true,
  },
  {
    id: "2",
    name: "Dr. Mehdi Trabelsi",
    title: "Psychologue du Travail & Thérapeute Familial",
    specialties: ["Burn-out & Travail", "Thérapie de Couple", "Addictions"],
    rating: 4.92,
    reviewsCount: 94,
    experience: "12 ans d'expérience",
    priceTND: "80 TND",
    priceEUR: "40 €",
    languages: ["Arabe", "Français"],
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    nextSlot: "Demain à 10:00",
    verified: true,
  },
  {
    id: "3",
    name: "Dr. Nourhene Karray",
    title: "Spécialiste Enfants, Adolescents & Parentalité",
    specialties: ["Adolescence", "Estime de soi", "Difficultés scolaires"],
    rating: 4.98,
    reviewsCount: 160,
    experience: "7 ans d'expérience",
    priceTND: "65 TND",
    priceEUR: "30 €",
    languages: ["Arabe", "Français", "Anglais"],
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    nextSlot: "Demain à 14:00",
    verified: true,
  }
];

const FAQS = [
  {
    q: "Comment se déroule une première consultation sur Monpsy ?",
    a: "Vous choisissez votre psychologue selon sa spécialité et vos préférences, puis vous réservez un créneau en quelques clics. Le jour du rendez-vous, vous accédez à votre espace sécurisé sans rien installer : la visioconférence démarre directement dans votre navigateur web, protégée et confidentielle."
  },
  {
    q: "Puis-je consulter en restant totalement anonyme ?",
    a: "Oui, absolument. Nous comprenons l'importance de la discrétion. Vous pouvez utiliser un pseudonyme lors de votre inscription. Votre identité réelle n'est jamais divulguée publiquement et la séance se déroule en toute confidentialité."
  },
  {
    q: "Quels sont les moyens de paiement acceptés ?",
    a: "En Tunisie, vous pouvez payer directement en Dinars Tunisiens (TND) via les passerelles sécurisées Konnect, Flouci, Paymee et cartes bancaires locales. Depuis l'étranger (diaspora et international), les paiements par carte bancaire internationale (Visa, Mastercard) sont traités en toute sécurité via Stripe."
  },
  {
    q: "La téléconsultation est-elle aussi efficace qu'en cabinet présentiel ?",
    a: "Oui, de nombreuses études cliniques internationales démontrent que la psychothérapie en ligne (TCC, écoute analytique, soutien) offre une efficacité strictement équivalente au présentiel, avec l'avantage majeur d'éliminer le stress du transport, de la salle d'attente et des contraintes horaires."
  },
  {
    q: "Comment sont vérifiés les diplômes des psychologues ?",
    a: "Chaque professionnel inscrit sur Monpsy passe par un processus de vérification rigoureux (KYC médical) : contrôle des diplômes d'État (Master / Doctorat en Psychologie Clinique), numéro d'autorisation d'exercice et entretien de conformité déontologique par notre équipe médicale."
  }
];

export default function LandingPage() {
  const { language, setLanguage, t, dir } = useTranslation();
  
  // Interactive diagnostic matching selector state
  const [selectedTopic, setSelectedTopic] = useState<string>("stress");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  
  // Orientation Quiz states
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [showTeaser, setShowTeaser] = useState(false);
  const [currentTeaserText, setCurrentTeaserText] = useState("");

  const topicsList = [
    { id: "stress", label: "Stress & Anxiété", icon: Activity, count: "18 praticiens" },
    { id: "depression", label: "Baisse de moral & Dépression", icon: Heart, count: "14 praticiens" },
    { id: "couple", label: "Couple & Relations", icon: Users, count: "11 praticiens" },
    { id: "burnout", label: "Burn-out & Travail", icon: Zap, count: "9 praticiens" },
    { id: "adolescents", label: "Adolescents & Études", icon: SmilePlus, count: "8 praticiens" },
    { id: "deuil", label: "Deuil & Séparation", icon: ShieldCheck, count: "10 praticiens" },
  ];

  const startQuiz = (therapyKey: string) => {
    const questions = {
      individuelle: [
        {
          question: language === 'ar' ? "ما هو السبب الرئيسي لزيارتك؟" : language === 'en' ? "What is the main reason for your visit?" : "Quel est le principal motif de votre démarche ?",
          options: language === 'ar' 
            ? ["التعامل مع الضغوط أو القلق اليومي", "التغلب على فترة اكتئاب أو احتراق نفسي", "العمل على تقدير الذات", "تجاوز حالة حداد أو انفصال"]
            : language === 'en'
            ? ["Managing daily stress or anxiety", "Overcoming a period of depression or burnout", "Working on self-esteem", "Navigating grief or separation"]
            : ["Gérer le stress ou l'anxiété au quotidien", "Surmonter une période de dépression ou burn-out", "Travailler sur l'estime de soi", "Traverser un deuil ou une séparation"],
          teaser: language === 'ar' ? "تحديد الاحتياجات هو الخطوة الأولى والأهم في رحلة التعافي." : language === 'en' ? "Identifying your needs is the most important first step." : "Identifier vos besoins est la première étape essentielle."
        },
        {
          question: language === 'ar' ? "منذ متى تشعر بهذه الأعراض؟" : language === 'en' ? "How long have you been feeling this way?" : "Depuis combien de temps ressentez-vous cela ?",
          options: language === 'ar'
            ? ["بضعة أيام أو أسابيع", "عدة أشهر", "أكثر من سنة", "تتكرر بشكل متقطع depuis longtemps"]
            : language === 'en'
            ? ["A few days or weeks", "Several months", "Over a year", "On and off for a long time"]
            : ["Quelques jours ou semaines", "Plusieurs mois", "Plus d'un an", "De façon intermittente depuis longtemps"],
          teaser: language === 'ar' ? "الاعتراف بالصعوبات هو نصف الطريق نحو الحل." : language === 'en' ? "Acknowledging struggles is halfway to finding a solution." : "Reconnaître ses difficultés est à mi-chemin de la solution."
        },
        {
          question: language === 'ar' ? "ما هو الشكل المفضل لديك للاستشارة؟" : language === 'en' ? "What is your preferred session format?" : "Quel format d'échange vous met le plus à l'aise ?",
          options: language === 'ar'
            ? ["مكالمة فيديو مباشرة", "مكالمة صوتية بدون كاميرا", "محادثة كتابية فورية", "لا يهم، الأهم هو كفاءة الأخصائي"]
            : language === 'en'
            ? ["Direct video call", "Audio-only session (no camera)", "Live written chat", "No preference, expertise matters most"]
            : ["Visioconférence HD directe", "Consultation audio (sans caméra)", "Messagerie écrite interactive", "Indifférent, la qualification prime"],
          teaser: language === 'ar' ? "راحتك النفسية هي أولويتنا المطلقة." : language === 'en' ? "Your emotional comfort is our top priority." : "Votre confort émotionnel est notre priorité absolue."
        }
      ]
    };

    setActiveQuiz({ key: therapyKey, questions: questions.individuelle });
    setCurrentQuestionIdx(0);
    setQuizAnswers([]);
    setShowTeaser(false);
  };

  const handleAnswer = (answer: string) => {
    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    setCurrentTeaserText(currentQ.teaser);
    setShowTeaser(true);

    setTimeout(() => {
      setShowTeaser(false);
      if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else {
        setCurrentQuestionIdx(activeQuiz.questions.length); // Finished
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* ─── Emergency & Crisis Top Banner ─── */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border-b border-teal-900/40 text-xs py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-slate-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span>Besoin d'une écoute immédiate en cas d'urgence ?</span>
          <span className="font-semibold text-teal-400 flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5 inline" /> Numéro Vert gratuit : 80 10 50 50 (Tunisie) / 15 (SAMU)
          </span>
        </div>
      </div>

      {/* ─── Global App Navbar ─── */}
      <Navbar />

      <main className="pt-24 lg:pt-28">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION                                                           */}
        {/* ========================================================================= */}
        <section className="relative px-6 pt-8 pb-20 lg:pt-14 lg:pb-32 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-teal-600/15 via-cyan-500/10 to-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute top-12 left-10 w-72 h-72 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Headline & Action Triggers */}
              <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={staggerContainer} 
                className="lg:col-span-7 space-y-8 text-center lg:text-left"
              >
                {/* Trust Badge */}
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
                  <span>Plateforme N°1 de Psychothérapie en Ligne Sécurisée</span>
                </motion.div>

                {/* Primary Heading */}
                <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                  Prenez soin de votre esprit,{" "}
                  <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                    en toute sérénité et discrétion.
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Consultez des psychologues agréés par visioconférence sécurisée, audio ou messagerie. 
                  Sans déplacement, sans salle d'attente et avec option d'anonymat total.
                </motion.p>

                {/* Interactive CTAs */}
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/psychologists"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-base shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                  >
                    <span>Trouver mon psychologue</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <button
                    onClick={() => startQuiz('individuelle')}
                    className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-semibold text-base backdrop-blur-md transition-all flex items-center justify-center gap-2.5 group"
                  >
                    <Sparkles className="w-4 h-4 text-teal-400 group-hover:rotate-12 transition-transform" />
                    <span>Faire le test d'orientation (2 min)</span>
                  </button>
                </motion.div>

                {/* Key Trust Checkmarks */}
                <motion.div variants={fadeInUp} className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-900/80 text-xs text-slate-400">
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>100% Psychologues diplômés</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <EyeOff className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Option d'anonymat garanti</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center lg:justify-start col-span-2 sm:col-span-1">
                    <CreditCard className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Paiement TND & International</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column: Live Interactive Consultation Mockup Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.94, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="lg:col-span-5 relative"
              >
                {/* Glowing Outer Ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 via-indigo-500/20 to-cyan-500/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000"></div>

                <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800/80 p-6 backdrop-blur-2xl shadow-2xl space-y-6">
                  
                  {/* Top Mockup Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="text-xs font-mono text-slate-400 ml-2">Séance Vidéo Sécurisée • Monpsy</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Chiffrement E2E
                    </span>
                  </div>

                  {/* Simulated Video Feeds */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Psychologist Box */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-800 flex flex-col justify-between p-3">
                      <Image 
                        src="https://images.unsplash.com/photo-1594824813581-229d4791a823?auto=format&fit=crop&q=80&w=600" 
                        alt="Psychologue en séance" 
                        fill 
                        className="object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <div className="relative z-10 self-end px-2 py-0.5 rounded-md bg-emerald-500/80 text-[10px] font-bold text-white flex items-center gap-1">
                        <Activity className="w-3 h-3 animate-pulse" /> HD Direct
                      </div>
                      <div className="relative z-10">
                        <p className="text-xs font-semibold text-white">Dr. Cyrine Ben Salem</p>
                        <p className="text-[10px] text-teal-300">Psychothérapeute</p>
                      </div>
                    </div>

                    {/* Patient / Waveform Box */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-slate-950 to-indigo-950/70 border border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mb-2">
                        <EyeOff className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-white">Patient (Mode Discret)</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Microphone actif • Caméra masquée</span>
                      
                      {/* Fake Audio Waveform */}
                      <div className="flex items-center gap-1 mt-3">
                        {[40, 70, 30, 90, 60, 100, 45, 80, 50].map((h, idx) => (
                          <span 
                            key={idx} 
                            style={{ height: `${h}%` }}
                            className="w-1 bg-teal-400/80 rounded-full animate-pulse"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Booking Snippet Inside Card */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Prochain créneau disponible :</span>
                      <span className="font-semibold text-teal-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Aujourd'hui à 16h30
                      </span>
                    </div>
                    <Link
                      href="/psychologists"
                      className="w-full py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Sélectionner ce créneau (Dès 65 TND)</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. STATS & RECOGNITION RIBBON                                             */}
        {/* ========================================================================= */}
        <section className="border-y border-slate-900 bg-slate-950/60 backdrop-blur-md py-10 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">+3 200</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Consultations Réalisées</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl lg:text-4xl font-extrabold text-teal-400 tracking-tight">98.6%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Satisfaction Patients</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">100%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Psychologues Diplômés</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl lg:text-4xl font-extrabold text-teal-400 tracking-tight">&lt; 24h</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Délai Moyen de Prise de RDV</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE TOPIC / SYMPTOM SELECTOR (SMART MATCHING)                 */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">Orientation Personnalisée</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pour quel motif souhaitez-vous être accompagné ?
            </p>
            <p className="text-slate-400 text-sm sm:text-base">
              Sélectionnez votre besoin principal pour découvrir immédiatement les praticiens les plus qualifiés.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {topicsList.map((topic) => {
              const Icon = topic.icon;
              const isSelected = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                    isSelected 
                      ? "bg-teal-500/15 border-teal-500 text-white shadow-lg shadow-teal-500/10 scale-105" 
                      : "bg-slate-900/60 border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-teal-400"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-snug">{topic.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{topic.count}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Match Preview Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                Des spécialistes certifiés sont disponibles dès aujourd'hui
              </h3>
              <p className="text-sm text-slate-400">
                Nos psychologues utilisent des approches validées scientifiquement (TCC, Systémique, Écoute bienveillante).
              </p>
            </div>
            <Link
              href="/psychologists"
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>Consulter les profils disponibles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. HOW IT WORKS (3 SIMPLE STEPS)                                          */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 bg-slate-900/40 border-t border-slate-900 relative">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">Processus Simple & Intuitif</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Consulter un psychologue n'a jamais été aussi simple
              </p>
              <p className="text-slate-400 text-sm sm:text-base">
                Trois étapes rapides pour démarrer votre thérapie en toute sérénité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              
              {/* Step 1 */}
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-850 hover:border-teal-500/40 transition-all space-y-5 relative group">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-extrabold text-xl group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="text-xl font-bold text-white">Choisissez votre praticien</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Parcourez les profils détaillés, les avis vérifiés, les spécialités et sélectionnez le créneau qui s'adapte à votre emploi du temps.
                </p>
                <div className="pt-2 text-xs text-teal-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Filtres par tarif, langue & expertise
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-850 hover:border-teal-500/40 transition-all space-y-5 relative group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-extrabold text-xl group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="text-xl font-bold text-white">Réservez & Payez en toute sécurité</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Confirmez votre consultation avec paiement sécurisé en Dinars Tunisiens (Konnect, Flouci, Paymee) ou par carte internationale (Stripe).
                </p>
                <div className="pt-2 text-xs text-indigo-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Facturation automatique & reçus
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-850 hover:border-teal-500/40 transition-all space-y-5 relative group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xl group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="text-xl font-bold text-white">Consultez en Visioconférence HD</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Le jour J, rejoignez votre salle de consultation privée d'un simple clic depuis votre téléphone, tablette ou ordinateur sans rien installer.
                </p>
                <div className="pt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Chiffrement WebRTC & Anonymat
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. FEATURED PSYCHOLOGISTS CARDS                                           */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">Équipe Médicale Qualifiée</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Quelques-uns de nos psychologues certifiés
              </p>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
                Tous nos praticiens sont titulaires d'un diplôme d'État et formés aux meilleures pratiques de thérapie en ligne.
              </p>
            </div>
            <Link
              href="/psychologists"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 group"
            >
              <span>Voir tous les psychologues</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_PSYCHOLOGISTS.map((psy) => (
              <div 
                key={psy.id}
                className="rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/50 p-6 backdrop-blur-md transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-700">
                      <Image src={psy.avatar} alt={psy.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-white text-base">{psy.name}</h3>
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-400">{psy.title}</p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {psy.rating}
                        </span>
                        <span className="text-[11px] text-slate-500">({psy.reviewsCount} avis)</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialties Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {psy.specialties.map((spec) => (
                      <span key={spec} className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-[11px]">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Next slot info */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Disponibilité :</span>
                    <span className="text-teal-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {psy.nextSlot}
                    </span>
                  </div>
                </div>

                {/* Bottom Pricing & CTA */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Tarif séance</span>
                    <span className="text-lg font-extrabold text-white">{psy.priceTND}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({psy.priceEUR})</span>
                  </div>
                  <Link
                    href={`/psychologists/${psy.id}`}
                    className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5"
                  >
                    <span>Prendre RDV</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. SECURITY & HEALTH COMPLIANCE PILLARS                                   */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-900">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">Confidentialité & Déontologie</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Une sécurité conçue selon les plus hauts standards médicaux
              </p>
              <p className="text-slate-400 text-sm sm:text-base">
                Vos échanges et données personnelles de santé bénéficient d'une protection inviolable.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Secret Médical Garanti</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Conformité stricte avec les normes de l'INPDP (Tunisie) et du RGPD. Aucune donnée médicale n'est revendue.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <EyeOff className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Option 100% Anonyme</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Consultez sous pseudonyme si vous le souhaitez. Votre vie privée reste sous votre contrôle total.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Visioconférence Chiffrée</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Salles virtuelles éphémères générées par jetons cryptographiques. Aucun enregistrement n'est stocké.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Paiements Chiffrés</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Transactions bancaires cryptées SSL/TLS 256 bits via passerelles certifiées PCI-DSS.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. FREQUENTLY ASKED QUESTIONS (ACCORDION)                                 */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">Questions Fréquentes</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tout ce que vous devez savoir
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl bg-slate-900/60 border border-slate-850 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-white text-sm sm:text-base hover:text-teal-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-teal-400" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-850/60 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FINAL HIGH-CONVERTING CTA BANNER                                       */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 border border-teal-500/30 p-10 sm:p-16 text-center space-y-8 shadow-2xl">
            {/* Background Light Orbs */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-teal-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto space-y-4 relative z-10">
              <span className="px-3.5 py-1 rounded-full bg-teal-400/20 text-teal-300 font-bold text-xs uppercase tracking-wider">
                Faites le premier pas aujourd'hui
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Votre bien-être mental mérite toute votre attention.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Rejoignez des milliers de patients qui ont retrouvé sérénité et équilibre grâce aux psychologues certifiés de Monpsy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
              <Link
                href="/psychologists"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-base shadow-xl shadow-teal-950/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Prendre un rendez-vous</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-750 text-white font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <span>Découvrir notre démarche</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ─── Global App Footer ─── */}
      <Footer />

      {/* ========================================================================= */}
      {/* 9. ORIENTATION QUIZ MODAL                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Questionnaire d'Orientation</span>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {currentQuestionIdx < activeQuiz.questions.length ? (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-400 h-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-semibold">
                      Question {currentQuestionIdx + 1} sur {activeQuiz.questions.length}
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {activeQuiz.questions[currentQuestionIdx].question}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {activeQuiz.questions[currentQuestionIdx].options.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(opt)}
                        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 text-left text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all flex items-center justify-between group"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>

                  {showTeaser && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 text-center font-medium"
                    >
                      {currentTeaserText}
                    </motion.div>
                  )}
                </div>
              ) : (
                /* Quiz Complete Screen */
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Test complété avec succès !</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Vos réponses indiquent qu'une thérapie d'accompagnement ciblée répond parfaitement à vos besoins actuels.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/psychologists"
                      onClick={() => setActiveQuiz(null)}
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-teal-400/10 transition-all"
                    >
                      <span>Découvrir les psychologues recommandés</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
