'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AIDesignChat from '@/components/AIDesignChat';
import IframePreview from '@/components/IframePreview';

export default function UploadPage() {
  const [css, setCSS] = useState('');
  const [themeName, setThemeName] = useState('AI 디자인');
  const router = useRouter();

  const goToChat = () => {
    sessionStorage.setItem('gptstyler_preview_css', css);
    sessionStorage.setItem('gptstyler_preview_name', themeName);
    router.push('/chat');
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">AI로 스타일 만들기</h1>
        <p className="text-gray-400 text-sm mt-1">
          원하는 테마를 말하면 AI가 디자인하고, 그 테마로 바로 채팅할 수 있어요.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start">
        {/* AI Chat */}
        <div className="w-full lg:flex-1 min-w-0">
          <AIDesignChat onCSSUpdate={(newCss, name) => {
            setCSS(newCss);
            if (name) setThemeName(name);
          }} />
        </div>

        {/* Preview + action — hidden on mobile until CSS is generated */}
        <div className="w-full lg:w-96 lg:flex-shrink-0 flex flex-col gap-3 lg:sticky lg:top-20">
          {css ? (
            <>
              <span className="text-xs text-gray-500">미리보기</span>
              <IframePreview css={css} />
              <button
                onClick={goToChat}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-brand hover:bg-brand-dark text-white transition-colors"
              >
                💬 이 테마로 채팅하기
              </button>
            </>
          ) : (
            <div className="hidden lg:flex flex-col gap-3">
              <span className="text-xs text-gray-500">미리보기</span>
              <IframePreview css={css} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
