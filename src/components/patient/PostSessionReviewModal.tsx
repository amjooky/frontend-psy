"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, CheckCircle2, X, Sparkles, MessageSquare, ShieldCheck, Loader } from 'lucide-react';
import api from '@/lib/api';
import { haptic } from '@/lib/haptics';

interface PostSessionReviewModalProps {
  isOpen: boolean;
  appointmentId: string;
  doctorName?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

const TAGS = [
  '👂 Écoute très attentive',
  '🌸 Bienveillance & Douceur',
  '💡 Conseils concrets',
  '⏰ Parfaite ponctualité',
  '🔒 Climat de confiance',
];

export function PostSessionReviewModal({
  isOpen,
  appointmentId,
  doctorName = 'votre praticien',
  onClose,
  onSubmitted,
}: PostSessionReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    haptic.light();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      haptic.medium();

      const combinedComment = [
        selectedTags.length > 0 ? `Points forts : ${selectedTags.join(', ')}` : '',
        comment.trim(),
      ]
        .filter(Boolean)
        .join('\n\n');

      await api.post('/reviews', {
        appointmentId,
        rating,
        comment: combinedComment || undefined,
        isAnonymous,
      });

      haptic.success();
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      haptic.warning();
      setErrorMsg(err.response?.data?.message || 'Impossible d\'enregistrer votre avis. Vous avez peut-être déjà évalué cette séance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-outfit">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#1B2559]">Merci pour votre retour !</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Votre avis aide la communauté et permet à votre praticien d'améliorer la qualité de ses accompagnements.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-[#1B2559] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md mt-2"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#2EC4B6] border border-teal-100 flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-[#1B2559]">Comment s'est passée votre séance ?</h3>
                <p className="text-xs text-slate-500">
                  Votre expérience avec <strong className="text-slate-700">{doctorName}</strong>
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Star Rating */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating !== null ? hoverRating : rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => {
                        haptic.light();
                        setRating(star);
                      }}
                      className="p-1 transition-transform hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          active
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-slate-200 fill-slate-50 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Appreciation Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600">Ce que vous avez particulièrement apprécié :</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Written Feedback */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">Votre commentaire (Optionnel) :</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez quelques mots sur votre ressenti lors de cette consultation..."
                  rows={3}
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-800 focus:border-[#2EC4B6] focus:bg-white outline-none resize-none"
                />
              </div>

              {/* Anonymity Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Publier cet avis de manière anonyme</span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2EC4B6] focus:ring-teal-400 cursor-pointer"
                />
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-[#2EC4B6] hover:bg-[#25b5a7] disabled:bg-teal-200 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-98"
              >
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4 fill-white/30" />}
                <span>Envoyer mon évaluation</span>
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
