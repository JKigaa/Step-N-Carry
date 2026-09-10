-- Adds a super-admin tier on top of the existing 'admin' role.
-- role='admin' still gates the whole admin panel (orders/products), unchanged.
-- is_super_admin additionally gates: the Reports page, and managing other admins.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

-- Grandfather every existing admin in as a super admin (they predate this distinction).
UPDATE public.profiles SET is_super_admin = true WHERE role = 'admin';

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_super_admin = true
  );
$$;

-- Lets a super admin promote/demote other profiles (update role / is_super_admin).
DROP POLICY IF EXISTS "profiles_update_by_super_admin" ON public.profiles;
CREATE POLICY "profiles_update_by_super_admin" ON public.profiles FOR UPDATE
  TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
