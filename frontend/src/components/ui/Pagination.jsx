import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPages = () => {
    const range = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-text-muted hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {page > 3 && (
        <>
          <button onClick={() => onPageChange(1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-sm text-text-muted hover:bg-background cursor-pointer">1</button>
          <span className="text-text-muted px-1">…</span>
        </>
      )}

      {getPages().map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={clsx(
            'w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-medium cursor-pointer transition-colors',
            p === page
              ? 'bg-primary text-white border-primary'
              : 'border-border text-text-muted hover:bg-background'
          )}
        >
          {p}
        </button>
      ))}

      {page < pages - 2 && (
        <>
          <span className="text-text-muted px-1">…</span>
          <button onClick={() => onPageChange(pages)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-sm text-text-muted hover:bg-background cursor-pointer">{pages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-text-muted hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
