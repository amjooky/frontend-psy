"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/components/providers/LanguageProvider';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#1B2559] text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Image src="/logo.png" alt="MonPsy" width={120} height={38} priority style={{ width: 'auto', height: 'auto' }} className="brightness-0 invert object-contain" />
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">{t('footer.navTitle')}</h4>
            <ul className="space-y-3">
              {[
                { key: "accueil", label: t('nav.accueil'), href: "/" },
                { key: "psychologues", label: t('nav.psychologues'), href: "/psychologists" },
                { key: "about", label: t('nav.about'), href: "/about" },
                { key: "contact", label: t('nav.contact'), href: "/contact" }
              ].map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="text-sm text-slate-400 hover:text-[#2EC4B6] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">{t('footer.legalTitle')}</h4>
            <ul className="space-y-3">
              {["Politique de confidentialité", "Conditions d'utilisation", "Mentions légales"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-slate-400 hover:text-[#2EC4B6] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">{t('footer.supportTitle')}</h4>
            <ul className="space-y-3">
              {["Centre d'aide", "Nous contacter", "FAQ"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-slate-400 hover:text-[#2EC4B6] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} MonPsy. {t('footer.rights')}
          </p>
          <p className="text-xs text-slate-500">
            {t('footer.slogan')}
          </p>
        </div>
      </div>
    </footer>
  );
}
