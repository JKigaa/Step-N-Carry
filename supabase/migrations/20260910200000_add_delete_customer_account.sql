-- Allows a super admin to permanently delete a customer account while
-- keeping their order history intact (orders already store the customer's
-- name/phone/delivery info directly, so nothing meaningful is lost).
--
-- Notifications still cascade-delete with the account (personal UI state,
-- not a business record) -- only orders are detached instead of deleted.

ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Only applies to customer accounts -- admin accounts are managed via
-- Manage Admins (demote first) rather than through this path, to avoid two
-- conflicting ways of "removing" an admin.
CREATE OR REPLACE FUNCTION public.delete_customer_account(target_user_id uuid)
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
    RAISE EXCEPTION 'Demote this account via Manage Admins before deleting it';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_customer_account(uuid) TO authenticated;
