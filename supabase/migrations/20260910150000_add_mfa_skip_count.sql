-- Tracks how many times an admin has skipped the "set up 2FA" prompt.
-- Once this reaches the grace-period threshold (enforced client-side),
-- they can no longer skip and must enroll to access /admin.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mfa_skip_count integer NOT NULL DEFAULT 0;
