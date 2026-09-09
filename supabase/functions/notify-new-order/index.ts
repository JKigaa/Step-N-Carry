// supabase/functions/notify-new-order/index.ts
//
// Triggered by a Supabase Database Webhook on INSERT into public.orders.
// Fetches the order's line items, formats them, and sends a WhatsApp
// template message ("new_snc_order") to the admin via Meta's WhatsApp
// Cloud API.
//
// Required secrets (set via Supabase Dashboard -> Edge Functions -> Secrets):
//   WHATSAPP_ACCESS_TOKEN   - permanent System User token
//   WHATSAPP_PHONE_NUMBER_ID - the sending number's Phone Number ID
//   WHATSAPP_ADMIN_NUMBER   - admin's WhatsApp number, international format,
//                              digits only (e.g. 254712345678)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')!;
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')!;
const WHATSAPP_ADMIN_NUMBER = Deno.env.get('WHATSAPP_ADMIN_NUMBER')!;

const TEMPLATE_NAME = 'new_snc_order';
const TEMPLATE_LANGUAGE = 'en';

interface OrderRow {
  id: string;
  order_number: string;
  full_name: string;
  phone: string;
  total: number;
  payment_method: string | null;
  delivery_address: string;
  county: string;
  town: string;
}

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: OrderRow;
}

function formatKsh(amount: number): string {
  return new Intl.NumberFormat('en-KE').format(amount);
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const order = payload.record;

    if (!order?.id) {
      return new Response(JSON.stringify({ error: 'No order record in payload' }), { status: 400 });
    }

    // Fetch line items for this order (webhook payload only contains the orders row itself)
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_name, size, quantity')
      .eq('order_id', order.id);

    if (itemsError) throw itemsError;

    const itemsSummary = (items ?? [])
      .map((it) => `${it.quantity}x ${it.product_name}${it.size ? ` (Size ${it.size})` : ''}`)
      .join(', ') || 'No items found';

    const deliveryLocation = [order.town, order.county].filter(Boolean).join(', ') || order.delivery_address;

    const components = [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: order.order_number },
          { type: 'text', text: order.full_name || 'N/A' },
          { type: 'text', text: order.phone || 'N/A' },
          { type: 'text', text: itemsSummary },
          { type: 'text', text: formatKsh(order.total) },
          { type: 'text', text: order.payment_method || 'N/A' },
          { type: 'text', text: deliveryLocation || 'N/A' },
        ],
      },
    ];

    const waResponse = await fetch(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: WHATSAPP_ADMIN_NUMBER,
          type: 'template',
          template: {
            name: TEMPLATE_NAME,
            language: { code: TEMPLATE_LANGUAGE },
            components,
          },
        }),
      }
    );

    const waResult = await waResponse.json();

    if (!waResponse.ok) {
      console.error('WhatsApp API error:', waResult);
      return new Response(JSON.stringify({ error: 'WhatsApp send failed', details: waResult }), { status: 502 });
    }

    return new Response(JSON.stringify({ success: true, whatsapp: waResult }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('notify-new-order error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
    });
  }
});
