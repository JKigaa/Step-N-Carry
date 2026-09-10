import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, ShieldCheck, Shield, UserMinus, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface AdminTeamPageProps {
  navigate: (to: string) => void;
}

interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  is_super_admin: boolean;
}

interface SearchResult {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
}

type NewAdminLevel = 'assistant' | 'super';

export function AdminTeamPage({ navigate }: AdminTeamPageProps) {
  const { user, profile, isSuperAdmin, loading: authLoading } = useAuth();
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState('');
  const [newAdminLevel, setNewAdminLevel] = useState<NewAdminLevel>('assistant');

  useEffect(() => {
    if (!authLoading && (!user || !isSuperAdmin)) { navigate('/admin'); return; }
  }, [user, isSuperAdmin, authLoading, navigate]);

  const loadAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, is_super_admin')
      .eq('role', 'admin')
      .order('is_super_admin', { ascending: false });
    if (error) console.error('LOAD ADMINS ERROR:', error);
    setAdmins((data ?? []) as AdminProfile[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!isSuperAdmin) return;
    loadAdmins();
  }, [isSuperAdmin]);

  const handleSearch = async () => {
    setSearchError('');
    setSearchResult(null);
    if (!searchEmail.trim()) return;
    setSearching(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .ilike('email', searchEmail.trim())
      .maybeSingle();
    setSearching(false);
    if (error) {
      setSearchError('Search failed. Please try again.');
      return;
    }
    if (!data) {
      setSearchError('No account found with that email. They need to sign up on the site first.');
      return;
    }
    setSearchResult(data as SearchResult);
  };

  const handlePromote = async () => {
    if (!searchResult) return;
    const grantSuper = newAdminLevel === 'super';
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin', is_super_admin: grantSuper })
      .eq('id', searchResult.id);
    if (error) {
      toast.error('Failed to add admin');
      return;
    }
    toast.success(`${searchResult.full_name || searchResult.email} is now a${grantSuper ? ' super' : 'n assistant'} admin`);
    setSearchResult(null);
    setSearchEmail('');
    setNewAdminLevel('assistant');
    loadAdmins();
  };

  const superAdminCount = admins.filter((a) => a.is_super_admin).length;

  const handleRemove = async (admin: AdminProfile) => {
    if (admin.is_super_admin && superAdminCount <= 1) {
      toast.error("Can't remove the last super admin \u2014 promote another admin to super admin first.");
      return;
    }
    const label = admin.is_super_admin ? 'super admin' : 'assistant admin';
    if (!confirm(`Remove ${label} access for ${admin.full_name || admin.email}?`)) return;
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'customer', is_super_admin: false })
      .eq('id', admin.id);
    if (error) {
      toast.error('Failed to remove admin access');
      return;
    }
    toast.success('Admin access removed');
    loadAdmins();
  };

  if (authLoading || !user || !isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border/60 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-1 text-2xl font-bold">Manage Admins</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Assistant admins can manage orders and products, but cannot view Reports or manage other admins.
          Super admins have full rights, including adding or removing other admins — useful for business partners.
        </p>

        {/* Add admin */}
        <div className="mb-6 rounded-xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 text-lg font-bold">Add Admin</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            The person must already have an account on the site (ask them to sign up first), then look them up by email here.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="searchEmail">Email address</Label>
              <Input
                id="searchEmail"
                type="email"
                placeholder="assistant@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
            <Button className="self-end" onClick={handleSearch} disabled={searching}>
              <Search className="mr-1.5 h-4 w-4" /> {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchError && <p className="mt-3 text-sm text-destructive">{searchError}</p>}

          {searchResult && (
            <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{searchResult.full_name || 'No name set'}</p>
                  <p className="text-sm text-muted-foreground">{searchResult.email}</p>
                  {searchResult.role === 'admin' && (
                    <p className="mt-1 text-xs text-amber-600">This account already has admin access.</p>
                  )}
                </div>
              </div>
              {searchResult.role !== 'admin' && (
                <div className="mb-3 flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="newAdminLevel" checked={newAdminLevel === 'assistant'} onChange={() => setNewAdminLevel('assistant')} />
                    Assistant Admin
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="newAdminLevel" checked={newAdminLevel === 'super'} onChange={() => setNewAdminLevel('super')} />
                    Super Admin (full rights)
                  </label>
                </div>
              )}
              <Button onClick={handlePromote} disabled={searchResult.role === 'admin'}>
                <UserPlus className="mr-1.5 h-4 w-4" /> Add as {newAdminLevel === 'super' ? 'Super Admin' : 'Assistant Admin'}
              </Button>
            </div>
          )}
        </div>

        {/* Current admins */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 text-lg font-bold">Current Admins</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admins found.</p>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${admin.is_super_admin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {admin.is_super_admin ? <ShieldCheck className="h-4.5 w-4.5" /> : <Shield className="h-4.5 w-4.5" />}
                    </div>
                    <div>
                      <p className="font-semibold">{admin.full_name || 'No name set'} {admin.id === user?.id && <span className="text-xs text-muted-foreground">(you)</span>}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${admin.is_super_admin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {admin.is_super_admin ? 'Super Admin' : 'Assistant Admin'}
                    </span>
                    {!admin.is_super_admin && (
                      <Button variant="outline" size="sm" onClick={() => handleRemove(admin)}>
                        <UserMinus className="mr-1.5 h-4 w-4" /> Remove
                      </Button>
                    )}
                    {admin.is_super_admin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(admin)}
                        disabled={superAdminCount <= 1}
                        title={superAdminCount <= 1 ? "Can't remove the last super admin" : undefined}
                      >
                        <UserMinus className="mr-1.5 h-4 w-4" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
