import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface AccountPasswordPageProps {
  navigate: (to: string) => void;
}

export function AccountPasswordPage({ navigate }: AccountPasswordPageProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/signin'); return; }
  }, [user, authLoading, navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) { toast.error('Enter your current password'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('New password and confirmation do not match'); return; }
    setSaving(true);
    try {
      const email = user?.email ?? profile?.email;
      if (!email) throw new Error('Could not verify your account email');

      const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: oldPassword });
      if (verifyError) throw new Error('Current password is incorrect');

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/account')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Account
      </button>
      <h1 className="mb-6 text-3xl font-bold">Change Password</h1>

      <form onSubmit={handlePasswordChange} className="space-y-4 rounded-xl border border-border/60 bg-card p-5">
        <input
          type="text"
          name="username"
          autoComplete="username"
          value={user?.email ?? profile?.email ?? ''}
          readOnly
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="space-y-2">
          <Label htmlFor="oldPassword">Current Password</Label>
          <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" autoComplete="current-password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" required minLength={6} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" autoComplete="new-password" required minLength={6} />
        </div>
        <Button type="submit" size="lg" disabled={saving} className="w-full">
          <Lock className="mr-2 h-4 w-4" /> {saving ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}
