import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import clsx from 'clsx';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

function resolveUrl(src) {
  if (!src) return PLACEHOLDER;
  return src.startsWith('http') ? src : `${API_BASE}${src}`;
}

export default function ImageGallery({ images = [] }) {
  const [lightbox, setLightbox] = useState(null); // index
  const imgs = images.length ? images : [null];

  const prev = () => setLightbox((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setLightbox((i) => (i + 1) % imgs.length);

  return (
    <>
      {/* Grid */}
      <div className={clsx(
        'grid gap-2 rounded-2xl overflow-hidden',
        imgs.length === 1 ? 'grid-cols-1' :
        imgs.length === 2 ? 'grid-cols-2' :
        'grid-cols-2'
      )}>
        {imgs.slice(0, 3).map((img, i) => (
          <div
            key={i}
            className={clsx(
              'relative overflow-hidden cursor-pointer group',
              i === 0 && imgs.length > 1 ? 'row-span-2' : '',
              i === 0 ? 'h-72' : 'h-[138px]'
            )}
            onClick={() => setLightbox(i)}
          >
            <img
              src={resolveUrl(img)}
              alt={`Property image ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-text/0 group-hover:bg-text/10 transition-colors flex items-center justify-center">
              <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {i === 2 && imgs.length > 3 && (
              <div className="absolute inset-0 bg-text/50 flex items-center justify-center">
                <span className="text-white font-heading text-xl font-semibold">+{imgs.length - 3}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-text/90 flex items-center justify-center p-4">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-surface/20 rounded-full flex items-center justify-center text-white hover:bg-surface/40 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>

          <button
            onClick={prev}
            className="absolute left-4 w-10 h-10 bg-surface/20 rounded-full flex items-center justify-center text-white hover:bg-surface/40 cursor-pointer transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <img
            src={resolveUrl(imgs[lightbox])}
            alt="Full size"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
          />

          <button
            onClick={next}
            className="absolute right-4 w-10 h-10 bg-surface/20 rounded-full flex items-center justify-center text-white hover:bg-surface/40 cursor-pointer transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 text-white/70 text-sm">
            {lightbox + 1} / {imgs.length}
          </div>
        </div>
      )}
    </>
  );
}
