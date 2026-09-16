-- Deactivate/reactivate a customer account using Supabase's own built-in
-- account-blocking field (auth.users.banned_until). When set to a future
-- date, Supabase's own sign-in endpoint rejects the login automatically --
-- this isn't something the app has to enforce itself. Setting it back to
-- NULL reactivates the account. Only applies to customers, same restriction
-- as delete_customer_account.

CREATE OR REPLACE FUNCTION public.set_customer_active_status(target_user_id uuid, deactivate boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_role text;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT role INTO target_role FROM public.profiles WHERE id = target_user_id;
  IF target_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  IF target_role = 'admin' THEN
    RAISE EXCEPTION 'This action only applies to customer accounts';
  END IF;

  IF deactivate THEN
    UPDATE auth.users SET banned_until = '2099-12-31 00:00:00+00'::timestamptz WHERE id = target_user_id;
  ELSE
    UPDATE auth.users SET banned_until = NULL WHERE id = target_user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_customer_active_status(uuid, boolean) TO authenticated;

-- Expose whether an account is currently deactivated, alongside the
-- existing activity data.
CREATE OR REPLACE FUNCTION public.get_all_users_activity()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  is_super_admin boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_deactivated boolean
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
  SELECT p.id, p.email, p.full_name, p.role, p.is_super_admin, p.created_at, u.last_sign_in_at,
         (u.banned_until IS NOT NULL AND u.banned_until > now()) AS is_deactivated
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY u.last_sign_in_at DESC NULLS LAST;
END;
$$;
