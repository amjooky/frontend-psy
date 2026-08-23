"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Sparkles, CheckCircle2, TrendingUp, Calendar, Heart } from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface MoodEntry {
  date: string;
  score: number;
  label: string;
  emoji: string;
  note?: string;
}

const MOODS = [
  { score: 5, emoji: '🌟', label: 'Rayonnant', color: 'from-amber-400 to-orange-400', border: 'border-amber-200', bg: 'bg-amber-50' },
  { score: 4, emoji: '😊', label: 'Serein', color: 'from-emerald-400 to-teal-400', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  { score: 3, emoji: '😐', label: 'Neutre', color: 'from-blue-400 to-indigo-400', border: 'border-blue-200', bg: 'bg-blue-50' },
  { score: 2, emoji: '😰', label: 'Anxieux', color: 'from-purple-400 to-violet-400', border: 'border-purple-200', bg: 'bg-purple-50' },
  { score: 1, emoji: '😔', label: 'Épuisé', color: 'from-rose-400 to-pink-400', border: 'border-rose-200', bg: 'bg-rose-50' },
];

export function DailyMoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [isSavedToday, setIsSavedToday] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('monpsy_mood_history');
      if (saved) {
        const parsed: MoodEntry[] = JSON.parse(saved);
        setHistory(parsed);
        const todayEntry = parsed.find((e) => e.date === todayStr);
        if (todayEntry) {
          setSelectedMood(todayEntry.score);
          setNote(todayEntry.note || '');
          setIsSavedToday(true);
        }
      }
    } catch {}
  }, [todayStr]);

  const handleSelect = (score: number) => {
    haptic.medium();
    setSelectedMood(score);
    const moodObj = MOODS.find((m) => m.score === score);
    if (!moodObj) return;

    const newEntry: MoodEntry = {
      date: todayStr,
      score,
      label: moodObj.label,
      emoji: moodObj.emoji,
      note,
    };

    const updated = [newEntry, ...history.filter((e) => e.date !== todayStr)].slice(0, 14);
    setHistory(updated);
    setIsSavedToday(true);
    haptic.success();

    try {
      localStorage.setItem('monpsy_mood_history', JSON.stringify(updated));
    } catch {}
  };

  const handleSaveNote = () => {
    if (selectedMood === null) return;
    handleSelect(selectedMood);
  };

  // Build 7-day display
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('fr-FR', { weekday: 'narrow' }).toUpperCase();
    const entry = history.find((h) => h.date === dStr);
    return { date: dStr, dayName, entry, isToday: dStr === todayStr };
  });

  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-7 font-outfit shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#2EC4B6] border border-teal-100 flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 fill-teal-100" />
          </div>
          <div>
            <h3 className="font-bold text-[#1B2559] text-base sm:text-lg">Mon Baromètre Émotionnel</h3>
            <p className="text-xs text-slate-500 font-medium">Comment vous sentez-vous aujourd'hui ?</p>
          </div>
        </div>

        {isSavedToday && (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Enregistré
          </span>
        )}
      </div>

      {/* Emoji Selector */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.score;
          return (
            <button
              key={mood.score}
              onClick={() => handleSelect(mood.score)}
              className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all relative ${
                isSelected
                  ? `${mood.bg} ${mood.border} border-2 shadow-md scale-105`
                  : 'bg-slate-50 border border-slate-100 hover:bg-slate-100/80 hover:scale-102'
              }`}
            >
              <span className="text-2xl sm:text-3xl filter drop-shadow-sm select-none">{mood.emoji}</span>
              <span className={`text-[10px] sm:text-xs tracking-tight ${isSelected ? 'font-bold text-[#1B2559]' : 'font-medium text-slate-600'}`}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 7-Day Weekly Mini Sparkline */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            Évolution des 7 derniers jours
          </span>
        </div>

        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {days.map((d, idx) => (
            <div
              key={idx}
              className={`flex-1 py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
                d.isToday ? 'bg-slate-100/90 border border-slate-200 font-bold' : 'bg-slate-50/60'
              }`}
            >
              <span className="text-[10px] text-slate-400">{d.dayName}</span>
              <span className="text-base select-none">{d.entry?.emoji || '·'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
