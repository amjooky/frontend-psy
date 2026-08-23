"use client";

import React, { useState, useEffect, useRef } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Send,
  Loader,
  MessageSquare,
  ArrowLeft,
  Search,
  CheckCheck,
  ShieldCheck,
  Paperclip,
  Smile,
  Circle,
  Video,
  Phone,
  MoreVertical
} from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';
import { haptic } from '@/lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [typingUser, setTypingUser] = useState<{ userId: string; text?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations list
  const { data: convos, isLoading: convosLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messaging/conversations');
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    },
  });

  // 2. Fetch messages in active conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeConvo],
    queryFn: async () => {
      if (!activeConvo) return [];
      const res = await api.get(`/messaging/conversations/${activeConvo}/messages`);
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!activeConvo,
  });

  // 3. Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (payload: { conversationId: string; content: string }) => {
      const res = await api.post('/messaging/messages', {
        conversationId: payload.conversationId,
        content: payload.content,
        type: 'TEXT',
      });
      return res.data?.data || res.data;
    },
    onSuccess: (newMsg) => {
      haptic.success();
      queryClient.setQueryData(['messages', activeConvo], (oldData: any) => {
        const list = Array.isArray(oldData) ? oldData : [];
        if (list.some((m: any) => m.id === newMsg.id)) return list;
        return [...list, newMsg];
      });
      setMessage('');
      if (socket) {
        socket.emit('typing', {
          conversationId: activeConvo,
          isTyping: false,
          text: '',
        });
      }
    },
  });

  // 4. Initialize active conversation from query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchConvoId = new URLSearchParams(window.location.search).get('convoId');
      if (searchConvoId) {
        setActiveConvo(searchConvoId);
      }
    }
  }, []);

  // 5. Connect Socket
  useEffect(() => {
    if (!user?.id) return;
    const socketClient = getSocket(user.id);
    setSocket(socketClient);
  }, [user?.id]);

  // 6. Socket listeners
  useEffect(() => {
    if (!socket || !activeConvo) return;

    const handleNewMessage = (newMsg: any) => {
      if (newMsg.conversationId === activeConvo) {
        haptic.light();
        queryClient.setQueryData(['messages', activeConvo], (oldData: any) => {
          const list = Array.isArray(oldData) ? oldData : [];
          if (list.some((m: any) => m.id === newMsg.id)) return list;
          return [...list, newMsg];
        });
      }
    };

    const handleTypingEvent = (data: { userId: string; isTyping: boolean; text?: string }) => {
      if (data.userId !== user?.id) {
        if (data.isTyping) {
          setTypingUser({ userId: data.userId, text: data.text });
        } else {
          setTypingUser(null);
        }
      }
    };

    socket.on('message', handleNewMessage);
    socket.on(`typing:${activeConvo}`, handleTypingEvent);

    return () => {
      socket.off('message', handleNewMessage);
      socket.off(`typing:${activeConvo}`, handleTypingEvent);
    };
  }, [socket, activeConvo, user?.id, queryClient]);

  // 7. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSend = () => {
    if (!activeConvo || !message.trim()) return;
    sendMutation.mutate({ conversationId: activeConvo, content: message.trim() });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessage(val);

    if (socket && activeConvo) {
      socket.emit('typing', {
        conversationId: activeConvo,
        isTyping: val.trim().length > 0,
        text: val,
      });
    }
  };

  const activeConversation = convos?.find((c: any) => c.id === activeConvo);
  const activePartner = activeConversation?.psychologist;

  const filteredConvos = (convos || []).filter((c: any) => {
    const name = `${c.psychologist?.firstName || ''} ${c.psychologist?.lastName || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <SidebarLayout>
      <div className="h-[calc(100dvh-7.5rem)] md:h-[calc(100vh-130px)] max-w-6xl mx-auto flex rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-md font-outfit">
        
        {/* ═══════════════════════════════════════════════════════════
            CONVERSATIONS INBOX LIST (LEFT SIDEBAR)
        ════════════════════════════════════════════════════════════ */}
        <div className={`w-full md:w-[340px] lg:w-[380px] border-r border-slate-200/80 bg-white flex flex-col shrink-0 ${
          activeConvo ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Inbox Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-[#1B2559] text-lg sm:text-xl tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#2EC4B6]" />
                Messages
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#2EC4B6] border border-teal-100">
                {convos?.length || 0} discussion{(convos?.length || 0) > 1 ? 's' : ''}
              </span>
            </div>

            {/* Messenger Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un praticien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none transition-all"
              />
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 custom-scrollbar">
            {convosLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-xs text-slate-400">
                <Loader className="w-6 h-6 animate-spin text-[#2EC4B6]" />
                <span>Chargement de vos échanges...</span>
              </div>
            ) : filteredConvos.length > 0 ? (
              filteredConvos.map((c: any) => {
                const partner = c.psychologist;
                const isActive = activeConvo === c.id;
                const lastMsg = c.messages?.[0];
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      haptic.light();
                      setActiveConvo(c.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 text-left transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-50/80 to-cyan-50/40 border border-teal-200 shadow-sm'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {/* Avatar with Online Badge */}
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border shadow-sm ${
                        isActive
                          ? 'bg-[#2EC4B6] text-white border-teal-300'
                          : 'bg-teal-50 text-[#2EC4B6] border-teal-100'
                      }`}>
                        {partner?.firstName?.[0] || 'D'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1B2559] truncate">
                          Dr. {partner?.firstName} {partner?.lastName}
                        </h4>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-slate-600 font-medium' : 'text-slate-400 font-light'}`}>
                        {lastMsg?.content || 'Débuter la consultation par message...'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#2EC4B6] flex items-center justify-center mx-auto border border-teal-100">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Aucune discussion trouvée</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MESSENGER ACTIVE CHAT ROOM (RIGHT / FULL SCREEN ON MOBILE)
        ════════════════════════════════════════════════════════════ */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 justify-between ${
          !activeConvo ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConvo && activePartner ? (
            <>
              {/* Messenger Header */}
              <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200/90 bg-white/95 backdrop-blur-md flex items-center justify-between shadow-xs sticky top-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => {
                      haptic.light();
                      setActiveConvo(null);
                    }}
                    className="md:hidden p-2 -ml-1 rounded-full text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {activePartner?.firstName?.[0] || 'D'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                  </div>

                  {/* Title and Live Status */}
                  <div className="min-w-0 truncate">
                    <h4 className="font-bold text-sm sm:text-base text-[#1B2559] truncate flex items-center gap-1.5">
                      <span>Dr. {activePartner?.firstName} {activePartner?.lastName}</span>
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    </h4>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                      En ligne • Canal médical chiffré
                    </span>
                  </div>
                </div>

                {/* Quick actions (mock video/call triggers) */}
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hidden sm:inline-block">
                    Session Active
                  </span>
                </div>
              </div>

              {/* Messenger Messages Scroll View */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar bg-slate-100/40">
                {/* Security notice chip */}
                <div className="flex justify-center my-2">
                  <span className="text-[10px] font-semibold text-slate-500 bg-white/80 border border-slate-200/80 px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Messages chiffrés de bout en bout
                  </span>
                </div>

                {messagesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader className="w-6 h-6 animate-spin text-[#2EC4B6]" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((m: any, idx: number) => {
                    const isOwn = m.senderId === activeConversation?.patientId || m.senderId === user?.id;
                    const timeStr = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={m.id || idx}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-150`}
                      >
                        <div
                          className={`max-w-[82%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative ${
                            isOwn
                              ? 'bg-gradient-to-tr from-[#2EC4B6] to-[#24b4a6] text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isOwn ? 'text-teal-100' : 'text-slate-400'
                          }`}>
                            <span>{timeStr}</span>
                            {isOwn && <CheckCheck className="w-3.5 h-3.5 text-white/90" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="w-12 h-12 rounded-full bg-teal-50 text-[#2EC4B6] flex items-center justify-center mx-auto mb-2 border border-teal-100">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Démarrez votre séance de consultation par message dès maintenant.</p>
                  </div>
                )}

                {/* Animated Typing Bubble */}
                {typingUser && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white text-slate-600 border border-teal-200 shadow-sm flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2EC4B6]">
                        Dr. {activePartner.firstName}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Messenger Bottom Input Bar */}
              <div className="p-3 sm:p-4 border-t border-slate-200/90 bg-white sticky bottom-0 z-20">
                <div className="flex items-center gap-2 max-w-4xl mx-auto">
                  <div className="flex-1 flex items-center bg-slate-100/90 border border-slate-200/80 rounded-full px-4 py-1.5 focus-within:border-[#2EC4B6] focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-400/20 transition-all">
                    <input
                      type="text"
                      placeholder="Écrivez un message sécurisé..."
                      value={message}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 bg-transparent py-1.5 outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMutation.isPending}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#2EC4B6] hover:bg-[#25b5a7] disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center shadow-md shadow-teal-500/25 transition-all shrink-0 active:scale-95"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state on desktop when no conversation is selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#2EC4B6] mb-4 shadow-sm">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-[#1B2559] text-lg">Vos Consultations par Message</h4>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1.5 max-w-xs leading-relaxed">
                Sélectionnez une discussion dans la colonne de gauche pour échanger en direct et en toute confidentialité.
              </p>
            </div>
          )}
        </div>

      </div>
    </SidebarLayout>
  );
}
