"use client";

import React, { useState, useEffect, useRef } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { MessageSquare, Send, User, MessageCircle, Loader } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';

export default function PsyChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
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
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
      }
      return data;
    },
  });

  // Fetch messages when active conversation changes
  useQuery({
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

  // Connect Socket (reuse singleton — shared with NotificationSocketBridge)
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

    const content = inputMessage;
    setInputMessage('');

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

  return (
    <PsySidebarLayout>
      <div className="h-[calc(100vh-140px)] flex border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        
        {/* Conversations Sidebar */}
        <div className="w-1/3 min-w-[280px] max-w-[360px] border-r border-slate-200/80 bg-slate-50/50 flex flex-col">
          <div className="p-5 border-b border-slate-200/80 bg-white">
            <h3 className="font-bold text-[#1B2559] text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
              Messagerie Patient
            </h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">Consultations et suivis en direct</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {convsLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-5 h-5 animate-spin text-[#7C3AED]" />
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const otherParticipant = conv.patient || {};
                const isActive = activeConvId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-3.5 rounded-2xl flex items-center gap-3 text-left transition-all ${
                      isActive
                        ? 'bg-white shadow-md shadow-purple-200/50 border border-purple-200 text-[#1B2559]'
                        : 'text-slate-600 hover:bg-white/70 border border-transparent'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isActive
                        ? 'bg-purple-50 text-[#7C3AED] border-purple-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {otherParticipant.firstName?.[0] || 'P'}
                    </div>
                    <div className="truncate flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#1B2559] truncate">
                        {otherParticipant.firstName ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Patient Anonyme'}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-light">
                        {conv.messages?.[0]?.content || 'Aucun message pour le moment'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 px-4 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Aucune conversation patient</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Window */}
        <div className="flex-1 flex flex-col bg-slate-50/30 justify-between">
          {activeConvId ? (
            <>
              {/* HEADER */}
              <div className="px-6 py-4 border-b border-slate-200/80 bg-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-[#7C3AED] font-bold flex items-center justify-center text-sm">
                  {activePatient?.firstName?.[0] || 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B2559]">
                    {activePatient?.firstName ? `${activePatient.firstName} ${activePatient.lastName}` : 'Patient Anonyme'}
                  </h4>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Patient connecté • Canal sécurisé
                  </span>
                </div>
              </div>

              {/* MESSAGES DISPLAY */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3.5">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === activeConvoObj?.psychologistId;
                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-[#7C3AED] text-white rounded-tr-none'
                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-200/80'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span className={`text-[9px] block mt-1.5 text-right font-medium ${
                          isMe ? 'text-white/80' : 'text-slate-400'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {typingUser && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] p-3.5 rounded-2xl text-xs bg-white text-slate-500 rounded-tl-none border border-purple-200 italic flex flex-col gap-1 shadow-sm animate-pulse">
                      <span className="text-[10px] text-[#7C3AED] font-bold not-italic">
                        {activePatient?.firstName ? `${activePatient.firstName} ${activePatient.lastName}` : 'Le patient'} est en train d&apos;écrire...
                      </span>
                      {typingUser.text && <span className="text-slate-600 not-italic font-normal">« {typingUser.text} »</span>}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200/80 bg-white flex gap-3">
                <input
                  type="text"
                  placeholder="Rédigez votre réponse médicale sécurisée..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-4 py-3 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:bg-purple-200 disabled:cursor-not-allowed shadow-md shadow-purple-500/10 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] mb-4">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h4 className="text-[#1B2559] font-bold text-base">Sélectionnez un patient</h4>
              <p className="text-slate-400 text-xs font-light mt-1 max-w-sm">
                Choisissez un patient dans la colonne de gauche pour débuter la séance de messagerie sécurisée.
              </p>
            </div>
          )}
        </div>
      </div>
    </PsySidebarLayout>
  );
}
