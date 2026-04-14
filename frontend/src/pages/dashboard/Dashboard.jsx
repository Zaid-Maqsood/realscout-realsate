import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { usePageContext } from '../../context/PageContextContext';
import {
  Building2, Users, TrendingUp, CheckCircle2,
  ArrowUpRight, BarChart2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import DashboardAISummary from '../../components/ai/DashboardAISummary';
import StaleLeadsCard from '../../components/ai/StaleLeadsCard';

const STATUS_PALETTE = {
  new:         '#6366F1',
  contacted:   '#0369A1',
  interested:  '#0F766E',
  negotiation: '#D97706',
  closed:      '#16A34A',
  lost:        '#DC2626',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics').then((r) => r.data),
    staleTime: 30000,
  });

  const { updatePageContext } = usePageContext();
  useEffect(() => {
    if (!data) return;
    const topCity = data.topCities?.[0]?.city ?? 'N/A';
    updatePageContext(
      `Dashboard metrics — Properties: ${data.properties?.total ?? 0} total, ${data.properties?.available ?? 0} available, ${data.properties?.sold ?? 0} sold, ${data.properties?.rented ?? 0} rented. ` +
      `Leads: ${data.leads?.total ?? 0} total, ${data.leads?.new ?? 0} new, ${data.leads?.closed ?? 0} closed, conversion rate ${data.leads?.conversionRate ?? 0}%. ` +
      `Top city: ${topCity}.`
    );
  }, [data]);

  if (isLoading) return <PageLoader />;

  const kpis = [
    {
      label: 'Total Properties',
      value: data?.properties?.total ?? 0,
      sub: `${data?.properties?.available ?? 0} available`,
      icon: Building2,
      color: 'bg-primary/10 text-primary',
      link: '/dashboard/properties',
    },
    {
      label: 'Total Leads',
      value: data?.leads?.total ?? 0,
      sub: `${data?.leads?.new ?? 0} new`,
      icon: Users,
      color: 'bg-cta/10 text-cta',
      link: '/dashboard/leads',
    },
    {
      label: 'Conversion Rate',
      value: `${data?.leads?.conversionRate ?? 0}%`,
      sub: `${data?.leads?.closed ?? 0} closed deals`,
      icon: TrendingUp,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Properties Sold',
      value: data?.properties?.sold ?? 0,
      sub: `${data?.properties?.rented ?? 0} rented`,
      icon: CheckCircle2,
      color: 'bg-warning/10 text-warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-text-muted mt-0.5">Here's what's happening today.</p>
        </div>
        <Link to="/dashboard/my-properties" className="btn-primary text-sm">
          <Building2 size={16} />
          Add Property
        </Link>
      </div>

      {/* AI Summary */}
      <DashboardAISummary data={data} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, link }) => {
          const card = (
            <div className="stat-card">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-2xl font-bold text-text">{value}</p>
                <p className="text-sm font-medium text-text-muted">{label}</p>
                <p className="text-xs text-text-light mt-0.5">{sub}</p>
              </div>
              {link && <ArrowUpRight size={16} className="text-text-light shrink-0" />}
            </div>
          );
          return link ? (
            <Link key={label} to={link} className="card-hover">{card}</Link>
          ) : (
            <div key={label} className="card">{card}</div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Leads by Status Pie */}
        <div className="card p-5">
          <h3 className="section-title text-base mb-4">Leads by Status</h3>
          {data?.leadsByStatus?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.leadsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status} (${count})`}
                  labelLine={false}
                  fontSize={11}
                >
                  {data.leadsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_PALETTE[entry.status] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-text-muted text-sm">No lead data yet</div>
          )}
        </div>

        {/* Properties Over Time */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title text-base mb-4">Activity (Last 6 Months)</h3>
          {data?.propertiesOverTime?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.propertiesOverTime.map((p, i) => ({
                month: p.month,
                Properties: p.count,
                Leads: data.leadsOverTime?.[i]?.count ?? 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Properties" stroke="#0F766E" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Leads" stroke="#0369A1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-text-muted text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Top Cities + Leads Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Cities */}
        <div className="card p-5">
          <h3 className="section-title text-base mb-4">Top Cities</h3>
          {data?.topCities?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.topCities} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#475569' }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F766E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted text-sm">No city data yet</div>
          )}
        </div>

        {/* Lead Pipeline Bar */}
        <div className="card p-5">
          <h3 className="section-title text-base mb-4">Lead Pipeline</h3>
          {data?.leadsByStatus?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.leadsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.leadsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_PALETTE[entry.status] || '#94A3B8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted text-sm">No lead data yet</div>
          )}
        </div>
      </div>
      {/* Follow-up Reminders */}
      <StaleLeadsCard />
    </div>
  );
}
