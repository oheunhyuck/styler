import Link from 'next/link';
import { Style } from '@/lib/types';
import StylePreviewClient from './StylePreviewClient';

export default function StyleCard({ style }: { style: Style }) {
  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden flex flex-col hover:border-brand/50 transition-colors">
      {/* Preview thumbnail */}
      <Link href={`/styles/${style.id}`} className="block" style={{ height: 160, overflow: 'hidden' }}>
        <div style={{ pointerEvents: 'none', height: 160, overflow: 'hidden' }}>
          <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '182%', height: '182%' }}>
            <StylePreviewClient css={style.css} />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <Link href={`/styles/${style.id}`}>
            <h3 className="font-semibold text-white hover:text-brand transition-colors truncate">
              {style.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{style.description}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>by {style.author}</span>
          <div className="flex items-center gap-3">
            <span>♥ {style.likes}</span>
            <span>👁 {style.views}</span>
          </div>
        </div>

        <Link
          href={`/chat?style=${style.id}`}
          className="w-full py-2 rounded-lg text-sm font-medium text-center bg-brand hover:bg-brand-dark text-white transition-colors"
        >
          💬 이 테마로 채팅하기
        </Link>
      </div>
    </div>
  );
}
