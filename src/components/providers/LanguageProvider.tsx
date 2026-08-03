"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'en' | 'ar';

export interface TranslationDict {
  [key: string]: any;
}

const translations: Record<Language, TranslationDict> = {
  fr: {
    nav: {
      accueil: "Accueil",
      psychologues: "Psychologues",
      about: "A propos",
      conseils: "Conseils",
      contact: "Contact",
      login: "Se connecter",
      register: "S'inscrire",
      logout: "Se déconnecter",
      overview: "Vue d'ensemble",
      appointments: "Rendez-vous",
      messaging: "Messagerie",
      documents: "Documents",
      support: "Support",
      profile: "Profil",
      schedule: "Disponibilités",
      certificates: "Diplômes",
      dashboard: "Console Admin",
      users: "Contrôle Utilisateurs",
      payments: "Paiements"
    },
    hero: {
      badge: "Prenez soin de votre santé mentale",
      title1: "consultez un psychologue",
      title2: "en ligne, en toute",
      trust: "confiance",
      desc: "Réservez facilement une consultation en ligne avec un psychologue certifié, depuis chez vous.",
      confidential: "100% Confidentiel",
      certified: "Psychologues certifiés",
      secure: "Consultations sécurisées"
    },
    banner: {
      quote: "Chaque étape vers le mieux-être commence par une simple conversation."
    },
    therapy: {
      title: "Choisissez le type de thérapie que vous convient",
      more: "Voir plus d'expertises",
      less: "Voir moins",
      startTest: "Démarrer le test",
      modalTitle: "Questionnaire d'orientation",
      question: "Question",
      of: "sur",
      completed: "Test complété !",
      completedDesc: "Vos réponses indiquent que cette thérapie est particulièrement adaptée à vos besoins actuels.",
      infoText: "Vos réponses vont nous aider à vous mettre en relation avec le thérapeute le plus qualifié.",
      close: "Fermer",
      findPsy: "Trouver mon psy",
      types: {
        individuelle: {
          title: "Thérapie individuelle",
          desc: "Un accompagnement personnalisé pour votre bien-être mental et émotionnel.",
          points: [
            "Gestion du stress",
            "Anxiété et crises d'angoisse",
            "Dépression",
            "Burn-out et épuisement professionnel",
            "Estime et confiance en soi",
            "Gestion des émotions",
            "Deuil et perte d'un proche",
            "Difficultés relationnelles",
            "Développement personnel",
            "Traumatismes psychologiques"
          ]
        },
        couple: {
          title: "Thérapie de couple",
          desc: "Renforcez votre relation et surmontez les difficultés avec l'accompagnement d'un professionnel.",
          points: [
            "Difficultés de communication",
            "Conflits de couple",
            "Infidélité et perte de confiance",
            "Jalousie",
            "Thérapie conjugale",
            "Difficultés liées à la parentalité",
            "Séparation ou divorce",
            "Préparation au mariage",
            "Intimité et vie sexuelle",
            "Renforcer la relation et retrouver la complicité"
          ]
        },
        adolescents: {
          title: "Thérapie pour adolescents",
          desc: "Un soutien adapté pour aider les jeunes et leurs parents à surmonter les défis de l'adolescence.",
          points: [
            "Difficultés scolaires",
            "Anxiété et stress",
            "Estime et confiance en soi",
            "Troubles du comportement",
            "Gestion des émotions",
            "Harcèlement scolaire",
            "Difficultés familiales",
            "Dépression chez l'adolescent",
            "Addiction aux écrans et aux réseaux sociaux",
            "Orientation scolaire et difficultés d'adaptation"
          ]
        }
      }
    },
    why: {
      title: "Pourquoi choisir MonPsy ?",
      confidentialityTitle: "Confidentialité garantie",
      confidentialityDesc: "Vos informations sont protégées et sécurisées.",
      psychologistsTitle: "Psychologues certifiés",
      psychologistsDesc: "Des professionnels qualifiés et vérifiés pour vous accompagner.",
      onlineTitle: "Consultations en ligne",
      onlineDesc: "Vidéo, audio ou chat, choisissez le format qui vous convient.",
      easyTitle: "Réservation facile",
      easyDesc: "Trouvez le créneau idéal et réservez en quelques clics."
    },
    cta: {
      title: "Prêt à prendre soin de vous ?",
      desc: "Rejoignez des milliers de personnes qui ont fait le premier pas vers le mieux-être avec MonPsy.",
      start: "Commencer maintenant",
      browse: "Voir nos psychologues"
    },
    footer: {
      desc: "Prenez soin de votre santé mentale avec des professionnels certifiés.",
      navTitle: "Navigation",
      legalTitle: "Légal",
      supportTitle: "Support",
      rights: "Tous droits réservés.",
      slogan: "Prenez soin de votre santé mentale"
    }
  },
  en: {
    nav: {
      accueil: "Home",
      psychologues: "Psychologists",
      about: "About",
      conseils: "Tips",
      contact: "Contact",
      login: "Sign In",
      register: "Sign Up",
      logout: "Sign Out",
      overview: "Overview",
      appointments: "Appointments",
      messaging: "Messaging",
      documents: "Documents",
      support: "Support",
      profile: "Profile",
      schedule: "Schedule",
      certificates: "Certificates",
      dashboard: "Admin Console",
      users: "User Control",
      payments: "Payments"
    },
    hero: {
      badge: "Take care of your mental health",
      title1: "consult a psychologist",
      title2: "online, with total",
      trust: "confidence",
      desc: "Easily book an online consultation with a certified psychologist, right from your home.",
      confidential: "100% Confidential",
      certified: "Certified Specialists",
      secure: "Secure Consultations"
    },
    banner: {
      quote: "Every step towards well-being begins with a simple conversation."
    },
    therapy: {
      title: "Choose the type of therapy that fits you best",
      more: "View more expertises",
      less: "View less",
      startTest: "Start the test",
      modalTitle: "Orientation Questionnaire",
      question: "Question",
      of: "of",
      completed: "Test completed!",
      completedDesc: "Your answers suggest that this therapy is particularly suited for your current needs.",
      infoText: "Your answers will help us match you with the most qualified therapist.",
      close: "Close",
      findPsy: "Find my therapist",
      types: {
        individuelle: {
          title: "Individual Therapy",
          desc: "Personalized support for your mental and emotional well-being.",
          points: [
            "Stress management",
            "Anxiety & panic attacks",
            "Depression",
            "Burnout & work exhaustion",
            "Self-esteem & confidence",
            "Emotional regulation",
            "Grief & loss",
            "Relationship issues",
            "Personal growth",
            "Psychological trauma"
          ]
        },
        couple: {
          title: "Couples Therapy",
          desc: "Strengthen your relationship and overcome difficulties with professional guidance.",
          points: [
            "Communication difficulties",
            "Relationship conflicts",
            "Infidelity & trust issues",
            "Jealousy",
            "Marital therapy",
            "Parenting challenges",
            "Separation or divorce",
            "Marriage preparation",
            "Intimacy & sexual life",
            "Rebuild connection & intimacy"
          ]
        },
        adolescents: {
          title: "Adolescent Therapy",
          desc: "Tailored support to help teens and parents navigate the challenges of adolescence.",
          points: [
            "Academic difficulties",
            "Anxiety & stress",
            "Self-esteem & confidence",
            "Behavioral issues",
            "Emotional regulation",
            "School bullying",
            "Family difficulties",
            "Teenage depression",
            "Screen & social media addiction",
            "School orientation & adaptation issues"
          ]
        }
      }
    },
    why: {
      title: "Why choose MonPsy?",
      confidentialityTitle: "Guaranteed Privacy",
      confidentialityDesc: "Your details are protected and fully secure.",
      psychologistsTitle: "Certified Therapists",
      psychologistsDesc: "Vetted and qualified professionals to support you.",
      onlineTitle: "Online Consultations",
      onlineDesc: "Video, audio, or text chat: choose the format that suits you.",
      easyTitle: "Easy Booking",
      easyDesc: "Find the ideal slot and book in just a few clicks."
    },
    cta: {
      title: "Ready to take care of yourself?",
      desc: "Join thousands of people who took the first step towards well-being with MonPsy.",
      start: "Get Started Now",
      browse: "Browse Psychologists"
    },
    footer: {
      desc: "Take care of your mental health with certified professionals.",
      navTitle: "Navigation",
      legalTitle: "Legal",
      supportTitle: "Support",
      rights: "All rights reserved.",
      slogan: "Take care of your mental health"
    }
  },
  ar: {
    nav: {
      accueil: "الرئيسية",
      psychologues: "الأطباء النفسيون",
      about: "من نحن",
      conseils: "نصائح",
      contact: "اتصل بنا",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      logout: "تسجيل الخروج",
      overview: "لوحة التحكم",
      appointments: "المواعيد",
      messaging: "المراسلة",
      documents: "الملفات",
      support: "الدعم الفني",
      profile: "الملف الشخصي",
      schedule: "الأوقات المتاحة",
      certificates: "الشهادات",
      dashboard: "إدارة النظام",
      users: "التحكم بالمستخدمين",
      payments: "المدفوعات"
    },
    hero: {
      badge: "اعتنِ بصحتك النفسية والذهنية",
      title1: "استشر طبيبًا نفسيًا",
      title2: "عبر الإنترنت، بكل",
      trust: "أمان وثقة",
      desc: "احجز بسهولة جلسة استشارية عبر الإنترنت مع أخصائي مرخص من منزلك وبكل خصوصية.",
      confidential: "سرية تامة 100%",
      certified: "أطباء نفسيون معتمدون",
      secure: "استشارات آمنة تمامًا"
    },
    banner: {
      quote: "كل خطوة نحو حياة أفضل تبدأ بمحادثة بسيطة."
    },
    therapy: {
      title: "اختر نوع العلاج النفسي المناسب لك",
      more: "عرض المزيد من التخصصات",
      less: "عرض أقل",
      startTest: "ابدأ الاختبار",
      modalTitle: "اختبار التوجيه والاستشارة",
      question: "السؤال",
      of: "من",
      completed: "اكتمل الاختبار بنجاح!",
      completedDesc: "تشير إجاباتك إلى أن هذا النوع من العلاج النفسي ملائم جدًا لاحتياجاتك الحالية.",
      infoText: "ستساعدنا إجاباتك في إيصالك بالطبيب النفسي الأكثر ملاءمة لحالتك.",
      close: "إغلاق",
      findPsy: "ابحث عن طبيبي النفسي",
      types: {
        individuelle: {
          title: "علاج نفسي فردي",
          desc: "دعم شخصي مخصص لمساعدتك في تحسين سلامتك النفسية والعاطفية.",
          points: [
            "التعامل مع الضغوطات اليومية",
            "القلق ونوبات الهلع",
            "الاكتئاب ومواجهة الحزن",
            "الاحتراق النفسي والإرهاق المهني",
            "تقدير الذات وبناء الثقة بالنفس",
            "التحكم في المشاعر والعواطف",
            "التعامل مع الفقد والحداد",
            "المشاكل والصعوبات العلاقاتية",
            "التطوير الذاتي والشخصي",
            "الصدمات النفسية"
          ]
        },
        couple: {
          title: "علاج العلاقات والأزواج",
          desc: "عزز علاقتك وتغلب على التحديات الزوجية بمساعدة وتوجيه أخصائي علاقات مرخص.",
          points: [
            "صعوبات التواصل والتفاهم",
            "الخلافات والصراعات الزوجية",
            "الخيانة الزوجية واستعادة الثقة",
            "الغيرة الشديدة والشك",
            "الإرشاد والتربية الأسرية",
            "تحديات وصعوبات الأبوة",
            "الطلاق أو الانفصال",
            "التأهيل والإعداد للزواج",
            "الحياة الزوجية والحميمة",
            "تعزيز العلاقة واستعادة الألفة"
          ]
        },
        adolescents: {
          title: "العلاج النفسي للمراهقين",
          desc: "دعم متخصص لمساعدة اليافعين وأولياء أمورهم في تجاوز تحديات مرحلة المراهقة الصعبة.",
          points: [
            "الصعوبات والمشاكل الدراسية",
            "القلق والتوتر المستمر",
            "بناء تقدير وثقة الذات",
            "الاضطرابات السلوكية",
            "التحكم في العواطف وتقلب المزاج",
            "مواجهة التنمر المدرسي",
            "المشاكل والخلافات الأسرية",
            "اكتئاب المراهقين",
            "إدمان الشاشات ومنصات التواصل الاجتماعي",
            "التوجيه الدراسي وصعوبات التكيف"
          ]
        }
      }
    },
    why: {
      title: "لماذا تختار MonPsy ؟",
      confidentialityTitle: "خصوصية وسرية مضمونة",
      confidentialityDesc: "جميع بياناتك ومعلوماتك محمية ومشفرة بالكامل.",
      psychologistsTitle: "أخصائيون معتمدون",
      psychologistsDesc: "نخبة من الأطباء النفسيين المرخصين والمؤهلين لمساعدتك.",
      onlineTitle: "استشارات مرنة",
      onlineDesc: "جلسات عبر الفيديو، الصوت أو المحادثة الكتابية كما تحب.",
      easyTitle: "حجز سهل وسريع",
      easyDesc: "اعثر على الموعد المناسب لك وقم بالحجز في دقائق معدودة."
    },
    cta: {
      title: "هل أنت مستعد لبدء رحلة التغيير ؟",
      desc: "انضم إلى آلاف الأشخاص الذين خطوا خطوتهم الأولى نحو حياة أفضل مع MonPsy.",
      start: "ابدأ الآن",
      browse: "تصفح قائمة الأطباء"
    },
    footer: {
      desc: "اعتنِ بصحتك النفسية والذهنية مع أخصائيين نفسيين معتمدين.",
      navTitle: "روابط سريعة",
      legalTitle: "الشروط القانونية",
      supportTitle: "الدعم والمساعدة",
      rights: "جميع الحقوق محفوظة.",
      slogan: "اعتنِ بصحتك النفسية"
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => any;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'fr' || savedLang === 'en' || savedLang === 'ar')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = translations[language];
    for (const key of keys) {
      if (current[key] === undefined) {
        return path;
      }
      current = current[key];
    }
    return current;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
