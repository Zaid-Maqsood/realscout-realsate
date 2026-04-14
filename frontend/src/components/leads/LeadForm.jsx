import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';
import { MessageSquare } from 'lucide-react';

export default function LeadForm({ propertyId, propertyTitle }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const mutation = useMutation({
    mutationFn: (data) => api.post('/leads', { ...data, property_id: propertyId }),
    onSuccess: () => {
      toast.success('Your inquiry has been sent! An agent will contact you soon.');
      reset();
    },
    onError: () => toast.error('Failed to send inquiry. Please try again.'),
  });

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-base font-semibold text-text">Request Info</h3>
          <p className="text-xs text-text-muted">We'll get back to you within 24 hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div>
          <label className="label">Your Name *</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="input-field"
            placeholder="John Ahmed"
          />
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Email *</label>
          <input
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            type="email"
            className="input-field"
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Phone</label>
          <input
            {...register('phone')}
            type="tel"
            className="input-field"
            placeholder="+92 300 1234567"
          />
        </div>

        <div>
          <label className="label">Message</label>
          <textarea
            {...register('message')}
            rows={3}
            className="input-field resize-none"
            defaultValue={propertyTitle ? `I'm interested in "${propertyTitle}". Please share more details.` : ''}
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary w-full justify-center"
        >
          {mutation.isPending ? <LoadingSpinner size="sm" /> : 'Send Inquiry'}
        </button>
      </form>
    </div>
  );
}
