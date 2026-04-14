import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Building2, TrendingUp, Users, Star, ArrowRight, Home as HomeIcon, Briefcase, TreePine } from 'lucide-react';
import api from '../../api/axios';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PropertyCard from '../../components/properties/PropertyCard';
import { PageLoader } from '../../components/ui/LoadingSpinner';

const PROPERTY_TYPES = [
  { label: 'Houses',      value: 'house',      icon: HomeIcon,  color: 'bg-primary/10 text-primary' },
  { label: 'Apartments',  value: 'apartment',  icon: Building2, color: 'bg-cta/10 text-cta' },
  { label: 'Commercial',  value: 'commercial', icon: Briefcase, color: 'bg-purple-100 text-purple-600' },
  { label: 'Plots',       value: 'plot',       icon: TreePine,  color: 'bg-warning/10 text-warning' },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('');

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => api.get('/properties?featured=true&limit=6').then((r) => r.data),
  });

  const { data: statsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics').then((r) => r.data).catch(() => null),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (searchType) params.set('type', searchType);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85"
            alt="Modern home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-text/80 via-text/50 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary-light rounded-full px-4 py-1.5 text-sm font-semibold mb-6 backdrop-blur-sm">
              <Star size={14} fill="currentColor" />
              Pakistan's Premier Real Estate Platform
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-white leading-tight mb-4">
              Find Your
              <span className="block text-primary-light">Dream Home</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Browse thousands of verified properties across Pakistan. Buy, sell, or rent with confidence.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="bg-surface rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <MapPin size={18} className="text-primary shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search city, area, or property…"
                  className="flex-1 outline-none text-sm text-text placeholder-text-light bg-transparent py-2"
                />
              </div>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="sm:w-40 px-3 py-2 rounded-xl border border-border text-sm text-text bg-background cursor-pointer focus:outline-none focus:border-primary"
              >
                <option value="">All Types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="commercial">Commercial</option>
                <option value="plot">Plot</option>
              </select>
              <button type="submit" className="btn-primary px-6 justify-center">
                <Search size={16} />
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-white/70">
              <span className="flex items-center gap-1"><MapPin size={13} />Lahore</span>
              <span className="flex items-center gap-1"><MapPin size={13} />Karachi</span>
              <span className="flex items-center gap-1"><MapPin size={13} />Islamabad</span>
              <span className="flex items-center gap-1"><MapPin size={13} />Rawalpindi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Properties Listed', value: statsData?.properties?.total ?? '500+' },
            { label: 'Active Listings',   value: statsData?.properties?.available ?? '300+' },
            { label: 'Properties Sold',   value: statsData?.properties?.sold ?? '200+' },
            { label: 'Happy Clients',     value: statsData?.leads?.closed ?? '150+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-heading text-3xl font-bold text-white">{value}</p>
              <p className="text-primary-light text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Property Types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold text-text mb-3">Browse by Type</h2>
          <p className="text-text-muted">Find the perfect property for your needs</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROPERTY_TYPES.map(({ label, value, icon: Icon, color }) => (
            <Link
              key={value}
              to={`/browse?type=${value}`}
              className="card-hover p-6 flex flex-col items-center gap-3 text-center"
            >
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
                <Icon size={24} />
              </div>
              <span className="font-semibold text-text text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-bold text-text mb-1">Featured Properties</h2>
            <p className="text-text-muted">Handpicked premium listings</p>
          </div>
          <Link to="/browse?featured=true" className="btn-outline text-sm hidden sm:inline-flex">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : featuredData?.properties?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData.properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-text-muted">
            <Building2 size={40} className="mx-auto mb-4 text-border" />
            <p>No featured properties yet. Be the first to list!</p>
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link to="/browse" className="btn-outline">View All Properties</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary-light py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">Ready to List Your Property?</h2>
          <p className="text-white/80 mb-8 text-lg">Join thousands of sellers and agents on RealScout</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors inline-flex items-center gap-2 justify-center cursor-pointer">
              <Users size={18} />
              Register Free
            </Link>
            <Link to="/browse" className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2 justify-center cursor-pointer">
              <TrendingUp size={18} />
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="font-heading font-semibold text-white">RealScout</span>
          </div>
          <p className="text-text-light text-sm">© 2025 RealScout. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-text-light">
            <Link to="/browse" className="hover:text-white transition-colors">Browse</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
