'use client';

import { useId } from 'react';
import { EditorState } from './VisualEditor';

const MOCK_MESSAGES = [
  { role: 'user', text: '안녕하세요! 오늘 날씨 어때요?' },
  { role: 'ai', text: '안녕하세요! 오늘은 맑고 따뜻한 날씨예요. 산책하기 좋은 날입니다 ☀️' },
  { role: 'user', text: '좋네요! 추천 장소 있어요?' },
  { role: 'ai', text: '한강공원이나 북한산 둘레길 어떨까요? 이 계절에 특히 아름답습니다.' },
];

// Scope AI-generated CSS to work inside the preview container only
function scopeCSS(css: string, scopeClass: string): string {
  const scope = `.${scopeClass}`;
  const lines = css.split('\n');
  const result: string[] = [];
  let depth = 0;
  let insideKeyframes = false;
  let skipBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Count braces to track nesting depth
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;

    // Pass @keyframes through unchanged
    if (trimmed.startsWith('@keyframes')) {
      insideKeyframes = true;
      result.push(line);
      depth += opens - closes;
      continue;
    }
    if (insideKeyframes) {
      result.push(line);
      depth += opens - closes;
      if (depth <= 0) { insideKeyframes = false; depth = 0; }
      continue;
    }

    // Skip :root, html, [data-theme], .dark blocks entirely (replace with scoped vars)
    if (depth === 0 && trimmed.endsWith('{')) {
      const sel = trimmed.slice(0, -1).trim();
      const isRootLike = sel.split(',').every(s => {
        const t = s.trim();
        return t === ':root' || t === 'html' || t === '[data-theme]' || t === '.dark' || t === '.light';
      });

      if (isRootLike) {
        // Replace :root with scoped .preview-main so CSS vars only apply inside preview
        result.push(`${scope} .preview-main {`);
        depth += opens - closes;
        continue;
      }

      // Map known ChatGPT selectors to preview equivalents
      const mapped = sel.split(',').map(s => {
        s = s.trim();
        if (s === 'body' || s === 'main' || s === '#__next' || s === 'html' ||
            s.includes('bg-token-main-surface') || s.includes('main-surface')) {
          return `${scope} .preview-main`;
        }
        if (s === 'nav' || s.includes('sidebar') || s.includes('nav-sidebar')) {
          return `${scope} .preview-sidebar`;
        }
        if (s.includes('author-role="user"') || s.includes('whitespace-pre-wrap') || s.includes('rounded-3xl')) {
          return `${scope} .preview-user-msg`;
        }
        if (s.includes('author-role="assistant"') || s === '.markdown' || s === '.prose' ||
            s.includes('markdown') || s.includes('prose')) {
          return `${scope} .preview-ai-msg`;
        }
        if (s === '#prompt-textarea' || s.includes('prompt-textarea') || s.includes('textarea')) {
          return `${scope} .preview-input`;
        }
        if (s === 'body::before' || s === 'body::after') {
          return `${scope} .preview-main::before, ${scope} .preview-main::after`;
        }
        return `${scope} ${s}`;
      }).join(', ');

      result.push(`${mapped} {`);
      depth += opens - closes;
      continue;
    }

    depth += opens - closes;
    result.push(line);
  }

  return result.join('\n');
}

export default function EditorPreview({
  state,
  overrideCSS,
}: {
  state: EditorState;
  overrideCSS?: string;
}) {
  const scopeClass = useId().replace(/:/g, 'x');

  const bg =
    state.background.type === 'gradient'
      ? `linear-gradient(${state.background.direction}, ${state.background.color1}, ${state.background.color2})`
      : state.background.color1;

  const animationStyle =
    !overrideCSS && state.animation === 'gradient-shift' && state.background.type === 'gradient'
      ? { backgroundSize: '200% 200%', animation: 'gptstyler-preview-gradient 8s ease infinite' }
      : {};

  const scoped = overrideCSS ? scopeCSS(overrideCSS, scopeClass) : '';

  return (
    <div
      className={`rounded-xl overflow-hidden border border-surface-3 flex ${scopeClass}`}
      style={{ height: 480, contain: 'style', isolation: 'isolate' }}
    >
      <style>{`
        @keyframes gptstyler-preview-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gptstyler-preview-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes gptstyler-preview-bubble {
          0% { transform: translateY(0); opacity: 0.5; }
          100% { transform: translateY(-200px); opacity: 0; }
        }
        ${scoped}
      `}</style>

      {/* Sidebar */}
      <div
        className="preview-sidebar w-44 flex-shrink-0 flex flex-col p-3 gap-2"
        style={!overrideCSS ? { background: state.sidebar.color } : {}}
      >
        <div className="text-xs font-semibold text-gray-400 px-2 pt-1 mb-1">GPTStyler</div>
        {['오늘의 날씨', '여행 계획', '코드 리뷰'].map((item) => (
          <div key={item} className="text-xs px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 cursor-pointer truncate">
            {item}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div
        className="preview-main flex-1 flex flex-col relative overflow-hidden"
        style={!overrideCSS ? { background: bg, ...animationStyle } : {}}
      >
        {/* State-based overlays (only when no AI CSS) */}
        {!overrideCSS && state.animation === 'stars' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: 'white',
                left: `${(i * 37 + 13) % 100}%`, top: `${(i * 53 + 7) % 100}%`,
                animation: `gptstyler-preview-twinkle ${1.5 + (i % 3) * 0.5}s ${(i % 4) * 0.5}s infinite`,
              }} />
            ))}
          </div>
        )}

        {!overrideCSS && state.animation === 'bubbles' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', width: 12 + i * 4, height: 12 + i * 4,
                borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
                left: `${10 + i * 11}%`, bottom: -20,
                animation: `gptstyler-preview-bubble ${4 + i}s ${i * 0.7}s infinite`,
              }} />
            ))}
          </div>
        )}

        {/* AI CSS star overlay: inject star elements if CSS mentions stars/twinkle */}
        {overrideCSS && (overrideCSS.includes('twinkle') || overrideCSS.includes('star')) && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', width: i % 5 === 0 ? 3 : 2, height: i % 5 === 0 ? 3 : 2,
                borderRadius: '50%', background: 'white',
                left: `${(i * 37 + 13) % 100}%`, top: `${(i * 53 + 7) % 100}%`,
                animation: `gptstyler-preview-twinkle ${1.5 + (i % 3) * 0.7}s ${(i % 5) * 0.4}s infinite`,
              }} />
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative z-10">
          {MOCK_MESSAGES.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.role === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-brand flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">G</div>
              )}
              <div
                className={`max-w-[75%] px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'preview-user-msg' : 'preview-ai-msg'
                }`}
                style={!overrideCSS ? {
                  borderRadius: state.roundness,
                  background: msg.role === 'user' ? state.userBubble.bg : 'transparent',
                  color: msg.role === 'user' ? state.userBubble.text : state.aiBubble.text,
                } : { borderRadius: 12 }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 relative z-10">
          <div
            className="preview-input flex items-center gap-2 px-3 py-2 text-xs text-gray-500"
            style={!overrideCSS ? {
              background: 'rgba(255,255,255,0.07)',
              borderRadius: state.roundness,
              border: '1px solid rgba(255,255,255,0.1)',
            } : {
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="flex-1">메시지 입력...</span>
            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-white text-xs">↑</div>
          </div>
        </div>
      </div>
    </div>
  );
}
