import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { PROPERTY_TYPES, PROPERTY_STATUSES } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function PropertyForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: defaultValues || {},
  });

  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(defaultValues?.images || []);

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
    setExistingImages(defaultValues?.images || []);
  }, [defaultValues, reset]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeExisting = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = (data) => {
    onSubmit(data, existingImages);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <label className="label">Title *</label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="input-field"
          placeholder="e.g. Modern 3-Bedroom House in DHA"
        />
        {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}
      </div>

      {/* Price & Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Price (USD) *</label>
          <input
            {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
            type="number"
            className="input-field"
            placeholder="e.g. 450000"
          />
          {errors.price && <p className="text-xs text-danger mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <label className="label">Type *</label>
          <select {...register('type')} className="input-field">
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location & City */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Location *</label>
          <input
            {...register('location', { required: 'Location is required' })}
            className="input-field"
            placeholder="e.g. Block C, DHA Phase 5"
          />
          {errors.location && <p className="text-xs text-danger mt-1">{errors.location.message}</p>}
        </div>
        <div>
          <label className="label">City *</label>
          <input
            {...register('city', { required: 'City is required' })}
            className="input-field"
            placeholder="e.g. Lahore"
          />
          {errors.city && <p className="text-xs text-danger mt-1">{errors.city.message}</p>}
        </div>
      </div>

      {/* Bedrooms, Bathrooms, Area */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Bedrooms</label>
          <input {...register('bedrooms')} type="number" min="0" className="input-field" placeholder="3" />
        </div>
        <div>
          <label className="label">Bathrooms</label>
          <input {...register('bathrooms')} type="number" min="0" className="input-field" placeholder="2" />
        </div>
        <div>
          <label className="label">Area (sqft)</label>
          <input {...register('area_sqft')} type="number" min="0" className="input-field" placeholder="1200" />
        </div>
      </div>

      {/* Status & Featured */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input-field">
            {PROPERTY_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('featured')}
              type="checkbox"
              className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
            />
            <span className="text-sm font-semibold text-text">Featured listing</span>
          </label>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="input-field resize-none"
          placeholder="Describe the property…"
        />
      </div>

      {/* Images */}
      <div>
        <label className="label">Images (max 10)</label>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {existingImages.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                <img
                  src={img.startsWith('http') ? img : `${API_BASE}${img}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExisting(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New uploads */}
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {previews.map((src, i) => (
              <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-primary/30">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/60 transition-colors">
          <Upload size={18} className="text-text-muted" />
          <span className="text-sm text-text-muted">Click to upload images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            {...register('images')}
            onChange={handleImageChange}
          />
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? <LoadingSpinner size="sm" /> : (defaultValues?.id ? 'Update Property' : 'Create Property')}
      </button>
    </form>
  );
}
