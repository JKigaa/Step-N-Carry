DROP POLICY IF EXISTS "notif_insert_admin" ON public.notifications;

CREATE POLICY "notif_insert_admin" ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());
