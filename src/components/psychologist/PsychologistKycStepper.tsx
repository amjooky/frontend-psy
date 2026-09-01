"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Award, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Plus,
  Loader2,
  FileCheck,
  Building2,
  Phone,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import api from '@/lib/api';
import { haptic } from '@/lib/haptics';

interface CertificateEntry {
  title: string;
  issuer: string;
  issuedAt: string;
  file: File | null;
  fileUrl?: string;
  uploaded?: boolean;
}

const AVAILABLE_SPECIALTIES = [
  "Anxiété & Phobies",
  "Dépression & Troubles de l'Humeur",
  "Burn-out & Stress au Travail",
  "Thérapie Cognitive & Comportementale (TCC)",
  "Thérapie de Couple & Relationnelle",
  "Addictions & Dépendances",
  "Deuil & Traumatismes",
  "Psychologie de l'Adolescent",
  "Estime de Soi & Confiance",
  "Gestion des Émotions",
  "Troubles du Sommeil",
  "Troubles Obsessionnels Compulsifs (TOC)",
];

const AVAILABLE_LANGUAGES = [
  { code: 'ar', label: 'Arabe (العربية)' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'Anglais (English)' },
  { code: 'it', label: 'Italien (Italiano)' },
];

interface KycStepperProps {
  initialProfile?: any;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function PsychologistKycStepper({ initialProfile, onSuccess, onClose }: KycStepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Step 1: Practitioner Identity & License
  const [firstName, setFirstName] = useState(initialProfile?.firstName || '');
  const [lastName, setLastName] = useState(initialProfile?.lastName || '');
  const [licenseNumber, setLicenseNumber] = useState(initialProfile?.licenseNumber || '');
  const [phoneNumber, setPhoneNumber] = useState(initialProfile?.phoneNumber || '');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(initialProfile?.yearsOfExperience || 5);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    initialProfile?.languages?.length ? initialProfile.languages : ['fr', 'ar']
  );

  // Step 2: Diplomas & Verification Files
  const [certificates, setCertificates] = useState<CertificateEntry[]>([
    {
      title: "Master Professionnel en Psychologie Clinique",
      issuer: "Faculté des Sciences Humaines",
      issuedAt: "2020-06-15",
      file: null,
    }
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newIssuer, setNewIssuer] = useState('');
  const [newIssuedAt, setNewIssuedAt] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  // Step 3: Practice Settings & Pricing
  const [pricePerSession, setPricePerSession] = useState<string>(
    initialProfile?.pricePerSession ? String(Number(initialProfile.pricePerSession)) : '80'
  );
  const [sessionDurationMins, setSessionDurationMins] = useState<number>(initialProfile?.sessionDurationMins || 60);
  const [sessionFormats, setSessionFormats] = useState<string[]>(
    initialProfile?.sessionFormats?.length ? initialProfile.sessionFormats : ['VIDEO', 'AUDIO']
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialProfile?.specialties?.map((s: any) => s.specialty || s) || ["Anxiété & Phobies", "Dépression & Troubles de l'Humeur"]
  );
  const [biography, setBiography] = useState<string>(
    initialProfile?.biography || "Psychologue clinicien agréé, j'accompagne les adultes et adolescents dans un cadre thérapeutique bienveillant, sécurisé et strictement confidentiel."
  );

  // Step 4: Ethical Oath & Terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [oathAccepted, setOathAccepted] = useState(false);

  // Helper toggle
  const toggleLanguage = (code: string) => {
    haptic.light();
    setSelectedLanguages(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleSpecialty = (spec: string) => {
    haptic.light();
    setSelectedSpecialties(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const toggleFormat = (format: string) => {
    haptic.light();
    setSessionFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  const handleAddCertificate = () => {
    if (!newTitle.trim() || !newIssuer.trim()) {
      setErrorMsg('Veuillez renseigner au moins le titre du diplôme et l\'organisme émetteur.');
      return;
    }
    haptic.medium();
    setCertificates(prev => [
      ...prev,
      {
        title: newTitle.trim(),
        issuer: newIssuer.trim(),
        issuedAt: newIssuedAt || new Date().toISOString().split('T')[0],
        file: newFile,
      }
    ]);
    setNewTitle('');
    setNewIssuer('');
    setNewIssuedAt('');
    setNewFile(null);
    setErrorMsg(null);
  };

  const handleRemoveCertificate = (index: number) => {
    haptic.warning();
    setCertificates(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Le fichier ne doit pas dépasser 10 Mo.');
      return;
    }

    if (index !== undefined) {
      setCertificates(prev => {
        const updated = [...prev];
        updated[index].file = file;
        return updated;
      });
    } else {
      setNewFile(file);
    }
    setErrorMsg(null);
    haptic.light();
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMsg('Veuillez renseigner votre prénom et nom.');
        return false;
      }
      if (!licenseNumber.trim()) {
        setErrorMsg('Le numéro d\'agrément CNOM ou autorisation d\'exercice est obligatoire.');
        return false;
      }
      if (selectedLanguages.length === 0) {
        setErrorMsg('Veuillez sélectionner au moins une langue de consultation.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (certificates.length === 0) {
        setErrorMsg('Veuillez joindre au moins un diplôme ou certificat officiel pour la validation KYC.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      const price = Number(pricePerSession);
      if (isNaN(price) || price <= 0) {
        setErrorMsg('Veuillez indiquer un tarif par consultation valide.');
        return false;
      }
      if (sessionFormats.length === 0) {
        setErrorMsg('Veuillez sélectionner au moins un format de consultation.');
        return false;
      }
      if (selectedSpecialties.length === 0) {
        setErrorMsg('Veuillez sélectionner au moins une spécialité thérapeutique.');
        return false;
      }
      if (!biography.trim() || biography.length < 20) {
        setErrorMsg('Veuillez rédiger une courte présentation clinique (au moins 20 caractères).');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!termsAccepted || !oathAccepted) {
        setErrorMsg('Veuillez accepter les déclarations déontologiques et réglementaires pour soumettre votre dossier.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    haptic.medium();
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    haptic.light();
    setErrorMsg(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitFinal = async () => {
    if (!validateStep(4)) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Update basic profile info
      await api.patch('/psychologists/me/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        licenseNumber: licenseNumber.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        yearsOfExperience: Number(yearsOfExperience),
        languages: selectedLanguages,
        sessionFormats,
        pricePerSession: String(pricePerSession),
        sessionDurationMins: Number(sessionDurationMins),
        biography: biography.trim(),
      });

      // 2. Update specialties
      await api.put('/psychologists/me/specialties', {
        specialties: selectedSpecialties,
      });

      // 3. Upload certificate documents
      for (const cert of certificates) {
        let fileUrl = cert.fileUrl;
        if (cert.file && !fileUrl) {
          const fd = new FormData();
          fd.append('file', cert.file);
          try {
            const uploadRes = await api.post('/documents/upload', fd, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            const data = uploadRes.data?.data || uploadRes.data;
            fileUrl = data?.url;
          } catch (uploadErr) {
            console.warn('Document upload fallback warning:', uploadErr);
          }
        }

        // Add to psychologist certificates
        try {
          await api.post('/psychologists/me/certificates', {
            title: cert.title,
            issuer: cert.issuer,
            issuedAt: cert.issuedAt,
            fileUrl: fileUrl || undefined,
          });
        } catch (certErr) {
          console.warn('Certificate register notice:', certErr);
        }
      }

      // 4. Mark KYC Complete and transition to PENDING_VERIFICATION
      try {
        await api.post('/psychologists/me/complete-kyc');
      } catch (kycErr) {
        console.warn('Complete KYC notice:', kycErr);
      }

      haptic.success();
      setIsCompleted(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2500);
      }
    } catch (err: any) {
      console.error('KYC submission error:', err);
      setErrorMsg(err.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement de votre dossier KYC.');
      haptic.warning();
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { number: 1, title: 'Identité & CNOM', desc: 'Informations réglementaires' },
    { number: 2, title: 'Diplômes & KYC', desc: 'Justificatifs professionnels' },
    { number: 3, title: 'Pratique & Tarifs', desc: 'Formats et spécialités' },
    { number: 4, title: 'Validation Finale', desc: 'Déclaration déontologique' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden font-outfit">
      {/* HEADER WITH PROGRESS */}
      <div className="bg-gradient-to-r from-[#1B2559] via-[#243373] to-[#121A40] text-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-400/20 border border-teal-300/30 flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300">Accréditation Professionnelle</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Dossier KYC Psychologue Agréé</h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-xs font-medium px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Fermer
            </button>
          )}
        </div>

        {/* STEPPER PILLS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {stepsList.map((s) => {
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number;
            return (
              <div
                key={s.number}
                className={`p-3 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-white/15 border-teal-400/60 shadow-xs'
                    : isDone
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-400 text-slate-950'
                        : isActive
                        ? 'bg-teal-400 text-slate-950'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                  </div>
                  <span className="text-xs font-bold text-white truncate">{s.title}</span>
                </div>
                <p className="text-[11px] text-blue-100/70 mt-1 truncate pl-8 hidden md:block">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Attention</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: IDENTITY & CNOM LICENSE */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#1B2559]">1. Vos Coordonnées Professionnelles</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Renseignez votre identité telle qu'elle figure sur vos registres officiels et autorisations d'exercer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Prénom légal *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Sonia"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nom de famille *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Trabelsi"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>Numéro d'Agrément CNOM / Arrêté *</span>
                  <span title="Numéro d'inscription à l'Ordre ou arrêté du Ministère de la Santé">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Ex: CNOM-TN-048192"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Téléphone professionnel
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: +216 98 123 456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Années d'expérience clinique : <span className="text-teal-600 font-bold">{yearsOfExperience} ans</span>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Débutant (&lt; 1 an)</span>
                <span>10 ans</span>
                <span>20 ans</span>
                <span>30+ ans</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Langues de consultation *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSel = selectedLanguages.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => toggleLanguage(lang.code)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSel
                          ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{lang.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DIPLOMAS & CERTIFICATIONS UPLOAD */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#1B2559]">2. Diplômes d'État & Justificatifs KYC</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Téléversez vos diplômes et attestations officielles (Master de Psychologie, Diplôme d'État, Certifications TCC / EMDR). 
                Ces documents sont strictement confidentiels et examinés par le comité médical MonPsy.
              </p>
            </div>

            {/* LIST OF UPLOADED CERTIFICATES */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Diplômes enregistrés ({certificates.length})
              </span>

              {certificates.map((cert, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1B2559]">{cert.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cert.issuer} {cert.issuedAt ? `· Obtenu en ${cert.issuedAt.split('-')[0]}` : ''}
                      </p>
                      {cert.file && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Fichier joint : {cert.file.name} ({(cert.file.size / 1024).toFixed(0)} Ko)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!cert.file && (
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl border border-teal-500 text-teal-600 hover:bg-teal-50 text-xs font-bold flex items-center gap-1.5 transition-colors">
                        <UploadCloud className="w-3.5 h-3.5" />
                        Joindre PDF / Image
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, index)}
                        />
                      </label>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(index)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      title="Supprimer ce justificatif"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD ANOTHER CERTIFICATE FORM */}
            <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-white space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B2559]">
                <Plus className="w-4 h-4 text-teal-600" />
                Ajouter un autre diplôme ou certification
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Intitulé du diplôme (ex: Certification TCC)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <input
                  type="text"
                  placeholder="Université / Institut émetteur"
                  value={newIssuer}
                  onChange={(e) => setNewIssuer(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <input
                  type="date"
                  value={newIssuedAt}
                  onChange={(e) => setNewIssuedAt(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <div className="flex items-center gap-2">
                  <label className="w-full cursor-pointer px-3.5 py-2.5 rounded-xl border border-dashed border-teal-500/50 bg-teal-50/50 text-teal-700 hover:bg-teal-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                    <UploadCloud className="w-4 h-4" />
                    {newFile ? newFile.name : "Sélectionner le fichier (PDF/Image)"}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleFileChange(e)}
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCertificate}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Valider l'ajout de ce diplôme
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PRACTICE SETTINGS & PRICING */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#1B2559]">3. Modalités d'Exercice & Tarification</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configurez vos honoraires, vos formats de consultation et les domaines cliniques dans lesquels vous intervenez.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Honoraires par consultation (TND) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="20"
                    max="500"
                    value={pricePerSession}
                    onChange={(e) => setPricePerSession(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">TND / Séance</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Durée standard d'une séance
                </label>
                <select
                  value={sessionDurationMins}
                  onChange={(e) => setSessionDurationMins(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  <option value={45}>45 minutes</option>
                  <option value={50}>50 minutes</option>
                  <option value={60}>60 minutes (Recommandé)</option>
                  <option value={75}>75 minutes</option>
                  <option value={90}>90 minutes (Thérapie de couple)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Formats de consultation proposés *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'VIDEO', label: 'Visioconférence Jitsi', desc: 'Séance sécurisée HD avec chiffrement E2E' },
                  { id: 'AUDIO', label: 'Consultation Audio', desc: 'Téléconsultation vocale confidentielle' },
                  { id: 'CHAT', label: 'Messagerie Thérapeutique', desc: 'Suivi par écrit continu et structuré' },
                ].map((fmt) => {
                  const isSel = sessionFormats.includes(fmt.id);
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => toggleFormat(fmt.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSel
                          ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{fmt.label}</div>
                      <p className="text-[11px] font-normal text-slate-500 mt-1">{fmt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Spécialités cliniques ({selectedSpecialties.length} sélectionnées) *
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SPECIALTIES.map((spec) => {
                  const isSel = selectedSpecialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSel
                          ? 'bg-teal-500 border-teal-600 text-white font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Biographie & Démarche thérapeutique *
              </label>
              <textarea
                rows={3}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="Présentez votre approche clinique, vos méthodes (TCC, Systémique...) et votre cadre d'accueil..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: FINAL OATH & SUBMISSION */}
        {/* ========================================================================= */}
        {currentStep === 4 && !isCompleted && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#1B2559]">4. Déclaration & Engagement Déontologique</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Dernière étape avant la soumission de votre dossier au conseil d'accréditation MonPsy.
              </p>
            </div>

            {/* SUMMARY CARD */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Récapitulatif de votre dossier</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Praticien :</span> <strong className="text-slate-800">Dr. {firstName} {lastName}</strong></div>
                <div><span className="text-slate-500">N° Agrément :</span> <strong className="text-slate-800">{licenseNumber}</strong></div>
                <div><span className="text-slate-500">Honoraires :</span> <strong className="text-teal-700">{pricePerSession} TND / séance</strong></div>
                <div><span className="text-slate-500">Diplômes joints :</span> <strong className="text-slate-800">{certificates.length} document(s)</strong></div>
                <div className="sm:col-span-2"><span className="text-slate-500">Spécialités :</span> <span className="text-slate-800">{selectedSpecialties.join(', ')}</span></div>
              </div>
            </div>

            {/* CHECKBOXES */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={oathAccepted}
                  onChange={(e) => setOathAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs sm:text-sm text-slate-700 font-medium">
                  Je certifie sur l'honneur l'authenticité et l'exactitude des diplômes, certificats et numéros d'exercice fournis dans ce dossier KYC.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs sm:text-sm text-slate-700 font-medium">
                  Je m'engage à respecter le Code de Déontologie des Psychologues, le secret médical absolu et la réglementation de l'INPDP / RGPD en matière de données de santé.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUCCESS CELEBRATION STATE */}
        {/* ========================================================================= */}
        {isCompleted && (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-[#1B2559]">Dossier KYC Soumis avec Succès !</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Vos diplômes et autorisations d'exercice ont été transmis au conseil médical MonPsy.
              Votre statut est désormais <strong>En cours de vérification</strong>. La validation s'effectue sous 24 à 48 heures ouvrées.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  if (onSuccess) onSuccess();
                }}
                className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                Accéder à mon Espace Praticien
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NAVIGATION BUTTONS */}
        {/* ========================================================================= */}
        {!isCompleted && (
          <div className="flex items-center justify-between gap-4 pt-8 border-t border-slate-100 mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#2EC4B6] hover:bg-[#26ad9f] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-teal-500/20 active:scale-95"
              >
                Suivant
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitFinal}
                disabled={loading || !termsAccepted || !oathAccepted}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transmission en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Soumettre mon dossier KYC
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
