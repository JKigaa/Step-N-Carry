import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordPageProps {
  navigate: (to: string) => void;
}

export function ForgotPasswordPage({ navigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/signin`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Password reset link sent');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-8 sm:px-6">
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sent ? 'Check your email for a reset link.' : 'Enter your email and we\'ll send you a reset link.'}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              A password reset link has been sent to <strong>{email}</strong>. Check your inbox and follow the instructions.
            </div>
            <Button className="w-full" variant="outline" onClick={() => navigate('/signin')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button type="button" className="w-full" variant="outline" onClick={() => navigate('/signin')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
