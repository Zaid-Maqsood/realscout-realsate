import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';
import { Building2, Users, TrendingUp, MapPin, CheckCircle2, XCircle, FileText, Copy, X, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { useMonthlyReport } from '../../hooks/useAI';
import ReactMarkdown from 'react-markdown';
import { usePageContext } from '../../context/PageContextContext';
import toast from 'react-hot-toast';

const STATUS_PALETTE = {
  new:         '#6366F1',
  contacted:   '#0369A1',
  interested:  '#0F766E',
  negotiation: '#D97706',
  closed:      '#16A34A',
  lost:        '#DC2626',
};

const STAT_CARDS = (data, scoped) => [
  { label: scoped ? 'My Properties'  : 'Total Properties', value: data?.properties?.total,     icon: Building2,    color: 'text-primary',  bg: 'bg-primary/10' },
  { label: 'Available',                                     value: data?.properties?.available, icon: CheckCircle2, color: 'text-success',  bg: 'bg-success/10' },
  { label: 'Sold',                                          value: data?.properties?.sold,      icon: TrendingUp,   color: 'text-warning',  bg: 'bg-warning/10' },
  { label: 'Rented',                                        value: data?.properties?.rented,    icon: Building2,    color: 'text-cta',      bg: 'bg-cta/10' },
  { label: scoped ? 'My Leads'       : 'Total Leads',       value: data?.leads?.total,          icon: Users,        color: 'text-primary',  bg: 'bg-primary/10' },
  { label: 'Closed Deals',                                  value: data?.leads?.closed,         icon: CheckCircle2, color: 'text-success',  bg: 'bg-success/10' },
  { label: 'Lost Leads',                                    value: data?.leadsByStatus?.find((l) => l.status === 'lost')?.count ?? 0, icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
  { label: 'Conversion Rate',                               value: `${data?.leads?.conversionRate ?? 0}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
];

export default function Analytics() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics').then((r) => r.data),
    staleTime: 30000,
  });
  const scoped = data?.scoped || user?.role === 'agent';
  const [report, setReport] = useState('');
  const [showReport, setShowReport] = useState(false);
  const reportAI = useMonthlyReport();

  const { updatePageContext } = usePageContext();
  useEffect(() => {
    if (!data) return;
    const topCities = data.topCities?.slice(0, 3).map((c) => `${c.city} (${c.count})`).join(', ') || 'N/A';
    const recentLeads = data.leadsOverTime?.slice(-3).map((l) => `${l.month}: ${l.count}`).join(', ') || 'N/A';
    updatePageContext(
      `Analytics — Properties: ${data.properties?.total ?? 0} total, ${data.properties?.available ?? 0} available, ${data.properties?.sold ?? 0} sold. ` +
      `Leads: ${data.leads?.total ?? 0} total, conversion ${data.leads?.conversionRate ?? 0}%. ` +
      `Top markets: ${topCities}. Recent lead trend: ${recentLeads}.`
    );
  }, [data]);

  const handleGenerateReport = async () => {
    const result = await reportAI.call({
      properties: data?.properties,
      leads: data?.leads,
      leadsByStatus: data?.leadsByStatus,
      topCities: data?.topCities,
      propertiesOverTime: data?.propertiesOverTime,
      leadsOverTime: data?.leadsOverTime,
    });
    if (result?.report) {
      setReport(result.report);
      setShowReport(true);
    } else {
      toast.error('Could not generate report');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header with Report button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text">Analytics</h2>
          <p className="text-sm text-text-muted mt-0.5">{scoped ? 'Your performance overview' : 'Platform-wide overview'}</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={reportAI.loading}
          className="btn-outline text-sm flex items-center gap-2"
        >
          {reportAI.loading
            ? <span className="w-3.5 h-3.5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            : <FileText size={15} />}
          {reportAI.loading ? 'Generating…' : 'Generate Monthly Report'}
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CARDS(data, scoped).map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-text">{value ?? 0}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leads by Status Donut */}
        <div className="card p-5">
          <h3 className="section-title text-base mb-4">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data?.leadsByStatus || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
              >
                {(data?.leadsByStatus || []).map((entry) => (
                  <Cell key={entry.status} fill={STATUS_PALETTE[entry.status] || '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Pipeline Bar */}
        <div className="card p-5">
          <h3 className="section-title text-base mb-4">Lead Pipeline</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.leadsByStatus || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(data?.leadsByStatus || []).map((entry) => (
                  <Cell key={entry.status} fill={STATUS_PALETTE[entry.status] || '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Listings Over Time Area */}
        <div className="card p-5">
          <h3 className="section-title text-base mb-4">New Listings (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.propertiesOverTime || []}>
              <defs>
                <linearGradient id="propGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F766E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#0F766E" fill="url(#propGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leads Over Time */}
        <div className="card p-5">
          <h3 className="section-title text-base mb-4">New Leads (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.leadsOverTime || []}>
              <defs>
                <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0369A1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0369A1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#0369A1" fill="url(#leadGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Cities */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-primary" />
          <h3 className="section-title text-base">Top Cities by Listings</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.topCities || []} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
            <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#475569' }} width={80} />
            <Tooltip />
            <Bar dataKey="count" fill="#0F766E" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <h3 className="font-heading text-base font-semibold text-text">Monthly Performance Report</h3>
              </div>
              <button onClick={() => setShowReport(false)} className="p-1.5 rounded-lg hover:bg-background text-text-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 prose prose-sm max-w-none
              prose-headings:font-heading prose-headings:text-text prose-headings:font-semibold
              prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2
              prose-p:text-text prose-p:leading-relaxed prose-p:text-sm
              prose-li:text-sm prose-li:text-text
              prose-strong:text-text prose-strong:font-semibold
              prose-ul:my-2 prose-ol:my-2">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
              <button
                onClick={() => { navigator.clipboard.writeText(report); toast.success('Report copied!'); }}
                className="btn-outline flex-1 justify-center"
              >
                <Copy size={14} /> Copy Report
              </button>
              <button onClick={() => setShowReport(false)} className="btn-primary flex-1 justify-center">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
