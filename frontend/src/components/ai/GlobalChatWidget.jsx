import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Sparkles } from 'lucide-react';
import { useChatPage } from '../../hooks/useAI';
import { usePageContext } from '../../context/PageContextContext';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

function getPageKey(pathname) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/browse')) return 'browse';
  if (pathname.startsWith('/login')) return 'login';
  if (pathname.startsWith('/register')) return 'register';
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'dashboard';
  if (pathname.startsWith('/dashboard/leads/')) return 'dashboard-leads';
  if (pathname.startsWith('/dashboard/leads')) return 'dashboard-leads';
  if (pathname.startsWith('/dashboard/analytics')) return 'dashboard-analytics';
  if (pathname.startsWith('/dashboard/my-properties')) return 'dashboard-my-properties';
  if (pathname.startsWith('/dashboard/properties')) return 'dashboard-properties';
  if (pathname.startsWith('/dashboard/users')) return 'dashboard-users';
  return 'home';
}

function getPageLabel(pageKey) {
  const labels = {
    home: 'Home',
    browse: 'Browse Listings',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    'dashboard-properties': 'Properties',
    'dashboard-my-properties': 'My Properties',
    'dashboard-leads': 'Leads',
    'dashboard-analytics': 'Analytics',
    'dashboard-users': 'Users',
  };
  return labels[pageKey] || 'PropVista';
}

export default function GlobalChatWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [banner, setBanner] = useState(false);
  const { call, loading } = useChatPage();
  const { pageContext, updatePageContext } = usePageContext();
  const { user } = useAuth();
  const role = user?.role || 'guest';
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const bannerTimer = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem('ai_banner_pending')) {
      sessionStorage.removeItem('ai_banner_pending');
      setBanner(true);
      bannerTimer.current = setTimeout(() => setBanner(false), 3000);
    }
    return () => clearTimeout(bannerTimer.current);
  }, []);

  // Hide on property detail pages — dedicated widget handles those
  if (location.pathname.match(/^\/property\//)) return null;

  const pageKey = getPageKey(location.pathname);
  const pageLabel = getPageLabel(pageKey);

  // Reset chat + clear stale page context when navigating
  useEffect(() => {
    updatePageContext('');
    setMessages([{
      role: 'assistant',
      content: `Hi! I'm RealScout AI. Ask me anything about ${pageLabel}.`,
    }]);
    setInput('');
  }, [pageKey]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');

    const result = await call({ page: pageKey, context: pageContext || undefined, role, messages: updated });

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: result?.reply ?? "Sorry, I couldn't get a response. Please try again.",
      },
    ]);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[21rem] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={15} />
              <div>
                <div className="text-sm font-semibold leading-none">RealScout AI</div>
                <div className="text-xs opacity-70 mt-0.5">{pageLabel}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity cursor-pointer">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[30rem]">
            {messages.map((msg, i) => (
              <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={clsx(
                  'px-3 py-2 rounded-2xl text-sm max-w-[85%] leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-background text-text rounded-bl-sm'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-border">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask about ${pageLabel}…`}
              className="input-field flex-1 text-sm py-2"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="btn-primary px-3 py-2 shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Login banner */}
      {banner && !open && (
        <div className="flex items-center gap-2 bg-primary text-white text-xs font-medium px-3 py-2 rounded-xl shadow-lg animate-fade-in pr-2">
          <Sparkles size={13} className="shrink-0" />
          <span>AI at your service — ask me anything!</span>
          <button
            onClick={() => { clearTimeout(bannerTimer.current); setBanner(false); }}
            className="ml-1 hover:opacity-70 transition-opacity cursor-pointer shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => { setBanner(false); setOpen((o) => !o); }}
        className="w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Ask RealScout AI"
      >
        {open ? <X size={22} /> : <Sparkles size={20} />}
      </button>
    </div>
  );
}
