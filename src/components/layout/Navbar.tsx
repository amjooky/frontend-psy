"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, Language } from '@/components/providers/LanguageProvider';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { language, setLanguage, t, dir } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: Record<Language, { label: string; flag: string }> = {
    fr: { label: "Français", flag: "🇫🇷" },
    en: { label: "English", flag: "🇬🇧" },
    ar: { label: "العربية", flag: "🇹🇳" }
  };

  const navLinks = [
    { label: t('nav.accueil'), href: "/" },
    { label: t('nav.psychologues'), href: "/psychologists" },
    { label: t('nav.about'), href: "/about" },
    { label: t('nav.conseils'), href: "/conseils" },
    { label: t('nav.contact'), href: "/contact" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image 
            src="/logo.png" 
            priority
            style={{ width: 'auto', height: 'auto' }}
            alt="MonPsy Logo" 
            width={180} 
            height={56} 
            className="object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isLinkActive(link.href)
                  ? "text-[#1B2559] underline underline-offset-[6px] decoration-2 decoration-[#1B2559]"
                  : "text-slate-500 hover:text-[#1B2559]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Language Selector & CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{languages[language].flag}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute mt-2 py-1.5 w-32 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 ${
                    dir === 'rtl' ? 'left-0' : 'right-0'
                  }`}
                >
                  {(Object.keys(languages) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                        language === lang ? 'text-[#7C3AED] bg-purple-50/50' : 'text-slate-700'
                      } ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <span>{languages[lang].flag}</span>
                      <span>{languages[lang].label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/login"
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#1B2559] border-2 border-[#1B2559] hover:bg-[#1B2559] hover:text-white transition-all duration-200"
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5 transition-all duration-200"
          >
            {t('nav.register')}
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Quick Language Toggle for Mobile */}
          <button
            onClick={() => {
              const nextLang: Record<Language, Language> = { fr: 'en', en: 'ar', ar: 'fr' };
              setLanguage(nextLang[language]);
            }}
            className="p-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {languages[language].flag}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-[#1B2559] hover:bg-slate-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="absolute top-[72px] left-0 right-0 bg-white border-b border-slate-100 shadow-xl px-6 py-8 flex flex-col gap-5 lg:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-medium transition-colors ${
                  isLinkActive(link.href) ? 'text-[#1B2559] font-semibold' : 'text-slate-700 hover:text-[#1B2559]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-slate-100" />
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-full text-sm font-semibold text-[#1B2559] border-2 border-[#1B2559] hover:bg-[#1B2559] hover:text-white transition-all"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-full text-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-all"
              >
                {t('nav.register')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
