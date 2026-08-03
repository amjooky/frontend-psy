"use client";

import React, { useState } from 'react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LifeBuoy, User, Send, Check, AlertCircle } from 'lucide-react';

export default function AdminTickets() {
  const queryClient = useQueryClient();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const res = await api.get('/support/tickets/admin/all');
      return res.data?.data || [];
    },
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!activeTicketId || !replyMessage.trim()) return;
      return api.post(`/support/tickets/${activeTicketId}/replies`, {
        body: replyMessage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setReplyMessage('');
      alert('Reply sent successfully!');
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return api.patch(`/support/tickets/${ticketId}/assign`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return api.patch(`/support/tickets/${ticketId}/status`, { status: 'RESOLVED' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
  });

  const selectedTicket = Array.isArray(tickets) ? tickets.find((t: any) => t.id === activeTicketId) : null;

  return (
    <AdminSidebarLayout>
      <div className="h-[calc(100vh-12rem)] max-w-6xl mx-auto flex rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-md font-outfit">
        {/* Ticket List Sidebar */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Support Inbox</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading tickets...</div>
            ) : Array.isArray(tickets) && tickets.length > 0 ? (
              tickets.map((t: any) => {
                const active = t.id === activeTicketId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-all ${
                      active ? 'bg-slate-50 border-l-4 border-blue-600' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          t.status === 'RESOLVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                          t.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                          'bg-amber-50 border-amber-100 text-amber-700'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1B2559] truncate">{t.subject}</h4>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 italic">No support tickets found</div>
            )}
          </div>
        </div>

        {/* Message / Resolution Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#1B2559] text-base">{selectedTicket.subject}</h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Assigned to: <span className="text-slate-700 font-semibold">{selectedTicket.assignee?.email || 'Unassigned'}</span></p>
                </div>
                <div className="flex gap-2">
                  {!selectedTicket.assigneeId && (
                    <button
                      onClick={() => assignMutation.mutate(selectedTicket.id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Assign to Me
                    </button>
                  )}
                  {selectedTicket.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveMutation.mutate(selectedTicket.id)}
                      className="px-4 py-2 rounded-xl bg-[#2EC4B6] hover:bg-[#2EC4B6]/95 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                {/* Initial ticket message */}
                <div className="flex justify-start">
                  <div className="max-w-md p-4 rounded-2xl text-sm leading-relaxed bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm">
                    <p className="font-bold text-xs text-slate-400 mb-1 uppercase tracking-wider">User Message:</p>
                    <p className="font-medium text-slate-700">{selectedTicket.body || <span className="text-slate-400 italic">No message content</span>}</p>
                  </div>
                </div>

                {/* Thread replies */}
                {selectedTicket.replies?.map((rep: any) => {
                  const isAdmin = rep.user?.role === 'ADMIN';
                  return (
                    <div key={rep.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md p-4 rounded-2xl text-sm leading-relaxed ${
                          isAdmin
                            ? 'bg-[#1B2559] text-white rounded-br-none shadow-sm'
                            : 'bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-sm'
                        }`}
                      >
                        <p className={isAdmin ? 'font-medium text-white' : 'font-medium text-slate-700'}>{rep.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Reply Input */}
              {selectedTicket.status !== 'RESOLVED' && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a support response..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:border-blue-600 focus:outline-none placeholder-slate-400"
                  />
                  <button
                    onClick={() => replyMutation.mutate()}
                    className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20">
              <LifeBuoy className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-[#1B2559] font-bold text-sm">Select a Ticket</h4>
              <p className="text-slate-500 text-xs mt-1 font-medium">Review active user complaints and system reports from the support inbox.</p>
            </div>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
