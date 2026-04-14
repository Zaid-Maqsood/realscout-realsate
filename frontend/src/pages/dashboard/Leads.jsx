import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Phone, Mail, Building2, Clock, User, Eye, Filter } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { KANBAN_COLUMNS, STATUS_COLORS, STATUS_LABELS, formatTimeAgo } from '../../utils/formatters';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useScoreLeads } from '../../hooks/useAI';
import { usePageContext } from '../../context/PageContextContext';

const SENTIMENT_STYLES = {
  hot:  'bg-danger/10 text-danger',
  warm: 'bg-warning/10 text-warning',
  cold: 'bg-cta/10 text-cta',
};
const SENTIMENT_LABEL = { hot: 'Hot', warm: 'Warm', cold: 'Cold' };

// ─── Lead Card ──────────────────────────────────────────────
function LeadCard({ lead, isDragging, sentiment }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        'card p-3 cursor-grab active:cursor-grabbing select-none',
        isDragging && 'opacity-40'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-text text-sm leading-tight">{lead.name}</p>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => navigate(`/dashboard/leads/${lead.id}`)}
          className="p-1 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
        >
          <Eye size={13} />
        </button>
      </div>

      {lead.property_title && (
        <div className="flex items-center gap-1 text-xs text-text-muted mb-1.5">
          <Building2 size={11} className="shrink-0" />
          <span className="truncate">{lead.property_title}</span>
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
        <Mail size={11} className="shrink-0" />
        <span className="truncate">{lead.email}</span>
      </div>

      {lead.phone && (
        <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
          <Phone size={11} className="shrink-0" />
          <span>{lead.phone}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
        {lead.agent_name ? (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <User size={10} />{lead.agent_name}
          </span>
        ) : <span />}
        <div className="flex items-center gap-1.5">
          {sentiment && (
            <span className={clsx('text-xs font-semibold px-1.5 py-0.5 rounded-full', SENTIMENT_STYLES[sentiment])}>
              {SENTIMENT_LABEL[sentiment]}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-text-light">
            <Clock size={10} />{formatTimeAgo(lead.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Column ───────────────────────────────────────────
function KanbanColumn({ column, leads, sentiments }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col min-w-[260px] w-[260px]">
      {/* Header */}
      <div className={clsx('flex items-center justify-between mb-3 pb-3 border-b-2', column.color)}>
        <h3 className="font-heading text-sm font-semibold text-text">{column.label}</h3>
        <span className="badge bg-background text-text-muted">{leads.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 space-y-2 min-h-[200px] rounded-xl p-1 transition-colors',
          isOver ? 'bg-primary/5 border-2 border-dashed border-primary/40' : ''
        )}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} sentiment={sentiments[lead.id]} />
        ))}
        {leads.length === 0 && (
          <div className="h-24 flex items-center justify-center">
            <p className="text-xs text-text-light">Drop leads here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Leads Page ─────────────────────────────────────────
export default function Leads() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';
  const [activeId, setActiveId] = useState(null);
  const [sentiments, setSentiments] = useState({});
  const scoredRef = useRef(false);
  const scoreAI = useScoreLeads();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data, isLoading } = useQuery({
    queryKey: ['leads', 'kanban'],
    queryFn: () => api.get('/leads?limit=200').then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/leads/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
    onError: () => toast.error('Failed to update lead status'),
  });

  const leads = data?.leads || [];

  const { updatePageContext } = usePageContext();
  useEffect(() => {
    if (!leads.length) return;
    const byStatus = KANBAN_COLUMNS.map((col) => `${col.label}: ${leads.filter((l) => l.status === col.id).length}`).join(', ');
    updatePageContext(`Leads pipeline — Total: ${leads.length}. Breakdown: ${byStatus}.`);
  }, [leads.length]);

  // Score leads once when data loads
  useEffect(() => {
    if (!leads.length || scoredRef.current) return;
    scoredRef.current = true;
    scoreAI.call({ leads: leads.map((l) => ({
      id: l.id,
      status: l.status,
      message: l.message,
      created_at: l.created_at,
    })) }).then((result) => {
      if (result?.scores) {
        const map = {};
        result.scores.forEach((s) => { map[s.id] = s.sentiment; });
        setSentiments(map);
      }
    });
  }, [leads.length]);

  const getLeadsForColumn = (status) => leads.filter((l) => l.status === status);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = active.id;
    const newStatus = over.id;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Optimistic update
    qc.setQueryData(['leads', 'kanban'], (old) => ({
      ...old,
      leads: old.leads.map((l) =>
        l.id === leadId ? { ...l, status: newStatus } : l
      ),
    }));

    updateStatus.mutate({ id: leadId, status: newStatus });
  };

  const activeLeadCard = activeId ? leads.find((l) => l.id === activeId) : null;

  if (isLoading) return <PageLoader />;

  if (!leads.length) return (
    <EmptyState
      icon={User}
      title="No leads yet"
      description="Leads will appear here when visitors submit inquiries from your property listings."
    />
  );

  return (
    <div className="space-y-4">
      {isAgent && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary w-fit">
          <Filter size={13} />
          Showing only leads assigned to you
        </div>
      )}
      <p className="text-sm text-text-muted">
        {leads.length} {leads.length === 1 ? 'lead' : 'leads'}{' '}
        {leads.length > 0 ? '— drag cards to update status' : ''}
      </p>

      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setActiveId(active.id)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 w-max">
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                leads={getLeadsForColumn(col.id)}
                sentiments={sentiments}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLeadCard && (
              <div className="w-[260px] opacity-95 rotate-1">
                <LeadCard lead={activeLeadCard} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
