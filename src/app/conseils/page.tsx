"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useTranslation } from '@/components/providers/LanguageProvider';
import { 
  Sparkles, 
  Smile, 
  Moon, 
  Coffee, 
  Activity, 
  Flame, 
  Heart, 
  Eye, 
  Compass,
  ArrowRight,
  ShieldCheck,
  Video,
  MessageCircle,
  Laptop
} from 'lucide-react';

export default function ConseilsPage() {
  const { dir } = useTranslation();

  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const categories = [
    "Gestion du stress", "Anxiété", "Dépression", "Sommeil", 
    "Confiance en soi", "Relations", "Gestion des émotions", "Développement personnel"
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-outfit" dir={dir}>
      <Navbar />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1B2559] mb-4">
              Conseils pour votre <span className="text-[#2EC4B6]">bien-être mental</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
              Découvrez des conseils pratiques, des techniques de relaxation et des ressources pour prendre soin de votre santé mentale au quotidien.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Tips (8 cols) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Categories */}
              <section className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-[#1B2559] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#2EC4B6]" />
                  Catégories
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat) => (
                    <span 
                      key={cat} 
                      className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-teal-200 hover:text-[#1B2559] hover:shadow-sm cursor-pointer transition-all"
                    >
                      • {cat}
                    </span>
                  ))}
                </div>
              </section>

              {/* 1. Comment gérer le stress */}
              <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1B2559] mb-3">1. Comment gérer le stress au quotidien ?</h2>
                <p className="text-slate-500 text-sm font-light mb-5">
                  Le stress fait partie de la vie, mais il peut être réduit grâce à quelques habitudes simples.
                </p>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Conseils :</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Prenez 5 à 10 minutes par jour pour respirer profondément.",
                      "Faites une promenade ou une activité physique.",
                      "Organisez votre journée avec des priorités.",
                      "Dormez entre 7 et 9 heures par nuit.",
                      "Accordez-vous des pauses pendant le travail."
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                        <span className="text-[#2EC4B6] font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 2. Reconnaître les signes de l'anxiété */}
              <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1B2559] mb-3">2. Reconnaître les signes de l'anxiété</h2>
                <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-4 mb-5">
                  <p className="text-xs text-rose-800 font-medium">
                    <span className="font-bold">L'anxiété peut se manifester par :</span> Inquiétude excessive | Difficultés à se concentrer | Fatigue | Palpitations | Difficultés à dormir.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Que faire ?</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Pratiquer la respiration profonde.",
                      "Éviter l'excès de caféine.",
                      "Parler à une personne de confiance.",
                      "Consulter un psychologue si les symptômes persistent."
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                        <span className="text-rose-500 font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 3. Mieux dormir */}
              <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1B2559] mb-3 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  3. Mieux dormir
                </h2>
                <p className="text-slate-500 text-sm font-light mb-5">
                  Un sommeil de qualité améliore la santé mentale.
                </p>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Conseils :</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Évitez les écrans une heure avant de dormir.",
                      "Gardez des horaires réguliers.",
                      "Limitez le café le soir.",
                      "Dormez dans une chambre calme et sombre."
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                        <span className="text-indigo-500 font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 4. Renforcer la confiance en soi */}
              <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1B2559] mb-3">4. Renforcer la confiance en soi</h2>
                <p className="text-slate-500 text-sm font-light mb-5">
                  La confiance en soi se construit progressivement.
                </p>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Essayez de :</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Célébrer vos petites réussites.",
                      "Éviter de vous comparer aux autres.",
                      "Vous fixer des objectifs réalistes.",
                      "Accepter que personne n'est parfait."
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                        <span className="text-amber-500 font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 5. Prendre soin de sa santé mentale */}
              <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1B2559] mb-3">5. Prendre soin de sa santé mentale</h2>
                <p className="text-slate-500 text-sm font-light mb-5">
                  Quelques habitudes simples peuvent faire une grande différence :
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Prendre du temps pour soi.",
                    "Pratiquer une activité physique.",
                    "Manger équilibré.",
                    "Maintenir des relations positives.",
                    "Demander de l'aide lorsque cela est nécessaire."
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                      <span className="text-[#2EC4B6] font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* 6. Technique de respiration 4-4-4 */}
              <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1B2559] mb-3">6. Technique de respiration 4-4-4</h2>
                <p className="text-slate-500 text-sm font-light mb-5">
                  En cas de stress :
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "1. Inspirez", desc: "pendant 4 secondes." },
                    { label: "2. Retenez", desc: "votre respiration 4s." },
                    { label: "3. Expirez", desc: "lentement pendant 4s." },
                    { label: "4. Répétez", desc: "pendant quelques minutes." }
                  ].map((step, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100/50 text-center">
                      <h4 className="text-xs font-bold text-teal-800 mb-1">{step.label}</h4>
                      <p className="text-[10px] text-teal-600">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 7. Faire une pause numérique */}
              <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1B2559] mb-3">7. Faire une pause numérique</h2>
                <p className="text-slate-500 text-sm font-light mb-5">
                  Une utilisation excessive des écrans peut augmenter le stress.
                </p>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Essayez de :</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Désactiver les notifications inutiles.",
                      "Faire une pause de 30 minutes sans téléphone.",
                      "Éviter les écrans avant de se coucher."
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                        <span className="text-[#2EC4B6] font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

            </div>

            {/* Right Column: Dynamic Vector Illustration (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="relative bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 overflow-hidden flex flex-col items-center justify-center min-h-[450px]">
                
                {/* Speech bubble floaters */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-10 p-3 rounded-2xl bg-white shadow-lg shadow-purple-50 flex items-center justify-center border border-slate-100"
                >
                  <MessageCircle className="w-6 h-6 text-purple-500" />
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-28 right-8 p-3 rounded-2xl bg-white shadow-lg shadow-blue-50 flex items-center justify-center border border-slate-100"
                >
                  <Video className="w-6 h-6 text-blue-500" />
                </motion.div>

                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-16 left-8 p-3 rounded-2xl bg-white shadow-lg shadow-teal-50 flex items-center justify-center border border-slate-100"
                >
                  <ShieldCheck className="w-6 h-6 text-[#2EC4B6]" />
                </motion.div>

                {/* Cozy Chair Scene Rendered in Premium CSS/SVG */}
                <div className="relative w-64 h-64 flex items-end justify-center mb-6">
                  {/* Backdrop lights */}
                  <div className="absolute top-8 w-48 h-48 bg-teal-200/20 rounded-full blur-2xl" />
                  
                  {/* Cozy armchair layout */}
                  <div className="relative z-10 w-44 h-44 bg-teal-100 rounded-3xl shadow-inner border border-teal-200/50 flex flex-col items-center justify-end p-3 pb-8">
                    {/* Pillow */}
                    <div className="absolute bottom-6 w-24 h-12 bg-purple-200 rounded-2xl border border-purple-300/30 transform rotate-6 shadow-sm" />
                    {/* Chair armrests */}
                    <div className="absolute left-[-12px] bottom-4 w-6 h-24 bg-teal-200 rounded-full border border-teal-300/30 shadow-md" />
                    <div className="absolute right-[-12px] bottom-4 w-6 h-24 bg-teal-200 rounded-full border border-teal-300/30 shadow-md" />
                    {/* Chair Legs */}
                    <div className="absolute left-4 bottom-[-16px] w-3 h-6 bg-amber-700/80 rounded-b-md transform -rotate-12" />
                    <div className="absolute right-4 bottom-[-16px] w-3 h-6 bg-amber-700/80 rounded-b-md transform rotate-12" />
                  </div>
                  
                  {/* Floating plant to the right */}
                  <div className="absolute bottom-0 right-[-16px] z-20 flex flex-col items-center">
                    <div className="w-10 h-10 bg-amber-800 rounded-t-lg rounded-b-2xl border border-amber-900/30" />
                    <div className="absolute bottom-8 flex gap-1">
                      <div className="w-2.5 h-8 bg-emerald-500 rounded-full transform -rotate-45 origin-bottom" />
                      <div className="w-3.5 h-10 bg-emerald-600 rounded-full transform -rotate-12 origin-bottom" />
                      <div className="w-2.5 h-8 bg-emerald-500 rounded-full transform rotate-45 origin-bottom" />
                    </div>
                  </div>

                  {/* Floating plant/table to the left */}
                  <div className="absolute bottom-0 left-[-20px] z-20 flex flex-col items-center">
                    <div className="w-8 h-12 bg-amber-700 rounded-lg shadow-sm" />
                    <div className="w-12 h-2 bg-amber-600 rounded-full" />
                    {/* Small plant on top */}
                    <div className="absolute bottom-12 flex gap-1">
                      <div className="w-2.5 h-6 bg-emerald-400 rounded-full transform -rotate-45" />
                      <div className="w-2.5 h-6 bg-emerald-500 rounded-full transform rotate-45" />
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#1B2559] mb-1">Votre espace serein</h3>
                <p className="text-xs text-slate-400 text-center max-w-xs font-light">
                  Prenez du temps pour vous détendre et respirer. MonPsy vous accompagne à chaque étape.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
