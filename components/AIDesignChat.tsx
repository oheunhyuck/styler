'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string | { type: string; text?: string; image_url?: { url: string } }[];
  css?: string;
  displayText?: string;
  streaming?: boolean;
}

const SUGGESTIONS = [
  '우주 테마로 만들어줘. 별이 반짝이는 어두운 배경',
  '따뜻한 카페 느낌. 갈색 톤에 아늑한 분위기',
  '미니멀 화이트. 깔끔하고 밝은 테마',
  '사이버펑크 스타일. 네온 핑크와 청록색',
  '숲 속 느낌. 초록색 계열에 자연스러운 분위기',
];

function extractCSS(text: string): string | null {
  const startMarker = '```css';
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return null;
  const afterStart = startIdx + startMarker.length;
  const endIdx = text.indexOf('```', afterStart);
  const css = text.slice(afterStart, endIdx !== -1 ? endIdx : text.length).trim();
  return css.includes('{') ? css : null;
}

function extractDescription(text: string): string {
  const startIdx = text.indexOf('```css');
  return startIdx !== -1 ? text.slice(0, startIdx).trim() : text.trim();
}

export default function AIDesignChat({ onCSSUpdate }: { onCSSUpdate: (css: string, name?: string) => void }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentCSS, setCurrentCSS] = useState('');
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText && !imagePreview) return;

    let userContent: Message['content'];
    if (imagePreview) {
      userContent = [
        ...(userText ? [{ type: 'text', text: userText }] : [{ type: 'text', text: '이 이미지를 참고해서 테마를 만들어줘' }]),
        { type: 'image_url', image_url: { url: imagePreview } },
      ];
    } else {
      userContent = userText;
    }

    const userMsg: Message = {
      role: 'user',
      content: userContent,
      displayText: userText || '이미지를 참고해서 테마를 만들어줘',
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
    setLoading(true);

    const firstName = nextMessages.find(m => m.role === 'user')?.displayText
      || (typeof nextMessages[0]?.content === 'string' ? nextMessages[0].content : '');

    // Add empty streaming assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    try {
      const apiMessages = nextMessages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let accumulated = '';
      let lastPreviewLen = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += dec.decode(value, { stream: true });

        const description = extractDescription(accumulated);
        const css = extractCSS(accumulated);

        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: description,
            css: css || undefined,
            streaming: true,
          };
          return copy;
        });

        // Throttle preview: update every 600 new CSS chars
        if (css && css.length - lastPreviewLen > 600) {
          lastPreviewLen = css.length;
          onCSSUpdate(css, firstName.slice(0, 40));
        }
      }

      // Final commit
      const finalCss = extractCSS(accumulated);
      const finalDescription = extractDescription(accumulated);

      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: finalDescription,
          css: finalCss || undefined,
          streaming: false,
        };
        return copy;
      });

      if (finalCss) {
        setCurrentCSS(finalCss);
        onCSSUpdate(finalCss, firstName.slice(0, 40));
      }
    } catch (err: any) {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: `오류가 발생했어요: ${err.message}` };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !author.trim()) {
      alert('이름과 닉네임을 입력해주세요.');
      return;
    }
    if (!currentCSS) {
      alert('먼저 AI와 대화해서 스타일을 만들어주세요.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, author, description: '(AI 생성 테마)', css: currentCSS }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/styles/${data.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Chat window */}
      <div className="flex-1 bg-surface-1 border border-surface-3 rounded-xl flex flex-col overflow-hidden" style={{ minHeight: 400 }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col gap-3 my-auto">
              <p className="text-center text-gray-500 text-sm">어떤 테마를 원하세요?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs bg-surface-2 hover:bg-surface-3 border border-surface-3 text-gray-300 px-3 py-2 rounded-lg transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-green-700 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                  AI
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand text-white rounded-br-sm'
                    : 'bg-surface-2 text-gray-200 rounded-bl-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="flex flex-col gap-2">
                    <span>{msg.displayText || (typeof msg.content === 'string' ? msg.content : '')}</span>
                    {Array.isArray(msg.content) &&
                      msg.content.find((c) => c.type === 'image_url') && (
                        <img
                          src={(msg.content.find((c) => c.type === 'image_url') as any)?.image_url?.url}
                          alt="참고 이미지"
                          className="w-24 h-24 object-cover rounded-lg opacity-80"
                        />
                      )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {msg.streaming && !msg.css && (
                      // Streaming description text
                      <p className="text-gray-300">
                        {typeof msg.content === 'string' && msg.content
                          ? msg.content
                          : <span className="text-gray-500">테마 생성 중...</span>}
                      </p>
                    )}
                    {msg.streaming && msg.css && (
                      <p className="text-yellow-400 font-medium">🎨 테마 그리는 중... 미리보기 업데이트 중</p>
                    )}
                    {!msg.streaming && msg.css && (
                      <p className="text-green-400 font-medium">✓ 테마 생성 완료! 오른쪽 미리보기를 확인하세요.</p>
                    )}
                    {!msg.streaming && !msg.css && (
                      <p>{typeof msg.content === 'string' ? msg.content : ''}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Image preview bar */}
        {imagePreview && (
          <div className="px-4 py-2 border-t border-surface-3 flex items-center gap-3">
            <img src={imagePreview} alt="preview" className="w-12 h-12 object-cover rounded-lg" />
            <span className="text-xs text-gray-400 flex-1">이미지 첨부됨</span>
            <button onClick={() => setImagePreview(null)} className="text-xs text-red-400 hover:text-red-300">
              제거
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-surface-3 flex gap-2">
          <input type="file" ref={fileRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            title="이미지 첨부"
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-surface-2 hover:bg-surface-3 text-gray-400 hover:text-white transition-colors text-base"
          >
            🖼
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="원하는 스타일을 설명해주세요..."
            disabled={loading}
            className="flex-1 bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || (!input.trim() && !imagePreview)}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-40 text-white transition-colors"
          >
            ↑
          </button>
        </div>
      </div>

      {/* Save section */}
      {currentCSS && (
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-300">마음에 들면 공유해보세요</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="스타일 이름 *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="flex-1 bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
            />
            <input
              type="text"
              placeholder="닉네임 *"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={30}
              className="w-32 bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand hover:bg-brand-dark disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              {saving ? '저장 중...' : '공유하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
