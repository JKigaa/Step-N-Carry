import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Circle, UserMinus, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
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
  is_deactivated: boolean;
}

const ACTIVE_WINDOW_DAYS = 30;
const PAGE_SIZE = 100;

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isSuperAdmin) { navigate('/admin'); return; }
  }, [user, isSuperAdmin, authLoading, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_users_activity');
    if (error) {
      console.error('LOAD USER ACTIVITY ERROR:', error);
      setError('Failed to load users.');
    } else {
      setUsers((data ?? []) as UserActivityRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { if (isSuperAdmin) loadUsers(); }, [isSuperAdmin]);

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const selectableRowsOnPage = pageRows.filter((r) => r.role === 'customer');

  useEffect(() => { setPage(0); setSelectedIds(new Set()); }, [search, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const allSelected = selectableRowsOnPage.every((r) => prev.has(r.id));
      const next = new Set(prev);
      if (allSelected) {
        selectableRowsOnPage.forEach((r) => next.delete(r.id));
      } else {
        selectableRowsOnPage.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const handleBulkDeactivate = async () => {
    const ids = Array.from(selectedIds);
    const results = await Promise.all(ids.map((id) => supabase.rpc('set_customer_active_status', { target_user_id: id, deactivate: true })));
    const failed = results.filter((r) => r.error).length;
    if (failed > 0) toast.error(`${failed} failed to deactivate`);
    toast.success(`${ids.length - failed} account${ids.length - failed === 1 ? '' : 's'} deactivated`);
    setSelectedIds(new Set());
    await loadUsers();
  };

  const handleBulkReactivate = async () => {
    const ids = Array.from(selectedIds);
    const results = await Promise.all(ids.map((id) => supabase.rpc('set_customer_active_status', { target_user_id: id, deactivate: false })));
    const failed = results.filter((r) => r.error).length;
    if (failed > 0) toast.error(`${failed} failed to reactivate`);
    toast.success(`${ids.length - failed} account${ids.length - failed === 1 ? '' : 's'} reactivated`);
    setSelectedIds(new Set());
    await loadUsers();
  };

  const handleBulkRemove = async () => {
    const ids = Array.from(selectedIds);
    if (!confirm(`Permanently delete ${ids.length} account${ids.length === 1 ? '' : 's'}? This cannot be undone. Order history is kept, but the login and profile will be gone for good.`)) return;
    const results = await Promise.all(ids.map((id) => supabase.rpc('delete_customer_account', { target_user_id: id })));
    const failed = results.filter((r) => r.error).length;
    if (failed > 0) toast.error(`${failed} failed to delete`);
    toast.success(`${ids.length - failed} account${ids.length - failed === 1 ? '' : 's'} deleted`);
    setSelectedIds(new Set());
    await loadUsers();
  };

  if (authLoading || !user || !isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border/60 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-1 text-2xl font-bold">Users</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Everyone who has an account on the site. "Active" means signed in within the last {ACTIVE_WINDOW_DAYS} days.
          Deactivate/reactivate/remove apply to customer accounts only.
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

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button size="sm" onClick={handleBulkReactivate}><UserCheck className="mr-1.5 h-4 w-4" /> Reactivate</Button>
            <Button size="sm" variant="outline" onClick={handleBulkDeactivate}><UserX className="mr-1.5 h-4 w-4" /> Deactivate</Button>
            <Button size="sm" variant="destructive" onClick={handleBulkRemove}><UserMinus className="mr-1.5 h-4 w-4" /> Remove</Button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear selection</button>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
          {loading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="p-6 text-center text-sm text-destructive">{error}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectableRowsOnPage.length > 0 && selectableRowsOnPage.every((r) => selectedIds.has(r.id))}
                      onChange={toggleSelectAllOnPage}
                      disabled={selectableRowsOnPage.length === 0}
                      className="h-4 w-4"
                    />
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Name</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Email</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Role</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Joined</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Last Active</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No users found.</td>
                  </tr>
                ) : (
                  pageRows.map((row) => {
                    const active = isActive(row.last_sign_in_at);
                    const selectable = row.role === 'customer';
                    return (
                      <tr key={row.id} className="border-b border-border/40 last:border-0">
                        <td className="px-4 py-3">
                          {selectable && (
                            <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} className="h-4 w-4" />
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{row.full_name || 'No name set'}</td>
                        <td className="whitespace-nowrap px-4 py-3">{row.email}</td>
                        <td className="whitespace-nowrap px-4 py-3">{roleLabel(row)}</td>
                        <td className="whitespace-nowrap px-4 py-3">{new Date(row.created_at).toLocaleDateString('en-KE')}</td>
                        <td className="whitespace-nowrap px-4 py-3">{relativeTime(row.last_sign_in_at)}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                              <Circle className={`h-2 w-2 ${active ? 'fill-green-600 text-green-600' : 'fill-muted-foreground text-muted-foreground'}`} />
                              {active ? 'Active' : 'Inactive'}
                            </span>
                            {row.is_deactivated && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                                Deactivated
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {currentPage * PAGE_SIZE + 1}-{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={currentPage >= pageCount - 1}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
