-- Product moderation for assistant admins:
--   * New products created by an assistant admin start as 'pending' and are
--     invisible to customers until a super admin approves them. Super admin's
--     own new products are auto-approved (immediate publish).
--   * Edits to existing, already-approved products by an assistant go through
--     immediately (no approval needed) -- only NEW products are gated.
--   * Deleting a product always requires super admin approval: an assistant
--     can only flag a product for deletion (it stays live/for sale while
--     pending); only a super admin's approval actually removes it.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pending_deletion boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deletion_requested_by uuid REFERENCES auth.users(id);

-- On INSERT: force approval_status based on who's actually submitting,
-- regardless of what the client sends -- this can't be bypassed via devtools.
CREATE OR REPLACE FUNCTION public.enforce_product_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.submitted_by := auth.uid();
  IF public.is_super_admin() THEN
    NEW.approval_status := 'approved';
  ELSE
    NEW.approval_status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_product_approval ON public.products;
CREATE TRIGGER trg_enforce_product_approval
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.enforce_product_approval();

-- On UPDATE: only a super admin may change approval_status (approve/reject),
-- and only a super admin may CLEAR pending_deletion (approve/reject a deletion
-- request). An assistant admin may still set pending_deletion false->true
-- themselves (that's how they request a deletion in the first place).
CREATE OR REPLACE FUNCTION public.enforce_product_moderation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    NEW.approval_status := OLD.approval_status;
    IF OLD.pending_deletion = true THEN
      NEW.pending_deletion := OLD.pending_deletion;
    ELSIF NEW.pending_deletion = true AND OLD.pending_deletion = false THEN
      NEW.deletion_requested_by := auth.uid();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_product_moderation_fields ON public.products;
CREATE TRIGGER trg_enforce_product_moderation_fields
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.enforce_product_moderation_fields();

-- Customers only ever see approved products; any admin (super or assistant)
-- can see the full catalog including pending/rejected items.
DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public" ON public.products FOR SELECT
  TO anon, authenticated USING (approval_status = 'approved' OR public.is_admin());

-- Actual deletion is now restricted to super admins only. An assistant
-- admin's "delete" action in the UI becomes an UPDATE (pending_deletion =
-- true) instead, which the policy above still allows via products_update_admin.
DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE
  TO authenticated USING (public.is_super_admin());
