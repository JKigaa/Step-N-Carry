-- Staged edits for assistant admins editing an EXISTING, already-live product.
-- The live products row is never touched by an assistant's edit -- their
-- proposed changes sit in this separate table until a super admin approves
-- them, at which point they're applied atomically. Customers therefore always
-- see the current approved version of the product while an edit is pending.

CREATE TABLE IF NOT EXISTS public.product_edit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proposed_data jsonb NOT NULL,
  proposed_sizes jsonb,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_edit_requests ENABLE ROW LEVEL SECURITY;

-- This project's tables have consistently needed explicit grants beyond RLS
-- policies alone (see prior migrations) -- adding this proactively.
GRANT SELECT, INSERT, DELETE ON public.product_edit_requests TO authenticated;

-- Any admin can see requests (assistants see their own submissions' status,
-- super admins see everything to review).
DROP POLICY IF EXISTS "edit_requests_select_admin" ON public.product_edit_requests;
CREATE POLICY "edit_requests_select_admin" ON public.product_edit_requests FOR SELECT
  TO authenticated USING (public.is_admin());

-- Any admin can submit a request (assistants use this path; super admins
-- normally edit directly instead, but this stays open in case they want to
-- use the same flow).
DROP POLICY IF EXISTS "edit_requests_insert_admin" ON public.product_edit_requests;
CREATE POLICY "edit_requests_insert_admin" ON public.product_edit_requests FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

-- Force submitted_by/status server-side regardless of what the client sends.
CREATE OR REPLACE FUNCTION public.enforce_edit_request_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.submitted_by := auth.uid();
  NEW.status := 'pending';
  NEW.reviewed_by := NULL;
  NEW.reviewed_at := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_edit_request_submission ON public.product_edit_requests;
CREATE TRIGGER trg_enforce_edit_request_submission
BEFORE INSERT ON public.product_edit_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_edit_request_submission();

-- A submitter may delete their own still-pending request (change of mind);
-- a super admin may delete any.
DROP POLICY IF EXISTS "edit_requests_delete" ON public.product_edit_requests;
CREATE POLICY "edit_requests_delete" ON public.product_edit_requests FOR DELETE
  TO authenticated USING (
    (submitted_by = auth.uid() AND status = 'pending') OR public.is_super_admin()
  );

-- Applying an approved edit touches two tables (products + product_sizes) and
-- must happen atomically, so it's done via a function rather than separate
-- client-side calls. Only a super admin can call it.
CREATE OR REPLACE FUNCTION public.approve_product_edit_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req record;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO req FROM public.product_edit_requests WHERE id = request_id AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Edit request not found or already reviewed';
  END IF;

  UPDATE public.products SET
    name = COALESCE(req.proposed_data->>'name', name),
    brand = COALESCE(req.proposed_data->>'brand', brand),
    category = COALESCE(req.proposed_data->>'category', category),
    description = COALESCE(req.proposed_data->>'description', description),
    price = COALESCE((req.proposed_data->>'price')::int, price),
    images = COALESCE(
      (SELECT array_agg(value) FROM jsonb_array_elements_text(req.proposed_data->'images')),
      images
    ),
    stock = COALESCE((req.proposed_data->>'stock')::int, stock),
    is_available = COALESCE((req.proposed_data->>'is_available')::boolean, is_available),
    is_featured = COALESCE((req.proposed_data->>'is_featured')::boolean, is_featured),
    is_popular = COALESCE((req.proposed_data->>'is_popular')::boolean, is_popular),
    updated_at = now()
  WHERE id = req.product_id;

  IF req.proposed_sizes IS NOT NULL THEN
    DELETE FROM public.product_sizes WHERE product_id = req.product_id;
    INSERT INTO public.product_sizes (product_id, size, stock)
    SELECT req.product_id, elem->>'size', (elem->>'stock')::int
    FROM jsonb_array_elements(req.proposed_sizes) elem;
  END IF;

  UPDATE public.product_edit_requests
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = request_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_product_edit_request(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.reject_product_edit_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.product_edit_requests
  SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = request_id AND status = 'pending';
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_product_edit_request(uuid) TO authenticated;
