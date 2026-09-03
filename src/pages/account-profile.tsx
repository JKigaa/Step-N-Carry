import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { KENYAN_COUNTIES } from '@/lib/store-constants';
import { toast } from 'sonner';

interface AccountProfilePageProps {
  navigate: (to: string) => void;
}

export function AccountProfilePage({ navigate }: AccountProfilePageProps) {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { navigate('/signin'); return; }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone);
      setDeliveryAddress(profile.delivery_address);
      setCounty(profile.county);
      setTown(profile.town);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone, delivery_address: deliveryAddress, county, town, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

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
      setChangingPassword(false);
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
      <h1 className="mb-6 text-3xl font-bold">Edit Profile</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="mb-4 text-lg font-bold">Personal Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Mwangi" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Email</Label>
              <Input value={profile?.email ?? ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="mb-4 text-lg font-bold">Delivery Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="House no, Street, Estate" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Select value={county} onValueChange={setCounty}>
                <SelectTrigger id="county"><SelectValue placeholder="Select county" /></SelectTrigger>
                <SelectContent>
                  {KENYAN_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="town">Town / Area</Label>
              <Input id="town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. Westlands" />
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={saving} className="w-full">
          <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>

      {/* Password change */}
      <div className="mt-6 rounded-xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Change Password</h2>
          <Button variant="outline" size="sm" onClick={() => setChangingPassword((v) => !v)}>
            {changingPassword ? 'Cancel' : 'Change'}
          </Button>
        </div>
        {changingPassword && (
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" required minLength={6} />
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update Password'}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
