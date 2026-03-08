'use client';

import { useState, useEffect } from 'react';

type Comment = { id: string; author: string; content: string; created_at: string };

export default function Comments({ styleId }: { styleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/comments/${styleId}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setComments(data));
  }, [styleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments/${styleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setComments(prev => [data, ...prev]);
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return '방금';
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
  };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-sm font-semibold text-gray-300">
        댓글 {comments.length > 0 && <span className="text-gray-500">{comments.length}</span>}
      </h3>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="닉네임"
            maxLength={30}
            className="w-28 bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
          />
          <input
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="이 테마 어떠세요?"
            maxLength={500}
            className="flex-1 bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
          />
          <button
            type="submit"
            disabled={submitting || !author.trim() || !content.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand hover:bg-brand-dark disabled:opacity-40 text-white transition-colors whitespace-nowrap"
          >
            {submitting ? '...' : '등록'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-600 py-4 text-center">첫 댓글을 남겨보세요!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map(c => (
            <div key={c.id} className="bg-surface-2 rounded-xl px-4 py-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">{c.author}</span>
                <span className="text-xs text-gray-600">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
