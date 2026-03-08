'use client';

import dynamic from 'next/dynamic';

const StylePreview = dynamic(() => import('./StylePreview'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-2" />,
});

export default function StylePreviewClient({ css }: { css: string }) {
  return <StylePreview css={css} />;
}
