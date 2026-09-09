-- Needed by the notify-new-order Edge Function (WhatsApp order notifications),
-- which reads order_items using the service role key.
GRANT SELECT ON public.order_items TO service_role;
