import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

export default function StaleLeadsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['ai-stale-leads'],
    queryFn: () => api.get('/ai/stale-leads', { timeout: 45000 }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const reminders = data?.reminders || [];

  if (isLoading) return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={15} className="text-warning" />
        <h3 className="font-heading text-sm font-semibold text-text">Follow-up Reminders</h3>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-background rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );

  if (!reminders.length) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-warning" />
          <h3 className="font-heading text-sm font-semibold text-text">Follow-up Reminders</h3>
        </div>
        <span className="badge bg-warning/10 text-warning">{reminders.length} stale</span>
      </div>

      <div className="space-y-2">
        {reminders.map((r) => (
          <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-background hover:bg-warning/5 transition-colors group">
            <div className="w-7 h-7 rounded-full bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
              <Clock size={12} className="text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-text truncate">{r.name}</p>
                <span className="text-xs text-text-light shrink-0">{r.daysIdle}d idle</span>
              </div>
              <p className="text-xs text-text-muted italic">{r.suggestion}</p>
            </div>
            <Link
              to={`/dashboard/leads/${r.id}`}
              className="p-1 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
