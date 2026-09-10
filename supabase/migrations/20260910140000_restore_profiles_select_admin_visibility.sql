-- profiles_select_own on the live database was found missing its "OR public.is_admin()"
-- clause (only "auth.uid() = id" remained), which silently blocked admins from viewing
-- other users' profiles -- e.g. searching by email in Manage Admins.
-- Restoring it to match the original intended definition.

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());
