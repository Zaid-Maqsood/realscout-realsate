import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Mail, Phone, Building2, Calendar,
  User, Send, MessageSquare,
} from 'lucide-react';
import api from '../../api/axios';
import { formatDate, formatTimeAgo, STATUS_COLORS, LEAD_STATUSES, STATUS_LABELS, formatPrice } from '../../utils/formatters';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function LeadDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const isAdmin = user?.role === 'admin';

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => api.get(`/leads/${id}`).then((r) => r.data),
  });

  const { data: agents } = useQuery({
    queryKey: ['users', 'agents'],
    queryFn: () => api.get('/users/agents').then((r) => r.data),
    enabled: isAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: (body) => api.put(`/leads/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', id] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated');
    },
    onError: () => toast.error('Failed to update lead'),
  });

  const noteMutation = useMutation({
    mutationFn: () => api.post(`/leads/${id}/notes`, { note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', id] });
      setNote('');
      toast.success('Note added');
    },
    onError: () => toast.error('Failed to add note'),
  });

  if (isLoading) return <PageLoader />;
  if (!lead) return <div className="text-center py-16 text-text-muted">Lead not found</div>;

  return (
    <div className="max-w-4xl space-y-5">
      <Link to="/dashboard/leads" className="btn-ghost text-sm">
        <ArrowLeft size={16} /> Back to Leads
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Lead Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Lead Card */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="font-heading text-xl font-semibold text-text">{lead.name}</h2>
                <p className="text-sm text-text-muted mt-1">Submitted {formatTimeAgo(lead.created_at)}</p>
              </div>
              <span className={clsx('badge', STATUS_COLORS[lead.status])}>
                {STATUS_LABELS[lead.status]}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-text-muted">
                <Mail size={15} className="text-primary shrink-0" />
                <a href={`mailto:${lead.email}`} className="hover:text-primary">{lead.email}</a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Phone size={15} className="text-primary shrink-0" />
                  <a href={`tel:${lead.phone}`} className="hover:text-primary">{lead.phone}</a>
                </div>
              )}
              {lead.property_title && (
                <div className="flex items-center gap-2 text-text-muted sm:col-span-2">
                  <Building2 size={15} className="text-primary shrink-0" />
                  <Link to={`/property/${lead.property_id}`} target="_blank" className="hover:text-primary">
                    {lead.property_title} — {formatPrice(lead.property_price)}
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar size={15} className="text-primary shrink-0" />
                <span>{formatDate(lead.created_at)}</span>
              </div>
            </div>

            {lead.message && (
              <div className="mt-5 p-4 bg-background rounded-xl">
                <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">Message</p>
                <p className="text-sm text-text leading-relaxed">{lead.message}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-primary" />
              <h3 className="font-heading text-base font-semibold text-text">Notes ({lead.notes?.length || 0})</h3>
            </div>

            {/* Note list */}
            <div className="space-y-3 mb-4">
              {lead.notes?.length > 0 ? (
                lead.notes.map((n) => (
                  <div key={n.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary font-semibold text-xs">
                        {n.author_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-text">{n.author_name || 'Unknown'}</span>
                        <span className="text-xs text-text-light">{formatTimeAgo(n.created_at)}</span>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">{n.note}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-muted text-center py-4">No notes yet. Add the first one.</p>
              )}
            </div>

            {/* Add note */}
            <div className="flex gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="input-field flex-1 resize-none"
                placeholder="Add a note…"
              />
              <button
                onClick={() => noteMutation.mutate()}
                disabled={!note.trim() || noteMutation.isPending}
                className="btn-primary px-3 self-end"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          {/* Status */}
          <div className="card p-5">
            <h3 className="font-heading text-sm font-semibold text-text mb-3">Update Status</h3>
            <div className="space-y-1.5">
              {LEAD_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateMutation.mutate({ status: s })}
                  disabled={lead.status === s || updateMutation.isPending}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer',
                    lead.status === s
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-background text-text-muted hover:text-text'
                  )}
                >
                  {STATUS_LABELS[s]}
                  {lead.status === s && <span className="float-right text-xs">Current</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Assign Agent — admin only */}
          {isAdmin && (
            <div className="card p-5">
              <h3 className="font-heading text-sm font-semibold text-text mb-3">
                <User size={14} className="inline mr-1" />
                Assign Agent
              </h3>
              <select
                value={lead.assigned_agent_id || ''}
                onChange={(e) => updateMutation.mutate({ assigned_agent_id: e.target.value || null })}
                className="input-field text-sm cursor-pointer"
              >
                <option value="">Unassigned</option>
                {agents?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {lead.agent_name && (
                <p className="text-xs text-text-muted mt-2">
                  Currently: <span className="text-primary font-medium">{lead.agent_name}</span>
                </p>
              )}
            </div>
          )}
          {/* Agent view — show assigned agent read-only */}
          {!isAdmin && lead.agent_name && (
            <div className="card p-5">
              <h3 className="font-heading text-sm font-semibold text-text mb-3">
                <User size={14} className="inline mr-1" />
                Assigned Agent
              </h3>
              <p className="text-sm text-primary font-medium">{lead.agent_name}</p>
              {lead.agent_email && <p className="text-xs text-text-muted mt-1">{lead.agent_email}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
