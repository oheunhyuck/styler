'use client';

import { useState } from 'react';
import { Style } from '@/lib/types';

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || '';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'no-extension';

export default function DownloadButton({ style }: { style: Style }) {
  const [status, setStatus] = useState<Status>('idle');

  const handleApply = async () => {
    setStatus('loading');

    try {
      const chrome = (window as any).chrome;
      if (!chrome?.runtime?.sendMessage) {
        setStatus('no-extension');
        return;
      }

      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { type: 'APPLY_STYLE', css: style.css, name: style.name, id: style.id },
        (response: any) => {
          if (chrome.runtime.lastError || !response?.success) {
            setStatus('error');
            return;
          }
          setStatus('success');
          setTimeout(() => setStatus('idle'), 3000);
          fetch(`/api/views/${style.id}`, { method: 'POST' });
        }
      );
    } catch {
      setStatus('error');
    }
  };

  const labels: Record<Status, string> = {
    idle: '확장프로그램에 적용',
    loading: '적용 중...',
    success: '적용 완료!',
    error: '오류 발생',
    'no-extension': '확장프로그램 필요',
  };

  const colors: Record<Status, string> = {
    idle: 'bg-brand hover:bg-brand-dark text-white',
    loading: 'bg-surface-3 text-gray-400 cursor-wait',
    success: 'bg-green-700 text-white',
    error: 'bg-red-900 text-red-200',
    'no-extension': 'bg-yellow-900 text-yellow-200',
  };

  return (
    <button
      onClick={handleApply}
      disabled={status === 'loading'}
      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${colors[status]}`}
    >
      {labels[status]}
    </button>
  );
}
