-- Adds "who approved it" tracking to products, matching what
-- product_edit_requests already captures (reviewed_by/reviewed_at).
-- Stamped automatically by the database whenever a super admin changes
-- approval_status or clears pending_deletion -- never trusts the client.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS approved_at timestamptz;

CREATE OR REPLACE FUNCTION public.enforce_product_moderation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_super_admin() THEN
    IF NEW.approval_status IS DISTINCT FROM OLD.approval_status
       OR NEW.pending_deletion IS DISTINCT FROM OLD.pending_deletion THEN
      NEW.approved_by := auth.uid();
      NEW.approved_at := now();
    END IF;
  ELSE
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
