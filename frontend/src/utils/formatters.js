export const formatPrice = (price) => {
  if (!price) return 'Price on Request';
  const num = Number(price);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
  if (num >= 1000)    return `$${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 0)}K`;
  return `$${num.toLocaleString('en-US')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateString);
};

export const PROPERTY_TYPES = ['house', 'apartment', 'commercial', 'plot'];
export const PROPERTY_STATUSES = ['available', 'sold', 'rented', 'pending'];
export const LEAD_STATUSES = ['new', 'contacted', 'interested', 'negotiation', 'closed', 'lost'];
export const USER_ROLES = ['admin', 'agent', 'user'];

export const STATUS_LABELS = {
  available:   'Available',
  sold:        'Sold',
  rented:      'Rented',
  pending:     'Pending',
  new:         'New',
  contacted:   'Contacted',
  interested:  'Interested',
  negotiation: 'Negotiation',
  closed:      'Closed',
  lost:        'Lost',
};

export const STATUS_COLORS = {
  available:   'bg-success/10 text-success',
  sold:        'bg-danger/10 text-danger',
  rented:      'bg-cta/10 text-cta',
  pending:     'bg-warning/10 text-warning',
  new:         'bg-indigo-100 text-indigo-600',
  contacted:   'bg-cta/10 text-cta',
  interested:  'bg-primary/10 text-primary',
  negotiation: 'bg-warning/10 text-warning',
  closed:      'bg-success/10 text-success',
  lost:        'bg-danger/10 text-danger',
};

export const TYPE_COLORS = {
  house:      'bg-primary/10 text-primary',
  apartment:  'bg-cta/10 text-cta',
  commercial: 'bg-purple-100 text-purple-600',
  plot:       'bg-warning/10 text-warning',
};

export const KANBAN_COLUMNS = [
  { id: 'new',         label: 'New Leads',    color: 'border-indigo-400' },
  { id: 'contacted',   label: 'Contacted',    color: 'border-cta' },
  { id: 'interested',  label: 'Interested',   color: 'border-primary' },
  { id: 'negotiation', label: 'Negotiation',  color: 'border-warning' },
  { id: 'closed',      label: 'Closed',       color: 'border-success' },
  { id: 'lost',        label: 'Lost',         color: 'border-danger' },
];
