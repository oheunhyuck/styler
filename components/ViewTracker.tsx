'use client';

import { useEffect } from 'react';

export default function ViewTracker({ styleId }: { styleId: string }) {
  useEffect(() => {
    fetch(`/api/views/${styleId}`, { method: 'POST' });
  }, [styleId]);

  return null;
}
