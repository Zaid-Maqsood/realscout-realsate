import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, Home, BedDouble, Bath, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, formatDate, STATUS_COLORS, STATUS_LABELS, TYPE_COLORS } from '../../utils/formatters';
import Modal from '../../components/ui/Modal';
import PropertyForm from '../../components/properties/PropertyForm';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

export default function MyProperties() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-properties', user?.id],
    queryFn: () =>
      api.get('/properties', { params: { owner_id: user.id, status: 'all', limit: 50 } })
        .then((r) => r.data),
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: ({ formData }) =>
      api.post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-properties'] });
      setCreateOpen(false);
      toast.success('Property listed!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create property'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) =>
      api.put(`/properties/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-properties'] });
      setEditItem(null);
      toast.success('Property updated!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/properties/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-properties'] });
      setDeleteItem(null);
      toast.success('Property removed');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const buildFormData = (data, existingImages) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'images') {
        if (v?.[0]) Array.from(v).forEach((f) => fd.append('images', f));
      } else if (v !== undefined && v !== null && v !== '') {
        fd.append(k, v);
      }
    });
    if (existingImages?.length) fd.append('existing_images', JSON.stringify(existingImages));
    return fd;
  };

  const properties = data?.properties || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{properties.length} listing{properties.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm shrink-0">
          <Plus size={16} /> List a Property
        </button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => {
            const img = p.images?.[0]
              ? (p.images[0].startsWith('http') ? p.images[0] : `${API_BASE}${p.images[0]}`)
              : PLACEHOLDER;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Image — clothing brand style: tall, full bleed */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={img}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Status badge overlay */}
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
                  {/* View button overlay */}
                  <Link
                    to={`/property/${p.id}`}
                    target="_blank"
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all duration-300 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 text-text font-semibold text-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <Eye size={14} /> View Listing
                    </span>
                  </Link>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Price */}
                  <p className="font-heading text-2xl font-bold text-primary mb-1">
                    {formatPrice(p.price)}
                  </p>

                  {/* Title */}
                  <h3 className="font-semibold text-text text-sm leading-snug mb-2 line-clamp-2">
                    {p.title}
                  </h3>

                  {/* Location */}
                  <p className="text-xs text-text-muted mb-3 truncate">{p.location}, {p.city}</p>

                  {/* Specs */}
                  {(p.bedrooms || p.bathrooms || p.area_sqft) && (
                    <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                      {p.bedrooms && (
                        <span className="flex items-center gap-1">
                          <BedDouble size={12} /> {p.bedrooms} bed
                        </span>
                      )}
                      {p.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Bath size={12} /> {p.bathrooms} bath
                        </span>
                      )}
                      {p.area_sqft && (
                        <span className="flex items-center gap-1">
                          <Maximize2 size={12} /> {Number(p.area_sqft).toLocaleString()} sqft
                        </span>
                      )}
                    </div>
                  )}

                  {/* Listed date */}
                  <p className="text-xs text-text-muted mt-auto pt-2 border-t border-border/40">
                    Listed {formatDate(p.created_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setEditItem(p)}
                      className="flex-1 btn-outline text-xs py-2 justify-center"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteItem(p)}
                      className="p-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      title="Remove listing"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Home}
          title="No listings yet"
          description="You haven't listed any properties. List your first property to get started."
          action={
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus size={16} /> List a Property
            </button>
          }
        />
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="List a Property" size="lg">
        <PropertyForm
          loading={createMutation.isPending}
          onSubmit={(data, existingImages) =>
            createMutation.mutate({ formData: buildFormData(data, existingImages) })
          }
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Listing" size="lg">
        {editItem && (
          <PropertyForm
            defaultValues={editItem}
            loading={updateMutation.isPending}
            onSubmit={(data, existingImages) =>
              updateMutation.mutate({ id: editItem.id, formData: buildFormData(data, existingImages) })
            }
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        loading={deleteMutation.isPending}
        title="Remove Listing?"
        message={`Remove "${deleteItem?.title}" from your listings? This cannot be undone.`}
      />
    </div>
  );
}
