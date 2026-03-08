'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// ── helpers ──────────────────────────────────────────────────

function parseInjectBlocks(rawCss: string) {
  const blocks: string[] = [];
  const css = rawCss.replace(/\/\*\s*GPTSTYLER_INJECT\s*([\s\S]*?)\*\//g, (_, html) => {
    blocks.push(html.trim());
    return '';
  });
  return { css: css.trim(), injectHtml: blocks.join('\n') };
}

function formatMarkdown(text: string) {
  // minimal md rendering: bold, inline code, code blocks, newlines
  return text
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

// ── types ────────────────────────────────────────────────────

type Message = { role: 'user' | 'assistant'; content: string };

// ── base CSS (default dark theme; user theme overrides below) ─

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100vh;overflow:hidden;background:#212121;color:#ececec;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px}

.gpt-layout{display:flex;height:100vh;position:relative}

/* ── sidebar ── */
nav{
  width:240px;flex-shrink:0;background:#171717;
  display:flex;flex-direction:column;padding:12px 8px;gap:2px;
  overflow-y:auto;overflow-x:hidden;
  position:relative;z-index:2;
}
@media(max-width:640px){
  nav{display:none}
}
.nav-logo{
  font-size:15px;font-weight:700;color:#fff;text-decoration:none;
  padding:8px 10px 16px;display:block;letter-spacing:.5px;
}
.new-chat-btn{
  background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);
  border-radius:10px;color:#ececec;font-size:13px;padding:9px 12px;
  text-align:left;cursor:pointer;transition:background .15s;margin-bottom:4px;
}
.new-chat-btn:hover{background:rgba(255,255,255,0.12)}
.nav-section{font-size:10px;color:#555;padding:10px 10px 4px;margin-top:4px;letter-spacing:.8px;text-transform:uppercase}
.nav-item{
  font-size:12px;padding:7px 10px;border-radius:8px;color:#aaa;
  cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  transition:background .15s;
}
.nav-item:hover{background:rgba(255,255,255,0.06);color:#eee}
.nav-item.active{background:rgba(255,255,255,0.09);color:#eee}
.nav-theme-badge{
  font-size:11px;padding:6px 10px;color:#666;border-top:1px solid rgba(255,255,255,0.06);
  margin-top:auto;padding-top:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.back-link{
  font-size:11px;color:#555;text-decoration:none;padding:6px 10px;
  display:block;transition:color .15s;
}
.back-link:hover{color:#aaa}

/* ── main ── */
main{
  flex:1;display:flex;flex-direction:column;overflow:hidden;
  background:transparent;position:relative;z-index:2;
}
.chat-messages{
  flex:1;overflow-y:auto;padding:28px 0;
  display:flex;flex-direction:column;gap:0;
  scroll-behavior:smooth;
  /* semi-transparent overlay so bg effects don't overpower text */
  background:rgba(0,0,0,0.45)!important;
  backdrop-filter:blur(0px);
}
.chat-messages::-webkit-scrollbar{width:6px}
.chat-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}

/* ── messages ── */
.message{padding:14px 40px;max-width:100%}
.message.user{display:flex;justify-content:flex-end}
.message.assistant{display:flex;gap:12px;align-items:flex-start}

[data-message-author-role="user"] .whitespace-pre-wrap{
  background:#343541;color:#ececec;
  padding:12px 18px;border-radius:20px 20px 4px 20px;
  font-size:14px;line-height:1.6;max-width:520px;
  white-space:pre-wrap;word-break:break-word;
}
.avatar{
  width:30px;height:30px;border-radius:50%;background:#19c37d;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;color:#fff;flex-shrink:0;margin-top:2px;
}
[data-message-author-role="assistant"] .markdown{
  font-size:14px;line-height:1.7;color:#ececec;
  max-width:640px;word-break:break-word;
}
[data-message-author-role="assistant"] .markdown pre{
  background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);
  border-radius:8px;padding:12px 16px;margin:8px 0;overflow-x:auto;
  font-size:12px;
}
[data-message-author-role="assistant"] .markdown code{
  background:rgba(255,255,255,0.1);border-radius:4px;
  padding:1px 5px;font-size:12px;
}
[data-message-author-role="assistant"] .markdown pre code{
  background:none;padding:0;
}
.cursor{animation:blink .8s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

/* ── empty state ── */
.empty-state{
  flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:16px;padding:40px;text-align:center;
}
.empty-state h2{font-size:22px;font-weight:600;color:#ececec}
.empty-state p{font-size:14px;color:#666;max-width:400px}
.suggestion-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px}
.chip{
  background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
  border-radius:20px;padding:8px 16px;font-size:13px;color:#aaa;
  cursor:pointer;transition:all .15s;
}
.chip:hover{background:rgba(255,255,255,0.1);color:#eee;border-color:rgba(255,255,255,0.2)}

/* ── input ── */
.input-area{padding:12px 40px 20px;position:relative;z-index:2;background:rgba(0,0,0,0.45)}
.input-wrapper{
  position:relative;background:rgba(255,255,255,0.07);
  border:1px solid rgba(255,255,255,0.12);border-radius:16px;
  display:flex;align-items:flex-end;gap:0;
  transition:border-color .2s;
}
.input-wrapper:focus-within{border-color:rgba(255,255,255,0.25)}
#prompt-textarea{
  flex:1;background:transparent;border:none;outline:none;
  color:#ececec;font-size:14px;line-height:1.5;
  padding:12px 16px;resize:none;min-height:44px;max-height:180px;
  font-family:inherit;
}
#prompt-textarea::placeholder{color:#555}
#prompt-textarea:disabled{opacity:.6}
.send-btn{
  width:36px;height:36px;border-radius:10px;border:none;
  background:#19c37d;color:#fff;font-size:18px;
  cursor:pointer;margin:4px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s;
}
.send-btn:hover:not(:disabled){background:#1adb8a}
.send-btn:disabled{background:rgba(255,255,255,0.1);color:#555;cursor:not-allowed}
.input-hint{font-size:11px;color:#444;text-align:center;margin-top:6px}

/* ── mobile top bar ── */
.mobile-topbar{
  display:none;position:relative;z-index:3;
  background:#171717;border-bottom:1px solid rgba(255,255,255,0.06);
  padding:10px 16px;align-items:center;justify-content:space-between;
}
.mobile-topbar-title{font-size:15px;font-weight:700;color:#fff}
.mobile-topbar-btn{
  background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);
  border-radius:8px;color:#ececec;font-size:12px;padding:6px 12px;cursor:pointer;
}
/* ── mobile drawer ── */
.drawer-overlay{
  display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100;
}
.drawer-overlay.open{display:block}
nav.drawer{
  position:fixed!important;top:0;left:0;height:100vh;z-index:101;
  transform:translateX(-100%);transition:transform .25s ease;
  width:260px!important;
}
nav.drawer.open{transform:translateX(0)}

@media(max-width:640px){
  .gpt-layout{flex-direction:column}
  .mobile-topbar{display:flex!important}
  nav:not(.drawer){display:none}
  .message{padding:10px 16px}
  .chat-messages{padding:12px 0}
  .input-area{padding:8px 12px 14px}
  [data-message-author-role="user"] .whitespace-pre-wrap{max-width:85vw;font-size:13px}
  [data-message-author-role="assistant"] .markdown{max-width:85vw;font-size:13px}
}

/* ── loading dots ── */
.loading-dots span{animation:dot-bounce .8s infinite;display:inline-block}
.loading-dots span:nth-child(2){animation-delay:.15s}
.loading-dots span:nth-child(3){animation-delay:.3s}
@keyframes dot-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
`;

// ── component ────────────────────────────────────────────────

function ChatPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const styleId = searchParams.get('style');

  const [rawCss, setRawCss] = useState('');
  const [themeName, setThemeName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const injectElRef = useRef<HTMLDivElement | null>(null);
  const decorationRef = useRef<HTMLDivElement>(null);

  // Load CSS
  useEffect(() => {
    async function load() {
      if (styleId) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data } = await supabase
          .from('styles')
          .select('css, name')
          .eq('id', styleId)
          .single();
        if (data) { setRawCss(data.css); setThemeName(data.name); }
      } else {
        const css  = sessionStorage.getItem('gptstyler_preview_css') ?? '';
        const name = sessionStorage.getItem('gptstyler_preview_name') ?? 'AI 디자인';
        setRawCss(css);
        setThemeName(name);
      }
    }
    load();
  }, [styleId]);

  // Inject HTML decoration blocks into the decoration layer inside gpt-layout
  useEffect(() => {
    if (!rawCss) return;
    const container = decorationRef.current;
    if (!container) return;

    const { injectHtml } = parseInjectBlocks(rawCss);
    container.innerHTML = injectHtml || '';

    // Re-execute scripts (innerHTML doesn't run them)
    container.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script');
      s.textContent = old.textContent;
      old.replaceWith(s);
    });

    return () => { container.innerHTML = ''; };
  }, [rawCss]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const newMsgs: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);

    // Save to history
    if (messages.length === 0) {
      const id = Date.now().toString();
      const newHistory = [{ id, title: text.slice(0, 40) }, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('gptstyler_history', JSON.stringify(newHistory));
    }

    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: full };
          return copy;
        });
      }
    } catch {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' };
        return copy;
      });
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, messages, loading, history]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startNew = () => setMessages([]);

  const suggestions = ['오늘 뭐 먹을까요?', '코드 리뷰 부탁해요', '여행지 추천해줘', '재미있는 이야기 해줘'];

  const { css: cleanCss } = parseInjectBlocks(rawCss);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html:
        BASE_CSS +
        (cleanCss ? '\n' + cleanCss : '') +
        '\nmain{background:transparent!important}'
      }} />

      {/* position:fixed + z-index:9999 covers root layout's Navbar (z-index:50) completely */}
      <div className="gpt-layout" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        {/* Decoration layer: inject SVG/HTML effects here — behind nav/main (z-index:0 < z-index:2) */}
        <div
          ref={decorationRef}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}
        />
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button className="mobile-topbar-btn" onClick={() => setDrawerOpen(true)}>☰</button>
          <span className="mobile-topbar-title">🎨 {themeName || 'GPTStyler'}</span>
          <button className="mobile-topbar-btn" onClick={startNew}>＋</button>
        </div>

        {/* Mobile drawer overlay */}
        <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

        {/* Mobile drawer nav */}
        <nav className={`drawer${drawerOpen ? ' open' : ''}`}>
          <a href="/" className="nav-logo">GPTStyler</a>
          <button className="new-chat-btn" onClick={() => { startNew(); setDrawerOpen(false); }}>＋ 새 채팅</button>
          {history.length > 0 && (
            <>
              <div className="nav-section">최근 채팅</div>
              {history.map(h => (
                <div key={h.id} className="nav-item" onClick={() => setDrawerOpen(false)}>{h.title}</div>
              ))}
            </>
          )}
          <div className="nav-section" style={{ marginTop: 'auto' }}>테마</div>
          <div className="nav-theme-badge">🎨 {themeName || '기본 테마'}</div>
          <a href="/upload" className="back-link">← 디자인 변경</a>
          <a href="/" className="back-link">← 갤러리</a>
        </nav>

        {/* Sidebar */}
        <nav>
          <a href="/" className="nav-logo">GPTStyler</a>
          <button className="new-chat-btn" onClick={startNew}>＋ 새 채팅</button>

          {history.length > 0 && (
            <>
              <div className="nav-section">최근 채팅</div>
              {history.map(h => (
                <div key={h.id} className="nav-item">{h.title}</div>
              ))}
            </>
          )}

          <div className="nav-section" style={{ marginTop: 'auto' }}>테마</div>
          <div className="nav-theme-badge">🎨 {themeName || '기본 테마'}</div>
          <a href="/upload" className="back-link">← 디자인 변경</a>
          <a href="/" className="back-link">← 갤러리</a>
        </nav>

        {/* Main */}
        <main>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <h2>무엇이든 물어보세요</h2>
                <p>테마 <strong>{themeName || '기본'}</strong>이 적용된 나만의 채팅 공간입니다</p>
                <div className="suggestion-chips">
                  {suggestions.map(s => (
                    <button key={s} className="chip" onClick={() => { setInput(s); textareaRef.current?.focus(); }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`} data-message-author-role={msg.role}>
                  {msg.role === 'assistant' && <div className="avatar">G</div>}
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="markdown">
                      {msg.content === '' && loading && i === messages.length - 1 ? (
                        <div className="loading-dots"><span>●</span><span>●</span><span>●</span></div>
                      ) : (
                        <span dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                      )}
                      {loading && i === messages.length - 1 && msg.content !== '' && (
                        <span className="cursor">▌</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="input-area">
            <div className="input-wrapper">
              <textarea
                id="prompt-textarea"
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKey}
                placeholder="메시지를 입력하세요..."
                disabled={loading}
                rows={1}
              />
              <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || loading}>
                ↑
              </button>
            </div>
            <p className="input-hint">Enter 전송 · Shift+Enter 줄바꿈</p>
          </div>
        </main>
      </div>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ background: '#212121', height: '100vh' }} />}>
      <ChatPageInner />
    </Suspense>
  );
}
