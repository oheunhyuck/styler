'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PLACEHOLDER_CSS = `/* 예시: ChatGPT 다크 퍼플 테마 */
:root {
  --main-surface-primary: #1a1a2e;
  --main-surface-secondary: #16213e;
}

body {
  font-family: 'Inter', sans-serif;
}`;

export default function UploadForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', author: '', css: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.css || !form.author) {
      setError('이름, 작성자, CSS는 필수입니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '업로드 실패');
      }

      const { id } = await res.json();
      router.push(`/styles/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          스타일 이름 <span className="text-red-400">*</span>
        </label>
        <input
          type="text" name="name" value={form.name} onChange={handleChange}
          placeholder="예: 다크 퍼플 테마" maxLength={60}
          className="bg-surface-2 border border-surface-3 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          작성자 닉네임 <span className="text-red-400">*</span>
        </label>
        <input
          type="text" name="author" value={form.author} onChange={handleChange}
          placeholder="예: user123" maxLength={30}
          className="bg-surface-2 border border-surface-3 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">설명</label>
        <input
          type="text" name="description" value={form.description} onChange={handleChange}
          placeholder="어떤 스타일인지 간단히 설명해주세요" maxLength={200}
          className="bg-surface-2 border border-surface-3 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          CSS <span className="text-red-400">*</span>
        </label>
        <textarea
          name="css" value={form.css} onChange={handleChange}
          placeholder={PLACEHOLDER_CSS} rows={16}
          className="bg-surface-2 border border-surface-3 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-700 font-mono focus:outline-none focus:border-brand transition-colors resize-y"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 px-4 py-2.5 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit" disabled={loading}
        className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {loading ? '업로드 중...' : '스타일 공유하기'}
      </button>
    </form>
  );
}
