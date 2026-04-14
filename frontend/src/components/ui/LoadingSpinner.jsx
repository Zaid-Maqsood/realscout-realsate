import clsx from 'clsx';

export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className={clsx('border-2 border-border border-t-primary rounded-full animate-spin', sizes[size])} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-text-muted">Loading…</p>
      </div>
    </div>
  );
}
