import { Building2 } from 'lucide-react';

export default function EmptyState({ icon: Icon = Building2, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon size={28} className="text-primary" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-text mb-2">{title}</h3>
      {description && <p className="text-sm text-text-muted mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
