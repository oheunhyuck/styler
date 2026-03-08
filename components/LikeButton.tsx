'use client';

import { useState, useEffect } from 'react';

export default function LikeButton({ styleId, initialLikes }: { styleId: string; initialLikes: number }) {
  const storageKey = `gptstyler_liked_${styleId}`;

  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restore liked state from localStorage (persists across refreshes)
  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === '1');
  }, [storageKey]);

  const handleLike = async () => {
    if (liked || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/styles/${styleId}/like`, { method: 'POST' });
      if (res.ok) {
        setLikes(n => n + 1);
        setLiked(true);
        localStorage.setItem(storageKey, '1');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked || loading}
      title={liked ? '이미 좋아요 했습니다' : '좋아요'}
      className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-lg border text-sm font-medium transition-colors ${
        liked
          ? 'border-red-800 bg-red-950/40 text-red-400'
          : 'border-surface-3 bg-surface-1 text-gray-400 hover:border-red-800 hover:text-red-400'
      } disabled:cursor-default`}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{likes}</span>
    </button>
  );
}
