import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, Building2 } from 'lucide-react';
import api from '../../api/axios';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PropertyCard from '../../components/properties/PropertyCard';
import Pagination from '../../components/ui/Pagination';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    city: searchParams.get('city') || '',
    status: searchParams.get('status') || 'available',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const queryParams = Object.fromEntries(
    Object.entries({ ...filters, page, limit: 12 }).filter(([, v]) => v !== '')
  );

  const { data, isLoading } = useQuery({
    queryKey: ['properties', queryParams],
    queryFn: () => api.get('/properties', { params: queryParams }).then((r) => r.data),
    keepPreviousData: true,
  });

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value); else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ type: '', city: '', status: 'available', min_price: '', max_price: '', bedrooms: '', search: '', featured: '' });
    setSearchParams({});
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'status').length;

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text">Browse Properties</h1>
            {data && (
              <p className="text-sm text-text-muted mt-1">
                {data.total} properties found
              </p>
            )}
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="btn-outline text-sm md:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`shrink-0 w-64 ${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="card p-5 space-y-5 sticky top-20">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-semibold text-text">Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-danger hover:underline cursor-pointer flex items-center gap-1">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="label text-xs">Search</label>
                <input
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="input-field text-xs"
                  placeholder="Title, area…"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="label text-xs">Property Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="input-field text-xs cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="commercial">Commercial</option>
                  <option value="plot">Plot</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="label text-xs">City</label>
                <select
                  value={filters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                  className="input-field text-xs cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="label text-xs">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="input-field text-xs cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="label text-xs">Price Range (USD)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    value={filters.min_price}
                    onChange={(e) => updateFilter('min_price', e.target.value)}
                    className="input-field text-xs"
                    placeholder="Min price"
                  />
                  <input
                    type="number"
                    value={filters.max_price}
                    onChange={(e) => updateFilter('max_price', e.target.value)}
                    className="input-field text-xs"
                    placeholder="Max price"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="label text-xs">Min Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => updateFilter('bedrooms', e.target.value)}
                  className="input-field text-xs cursor-pointer"
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
                </select>
              </div>

              {/* Featured */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured === 'true'}
                  onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-text">Featured only</span>
              </label>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <PageLoader />
            ) : data?.properties?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {data.properties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  pages={data.pages}
                  onPageChange={setPage}
                />
              </>
            ) : (
              <EmptyState
                icon={Building2}
                title="No properties found"
                description="Try adjusting your filters to find more properties."
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
