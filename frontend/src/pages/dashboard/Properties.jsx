import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePageContext } from '../../context/PageContextContext';
import { Eye, Building2, Search, BedDouble, Bath, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatPrice, STATUS_COLORS, STATUS_LABELS, TYPE_COLORS } from '../../utils/formatters';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import clsx from 'clsx';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

export default function Properties() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'all', page, search, typeFilter, statusFilter],
    queryFn: () => {
      const params = { page, limit: 12, status: statusFilter || 'all' };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      return api.get('/properties', { params }).then((r) => r.data);
    },
  });

  const { updatePageContext } = usePageContext();
  useEffect(() => {
    if (!data) return;
    const activeFilters = [
      search && `search="${search}"`,
      typeFilter && `type=${typeFilter}`,
      statusFilter && `status=${statusFilter}`,
    ].filter(Boolean).join(', ');
    const list = (data.properties || [])
      .map((p) => `"${p.title}" — ${p.type}, ${p.city}, $${Number(p.price).toLocaleString()}, ${p.status}`)
      .join('; ');
    updatePageContext(
      `Showing page ${page} of ${data.pages ?? 1} (${data.total ?? 0} total properties).` +
      (activeFilters ? ` Active filters: ${activeFilters}.` : ' No filters active.') +
      ` This page has ${data.properties?.length ?? 0} properties: ${list}.` +
      ` Note: this page only shows 12 at a time — for city/price queries, advise the user to use the search bar and filter dropdowns at the top.`
    );
  }, [data, page, search, typeFilter, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Stats + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-sm text-text-muted shrink-0">{data?.total ?? 0} properties total</p>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="flex items-center gap-2 input-field py-2 flex-1 min-w-44">
            <Search size={15} className="text-text-muted shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search properties…"
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="input-field w-auto text-sm cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="commercial">Commercial</option>
            <option value="plot">Plot</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field w-auto text-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : data?.properties?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.properties.map((p) => {
              const img = p.images?.[0]
                ? (p.images[0].startsWith('http') ? p.images[0] : `${API_BASE}${p.images[0]}`)
                : PLACEHOLDER;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {/* Image — tall, full bleed */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={clsx('badge shadow-sm', STATUS_COLORS[p.status])}>
                        {STATUS_LABELS[p.status]}
                      </span>
                    </div>
                    {/* Type badge */}
                    <div className="absolute top-3 right-3">
                      <span className={clsx('badge shadow-sm', TYPE_COLORS[p.type])}>
                        {p.type}
                      </span>
                    </div>
                    {/* Hover overlay */}
                    <Link
                      to={`/property/${p.id}`}
                      target="_blank"
                      className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/25 transition-all duration-300 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 text-text font-semibold text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow">
                        <Eye size={14} /> View Property
                      </span>
                    </Link>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Price */}
                    <p className="font-heading text-xl font-bold text-primary mb-1">
                      {formatPrice(p.price)}
                    </p>

                    {/* Title */}
                    <h3 className="font-semibold text-text text-sm leading-snug mb-1 line-clamp-2">
                      {p.title}
                    </h3>

                    {/* Location */}
                    <p className="text-xs text-text-muted mb-3 truncate">
                      {p.location}, {p.city}
                    </p>

                    {/* Specs */}
                    {(p.bedrooms || p.bathrooms || p.area_sqft) && (
                      <div className="flex items-center gap-3 text-xs text-text-muted pt-2 border-t border-border/40 mt-auto">
                        {p.bedrooms && (
                          <span className="flex items-center gap-1">
                            <BedDouble size={12} /> {p.bedrooms}
                          </span>
                        )}
                        {p.bathrooms && (
                          <span className="flex items-center gap-1">
                            <Bath size={12} /> {p.bathrooms}
                          </span>
                        )}
                        {p.area_sqft && (
                          <span className="flex items-center gap-1">
                            <Maximize2 size={12} /> {Number(p.area_sqft).toLocaleString()} sqft
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination page={page} pages={data.pages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
}
