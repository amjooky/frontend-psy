"use client";

import React, { useState, useEffect, useRef } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  MessageSquare,
  Send,
  Loader,
  ArrowLeft,
  Search,
  CheckCheck,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';
import { haptic } from '@/lib/haptics';

export default function PsyChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [typingUser, setTypingUser] = useState<{ userId: string; text?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: convsData, isLoading: convsLoading } = useQuery({
    queryKey: ['psy-conversations'],
    queryFn: async () => {
      const res = await api.get('/messaging/conversations');
      const payload = res.data?.data || res.data;
      const data = Array.isArray(payload) ? payload : [];
      setConversations(data);
      return data;
    },
  });

  // Fetch messages when active conversation changes
  const { isLoading: messagesLoading } = useQuery({
    queryKey: ['psy-messages', activeConvId],
    queryFn: async () => {
      if (!activeConvId) return [];
      const res = await api.get(`/messaging/conversations/${activeConvId}/messages`);
      const payload = res.data?.data || res.data;
      const data = Array.isArray(payload) ? payload : [];
      setMessages(data);
      return data;
    },
    enabled: !!activeConvId,
  });

  // Connect Socket
  useEffect(() => {
    if (!user?.id) return;
    const socketClient = getSocket(user.id);
    setSocket(socketClient);
  }, [user?.id]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !activeConvId) return;

    const handleNewMessage = (newMsg: any) => {
      if (newMsg.conversationId === activeConvId) {
        haptic.light();
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
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
    socket.on(`typing:${activeConvId}`, handleTypingEvent);

    return () => {
      socket.off('message', handleNewMessage);
      socket.off(`typing:${activeConvId}`, handleTypingEvent);
    };
  }, [socket, activeConvId, user?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    if (socket && activeConvId) {
      socket.emit('typing', {
        conversationId: activeConvId,
        isTyping: val.trim().length > 0,
        text: val,
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeConvId) return;

    const content = inputMessage.trim();
    setInputMessage('');
    haptic.success();

    if (socket) {
      socket.emit('typing', {
        conversationId: activeConvId,
        isTyping: false,
        text: '',
      });
    }

    try {
      const res = await api.post('/messaging/messages', {
        conversationId: activeConvId,
        content,
        type: 'TEXT',
      });
      const newMsg = res.data?.data || res.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    } catch (err: any) {
      console.error('Failed to send message:', err);
    }
  };

  const activeConvoObj = conversations.find((c) => c.id === activeConvId);
  const activePatient = activeConvoObj?.patient;

  const filteredConvos = conversations.filter((c) => {
    const name = `${c.patient?.firstName || ''} ${c.patient?.lastName || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <PsySidebarLayout>
      <div className="h-[calc(100dvh-7.5rem)] md:h-[calc(100vh-130px)] max-w-6xl mx-auto flex rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-md font-outfit">
        
        {/* ═══════════════════════════════════════════════════════════
            CONVERSATIONS INBOX LIST (LEFT SIDEBAR)
        ════════════════════════════════════════════════════════════ */}
        <div className={`w-full md:w-[340px] lg:w-[380px] border-r border-slate-200/80 bg-white flex flex-col shrink-0 ${
          activeConvId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Inbox Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-[#1B2559] text-lg sm:text-xl tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
                Messagerie Patient
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7C3AED] border border-purple-100">
                {conversations.length} patient{conversations.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Messenger Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none transition-all"
              />
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 custom-scrollbar">
            {convsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-xs text-slate-400">
                <Loader className="w-6 h-6 animate-spin text-[#7C3AED]" />
                <span>Chargement des conversations...</span>
              </div>
            ) : filteredConvos.length > 0 ? (
              filteredConvos.map((conv) => {
                const otherParticipant = conv.patient || {};
                const isActive = activeConvId === conv.id;
                const lastMsg = conv.messages?.[0];
                const displayName = otherParticipant.firstName ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Patient Anonyme';

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      haptic.light();
                      setActiveConvId(conv.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 text-left transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-50/80 to-indigo-50/40 border border-purple-200 shadow-sm'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {/* Avatar with Online Badge */}
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border shadow-sm ${
                        isActive
                          ? 'bg-[#7C3AED] text-white border-purple-300'
                          : 'bg-purple-50 text-[#7C3AED] border-purple-100'
                      }`}>
                        {otherParticipant.firstName?.[0] || 'P'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1B2559] truncate">
                          {displayName}
                        </h4>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-slate-600 font-medium' : 'text-slate-400 font-light'}`}>
                        {lastMsg?.content || 'Aucun message échangé'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto border border-purple-100">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Aucun patient trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MESSENGER ACTIVE CHAT ROOM (RIGHT / FULL SCREEN ON MOBILE)
        ════════════════════════════════════════════════════════════ */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 justify-between ${
          !activeConvId ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConvId && activePatient ? (
            <>
              {/* Messenger Header */}
              <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200/90 bg-white/95 backdrop-blur-md flex items-center justify-between shadow-xs sticky top-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => {
                      haptic.light();
                      setActiveConvId(null);
                    }}
                    className="md:hidden p-2 -ml-1 rounded-full text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {activePatient?.firstName?.[0] || 'P'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                  </div>

                  {/* Title and Status */}
                  <div className="min-w-0 truncate">
                    <h4 className="font-bold text-sm sm:text-base text-[#1B2559] truncate flex items-center gap-1.5">
                      <span>{activePatient?.firstName ? `${activePatient.firstName} ${activePatient.lastName}` : 'Patient Anonyme'}</span>
                      <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
                    </h4>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                      En ligne • Canal médical chiffré
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#7C3AED] border border-purple-100 hidden sm:inline-block">
                    Suivi Patient
                  </span>
                </div>
              </div>

              {/* Messenger Messages Scroll View */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar bg-slate-100/40">
                {/* Security notice chip */}
                <div className="flex justify-center my-2">
                  <span className="text-[10px] font-semibold text-slate-500 bg-white/80 border border-slate-200/80 px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#7C3AED]" />
                    Échange confidentiel & secret médical
                  </span>
                </div>

                {messagesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader className="w-6 h-6 animate-spin text-[#7C3AED]" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === activeConvoObj?.psychologistId;
                    const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-150`}
                      >
                        <div
                          className={`max-w-[82%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative ${
                            isMe
                              ? 'bg-gradient-to-tr from-[#7C3AED] to-[#6D28D9] text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isMe ? 'text-purple-100' : 'text-slate-400'
                          }`}>
                            <span>{timeStr}</span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-white/90" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto mb-2 border border-purple-100">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Démarrez la conversation avec votre patient.</p>
                  </div>
                )}

                {/* Animated Typing Bubble */}
                {typingUser && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white text-slate-600 border border-purple-200 shadow-sm flex items-center gap-2">
                      <span className="text-xs font-bold text-[#7C3AED]">
                        {activePatient?.firstName || 'Le patient'}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Messenger Bottom Input Bar */}
              <div className="p-3 sm:p-4 border-t border-slate-200/90 bg-white sticky bottom-0 z-20">
                <div className="flex items-center gap-2 max-w-4xl mx-auto">
                  <div className="flex-1 flex items-center bg-slate-100/90 border border-slate-200/80 rounded-full px-4 py-1.5 focus-within:border-[#7C3AED] focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-400/20 transition-all">
                    <input
                      type="text"
                      placeholder="Rédigez votre réponse médicale sécurisée..."
                      value={inputMessage}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 bg-transparent py-1.5 outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center shadow-md shadow-purple-500/25 transition-all shrink-0 active:scale-95"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state on desktop */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] mb-4 shadow-sm">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-[#1B2559] text-lg">Séances de Messagerie Patient</h4>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1.5 max-w-xs leading-relaxed">
                Sélectionnez un patient dans la colonne de gauche pour débuter l'échange thérapeutique sécurisé.
              </p>
            </div>
          )}
        </div>

      </div>
    </PsySidebarLayout>
  );
}
