import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, BarChart3, LogOut,
  ChevronLeft, ChevronRight, ListFilter, Globe, Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard',                  icon: LayoutDashboard, label: 'Dashboard',      roles: ['admin', 'agent'] },
  { to: '/dashboard/properties',       icon: Building2,       label: 'Properties',     roles: ['admin', 'agent', 'user'] },
  { to: '/dashboard/my-properties',    icon: Home,            label: 'My Properties',  roles: ['admin', 'agent', 'user'] },
  { to: '/dashboard/leads',            icon: ListFilter,      label: 'Leads CRM',      roles: ['admin', 'agent'] },
  { to: '/dashboard/analytics',        icon: BarChart3,       label: 'Analytics',      roles: ['admin', 'agent'] },
  { to: '/dashboard/users',            icon: Users,           label: 'Users',          roles: ['admin'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) =>
    user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-surface shadow-sidebar border-r border-border/60 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center border-b border-border/60 h-16 shrink-0',
        collapsed ? 'justify-center px-2' : 'px-5 gap-3'
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-heading font-semibold text-primary text-lg tracking-wide">
            RealScout
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              clsx(
                'flex items-center rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text hover:bg-background'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Public site link */}
      <div className="px-2 pb-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'flex items-center rounded-xl text-sm font-medium text-text-muted hover:text-text hover:bg-background transition-all duration-200 cursor-pointer',
            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          )}
          title={collapsed ? 'Public Site' : undefined}
        >
          <Globe size={18} className="shrink-0" />
          {!collapsed && <span>Public Site</span>}
        </a>
      </div>

      {/* User + Logout */}
      <div className="border-t border-border/60 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate">{user.name}</p>
              <p className="text-xs text-text-muted capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-all duration-200 cursor-pointer w-full',
            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-background transition-colors cursor-pointer z-10"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
