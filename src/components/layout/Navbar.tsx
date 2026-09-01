"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, Language } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Globe, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react';

export function Navbar() {
  const { language, setLanguage, t, dir } = useTranslation();
  const { user, isAuthenticated, loading, logoutUser } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    if (langDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [langDropdownOpen]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLangDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
  }, [pathname]);

  const languages: Record<Language, { label: string; flag: string }> = {
    fr: { label: "Français", flag: "🇫🇷" },
    en: { label: "English", flag: "🇬🇧" },
    ar: { label: "العربية", flag: "🇹🇳" }
  };

  const navLinks = [
    { label: t('nav.accueil') || "Accueil", href: "/" },
    { label: t('nav.psychologues') || "Psychologues", href: "/psychologists" },
    { label: t('nav.about') || "À propos", href: "/about" },
    { label: t('nav.conseils') || "Conseils", href: "/conseils" },
    { label: t('nav.contact') || "Contact", href: "/contact" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const getDashboardUrl = () => {
    if (!user) return '/dashboard';
    if (user.role === 'PATIENT') return '/dashboard/patient';
    if (user.role === 'PSYCHOLOGIST') return '/dashboard/psychologist';
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return '/dashboard/admin';
    return '/dashboard';
  };

  const dashboardLabel = language === 'ar' 
    ? 'لوحة التحكم' 
    : language === 'en' 
    ? 'Dashboard' 
    : 'Mon Espace';

  const isUserAuthenticated = mounted && !loading && isAuthenticated;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
          aria-label="MonPsy Accueil"
        >
          <Image 
            src="/logo.png" 
            priority
            style={{ width: 'auto', height: '44px' }}
            alt="MonPsy Logo" 
            width={160} 
            height={44} 
            className="object-contain group-hover:scale-[1.02] transition-transform duration-200"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all relative py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded ${
                  active
                    ? "text-[#1B2559] font-bold"
                    : "text-slate-600 hover:text-[#1B2559]"
                }`}
              >
                {link.label}
                {active && (
                  <motion.span 
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#1B2559] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language Selector & CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-expanded={langDropdownOpen}
              aria-label="Changer de langue"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="text-base leading-none">{languages[language]?.flag}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute mt-2 py-1.5 w-36 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden ${
                    dir === 'rtl' ? 'left-0' : 'right-0'
                  }`}
                >
                  {(Object.keys(languages) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        language === lang ? 'text-[#7C3AED] bg-purple-50/60 font-bold' : 'text-slate-700'
                      } ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{languages[lang].flag}</span>
                        <span>{languages[lang].label}</span>
                      </span>
                      {language === lang && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth State CTAs */}
          {isUserAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href={getDashboardUrl()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#1B2559] text-white hover:bg-[#131b40] shadow-md hover:shadow-lg transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                <span>{dashboardLabel}</span>
              </Link>
              <button
                type="button"
                onClick={logoutUser}
                title={t('nav.logout') || "Déconnexion"}
                className="p-2.5 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                aria-label="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-5 py-2 rounded-full text-sm font-semibold text-[#1B2559] border-2 border-[#1B2559] hover:bg-[#1B2559] hover:text-white transition-all duration-200"
              >
                {t('nav.login') || "Connexion"}
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-full text-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-md shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                {t('nav.register') || "S'inscrire"}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls (Language Quick Switch + Hamburger) */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextLang: Record<Language, Language> = { fr: 'en', en: 'ar', ar: 'fr' };
              setLanguage(nextLang[language]);
            }}
            className="p-2 rounded-xl border border-slate-200 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            title="Changer de langue"
            aria-label="Changer de langue"
          >
            {languages[language]?.flag}
          </button>
          
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:text-[#1B2559] hover:bg-slate-50 transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-[72px] bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[72px] left-0 right-0 bg-white border-b border-slate-100 shadow-2xl px-6 py-6 flex flex-col gap-5 z-50 lg:hidden max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      active 
                        ? 'bg-slate-100 text-[#1B2559] font-bold' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#1B2559]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Language Selector Pill */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                {language === 'ar' ? 'اللغة' : language === 'en' ? 'Language' : 'Langue'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(languages) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setLanguage(lang);
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      language === lang
                        ? 'border-[#7C3AED] bg-purple-50 text-[#7C3AED]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{languages[lang].flag}</span>
                    <span>{languages[lang].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Auth CTAs */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
              {isUserAuthenticated ? (
                <>
                  <Link
                    href={getDashboardUrl()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-full text-sm font-semibold bg-[#1B2559] text-white hover:bg-[#131b40] transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <LayoutDashboard className="w-4 h-4 text-teal-400" />
                    <span>{dashboardLabel}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout') || "Déconnexion"}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-full text-sm font-semibold text-[#1B2559] border-2 border-[#1B2559] hover:bg-[#1B2559] hover:text-white transition-all"
                  >
                    {t('nav.login') || "Connexion"}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-full text-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-all shadow-md shadow-purple-200"
                  >
                    {t('nav.register') || "S'inscrire"}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
