import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard':                 'Dashboard',
  '/dashboard/properties':      'Properties',
  '/dashboard/my-properties':   'My Properties',
  '/dashboard/leads':           'Leads CRM',
  '/dashboard/analytics':       'Analytics',
  '/dashboard/users':           'Users',
};

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();

  const title = Object.entries(PAGE_TITLES).reverse().find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'Dashboard';

  return (
    <header className="h-16 bg-surface border-b border-border/60 flex items-center justify-between px-6 shrink-0">
      <h1 className="font-heading text-xl font-semibold text-text tracking-wide">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="btn-ghost p-2 rounded-xl" aria-label="Notifications">
          <Bell size={18} />
        </button>

        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-text leading-tight">{user.name}</p>
              <p className="text-xs text-text-muted capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
