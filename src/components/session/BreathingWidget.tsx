"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { haptic } from '@/lib/haptics';

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export function BreathingWidget({ isCompact = false }: { isCompact?: boolean }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [timer, setTimer] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Transition between phases
        if (phase === 'inhale') {
          setPhase('hold');
          haptic.pulse();
          return 4; // Hold 4 seconds
        } else if (phase === 'hold') {
          setPhase('exhale');
          haptic.pulse();
          return 6; // Exhale 6 seconds
        } else {
          setPhase('inhale');
          setCycleCount((c) => c + 1);
          haptic.pulse();
          return 4; // Inhale 4 seconds
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const toggleExercise = () => {
    haptic.medium();
    if (!isActive) {
      setIsActive(true);
      setPhase('inhale');
      setTimer(4);
    } else {
      setIsActive(false);
    }
  };

  const resetExercise = () => {
    haptic.light();
    setIsActive(false);
    setPhase('inhale');
    setTimer(4);
    setCycleCount(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Inspirez profondément par le nez...';
      case 'hold':
        return 'Retenez doucement votre souffle...';
      case 'exhale':
        return 'Expirez lentement par la bouche...';
    }
  };

  const getScale = () => {
    if (!isActive) return 1;
    switch (phase) {
      case 'inhale':
        return 1.45;
      case 'hold':
        return 1.45;
      case 'exhale':
        return 0.95;
    }
  };

  const getDuration = () => {
    switch (phase) {
      case 'inhale':
        return 4;
      case 'hold':
        return 0.5;
      case 'exhale':
        return 6;
    }
  };

  return (
    <div className={`rounded-3xl bg-gradient-to-b from-teal-500/10 via-white to-slate-50 border border-teal-100/80 p-6 md:p-8 font-outfit shadow-sm text-center relative overflow-hidden ${isCompact ? 'max-w-md mx-auto' : 'w-full'}`}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-[#2EC4B6] flex items-center justify-center">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1B2559]">Exercice de Cohérence Cardiaque</h4>
            <p className="text-[11px] text-slate-500 font-medium">Apaisez votre esprit avant votre séance</p>
          </div>
        </div>

        {cycleCount > 0 && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            {cycleCount} cycle{cycleCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Central Breathing Animated Sphere */}
      <div className="py-8 flex flex-col items-center justify-center relative z-10">
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Outer Ripple Halo */}
          <motion.div
            animate={{
              scale: isActive ? [1, 1.25, 1] : 1,
              opacity: isActive ? [0.3, 0.6, 0.3] : 0.2,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-teal-300/30 blur-xl"
          />

          {/* Main Breathing Circle */}
          <motion.div
            animate={{ scale: getScale() }}
            transition={{
              duration: isActive ? getDuration() : 0.4,
              ease: "easeInOut",
            }}
            className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#2EC4B6] via-teal-400 to-cyan-300 text-white shadow-xl shadow-teal-500/20 flex flex-col items-center justify-center border-4 border-white/60"
          >
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-center"
                >
                  <span className="text-3xl font-extrabold tracking-tight drop-shadow-sm">{timer}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/90">sec</span>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <Wind className="w-8 h-8 mx-auto mb-1 text-white/90" />
                  <span className="text-xs font-bold uppercase tracking-wider">Prêt</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Phase instruction label */}
        <p className="text-sm font-semibold text-[#1B2559] mt-6 min-h-[1.5rem] transition-all">
          {isActive ? getPhaseText() : "Prenez quelques instants pour respirer calmement"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 relative z-10 pt-2">
        <button
          onClick={toggleExercise}
          className="px-6 py-2.5 rounded-2xl bg-[#1B2559] text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Commencer la respiration
            </>
          )}
        </button>

        {isActive && (
          <button
            onClick={resetExercise}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
