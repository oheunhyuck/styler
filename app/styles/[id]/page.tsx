import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Style } from '@/lib/types';
import LikeButton from '@/components/LikeButton';
import StylePreviewClient from '@/components/StylePreviewClient';
import Comments from '@/components/Comments';
import ViewTracker from '@/components/ViewTracker';

export const revalidate = 10;

async function getStyle(id: string): Promise<Style | null> {
  const { data, error } = await supabase
    .from('styles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export default async function StyleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const style = await getStyle(params.id);
  if (!style) notFound();

  return (
    <div className="max-w-4xl flex flex-col gap-6 sm:gap-8">
      <ViewTracker styleId={style.id} />
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{style.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{style.description}</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs text-gray-600">
          <span>by {style.author}</span>
          <span>♥ {style.likes} 좋아요</span>
          <span>👁 {style.views} 조회</span>
          <span>{new Date(style.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      {/* Preview */}
      <StylePreviewClient css={style.css} />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`/chat?style=${style.id}`}
          className="w-full sm:flex-1 py-2.5 rounded-lg text-sm font-semibold text-center bg-brand hover:bg-brand-dark text-white transition-colors"
        >
          💬 이 테마로 채팅하기
        </a>
        <LikeButton styleId={style.id} initialLikes={style.likes} />
      </div>

      {/* Comments */}
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 sm:p-5">
        <Comments styleId={style.id} />
      </div>
    </div>
  );
}
