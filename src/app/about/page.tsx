"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useTranslation } from '@/components/providers/LanguageProvider';
import { Shield, Users, EyeOff, CheckCircle2, Heart, Globe, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const { dir } = useTranslation();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const values = [
    { icon: <Shield className="w-5 h-5 text-teal-600" />, label: "Confidentialité", desc: "Protection totale des données personnelles." },
    { icon: <Heart className="w-5 h-5 text-rose-500" />, label: "Bienveillance", desc: "Une écoute sans jugement." },
    { icon: <Globe className="w-5 h-5 text-blue-500" />, label: "Accessibilité", desc: "Consulter un psychologue depuis n'importe où." },
    { icon: <EyeOff className="w-5 h-5 text-purple-500" />, label: "Anonymat", desc: "Possibilité de consulter sous un pseudonyme." },
    { icon: <Award className="w-5 h-5 text-amber-500" />, label: "Professionnalisme", desc: "Des psychologues diplômés et vérifiés." },
  ];

  const features = [
    "Consultations vidéo sécurisées",
    "Prise de rendez-vous en quelques clics",
    "Paiement en ligne sécurisé",
    "Consultation anonyme (optionnelle)",
    "Interface simple et intuitive",
    "Disponibilité 24h/24 pour la réservation",
    "Historique des rendez-vous",
    "Conseils et ressources pour le bien-être mental"
  ];

  const steps = [
    "Créez votre compte.",
    "Choisissez votre psychologue.",
    "Réservez votre rendez-vous.",
    "Effectuez le paiement sécurisé.",
    "Commencez votre séance en ligne.",
    "Retrouvez votre historique et vos prochaines consultations."
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-outfit" dir={dir}>
      <Navbar />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl font-extrabold text-[#1B2559] mb-4"
            >
              À propos de <span className="text-[#2EC4B6]">MonPsy</span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-slate-500 max-w-xl mx-auto font-light"
            >
              Votre plateforme de confiance pour l'accompagnement et le bien-être psychologique en ligne.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="space-y-12"
          >
            {/* Notre histoire */}
            <motion.section variants={fadeInUp} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-2xl font-bold text-[#1B2559] mb-4">Notre histoire</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                MonPsy est une plateforme de thérapie psychologique en ligne conçue pour rendre le soutien psychologique accessible à tous. Nous croyons que chacun mérite un espace sécurisé, confidentiel et bienveillant pour s'exprimer librement, où qu'il se trouve.
              </p>
            </motion.section>

            {/* Notre mission */}
            <motion.section variants={fadeInUp} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-2xl font-bold text-[#1B2559] mb-4">Notre mission</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Notre mission est de faciliter l'accès aux soins psychologiques grâce aux nouvelles technologies, en mettant en relation les patients avec des psychologues qualifiés via des consultations en ligne simples, rapides et sécurisées.
              </p>
            </motion.section>

            {/* Nos valeurs */}
            <motion.section variants={fadeInUp} className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1B2559] px-2">Nos valeurs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {values.map((val) => (
                  <div key={val.label} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      {val.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1B2559] text-sm mb-1">{val.label}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Pourquoi choisir MonPsy? */}
            <motion.section variants={fadeInUp} className="bg-[#1B2559] text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h2 className="text-2xl font-bold mb-6 relative z-10">Pourquoi choisir MonPsy ?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {features.map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2EC4B6] shrink-0" />
                    <span className="text-sm font-medium text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Nos professionnels */}
            <motion.section variants={fadeInUp} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-2xl font-bold text-[#1B2559] mb-4">Nos professionnels</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Tous les psychologues présents sur MonPsy sont sélectionnés selon leurs qualifications, leur expérience et leur engagement à respecter les règles d'éthique et de confidentialité.
              </p>
            </motion.section>

            {/* Votre sécurité avant tout */}
            <motion.section variants={fadeInUp} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-2xl font-bold text-[#1B2559] mb-4">Votre sécurité avant tout</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Nous utilisons des technologies modernes afin de garantir la sécurité des échanges, la confidentialité des consultations et la protection des informations personnelles.
              </p>
            </motion.section>

            {/* Notre vision */}
            <motion.section variants={fadeInUp} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-2xl font-bold text-[#1B2559] mb-4">Notre vision</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Nous souhaitons faire de MonPsy une référence dans l'accompagnement psychologique en ligne en offrant une expérience humaine, sécurisée et accessible à tous.
              </p>
            </motion.section>

            {/* Comment ça marche? */}
            <motion.section variants={fadeInUp} className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1B2559] px-2">"Comment ça marche ?"</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all items-center">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 font-extrabold text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
