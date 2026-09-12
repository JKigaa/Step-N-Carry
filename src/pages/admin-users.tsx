import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Circle, UserMinus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface AdminUsersPageProps {
  navigate: (to: string) => void;
}

interface UserActivityRow {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  is_super_admin: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

const ACTIVE_WINDOW_DAYS = 30;

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never signed in';
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

function isActive(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const days = (Date.now() - new Date(dateStr).getTime()) / 86400000;
  return days <= ACTIVE_WINDOW_DAYS;
}

function roleLabel(row: UserActivityRow): string {
  if (row.role !== 'admin') return 'Customer';
  return row.is_super_admin ? 'Super Admin' : 'Assistant Admin';
}

export function AdminUsersPage({ navigate }: AdminUsersPageProps) {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isSuperAdmin) { navigate('/admin'); return; }
  }, [user, isSuperAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_users_activity');
      if (error) {
        console.error('LOAD USER ACTIVITY ERROR:', error);
        setError('Failed to load users.');
      } else {
        setUsers((data ?? []) as UserActivityRow[]);
      }
      setLoading(false);
    })();
  }, [isSuperAdmin]);

  const handleRemove = async (row: UserActivityRow) => {
    if (!confirm(`Permanently delete ${row.full_name || row.email}'s account? This cannot be undone. Their order history will be kept, but their login and profile will be gone for good.`)) return;
    const { error } = await supabase.rpc('delete_customer_account', { target_user_id: row.id });
    if (error) { toast.error(error.message || 'Failed to delete account'); return; }
    toast.success('Account deleted');
    setUsers((prev) => prev.filter((u) => u.id !== row.id));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive(u.last_sign_in_at)) ||
        (statusFilter === 'inactive' && !isActive(u.last_sign_in_at));
      const matchSearch = !q || u.email.toLowerCase().includes(q) || (u.full_name ?? '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [users, search, statusFilter]);

  const activeCount = useMemo(() => users.filter((u) => isActive(u.last_sign_in_at)).length, [users]);

  if (authLoading || !user || !isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border/60 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-1 text-2xl font-bold">Users</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Everyone who has an account on the site. "Active" means signed in within the last {ACTIVE_WINDOW_DAYS} days.
        </p>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <p className="text-2xl font-bold">{loading ? '...' : users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <p className="text-2xl font-bold text-green-600">{loading ? '...' : activeCount}</p>
            <p className="text-sm text-muted-foreground">Active (last {ACTIVE_WINDOW_DAYS} days)</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <p className="text-2xl font-bold text-muted-foreground">{loading ? '...' : users.length - activeCount}</p>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>
            All ({users.length})
          </Button>
          <Button size="sm" variant={statusFilter === 'active' ? 'default' : 'outline'} onClick={() => setStatusFilter('active')}>
            Active ({activeCount})
          </Button>
          <Button size="sm" variant={statusFilter === 'inactive' ? 'default' : 'outline'} onClick={() => setStatusFilter('inactive')}>
            Inactive ({users.length - activeCount})
          </Button>
        </div>

        <div className="mb-4 relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
          {loading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="p-6 text-center text-sm text-destructive">{error}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Name</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Email</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Role</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Joined</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Last Active</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No users found.</td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const active = isActive(row.last_sign_in_at);
                    return (
                      <tr key={row.id} className="border-b border-border/40 last:border-0">
                        <td className="whitespace-nowrap px-4 py-3">{row.full_name || 'No name set'}</td>
                        <td className="whitespace-nowrap px-4 py-3">{row.email}</td>
                        <td className="whitespace-nowrap px-4 py-3">{roleLabel(row)}</td>
                        <td className="whitespace-nowrap px-4 py-3">{new Date(row.created_at).toLocaleDateString('en-KE')}</td>
                        <td className="whitespace-nowrap px-4 py-3">{relativeTime(row.last_sign_in_at)}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                            <Circle className={`h-2 w-2 ${active ? 'fill-green-600 text-green-600' : 'fill-muted-foreground text-muted-foreground'}`} />
                            {active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {row.role === 'customer' && row.id !== user?.id && (
                            <Button size="sm" variant="outline" onClick={() => handleRemove(row)}>
                              <UserMinus className="mr-1.5 h-4 w-4" /> Remove
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
