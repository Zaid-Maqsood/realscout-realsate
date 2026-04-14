import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Building2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = useState(false);
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: ({ data }) => {
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      const dest = from !== '/dashboard' ? from : data.user.role === 'user' ? '/dashboard/properties' : '/dashboard';
      navigate(dest, { replace: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    },
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=85"
          alt="Real estate"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-text/70 to-primary/50 flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="font-heading text-2xl font-semibold text-white">RealScout</span>
          </div>
          <h2 className="font-heading text-4xl font-bold text-white leading-tight mb-4">
            Your Trusted Real Estate Partner
          </h2>
          <p className="text-white/80 text-lg">
            Buy, sell, and manage properties with confidence.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-heading font-semibold text-primary text-lg">RealScout</span>
          </div>

          <h1 className="font-heading text-3xl font-bold text-text mb-2">Welcome back</h1>
          <p className="text-text-muted mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-danger mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full justify-center py-3">
              {mutation.isPending ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>

          <p className="text-center text-sm text-text-muted mt-3">
            <Link to="/" className="hover:text-text transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
