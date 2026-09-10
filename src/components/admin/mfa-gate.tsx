import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

// How many times an admin may skip 2FA enrollment before it becomes mandatory.
const SKIP_LIMIT = 3;

type GateState = 'checking' | 'needs_enrollment' | 'needs_challenge' | 'ok';

interface AdminMfaGateProps {
  children: ReactNode;
}

export function AdminMfaGate({ children }: AdminMfaGateProps) {
  const { user, profile, isAdmin, loading: authLoading, refreshProfile } = useAuth();
  const [state, setState] = useState<GateState>('checking');

  const checkMfaStatus = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) { setState('ok'); return; }
    if (data.currentLevel === 'aal2') { setState('ok'); return; }
    if (data.nextLevel === 'aal2') { setState('needs_challenge'); return; }
    setState('needs_enrollment');
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) { setState('ok'); return; }
    checkMfaStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin]);

  if (authLoading || state === 'checking') return null;
  if (state === 'ok') return <>{children}</>;

  if (state === 'needs_challenge') {
    return <MfaChallengeScreen onVerified={() => setState('ok')} />;
  }

  return (
    <MfaEnrollScreen
      skipCount={profile?.mfa_skip_count ?? 0}
      onEnrolled={() => setState('ok')}
      onSkip={async () => {
        if (!user) return;
        await supabase.from('profiles').update({ mfa_skip_count: (profile?.mfa_skip_count ?? 0) + 1 }).eq('id', user.id);
        await refreshProfile();
        setState('ok');
      }}
    />
  );
}

function MfaChallengeScreen({ onVerified }: { onVerified: () => void }) {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const factor = factors?.totp?.[0];
      if (!factor) throw new Error('No 2FA method found on this account.');

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;

      onVerified();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="mb-1 text-xl font-bold">Two-Factor Verification</h1>
        <p className="mb-4 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
        <form onSubmit={handleVerify} className="space-y-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="text-center text-lg tracking-[0.5em]"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            required
          />
          <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
            {verifying ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MfaEnrollScreen({
  skipCount,
  onEnrolled,
  onSkip,
}: {
  skipCount: number;
  onEnrolled: () => void;
  onSkip: () => void;
}) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const canSkip = skipCount < SKIP_LIMIT;

  useEffect(() => {
    (async () => {
      try {
        // Clean up any abandoned unverified factor from a previous attempt
        // (e.g. the user skipped or refreshed mid-setup) before starting fresh.
        const { data: existing } = await supabase.auth.mfa.listFactors();
        const stale = existing?.totp?.find((f) => f.status === 'unverified');
        if (stale) {
          await supabase.auth.mfa.unenroll({ factorId: stale.id });
        }

        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
        if (error) throw error;
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to start 2FA setup.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setVerifying(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;

      toast.success('Two-factor authentication enabled');
      onEnrolled();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    await onSkip();
    setSkipping(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-8">
      <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mb-1 text-xl font-bold">Set Up Two-Factor Authentication</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Admin accounts require 2FA for extra security. Scan this QR code with an authenticator app
          (Google Authenticator, Authy, etc.).
        </p>

        {loading ? (
          <p className="py-6 text-sm text-muted-foreground">Loading...</p>
        ) : qrCode ? (
          <>
            <img src={qrCode} alt="Scan with your authenticator app" className="mx-auto mb-3 h-44 w-44" />
            {secret && (
              <p className="mb-4 break-all rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                Can't scan? Enter this code manually: <span className="font-mono">{secret}</span>
              </p>
            )}
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="mfaCode">Enter the 6-digit code to confirm</Label>
                <Input
                  id="mfaCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-lg tracking-[0.5em]"
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
                {verifying ? 'Verifying...' : 'Verify & Enable 2FA'}
              </Button>
            </form>
          </>
        ) : (
          <p className="py-6 text-sm text-destructive">Couldn't load 2FA setup. Please refresh and try again.</p>
        )}

        {canSkip && (
          <button
            onClick={handleSkip}
            disabled={skipping}
            className="mt-4 text-sm text-muted-foreground underline hover:text-foreground"
          >
            {skipping ? 'Skipping...' : `Skip for now (${SKIP_LIMIT - skipCount} left)`}
          </button>
        )}
      </div>
    </div>
  );
}
