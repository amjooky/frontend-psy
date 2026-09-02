"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, Language } from '@/components/providers/LanguageProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Menu,
  X,
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
  Check
} from 'lucide-react';

/* ─── Animation variants ─── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 }
  })
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

export default function LandingPage() {
  const { language, setLanguage, t, dir } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [showTeaser, setShowTeaser] = useState(false);
  const [currentTeaserText, setCurrentTeaserText] = useState("");

  // States to toggle expanded therapy points list
  const [expandedSection, setExpandedSection] = useState<Record<string, boolean>>({
    individuelle: false,
    couple: false,
    adolescents: false
  });

  const toggleSection = (id: string) => {
    setExpandedSection(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const startQuiz = (therapyKey: string, therapyData: any) => {
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
            ? ["بضعة أيام أو أسابيع", "عدة أشهر", "أكثر من سنة", "تتكرر بشكل متقطع منذ فترة طويلة"]
            : language === 'en'
              ? ["A few days or weeks", "Several months", "Over a year", "On and off for a long time"]
              : ["Quelques jours ou semaines", "Plusieurs mois", "Plus d'un an", "De façon intermittente depuis longtemps"],
          teaser: language === 'ar' ? "الاعتراف بالصعوبات هو نصف الطريق نحو الحل." : language === 'en' ? "Acknowledging struggles is halfway to finding a solution." : "Reconnaître ses difficultés est à mi-chemin de la solution."
        },
        {
          question: language === 'ar' ? "هل تؤثر هذه الصعوبات على حياتك اليومية؟" : language === 'en' ? "Do these difficulties affect your daily life?" : "Ces difficultés affectent-elles votre quotidien ?",
          options: language === 'ar'
            ? ["نعم، بشكل كبير جداً", "نعم، بشكل متوسط", "قليلاً فقط", "لا تؤثر تقريباً"]
            : language === 'en'
              ? ["Yes, significantly", "Yes, moderately", "Only slightly", "Hardly at all"]
              : ["Oui, de manière significative", "Oui, modérément", "Seulement un peu", "Presque pas du tout"],
          teaser: language === 'ar' ? "نحن هنا لمساعدتك على استعادة توازن حياتك اليومية." : language === 'en' ? "We are here to help you restore balance in your daily life." : "Nous sommes là pour vous aider à retrouver l'équilibre au quotidien."
        },
        {
          question: language === 'ar' ? "هل سبق لك استشارة طبيب نفسي؟" : language === 'en' ? "Have you ever consulted a psychologist?" : "Avez-vous déjà consulté un psychologue ?",
          options: language === 'ar'
            ? ["نعم، بانتظام", "نعم، ولكن بشكل متقطع", "لا، هذه المرة الأولى"]
            : language === 'en'
              ? ["Yes, regularly", "Yes, occasionally", "No, this is my first time"]
              : ["Oui, régulièrement", "Oui, mais de façon occasionnelle", "Non, c'est ma première fois"],
          teaser: language === 'ar' ? "سواء كانت تجربتك الأولى أو لا، نحن نضمن لك رعاية مخصصة." : language === 'en' ? "Whether it's your first time or not, we guarantee personalized care." : "Que ce soit votre première fois ou non, nous garantissons des soins personnalisés."
        },
        {
          question: language === 'ar' ? "ما هو التغيير الرئيسي الذي تطمح إليه؟" : language === 'en' ? "What main change are you hoping for?" : "Quel changement principal espérez-vous ?",
          options: language === 'ar'
            ? ["الشعور براحة أكبر وتخفيف التوتر", "فهم أفضل لمشاعري وسلوكي", "تحسين علاقاتي مع الآخرين", "الحصول على دعم في قرار مهم"]
            : language === 'en'
              ? ["Feeling more relaxed and relieved of stress", "Better understanding of my emotions", "Improving relationships with others", "Getting support for an important decision"]
              : ["Me sentir plus apaisé et libéré du stress", "Mieux comprendre mes émotions", "Améliorer mes relations avec les autres", "Obtenir du soutien pour une décision importante"],
          teaser: language === 'ar' ? "وضع أهداف واضحة يسرع من تحقيق النتائج الإيجابية." : language === 'en' ? "Setting clear goals accelerates positive results." : "Définir des objectifs clairs accélère les résultats positifs."
        },
        {
          question: language === 'ar' ? "ما هو شكل الجلسات المفضل لديك؟" : language === 'en' ? "What is your preferred session format?" : "Quel est le format de session que vous préférez ?",
          options: language === 'ar'
            ? ["جلسة فيديو عن بعد (موصى بها)", "مكالمة صوتية فقط", "محادثة كتابية مشفرة"]
            : language === 'en'
              ? ["Online video session (Recommended)", "Audio call only", "Encrypted text chat"]
              : ["Consultation Vidéo (Recommandé)", "Appel audio uniquement", "Chat écrit sécurisé"],
          teaser: language === 'ar' ? "المرونة والراحة هما سر نجاح استشاراتنا." : language === 'en' ? "Flexibility and convenience are the keys to successful consultations." : "La flexibilité et le confort sont les clés d'une consultation réussie."
        }
      ],
      couple: [
        {
          question: language === 'ar' ? "منذ متى تعاني من هذه الصعوبات؟" : language === 'en' ? "How long have you been experiencing these difficulties?" : "Depuis combien de temps observez-vous ces difficultés ?",
          options: language === 'ar'
            ? ["أقل من 6 أشهر", "بين 6 أشهر وسنتين", "عدة سنوات", "نتيجة حدث طارئ مؤخراً"]
            : language === 'en'
              ? ["Less than 6 months", "Between 6 months and 2 years", "Several years", "Triggered by a recent event"]
              : ["Moins de 6 mois", "Entre 6 mois et 2 ans", "Plusieurs années", "Suite à un événement déclencheur récent"],
          teaser: language === 'ar' ? "جميع العلاقات تمر بفترات حرجة، والبحث عن حل هو علامة قوة." : language === 'en' ? "All relationships face challenges; seeking support is a sign of strength." : "Toutes les relations traversent des crises ; chercher de l'aide est un signe de force."
        },
        {
          question: language === 'ar' ? "هل ما زال هناك حوار هادئ بينكما؟" : language === 'en' ? "Is there still calm dialogue between you?" : "Y a-t-il encore un dialogue calme entre vous ?",
          options: language === 'ar'
            ? ["نعم، غالباً", "أحياناً، ولكن سرعان ما يتحول لنقاش حاد", "لا، الحوار مقطوع تماماً", "نتجنب الحديث تماماً لتفادي الخلافات"]
            : language === 'en'
              ? ["Yes, mostly", "Sometimes, but it quickly turns into an argument", "No, dialogue is completely cut off", "We avoid talking to prevent conflicts"]
              : ["Oui, la plupart du temps", "Parfois, mais cela tourne vite à la dispute", "Non, le dialogue est complètement rompu", "Nous évitons de parler pour éviter les conflits"],
          teaser: language === 'ar' ? "إعادة بناء قنوات التواصل هي الركيزة الأولى للعلاج الزوجي." : language === 'en' ? "Rebuilding communication channels is the first pillar of couples therapy." : "Reconstruire les canaux de communication est le premier pilier de la thérapie."
        },
        {
          question: language === 'ar' ? "هل شريكك موافق على فكرة حضور الجلسات؟" : language === 'en' ? "Is your partner willing to attend sessions?" : "Votre partenaire est-il d'accord pour suivre les sessions ?",
          options: language === 'ar'
            ? ["نعم، متفقان تماماً", "شريكي متردد ولكن موافق على التجربة", "لا، يرفض الفكرة حالياً", "لم نتحدث في هذا الموضوع بعد"]
            : language === 'en'
              ? ["Yes, fully agreed", "My partner is hesitant but willing to try", "No, refuses the idea for now", "We haven't discussed this yet"]
              : ["Oui, tout à fait d'accord", "Mon partenaire hésite mais accepte d'essayer", "Non, il/elle refuse pour l'instant", "Nous n'en avons pas encore parlé"],
          teaser: language === 'ar' ? "يمكن بدء الجلسات بشكل فردي لمساعدتك على التعامل مع الوضع." : language === 'en' ? "Sessions can start individually to help you navigate the situation." : "Les séances peuvent commencer individuellement pour vous aider à gérer la situation."
        },
        {
          question: language === 'ar' ? "ما هو الهدف الأساسي من هذه الاستشارة؟" : language === 'en' ? "What is the primary goal of this consultation?" : "Quel est le but principal de cette consultation ?",
          options: language === 'ar'
            ? ["إيجاد حلول للخلافات المتكررة", "استعادة الثقة والحب المفقود", "تسهيل قرار الانفصال بشكل ودي", "تحسين التربية المشتركة للأطفال"]
            : language === 'en'
              ? ["Resolving frequent arguments", "Restoring trust and reconnection", "Facilitating an amicable separation", "Improving co-parenting"]
              : ["Résoudre les disputes fréquentes", "Restaurer la confiance et renouer le lien", "Faciliter une séparation à l'amiable", "Améliorer la coparentalité"],
          teaser: language === 'ar' ? "تحديد هدف مشترك يساعد بشكل كبير في نجاح العملية العلاجية." : language === 'en' ? "Identifying a shared goal greatly supports the therapy process." : "Définir un objectif commun soutient grandement le processus."
        },
        {
          question: language === 'ar' ? "هل تؤثر المشاكل على الجانب الحميمي؟" : language === 'en' ? "Do these problems affect your physical intimacy?" : "Ces problèmes affectent-ils votre intimité physique ?",
          options: language === 'ar'
            ? ["نعم، بشكل كبير", "قليلاً", "لا، هذا الجانب مستقر", "لا نرغب في الإجابة"]
            : language === 'en'
              ? ["Yes, significantly", "Slightly", "No, this area is stable", "Prefer not to answer"]
              : ["Oui, de manière significative", "Légèrement", "Non, cet aspect est préservé", "Ne souhaite pas répondre"],
          teaser: language === 'ar' ? "الحميمية العاطفية والجسدية مرتبطان بشكل وثيق بنجاح العلاقة." : language === 'en' ? "Emotional and physical intimacy are closely linked in a relationship." : "L'intimité émotionnelle et physique sont étroitement liées."
        },
        {
          question: language === 'ar' ? "هل هناك ضغوط خارجية تؤثر على علاقتكما؟" : language === 'en' ? "Are external stressors impacting your relationship?" : "Des facteurs de stress externes impactent-ils votre relation ?",
          options: language === 'ar'
            ? ["نعم، العمل أو المال", "نعم، العائلة أو الأقارب", "نعم، تربية الأطفال", "لا، المشاكل داخلية فقط"]
            : language === 'en'
              ? ["Yes, work or finances", "Yes, family or in-laws", "Yes, raising children", "No, stressors are only internal"]
              : ["Oui, le travail ou l'argent", "Oui, la famille ou l'entourage", "Oui, l'éducation des enfants", "Non, les tensions sont purement internes"],
          teaser: language === 'ar' ? "فهم الضغوط الخارجية يساعد على تخفيف اللوم المتبادل بين الشريكين." : language === 'en' ? "Understanding external stressors helps reduce mutual blame between partners." : "Comprendre les stress externes aide à réduire les reproches mutuels."
        }
      ],
      adolescents: [
        {
          question: language === 'ar' ? "ما هو عمر المراهق المعني بالاستشارة؟" : language === 'en' ? "How old is the teenager concerned?" : "Quel âge a l'adolescent concerné ?",
          options: language === 'ar'
            ? ["11 إلى 13 سنة", "14 إلى 16 سنة", "17 إلى 19 سنة"]
            : language === 'en'
              ? ["11 to 13 years old", "14 to 16 years old", "17 to 19 years old"]
              : ["11 à 13 ans", "14 à 16 ans", "17 à 19 ans"],
          teaser: language === 'ar' ? "تختلف التحديات النفسية والاحتياجات بحسب الفئة العمرية للمراهق." : language === 'en' ? "Psychological challenges and needs vary by the teenager's age." : "Les défis psychologiques et les besoins varient selon l'âge."
        },
        {
          question: language === 'ar' ? "ما هو التغيير السلوكي الأكثر وضوحاً حالياً؟" : language === 'en' ? "What is the most noticeable behavior change?" : "Quel est le changement de comportement le plus marquant ?",
          options: language === 'ar'
            ? ["العزلة والانطواء المفرط", "العدوانية أو العصبية السريعة", "تراجع كبير في التحصيل الدراسي", "تغيرات في النوم أو الشهية"]
            : language === 'en'
              ? ["Extreme isolation and withdrawal", "Aggressiveness or quick temper", "Drop in academic performance", "Changes in sleep or appetite"]
              : ["Isolement et repli sur soi", "Agressivité ou irritabilité rapide", "Baisse des résultats scolaires", "Changements de sommeil/d'appétit"],
          teaser: language === 'ar' ? "التغيرات المفاجئة في السلوك هي بمثابة نداء استغاثة غير مباشر." : language === 'en' ? "Sudden changes in behavior are often an indirect call for help." : "Les changements de comportement sont souvent un appel à l'aide."
        },
        {
          question: language === 'ar' ? "كيف تصف التواصل الأسري معه؟" : language === 'en' ? "How would you describe family communication with them?" : "Comment décririez-vous la communication familiale ?",
          options: language === 'ar'
            ? ["صعب جداً ومليء بالتوتر", "سطحي ونتجنب المواضيع الحساسة", "جيد في بعض الأحيان ومستحيل في أحيان أخرى", "شبه منعدم"]
            : language === 'en'
              ? ["Very difficult and tense", "Superficial, avoiding sensitive topics", "Good at times, impossible at others", "Almost non-existent"]
              : ["Très difficile et tendu", "Superficiel, on évite les sujets sensibles", "Bon par moments, impossible à d'autres", "Quasi inexistant"],
          teaser: language === 'ar' ? "العلاج يساعد في إيجاد حوار آمن وبناء بين الآباء والأبناء." : language === 'en' ? "Therapy helps rebuild safe and constructive dialogue within the family." : "La thérapie aide à retrouver un dialogue sécurisant et constructif."
        },
        {
          question: language === 'ar' ? "هل يواجه مشاكل خارج نطاق العائلة؟" : language === 'en' ? "Do they face challenges outside the family?" : "Rencontre-t-il des difficultés hors du cadre familial ?",
          options: language === 'ar'
            ? ["نعم، تنمر أو مشاكل مع الأصدقاء", "نعم، ضغط دراسي وخوف من الفشل", "نعم، صعوبة في التأقلم أو تكوين صداقات", "لا توجد مشاكل ظاهرة خارج المنزل"]
            : language === 'en'
              ? ["Yes, bullying or friend issues", "Yes, academic stress and fear of failure", "Yes, trouble fitting in or making friends", "No obvious issues outside the home"]
              : ["Oui, harcèlement ou soucis d'amis", "Oui, stress scolaire et peur de l'échec", "Oui, mal à s'adapter ou se faire des amis", "Pas de soucis apparents"],
          teaser: language === 'ar' ? "حماية المراهق ودعمه في بيئته الاجتماعية هي أولويتنا." : language === 'en' ? "Protecting and supporting teens in their social environment is our priority." : "Soutenir l'adolescent dans son environnement social est primordial."
        },
        {
          question: language === 'ar' ? "هل يوافق المراهق على فكرة الحديث مع أخصائي؟" : language === 'en' ? "Is the teen willing to talk to a professional?" : "L'adolescent accepte-t-il de parler à un professionnel ?",
          options: language === 'ar'
            ? ["نعم، بطلب منه شخصياً", "موافق على التجربة بشرط الخصوصية", "متردد أو يرفض الفكرة", "لم نطرح عليه الفكرة بعد"]
            : language === 'en'
              ? ["Yes, requested it themselves", "Agrees if privacy is guaranteed", "Hesitant or refuses the idea", "We haven't proposed it yet"]
              : ["Oui, à sa propre demande", "D'accord si la confidentialité est garantie", "Hésitant ou refuse l'idée", "Nous ne lui avons pas proposé"],
          teaser: language === 'ar' ? "سرية الجلسات تمنح المراهق الأمان الكامل للتعبير عن نفسه بحرية." : language === 'en' ? "Strict confidentiality gives teens a safe space to express themselves." : "La confidentialité stricte offre à l'ado l'espace pour s'exprimer."
        },
        {
          question: language === 'ar' ? "هل تلاحظ استخداماً مفرطاً للشاشات؟" : language === 'en' ? "Do you notice excessive screen use?" : "Remarquez-vous un usage excessif des écrans ?",
          options: language === 'ar'
            ? ["نعم، يؤثر على نومه ودراسته", "نعم، ولكن ضمن الحدود المقبولة", "لا، استخدام طبيعي ومتوازن", "لا أعرف بدقة"]
            : language === 'en'
              ? ["Yes, affecting sleep and school", "Yes, but within limits", "No, balanced usage", "I don't know exactly"]
              : ["Oui, affecte le sommeil et l'école", "Oui, mais dans la limite du raisonnable", "Non, usage équilibré", "Je ne sais pas précisément"],
          teaser: language === 'ar' ? "التوازن الرقمي يعزز الصحة النفسية والقدرات الذهنية للشباب." : language === 'en' ? "Digital balance promotes positive mental health in young people." : "L'équilibre numérique favorise une bonne santé mentale."
        }
      ]
    }[therapyKey as 'individuelle' | 'couple' | 'adolescents'] || [];

    setActiveQuiz({
      key: therapyKey,
      title: therapyData.title,
      iconColor: therapyData.iconColor,
      questions
    });
    setCurrentQuestionIdx(0);
    setQuizAnswers([]);
    setShowTeaser(false);
  };

  const handleAnswerSelect = (answer: string) => {
    const nextAnswers = [...quizAnswers, answer];
    setQuizAnswers(nextAnswers);

    const currentQuestion = activeQuiz.questions[currentQuestionIdx];
    if (currentQuestion.teaser) {
      setCurrentTeaserText(currentQuestion.teaser);
      setShowTeaser(true);
    } else {
      goToNextQuestion();
    }
  };

  const goToNextQuestion = () => {
    setShowTeaser(false);
    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setCurrentQuestionIdx(activeQuiz.questions.length);
    }
  };

  const languages: Record<Language, { label: string; flag: string }> = {
    fr: { label: "Français", flag: "🇫🇷" },
    en: { label: "English", flag: "🇬🇧" },
    ar: { label: "العربية", flag: "🇹🇳" }
  };

  const therapySections = [
    {
      id: "individuelle",
      color: "bg-emerald-50",
      borderColor: "border-emerald-100",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      btnBg: "bg-[#1B3A5C]",
      btnText: "text-white",
      image: "/therapy-individual.png"
    },
    {
      id: "couple",
      color: "bg-orange-50",
      borderColor: "border-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      btnBg: "bg-orange-500",
      btnText: "text-white",
      image: "/therapy-couple.png"
    },
    {
      id: "adolescents",
      color: "bg-rose-50",
      borderColor: "border-rose-100",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      btnBg: "bg-rose-500",
      btnText: "text-white",
      image: "/therapy-adolescent.png"
    }
  ];

  const whyChooseFeatures = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: t('why.confidentialityTitle'),
      description: t('why.confidentialityDesc'),
      color: "text-teal-500",
      bg: "bg-teal-50",
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: t('why.psychologistsTitle'),
      description: t('why.psychologistsDesc'),
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: <MonitorSmartphone className="w-6 h-6" />,
      title: t('why.onlineTitle'),
      description: t('why.onlineDesc'),
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: <CalendarCheck className="w-6 h-6" />,
      title: t('why.easyTitle'),
      description: t('why.easyDesc'),
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden selection:bg-teal-200 selection:text-teal-900 font-outfit" dir={dir}>

      <Navbar />

      {/* ════════════════════════════════════════
          2. HERO SECTION
      ════════════════════════════════════════ */}
      <section className="relative pt-28 lg:pt-32 pb-16 lg:pb-20 px-6 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
        {/* Subtle background decoration */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-50/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left column — Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className={`order-2 lg:order-1 ${dir === 'rtl' ? 'lg:text-right' : 'lg:text-left'}`}
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} custom={0}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold text-purple-700 tracking-wide">
                    {t('hero.badge')}
                  </span>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeInUp}
                custom={1}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] mb-5 text-[#1B2559]"
              >
                {t('hero.title1')}{" "}
                <br className="hidden sm:block" />
                {t('hero.title2')}{" "}
                <span className="text-[#2EC4B6] relative">
                  {t('hero.trust')}
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="#2EC4B6" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeInUp}
                custom={2}
                className="text-base lg:text-lg text-slate-500 max-w-lg mb-8 leading-relaxed font-light"
              >
                {t('hero.desc')}
              </motion.p>

              {/* Feature badges */}
              <motion.div
                variants={fadeInUp}
                custom={3}
                className={`flex flex-wrap gap-3 ${dir === 'rtl' ? 'justify-start' : ''}`}
              >
                {[
                  { icon: <Shield className="w-4 h-4" />, label: t('hero.confidential') },
                  { icon: <Award className="w-4 h-4" />, label: t('hero.certified') },
                  { icon: <Lock className="w-4 h-4" />, label: t('hero.secure') },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-700 hover:border-teal-200 hover:shadow-md transition-all"
                  >
                    <span className="text-[#2EC4B6]">{badge.icon}</span>
                    {badge.label}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right column — Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="order-1 lg:order-2 relative flex items-center justify-center"
            >
              {/* Floating icons around the illustration */}
              <div className="absolute -top-2 right-1/4 z-20 animate-float">
                <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] shadow-lg shadow-purple-200 flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="absolute top-1/4 -right-2 lg:right-4 z-20 animate-float-delayed">
                <div className="w-10 h-10 rounded-xl bg-[#2EC4B6] shadow-lg shadow-teal-200 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="absolute bottom-1/4 -left-2 lg:left-8 z-20 animate-float-slow">
                <div className="w-10 h-10 rounded-xl bg-blue-500 shadow-lg shadow-blue-200 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Main illustration */}
              <div className="relative w-full max-w-md lg:max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-100/40 via-purple-100/30 to-blue-100/40 rounded-[2rem] blur-xl" />
                <Image
                  src="/hero-illustration.png"
                  alt="Illustration d'une salle de thérapie confortable"
                  width={520}
                  height={420}
                  className="relative z-10 w-full h-auto object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. MOTIVATIONAL BANNER
      ════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 px-6 bg-gradient-to-r from-slate-50 via-[#F0EDFF] to-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/30 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1B2559] leading-snug">
            {t('banner.quote')}
          </h2>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          4. THERAPY TYPES SECTION
      ════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1B2559]">
              {t('therapy.title')}
            </h2>
          </motion.div>

          {/* Cards — 2 top, 1 centered bottom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {therapySections.slice(0, 2).map((style, idx) => {
              const isExpanded = expandedSection[style.id];
              const info = {
                title: t(`therapy.types.${style.id}.title`),
                desc: t(`therapy.types.${style.id}.desc`),
                points: t(`therapy.types.${style.id}.points`) as string[]
              };
              const visiblePoints = isExpanded ? info.points : info.points.slice(0, 5);

              return (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className={`relative rounded-3xl ${style.color} border ${style.borderColor} p-7 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
                >
                  <div>
                    {/* Illustration */}
                    <div className="flex justify-end mb-4">
                      <div className="w-28 h-28 relative">
                        <Image
                          src={style.image}
                          alt={info.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-[#1B2559] mb-2">{info.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{info.desc}</p>

                    <ul className="space-y-2 mb-6">
                      {visiblePoints.map((point) => (
                        <li key={point} className="flex items-center gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${style.iconColor}`} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => toggleSection(style.id)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all flex items-center gap-1"
                    >
                      {isExpanded ? t('therapy.less') : t('therapy.more')}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <button
                      onClick={() => startQuiz(style.id, info)}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold ${style.btnBg} ${style.btnText} hover:opacity-90 transition-all shadow-md`}
                    >
                      {t('therapy.startTest')}
                      <ArrowRight className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Centered third card */}
          <div className="flex justify-center mt-8">
            {(() => {
              const style = therapySections[2];
              const isExpanded = expandedSection[style.id];
              const info = {
                title: t(`therapy.types.${style.id}.title`),
                desc: t(`therapy.types.${style.id}.desc`),
                points: t(`therapy.types.${style.id}.points`) as string[]
              };
              const visiblePoints = isExpanded ? info.points : info.points.slice(0, 5);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={`relative rounded-3xl ${style.color} border ${style.borderColor} p-7 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full max-w-md md:max-w-lg flex flex-col justify-between`}
                >
                  <div>
                    {/* Illustration */}
                    <div className="flex justify-end mb-4">
                      <div className="w-28 h-28 relative">
                        <Image
                          src={style.image}
                          alt={info.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#1B2559] mb-2">{info.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{info.desc}</p>

                    <ul className="space-y-2 mb-6">
                      {visiblePoints.map((point) => (
                        <li key={point} className="flex items-center gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${style.iconColor}`} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => toggleSection(style.id)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all flex items-center gap-1"
                    >
                      {isExpanded ? t('therapy.less') : t('therapy.more')}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <button
                      onClick={() => startQuiz(style.id, info)}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold ${style.btnBg} ${style.btnText} hover:opacity-90 transition-all shadow-md`}
                    >
                      {t('therapy.startTest')}
                      <ArrowRight className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════
          EASY QUESTIONNAIRE MODAL WITH TEASERS
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir={dir}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${(activeQuiz.iconColor || 'text-teal-600').replace('text', 'bg')}`} />
                  <h3 className="font-bold text-[#1B2559] text-base">{activeQuiz.title}</h3>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full bg-slate-100">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, ((currentQuestionIdx) / activeQuiz.questions.length) * 100)}%`
                  }}
                />
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 flex-1 min-h-[360px] flex flex-col justify-center">
                {showTeaser ? (
                  /* Teaser Intermission Screen */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center space-y-6 py-6"
                  >
                    <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100 animate-pulse">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Note de notre équipe</h4>
                      <p className="text-base font-medium text-slate-700 max-w-sm mx-auto leading-relaxed italic">
                        &quot;{currentTeaserText}&quot;
                      </p>
                    </div>
                    <button
                      onClick={goToNextQuestion}
                      className="px-6 py-2.5 rounded-full bg-[#1B3A5C] text-white text-sm font-semibold hover:opacity-90 shadow-md transition-all inline-flex items-center gap-1.5"
                    >
                      <span>Continuer</span>
                      <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </button>
                  </motion.div>
                ) : currentQuestionIdx < activeQuiz.questions.length ? (
                  /* Question Display */
                  <div className="space-y-6">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {t('therapy.question')} {currentQuestionIdx + 1} {t('therapy.of')} {activeQuiz.questions.length}
                    </span>
                    <h4 className="text-lg font-bold text-[#1B2559] leading-snug">
                      {activeQuiz.questions[currentQuestionIdx].question}
                    </h4>

                    <div className="grid gap-3 pt-2">
                      {activeQuiz.questions[currentQuestionIdx].options.map((option: string) => (
                        <button
                          key={option}
                          onClick={() => handleAnswerSelect(option)}
                          className={`w-full p-4 rounded-xl text-left border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 text-sm font-medium text-slate-700 hover:text-teal-900 transition-all duration-150 flex items-center justify-between group ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''
                            }`}
                        >
                          {option}
                          <ChevronRight className={`w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-all ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
                            }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Quiz Completed State */
                  <div className="text-center py-6 space-y-6">
                    <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center mx-auto border border-teal-100">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-[#1B2559]">{t('therapy.completed')}</h4>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                        {t('therapy.completedDesc')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-500 flex gap-2.5 items-start">
                      <Info className="w-4.5 h-4.5 text-teal-500 shrink-0 mt-0.5" />
                      <p className={`${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        {t('therapy.infoText')}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4 justify-center">
                      <button
                        onClick={() => setActiveQuiz(null)}
                        className="px-6 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        {t('therapy.close')}
                      </button>
                      <Link
                        href="/register"
                        className="px-6 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold shadow-lg shadow-purple-100 transition-all flex items-center gap-1.5"
                      >
                        {t('therapy.findPsy')}
                        <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          5. WHY CHOOSE MONPSY
      ════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-6 bg-slate-50/80">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1B2559]">
              {t('why.title').split('?')[0]}{" "}
              <span className="text-[#2EC4B6]">MonPsy</span> {t('why.title').includes('?') ? '?' : ''}
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {whyChooseFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                custom={idx}
                className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <span className={feature.color}>{feature.icon}</span>
                </div>
                <h3 className="text-base font-bold text-[#1B2559] mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          6. CTA SECTION
      ════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] rounded-3xl p-10 md:p-16 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
              {t('cta.title')}
            </h2>
            <p className="text-purple-200 text-base md:text-lg mb-8 max-w-xl mx-auto relative z-10">
              {t('cta.desc')}
            </p>
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#7C3AED] font-bold text-sm hover:bg-purple-50 shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
              >
                {t('cta.start')}
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
              </Link>
              <Link
                href="/psychologists"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                {t('cta.browse')}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          7. FOOTER
      ════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
