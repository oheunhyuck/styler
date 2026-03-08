import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b border-surface-3 bg-surface-1 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-brand transition-colors">
          <span className="text-brand">★</span>
          GPTStyler
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            갤러리
          </Link>
          <Link href="/upload" className="text-sm bg-brand hover:bg-brand-dark text-white px-4 py-1.5 rounded-lg transition-colors font-medium">
            스타일 올리기
          </Link>
        </div>
      </div>
    </nav>
  );
}
