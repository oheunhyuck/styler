'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-surface-3 bg-surface-1 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-brand transition-colors">
          <span className="text-brand">★</span>
          GPTStyler
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            갤러리
          </Link>
          <Link href="/upload" className="text-sm bg-brand hover:bg-brand-dark text-white px-4 py-1.5 rounded-lg transition-colors font-medium">
            스타일 올리기
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-surface-2 transition-colors"
          aria-label="메뉴 열기"
        >
          <span className={`block w-5 h-0.5 bg-gray-300 transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-surface-3 bg-surface-1 px-4 py-3 flex flex-col gap-3">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-sm text-gray-400 hover:text-white transition-colors py-2"
          >
            갤러리
          </Link>
          <Link
            href="/upload"
            onClick={() => setMenuOpen(false)}
            className="text-sm bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-center"
          >
            스타일 올리기
          </Link>
        </div>
      )}
    </nav>
  );
}
