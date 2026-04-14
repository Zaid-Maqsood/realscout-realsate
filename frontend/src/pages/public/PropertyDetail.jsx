import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, Bed, Bath, Maximize2, Calendar, User, Phone, Mail,
  ArrowLeft, Share2, Heart, Building2,
} from 'lucide-react';
import api from '../../api/axios';
import PublicNavbar from '../../components/layout/PublicNavbar';
import ImageGallery from '../../components/properties/ImageGallery';
import LeadForm from '../../components/leads/LeadForm';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatPrice, formatDate, STATUS_COLORS, TYPE_COLORS, STATUS_LABELS } from '../../utils/formatters';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function PropertyDetail() {
  const { id } = useParams();

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ['property', id],
    queryFn: () => api.get(`/properties/${id}`).then((r) => r.data),
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) return <div className="min-h-screen bg-background"><PublicNavbar /><div className="pt-20"><PageLoader /></div></div>;
  if (isError || !property) return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="text-center">
          <Building2 size={48} className="mx-auto text-border mb-4" />
          <h2 className="font-heading text-xl font-semibold text-text mb-2">Property Not Found</h2>
          <Link to="/browse" className="btn-primary mt-4">Browse Properties</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-5 text-sm">
          <Link to="/" className="text-text-muted hover:text-text transition-colors">Home</Link>
          <span className="text-border">/</span>
          <Link to="/browse" className="text-text-muted hover:text-text transition-colors">Browse</Link>
          <span className="text-border">/</span>
          <span className="text-text truncate max-w-xs">{property.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <ImageGallery images={property.images} />

            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={clsx('badge', STATUS_COLORS[property.status])}>
                  {STATUS_LABELS[property.status]}
                </span>
                <span className={clsx('badge', TYPE_COLORS[property.type])}>
                  {property.type?.charAt(0).toUpperCase() + property.type?.slice(1)}
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-2 leading-tight">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-text-muted mb-4">
                <MapPin size={16} className="text-primary shrink-0" />
                <span>{property.location}, {property.city}</span>
              </div>

              <p className="font-heading text-3xl font-bold text-primary">
                {formatPrice(property.price)}
              </p>
            </div>

            {/* Specs */}
            <div className="card p-5">
              <h3 className="font-heading text-base font-semibold text-text mb-4">Property Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.bedrooms != null && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bed size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-text">{property.bedrooms}</p>
                      <p className="text-xs text-text-muted">Bedrooms</p>
                    </div>
                  </div>
                )}
                {property.bathrooms != null && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cta/10 flex items-center justify-center">
                      <Bath size={18} className="text-cta" />
                    </div>
                    <div>
                      <p className="font-semibold text-text">{property.bathrooms}</p>
                      <p className="text-xs text-text-muted">Bathrooms</p>
                    </div>
                  </div>
                )}
                {property.area_sqft && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Maximize2 size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-text">{Number(property.area_sqft).toLocaleString()}</p>
                      <p className="text-xs text-text-muted">Sqft</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Calendar size={18} className="text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold text-text text-sm">{formatDate(property.created_at)}</p>
                    <p className="text-xs text-text-muted">Listed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="card p-5">
                <h3 className="font-heading text-base font-semibold text-text mb-3">Description</h3>
                <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Agent Info */}
            {(property.agent_name || property.owner_name) && (
              <div className="card p-5">
                <h3 className="font-heading text-base font-semibold text-text mb-4">
                  {property.agent_name ? 'Listed By Agent' : 'Owner'}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text">{property.agent_name || property.owner_name}</p>
                    {property.agent_email && (
                      <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                        <Mail size={12} /> {property.agent_email}
                      </p>
                    )}
                    {property.agent_phone && (
                      <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                        <Phone size={12} /> {property.agent_phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Link to="/browse" className="btn-outline flex-1 justify-center">
                <ArrowLeft size={16} /> Back to Listings
              </Link>
              <button onClick={handleShare} className="btn-ghost border border-border">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>

          {/* Right Column — Lead Form */}
          <div className="space-y-4">
            <LeadForm propertyId={id} propertyTitle={property.title} />

          </div>
        </div>
      </div>
    </div>
  );
}
