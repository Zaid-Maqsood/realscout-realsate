import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useDashboardSummary } from '../../hooks/useAI';

export default function DashboardAISummary({ data }) {
  const { call, loading } = useDashboardSummary();
  const [summary, setSummary] = useState('');

  const fetchSummary = async () => {
    if (!data) return;
    const result = await call({
      properties: data.properties,
      leads: data.leads,
      topCities: data.topCities,
      leadsOverTime: data.leadsOverTime,
    });
    if (result?.summary) setSummary(result.summary);
  };

  useEffect(() => {
    if (data && !summary) fetchSummary();
  }, [data]);

  if (!summary && !loading) return null;

  return (
    <div className="card p-4 border-l-4 border-primary bg-primary/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={15} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wide">AI Insight</p>
            {loading ? (
              <div className="space-y-1.5">
                <div className="h-3 bg-primary/10 rounded animate-pulse w-full" />
                <div className="h-3 bg-primary/10 rounded animate-pulse w-4/5" />
              </div>
            ) : (
              <p className="text-sm text-text leading-relaxed">{summary}</p>
            )}
          </div>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
          title="Refresh summary"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}
