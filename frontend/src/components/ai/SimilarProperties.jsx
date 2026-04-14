import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import api from '../../api/axios';
import PropertyCard from '../properties/PropertyCard';

export default function SimilarProperties({ propertyId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['similar-properties', propertyId],
    queryFn: () => api.get(`/ai/similar-properties/${propertyId}`).then((r) => r.data),
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const properties = data?.properties || [];

  if (isLoading) return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-primary" />
        <h3 className="font-heading text-base font-semibold text-text">Similar Properties</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2].map((i) => <div key={i} className="h-40 bg-background rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (!properties.length) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-primary" />
        <h3 className="font-heading text-base font-semibold text-text">Similar Properties</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}
