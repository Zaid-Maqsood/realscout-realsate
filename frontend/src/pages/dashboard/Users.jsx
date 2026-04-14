import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Shield, User, Users } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-600',
  agent: 'bg-cta/10 text-cta',
  user:  'bg-primary/10 text-primary',
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [deleteItem, setDeleteItem] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => api.get('/users', { params: roleFilter ? { role: roleFilter } : {} }).then((r) => r.data),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => api.put(`/users/${id}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
    onError: () => toast.error('Failed to update role'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeleteItem(null);
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-muted">{users.length} users total</p>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field w-auto text-sm cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="user">User</option>
        </select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : users.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background border-b border-border/60">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-background/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-primary font-semibold text-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text truncate">
                            {u.name} {u.id === me?.id && <span className="text-xs text-text-muted font-normal">(you)</span>}
                          </p>
                          <p className="text-xs text-text-muted truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.id === me?.id ? (
                        <span className={clsx('badge', ROLE_COLORS[u.role])}>{u.role}</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                          className={clsx(
                            'badge cursor-pointer border-0 outline-none pr-5 appearance-none',
                            ROLE_COLORS[u.role]
                          )}
                        >
                          <option value="admin">admin</option>
                          <option value="agent">agent</option>
                          <option value="user">user</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                      {u.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        {u.id !== me?.id && (
                          <button
                            onClick={() => setDeleteItem(u)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon={Users} title="No users found" />
      )}

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        loading={deleteMutation.isPending}
        title="Delete User?"
        message={`Remove "${deleteItem?.name}" from RealScout? This cannot be undone.`}
      />
    </div>
  );
}
