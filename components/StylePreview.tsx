'use client';

import IframePreview from './IframePreview';

export default function StylePreview({ css }: { css: string }) {
  return <IframePreview css={css} />;
}
