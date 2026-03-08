'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import EditorPreview from './EditorPreview';

export interface EditorState {
  background: {
    type: 'solid' | 'gradient';
    color1: string;
    color2: string;
    direction: string;
  };
  sidebar: {
    color: string;
  };
  userBubble: {
    bg: string;
    text: string;
  };
  aiBubble: {
    bg: string;
    text: string;
  };
  font: {
    family: string;
    size: number;
  };
  animation: 'none' | 'gradient-shift' | 'stars' | 'bubbles';
  roundness: number;
}

const DEFAULT_STATE: EditorState = {
  background: { type: 'solid', color1: '#212121', color2: '#1a1a2e', direction: '135deg' },
  sidebar: { color: '#171717' },
  userBubble: { bg: '#7c6af7', text: '#ffffff' },
  aiBubble: { bg: '#2f2f2f', text: '#ececec' },
  font: { family: 'inherit', size: 15 },
  animation: 'none',
  roundness: 12,
};

const FONTS = [
  { label: '기본 (ChatGPT)', value: 'inherit' },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Pretendard', value: "'Pretendard', sans-serif" },
  { label: 'Noto Sans KR', value: "'Noto Sans KR', sans-serif" },
  { label: 'Georgia (세리프)', value: 'Georgia, serif' },
  { label: 'Fira Code (모노)', value: "'Fira Code', monospace" },
];

const GRADIENTS = ['135deg', '90deg', '180deg', '45deg'];
const GRADIENT_LABELS: Record<string, string> = {
  '135deg': '대각선 ↘',
  '90deg': '가로 →',
  '180deg': '세로 ↓',
  '45deg': '대각선 ↗',
};

const ANIMATIONS = [
  { value: 'none', label: '없음' },
  { value: 'gradient-shift', label: '그라디언트 흐름' },
  { value: 'stars', label: '별 반짝임' },
  { value: 'bubbles', label: '버블' },
];

function generateCSS(s: EditorState): string {
  const bg =
    s.background.type === 'gradient'
      ? `linear-gradient(${s.background.direction}, ${s.background.color1}, ${s.background.color2})`
      : s.background.color1;

  const animationCSS = {
    none: '',
    'gradient-shift': `
@keyframes gptstyler-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`,
    stars: `
@keyframes gptstyler-twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}`,
    bubbles: `
@keyframes gptstyler-bubble {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
}`,
  }[s.animation];

  const animationBodyCSS =
    s.animation === 'gradient-shift' && s.background.type === 'gradient'
      ? `
  background-size: 200% 200% !important;
  animation: gptstyler-gradient 8s ease infinite !important;`
      : '';

  const starsCSS =
    s.animation === 'stars'
      ? `
#gptstyler-stars {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
}
#gptstyler-stars span {
  position: absolute; width: 3px; height: 3px; background: white; border-radius: 50%;
  animation: gptstyler-twinkle 2s infinite;
}`
      : '';

  const bubblesCSS =
    s.animation === 'bubbles'
      ? `
#gptstyler-bubbles {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
}
#gptstyler-bubbles span {
  position: absolute; bottom: -60px; width: 20px; height: 20px;
  background: rgba(255,255,255,0.08); border-radius: 50%;
  animation: gptstyler-bubble 6s infinite;
}`
      : '';

  return `/* GPTStyler - Generated CSS */
${animationCSS}

/* Background */
body,
[class*="bg-token-main-surface"],
main {
  background: ${bg} !important;${animationBodyCSS}
  font-family: ${s.font.family} !important;
  font-size: ${s.font.size}px !important;
}

/* Sidebar */
nav,
[class*="bg-token-sidebar"],
[class*="dark:bg-gray-9"] {
  background: ${s.sidebar.color} !important;
}

/* User message bubble */
[data-message-author-role="user"] .whitespace-pre-wrap,
[class*="bg-token-message-surface"] {
  background: ${s.userBubble.bg} !important;
  color: ${s.userBubble.text} !important;
  border-radius: ${s.roundness}px !important;
}

/* AI message bubble */
[data-message-author-role="assistant"] .markdown,
[data-message-author-role="assistant"] .prose {
  color: ${s.aiBubble.text} !important;
}

/* Input area */
#prompt-textarea {
  border-radius: ${s.roundness}px !important;
}
${starsCSS}
${bubblesCSS}`.trim();
}

// Color picker row
function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-mono">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md cursor-pointer border border-surface-3 bg-transparent p-0.5"
        />
      </div>
    </div>
  );
}

// Section wrapper
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default function VisualEditor() {
  const router = useRouter();
  const [state, setState] = useState<EditorState>(DEFAULT_STATE);
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = useCallback((path: string, value: any) => {
    setState((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !author.trim()) {
      setError('이름과 닉네임을 입력해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, author, description, css: generateCSS(state) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '업로드 실패');
      }
      const { id } = await res.json();
      router.push(`/styles/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top meta */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="스타일 이름 *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="flex-1 bg-surface-2 border border-surface-3 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
        />
        <input
          type="text"
          placeholder="닉네임 *"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={30}
          className="w-36 bg-surface-2 border border-surface-3 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
        />
      </div>
      <input
        type="text"
        placeholder="설명 (선택)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={200}
        className="bg-surface-2 border border-surface-3 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
      />

      {/* Editor area */}
      <div className="flex gap-5 items-start">
        {/* Controls */}
        <div className="w-72 flex-shrink-0 bg-surface-1 border border-surface-3 rounded-xl p-5 flex flex-col gap-6">

          <Section title="배경">
            <div className="flex gap-2">
              {(['solid', 'gradient'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update('background.type', t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    state.background.type === t
                      ? 'bg-brand text-white'
                      : 'bg-surface-2 text-gray-400 hover:text-white'
                  }`}
                >
                  {t === 'solid' ? '단색' : '그라디언트'}
                </button>
              ))}
            </div>
            <ColorRow
              label={state.background.type === 'gradient' ? '색상 1' : '배경색'}
              value={state.background.color1}
              onChange={(v) => update('background.color1', v)}
            />
            {state.background.type === 'gradient' && (
              <>
                <ColorRow
                  label="색상 2"
                  value={state.background.color2}
                  onChange={(v) => update('background.color2', v)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">방향</span>
                  <select
                    value={state.background.direction}
                    onChange={(e) => update('background.direction', e.target.value)}
                    className="bg-surface-2 border border-surface-3 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    {GRADIENTS.map((d) => (
                      <option key={d} value={d}>{GRADIENT_LABELS[d]}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </Section>

          <Section title="사이드바">
            <ColorRow
              label="배경색"
              value={state.sidebar.color}
              onChange={(v) => update('sidebar.color', v)}
            />
          </Section>

          <Section title="말풍선">
            <ColorRow
              label="내 메시지 배경"
              value={state.userBubble.bg}
              onChange={(v) => update('userBubble.bg', v)}
            />
            <ColorRow
              label="내 메시지 글자"
              value={state.userBubble.text}
              onChange={(v) => update('userBubble.text', v)}
            />
            <ColorRow
              label="AI 메시지 글자"
              value={state.aiBubble.text}
              onChange={(v) => update('aiBubble.text', v)}
            />
          </Section>

          <Section title="폰트">
            <select
              value={state.font.family}
              onChange={(e) => update('font.family', e.target.value)}
              className="bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white focus:outline-none w-full"
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">크기</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={12}
                  max={20}
                  value={state.font.size}
                  onChange={(e) => update('font.size', Number(e.target.value))}
                  className="w-24 accent-brand"
                />
                <span className="text-xs text-gray-400 w-8">{state.font.size}px</span>
              </div>
            </div>
          </Section>

          <Section title="모서리 둥글기">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={24}
                value={state.roundness}
                onChange={(e) => update('roundness', Number(e.target.value))}
                className="flex-1 accent-brand"
              />
              <span className="text-xs text-gray-400 w-8">{state.roundness}px</span>
            </div>
          </Section>

          <Section title="배경 애니메이션">
            <div className="grid grid-cols-2 gap-2">
              {ANIMATIONS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => update('animation', a.value)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    state.animation === a.value
                      ? 'bg-brand text-white'
                      : 'bg-surface-2 text-gray-400 hover:text-white'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Preview */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <span className="text-xs text-gray-500">미리보기</span>
          <EditorPreview state={state} />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 px-4 py-2.5 rounded-lg">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors text-sm"
      >
        {loading ? '공유 중...' : '스타일 공유하기'}
      </button>
    </div>
  );
}
