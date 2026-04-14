import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize2, Star } from 'lucide-react';
import { formatPrice, formatTimeAgo, STATUS_COLORS, TYPE_COLORS, STATUS_LABELS } from '../../utils/formatters';
import clsx from 'clsx';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80';

export default function PropertyCard({ property }) {
  const {
    id, title, price, location, city,
    bedrooms, bathrooms, area_sqft,
    type, status, images, featured, created_at,
  } = property;

  const image = images?.[0]
    ? (images[0].startsWith('http') ? images[0] : `${API_BASE}${images[0]}`)
    : PLACEHOLDER;

  return (
    <Link to={`/property/${id}`} className="card-hover group block">
      {/* Image */}
      <div className="relative h-52 overflow-hidden rounded-t-2xl">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={clsx('badge', STATUS_COLORS[status] || 'bg-gray-100 text-gray-600')}>
            {STATUS_LABELS[status] || status}
          </span>
        </div>
        {featured && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-warning/90 text-white">
              <Star size={10} className="mr-1" fill="currentColor" />
              Featured
            </span>
          </div>
        )}
        {/* Type badge */}
        <div className="absolute bottom-3 left-3">
          <span className={clsx('badge', TYPE_COLORS[type] || 'bg-gray-100 text-gray-600')}>
            {type?.charAt(0).toUpperCase() + type?.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-heading font-semibold text-primary text-lg leading-tight mb-1">
          {formatPrice(price)}
        </p>
        <h3 className="text-sm font-semibold text-text line-clamp-1 mb-2 font-body">{title}</h3>

        <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
          <MapPin size={12} className="shrink-0 text-primary/60" />
          <span className="truncate">{city}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-text-muted border-t border-border/60 pt-3">
          {bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed size={13} /> {bedrooms} Bed
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath size={13} /> {bathrooms} Bath
            </span>
          )}
          {area_sqft && (
            <span className="flex items-center gap-1">
              <Maximize2 size={13} /> {Number(area_sqft).toLocaleString()} sqft
            </span>
          )}
          <span className="ml-auto">{formatTimeAgo(created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
