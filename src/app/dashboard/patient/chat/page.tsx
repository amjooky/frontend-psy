"use client";

import React, { useState, useEffect, useRef } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Send, Loader, User, MessageSquare } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';

export default function PatientChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [typingUser, setTypingUser] = useState<{ userId: string; text?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations list (safely unpack transformed res.data.data array)
  const { data: convos, isLoading: convosLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messaging/conversations');
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    },
  });

  // 2. Fetch messages in active conversation (safely unpack transformed res.data.data array)
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

  // 4. Initialize active conversation from query parameter if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchConvoId = new URLSearchParams(window.location.search).get('convoId');
      if (searchConvoId) {
        setActiveConvo(searchConvoId);
      }
    }
  }, []);

  // 5. Connect Socket
  // Socket init (reuse singleton — shared with NotificationSocketBridge)
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
    sendMutation.mutate({ conversationId: activeConvo, content: message });
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

  const activePartner = convos?.find((c: any) => c.id === activeConvo)?.psychologist;

  return (
    <SidebarLayout>
      <div className="h-[calc(100vh-140px)] flex border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        
        {/* CONVERSATION LIST (LEFT PANEL) */}
        <div className="w-1/3 min-w-[280px] max-w-[360px] border-r border-slate-200/80 bg-slate-50/50 flex flex-col">
          <div className="p-5 border-b border-slate-200/80 bg-white">
            <h3 className="font-bold text-[#1B2559] text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#2EC4B6]" />
              Messagerie
            </h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">Vos conversations avec vos spécialistes</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {convosLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-5 h-5 animate-spin text-[#2EC4B6]" />
              </div>
            ) : convos && Array.isArray(convos) && convos.length > 0 ? (
              convos.map((c: any) => {
                const partner = c.psychologist;
                const isActive = activeConvo === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvo(c.id)}
                    className={`w-full p-3.5 rounded-2xl flex items-center gap-3 text-left transition-all ${
                      isActive
                        ? 'bg-white shadow-md shadow-slate-200/50 border border-teal-200 text-[#1B2559]'
                        : 'text-slate-600 hover:bg-white/70 border border-transparent'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isActive 
                        ? 'bg-teal-50 text-[#2EC4B6] border-teal-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {partner?.firstName?.[0] || 'D'}
                    </div>
                    <div className="truncate flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#1B2559] truncate">
                        Dr. {partner?.firstName} {partner?.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 font-light">
                        {c.messages?.[0]?.content || 'Démarrer la discussion...'}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 px-4 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Aucune discussion active</p>
              </div>
            )}
          </div>
        </div>

        {/* MESSAGES AREA (RIGHT PANEL) */}
        <div className="flex-1 flex flex-col bg-slate-50/30 justify-between">
          {activeConvo ? (
            <>
              {/* CHAT HEADER */}
              <div className="px-6 py-4 border-b border-slate-200/80 bg-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#2EC4B6] font-bold flex items-center justify-center text-sm">
                  {activePartner?.firstName?.[0] || 'D'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B2559]">
                    Dr. {activePartner?.firstName} {activePartner?.lastName}
                  </h4>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    En ligne • Consultation sécurisée
                  </span>
                </div>
              </div>

              {/* MESSAGES DISPLAY */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader className="w-5 h-5 animate-spin text-[#2EC4B6]" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((m: any, idx: number) => {
                    const activeConversation = convos?.find((c: any) => c.id === activeConvo);
                    const isOwn = m.senderId === activeConversation?.patientId;
                    return (
                      <div key={m.id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isOwn 
                            ? 'bg-[#2EC4B6] text-white rounded-tr-none'
                            : 'bg-white text-slate-700 border border-slate-200/80 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <span className={`block text-[9px] mt-1.5 text-right font-medium ${
                            isOwn ? 'text-white/80' : 'text-slate-400'
                          }`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <p className="text-xs text-slate-400 font-medium">Aucun message échangé pour l&apos;instant. Écrivez votre premier message !</p>
                  </div>
                )}
                {typingUser && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] px-4 py-3 rounded-2xl text-xs bg-white text-slate-500 border border-teal-200 rounded-tl-none italic flex flex-col gap-1 shadow-sm animate-pulse">
                      <span className="text-[10px] text-[#2EC4B6] font-bold not-italic">
                        {(() => {
                          const activeConversation = convos?.find((c: any) => c.id === activeConvo);
                          return activeConversation?.psychologist 
                            ? `Dr. ${activeConversation.psychologist.firstName} ${activeConversation.psychologist.lastName}`
                            : 'Le praticien';
                        })()} est en train d&apos;écrire...
                      </span>
                      {typingUser.text && <span className="text-slate-600 not-italic font-normal">« {typingUser.text} »</span>}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* CHAT INPUT BAR */}
              <div className="p-4 border-t border-slate-200/80 bg-white flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none text-xs text-slate-700 placeholder:text-slate-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending}
                  className="p-3.5 rounded-xl bg-[#2EC4B6] hover:bg-[#28b3a6] text-white disabled:bg-teal-200 disabled:cursor-not-allowed shadow-md shadow-teal-500/10 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#2EC4B6] mb-4">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-[#1B2559] text-base">Sélectionnez une discussion</h4>
              <p className="text-slate-400 text-xs font-light mt-1 max-w-sm">
                Choisissez un psychologue dans la liste de gauche pour échanger en toute confidentialité.
              </p>
            </div>
          )}
        </div>

      </div>
    </SidebarLayout>
  );
}
