import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, Loader2, ArrowRight } from 'lucide-react';
import { useSafeguard } from '../../context/SafeguardContext';
import { useTranslation } from '../../hooks/useTranslation';
import { sendChatMessage } from '../../services/chatService';
import { ChatAction, ChatHistoryItem, ChatRoute } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  action?: ChatAction;
  route?: ChatRoute | null;
}

const ROUTE_LABEL_KEYS: Record<string, string> = {
  '/dashboard': 'chatbot.routes.dashboard',
  '/pattern-analysis': 'chatbot.routes.patternAnalysis',
  '/financial-health': 'chatbot.routes.financialHealth',
  '/results': 'chatbot.routes.results',
  '/resources': 'chatbot.routes.resources',
  '/settings/privacy': 'chatbot.routes.privacy',
};

let messageIdCounter = 0;
const nextMessageId = () => `msg-${++messageIdCounter}`;

export const ChatbotWidget: React.FC = () => {
  const navigate = useNavigate();
  const { user, appLanguage } = useSafeguard();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: t('chatbot.welcome') },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Keep the greeting in sync with the selected language as long as the user
  // hasn't started a real conversation yet (still just the welcome message).
  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === 'welcome'
        ? [{ id: 'welcome', role: 'assistant', text: t('chatbot.welcome') }]
        : prev
    );
  }, [appLanguage, t]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    // Conversation so far (excluding the welcome greeting, which is just UI
    // chrome, not a real turn) — gives the backend follow-up context.
    const history: ChatHistoryItem[] = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.text }));

    const userMessage: ChatMessage = { id: nextMessageId(), role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await sendChatMessage(text, user?.id ?? null, history, appLanguage);
      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId(),
          role: 'assistant',
          text: response.message,
          action: response.action,
          route: response.route,
        },
      ]);
    } catch {
      // Never expose technical/backend error details in the chat itself.
      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId(),
          role: 'assistant',
          text: t('chatbot.genericError'),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Portaled to <body> so this `fixed` widget is never re-parented under an
  // ancestor with an active `transform` (e.g. the landing page's own
  // `animate-fade-in`/scroll-reveal sections), which would otherwise anchor
  // it to that ancestor's box instead of the viewport corner.
  return createPortal(
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
      {open && (
        <div className="animate-scale-up absolute bottom-[calc(100%+0.75rem)] right-0 w-[calc(100vw-2.5rem)] max-w-sm sm:w-96 h-[28rem] max-h-[70vh] bg-white border border-[#EDECE8] rounded-[24px] shadow-xl flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-indigo-600 text-white shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">{t('chatbot.title')}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('chatbot.closeAria')}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* MESSAGE HISTORY */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAF9F6]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-[#EDECE8] text-slate-700'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.role === 'assistant' && m.action && m.action !== 'NONE' && m.route && (
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate(m.route as string);
                      }}
                      className="mt-2 inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <span>{ROUTE_LABEL_KEYS[m.route] ? t(ROUTE_LABEL_KEYS[m.route]) : t('chatbot.routes.default')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#EDECE8] rounded-2xl px-3.5 py-2.5 flex items-center space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  <span className="text-xs text-slate-400 font-medium">{t('chatbot.thinking')}</span>
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="p-3 border-t border-[#EDECE8] bg-white shrink-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chatbot.placeholder')}
                disabled={sending}
                className="flex-1 min-w-0 px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                aria-label={t('chatbot.sendAria')}
                className="shrink-0 w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? t('chatbot.closeWidgetAria') : t('chatbot.openAria')}
        className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
      >
        {open ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>
    </div>,
    document.body
  );
};

export default ChatbotWidget;
