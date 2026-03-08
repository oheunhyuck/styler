import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Style } from '@/lib/types';
import Gallery from '@/components/Gallery';

export const revalidate = 30;

async function getStyles(): Promise<Style[]> {
  const { data, error } = await supabase
    .from('styles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch styles:', error);
    return [];
  }
  return data ?? [];
}

export default async function HomePage() {
  const styles = await getStyles();

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="text-center py-8 sm:py-12 flex flex-col items-center gap-4 sm:gap-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
          나만의 테마로 <span className="text-brand">AI와 채팅</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-lg px-2">
          원하는 분위기의 테마를 고르거나 직접 만들고, 그 공간에서 AI와 대화하세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
          <Link
            href="/chat"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition-colors text-center"
          >
            💬 지금 바로 채팅하기
          </Link>
          <Link
            href="/upload"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-surface-3 text-white font-semibold text-sm transition-colors text-center"
          >
            ✦ AI로 테마 만들기
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-400">{styles.length}개 스타일</h2>
      </div>

      <Gallery styles={styles} />
    </div>
  );
}
