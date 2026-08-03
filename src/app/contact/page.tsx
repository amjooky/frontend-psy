"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useTranslation } from '@/components/providers/LanguageProvider';
import { MapPin, Phone, Mail, Clock, Share2, Send } from 'lucide-react';

export default function ContactPage() {
  const { dir } = useTranslation();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const contactInfos = [
    { icon: <MapPin className="w-5 h-5 text-teal-600" />, label: "Adresse", value: "Centre Urbain Nord, Tunis, Tunisie" },
    { icon: <Phone className="w-5 h-5 text-teal-600" />, label: "Téléphone", value: "+216 70 123 456" },
    { icon: <Mail className="w-5 h-5 text-teal-600" />, label: "E-mail", value: "contact@monpsy.tn" }
  ];

  const openingHours = [
    { day: "Lundi – Vendredi", hours: "08h30 – 18h00", isClosed: false },
    { day: "Samedi", hours: "09h00 – 13h00", isClosed: false },
    { day: "Dimanche", hours: "09h00 – 13h00", isClosed: false }
  ];

  const socialLinks = [
    { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, name: "Facebook", handle: "MonPsy", url: "#" },
    { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>, name: "Instagram", handle: "@monpsy.tn", url: "#" },
    { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>, name: "LinkedIn", handle: "MonPsy", url: "#" },
    { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>, name: "X (Twitter)", handle: "@MonPsyTN", url: "#" }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-outfit" dir={dir}>
      <Navbar />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1B2559] mb-3">Contactez-nous</h1>
            <h2 className="text-lg sm:text-xl font-bold text-teal-600 mb-4">Vous avez une question ?</h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
              Notre équipe est à votre écoute pour vous accompagner et répondre à toutes vos questions concernant la plateforme <span className="text-[#2EC4B6] font-semibold">MonPsy</span>.
            </p>
          </div>

          {/* Quick Contacts Bar */}
          <section className="bg-purple-50/50 border border-purple-100/30 rounded-3xl p-6 sm:p-8 mb-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {contactInfos.map((info) => (
                <div key={info.label} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mb-3">
                    {info.icon}
                  </div>
                  <h3 className="font-bold text-xs text-slate-400 mb-1">{info.label}</h3>
                  <p className="text-sm font-semibold text-[#1B2559]">{info.value}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left side: Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-xl font-bold text-[#1B2559] mb-6">Envoyez-nous un message</h3>
                
                {formSubmitted ? (
                  <div className="p-8 text-center bg-teal-50 border border-teal-100 rounded-2xl">
                    <h4 className="font-bold text-teal-800 text-lg mb-2">Message envoyé !</h4>
                    <p className="text-sm text-teal-600">
                      Merci pour votre message. Notre équipe d'assistance vous répondra dans les plus brefs délais.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-xs font-bold text-slate-500 mb-2">Nom complet</label>
                        <input 
                          type="text" 
                          id="name"
                          required 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                          placeholder="Ex: Jean Dupont"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-xs font-bold text-slate-500 mb-2">Adresse e-mail</label>
                        <input 
                          type="email" 
                          id="email"
                          required 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                          placeholder="Ex: jean.dupont@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-xs font-bold text-slate-500 mb-2">Sujet</label>
                      <input 
                        type="text" 
                        id="subject"
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="De quoi s'agit-il ?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-xs font-bold text-slate-500 mb-2">Message</label>
                      <textarea 
                        id="message"
                        rows={5}
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="Rédigez votre message ici..."
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold shadow-lg shadow-purple-100 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Envoyer le message</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right side: Hours and Socials (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Horaires d'assistance */}
              <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#1B2559] mb-5 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  Horaires d'assistance
                </h3>
                <div className="space-y-4">
                  {openingHours.map((hour) => (
                    <div key={hour.day} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-sm">
                      <span className="font-semibold text-slate-700">{hour.day}</span>
                      <span className={`font-bold ${hour.isClosed ? 'text-rose-500' : 'text-slate-500'}`}>{hour.hours}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Réseaux sociaux */}
              <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#1B2559] mb-5 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-teal-600" />
                  Réseaux sociaux
                </h3>
                <div className="space-y-4">
                  {socialLinks.map((social) => (
                    <a 
                      key={social.name} 
                      href={social.url} 
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                          {social.icon}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{social.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{social.handle}</span>
                    </a>
                  ))}
                </div>
              </section>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
