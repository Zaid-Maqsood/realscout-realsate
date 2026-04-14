import { Link, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-heading font-semibold text-primary text-lg tracking-wide">
            RealScout
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/browse" className="btn-ghost text-sm">Browse</Link>
          <Link to="/browse?type=house" className="btn-ghost text-sm">Houses</Link>
          <Link to="/browse?type=apartment" className="btn-ghost text-sm">Apartments</Link>
          <Link to="/browse?type=commercial" className="btn-ghost text-sm">Commercial</Link>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-ghost text-sm">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm text-danger">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm">List Property</Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden btn-ghost p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border/60 px-4 py-3 space-y-1">
          <Link to="/browse" className="block px-3 py-2 text-sm font-medium text-text-muted hover:text-text" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link to="/browse?type=house" className="block px-3 py-2 text-sm font-medium text-text-muted hover:text-text" onClick={() => setMenuOpen(false)}>Houses</Link>
          <Link to="/browse?type=apartment" className="block px-3 py-2 text-sm font-medium text-text-muted hover:text-text" onClick={() => setMenuOpen(false)}>Apartments</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm font-medium text-danger">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 text-sm font-medium text-text-muted" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="block px-3 py-2 text-sm font-semibold text-primary" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
