import { useForm, useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Upload, X, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PROPERTY_TYPES, PROPERTY_STATUSES } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useGenerateDescription, useSuggestPrice, useCheckQuality } from '../../hooks/useAI';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function PropertyForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, control } = useForm({
    defaultValues: defaultValues || {},
  });

  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(defaultValues?.images || []);
  const [priceResult, setPriceResult] = useState(null);
  const [qualityResult, setQualityResult] = useState(null);
  const [showQualityGate, setShowQualityGate] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);

  const descAI = useGenerateDescription();
  const priceAI = useSuggestPrice();
  const qualityAI = useCheckQuality();

  // Watch fields needed for AI calls
  const watched = useWatch({ control, name: ['title', 'type', 'location', 'city', 'bedrooms', 'bathrooms', 'area_sqft', 'price', 'description', 'status'] });
  const [title, type, location, city, bedrooms, bathrooms, area_sqft, price, description, status] = watched;

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

  // ── AI: Generate Description ──────────────────────────────
  const handleGenerateDescription = async () => {
    if (!title || !type || !city) {
      toast.error('Fill in Title, Type, and City first');
      return;
    }
    const result = await descAI.call({ title, type, location, city, bedrooms, bathrooms, area_sqft, price, status });
    if (result?.description) {
      setValue('description', result.description);
      toast.success('Description generated!');
    } else {
      toast.error('Could not generate description');
    }
  };

  // ── AI: Suggest Price ─────────────────────────────────────
  const handleSuggestPrice = async () => {
    if (!type || !city) {
      toast.error('Fill in Type and City first');
      return;
    }
    const result = await priceAI.call({ type, city, area_sqft, bedrooms, bathrooms });
    if (result?.suggested) {
      setPriceResult(result);
    } else {
      toast.error('Could not suggest price');
    }
  };

  // ── AI: Quality Check (intercept submit) ──────────────────
  const handleFormSubmit = async (data) => {
    const imageCount = existingImages.length + previews.length;
    const result = await qualityAI.call({
      title: data.title,
      description: data.description,
      imageCount,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area_sqft: data.area_sqft,
      price: data.price,
      type: data.type,
    });

    if (result && !result.approved) {
      setQualityResult(result);
      setPendingSubmitData({ data, existingImages });
      setShowQualityGate(true);
      return;
    }
    onSubmit(data, existingImages);
  };

  const proceedAnyway = () => {
    if (pendingSubmitData) {
      onSubmit(pendingSubmitData.data, pendingSubmitData.existingImages);
    }
    setShowQualityGate(false);
  };

  return (
    <>
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
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Price (USD) *</label>
              <button
                type="button"
                onClick={handleSuggestPrice}
                disabled={priceAI.loading}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                {priceAI.loading ? <LoadingSpinner size="xs" /> : <TrendingUp size={11} />}
                Suggest
              </button>
            </div>
            <input
              {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
              type="number"
              className="input-field"
              placeholder="e.g. 450000"
            />
            {errors.price && <p className="text-xs text-danger mt-1">{errors.price.message}</p>}
            {/* Price suggestion result */}
            {priceResult && (
              <div className="mt-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl text-xs">
                <p className="text-primary font-semibold mb-1">
                  Suggested: ${Number(priceResult.suggested).toLocaleString()}
                </p>
                <p className="text-text-muted mb-2">
                  Range: ${Number(priceResult.min).toLocaleString()} – ${Number(priceResult.max).toLocaleString()}
                </p>
                <p className="text-text-muted italic mb-2">{priceResult.reasoning}</p>
                <button
                  type="button"
                  onClick={() => { setValue('price', priceResult.suggested); setPriceResult(null); }}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  Apply suggested price
                </button>
              </div>
            )}
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
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Description</label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={descAI.loading}
              className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer font-medium"
            >
              {descAI.loading ? <LoadingSpinner size="xs" /> : <Sparkles size={11} />}
              Generate with AI
            </button>
          </div>
          <textarea
            {...register('description')}
            rows={3}
            className="input-field resize-none"
            placeholder="Describe the property… or click Generate with AI"
          />
        </div>

        {/* Images */}
        <div>
          <label className="label">Images (max 10)</label>

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

        <button type="submit" disabled={loading || qualityAI.loading} className="btn-primary w-full justify-center">
          {loading || qualityAI.loading
            ? <><LoadingSpinner size="sm" /> {qualityAI.loading ? 'Checking quality…' : 'Saving…'}</>
            : (defaultValues?.id ? 'Update Property' : 'Create Property')}
        </button>
      </form>

      {/* Quality Gate Modal */}
      {showQualityGate && qualityResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold text-text">Listing Quality Check</h3>
                <p className="text-xs text-text-muted">Score: {qualityResult.score}/100</p>
              </div>
            </div>

            {qualityResult.warnings?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-text mb-2 uppercase tracking-wide">Issues Found</p>
                <ul className="space-y-1.5">
                  {qualityResult.warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                      <span className="text-danger mt-0.5 shrink-0">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {qualityResult.suggestions?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-text mb-2 uppercase tracking-wide">Suggestions</p>
                <ul className="space-y-1.5">
                  {qualityResult.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                      <CheckCircle2 size={13} className="text-success mt-0.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowQualityGate(false)}
                className="btn-outline flex-1 justify-center"
              >
                Go Back & Fix
              </button>
              <button
                onClick={proceedAnyway}
                className="btn-primary flex-1 justify-center"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
