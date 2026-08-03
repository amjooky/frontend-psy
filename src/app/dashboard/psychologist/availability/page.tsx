"use client";

import React, { useState } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

interface Slot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_ENUM = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function PsySchedule() {
  const queryClient = useQueryClient();
  const [slots, setSlots] = useState<Slot[]>([]);

  const { data: availability, isLoading } = useQuery({
    queryKey: ['psy-availability'],
    queryFn: async () => {
      const res = await api.get('/psychologists/me/profile');
      const backendSlots = res.data?.data?.availabilitySlots || res.data?.availabilitySlots || [];
      setSlots(backendSlots);
      return backendSlots;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedSlots: Slot[]) => {
      return api.put('/psychologists/me/availability', { slots: updatedSlots });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psy-availability'] });
      alert('Availability saved successfully!');
    },
  });

  const addSlot = () => {
    setSlots([...slots, { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, idx) => idx !== index));
  };

  const updateSlotField = (index: number, field: keyof Slot, value: any) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  return (
    <PsySidebarLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400 font-light">Set up your weekly available time slots for sessions.</p>
          <div className="flex gap-3">
            <button
              onClick={addSlot}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Slot
            </button>
            <button
              onClick={() => saveMutation.mutate(slots)}
              disabled={saveMutation.isPending}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Schedule
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-16 rounded-xl bg-slate-900/30 animate-pulse border border-slate-900/40" />
            ))}
          </div>
        ) : slots.length > 0 ? (
          <div className="grid gap-3">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/20 border border-slate-900 flex items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <select
                    value={slot.dayOfWeek}
                    onChange={(e) => updateSlotField(idx, 'dayOfWeek', e.target.value)}
                    className="bg-slate-950 border border-slate-900 text-slate-200 text-sm rounded-lg p-2.5 focus:border-blue-600 focus:outline-none"
                  >
                    {DAYS_ENUM.map((day, dIdx) => (
                      <option key={day} value={day}>
                        {DAYS[dIdx]}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 text-slate-400">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlotField(idx, 'startTime', e.target.value)}
                      className="bg-slate-950 border border-slate-900 text-slate-200 text-sm rounded-lg p-2 focus:border-blue-600 focus:outline-none"
                    />
                    <span className="text-xs">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlotField(idx, 'endTime', e.target.value)}
                      className="bg-slate-950 border border-slate-900 text-slate-200 text-sm rounded-lg p-2 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeSlot(idx)}
                  className="p-2.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-900 rounded-3xl">
            <Clock className="w-10 h-10 text-slate-700 mx-auto mb-4" />
            <h4 className="text-slate-400 font-semibold text-sm">No Availability Set</h4>
            <p className="text-slate-600 text-xs mt-1">Add slots above so patients can book appointments with you.</p>
          </div>
        )}
      </div>
    </PsySidebarLayout>
  );
}
