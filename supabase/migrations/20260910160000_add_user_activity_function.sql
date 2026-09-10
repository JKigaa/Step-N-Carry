-- Exposes last_sign_in_at (from the protected auth.users table) alongside each
-- profile, so super admins can see who's active/inactive. Only callable by a
-- super admin -- anyone else gets an exception, not partial/empty data.

CREATE OR REPLACE FUNCTION public.get_all_users_activity()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  is_super_admin boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.role, p.is_super_admin, p.created_at, u.last_sign_in_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY u.last_sign_in_at DESC NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_users_activity() TO authenticated;
