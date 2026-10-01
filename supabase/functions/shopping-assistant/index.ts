// supabase/functions/shopping-assistant/index.ts
//
// Powers the storefront's AI shopping assistant. Claude is given a
// search_products tool that queries the REAL product catalog (Supabase)
// rather than inventing products, prices, sizes, or stock. The Anthropic
// API key stays server-side here and is never exposed to the frontend.
//
// Required secret (Supabase Dashboard -> Edge Functions -> Secrets):
//   ANTHROPIC_API_KEY

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_RESULTS = 6;
const MAX_TOOL_ROUNDS = 3;

const SYSTEM_PROMPT = `You are the Step N Carry shopping assistant -- a helpful, concise shop
assistant for an online shoe and bag store in Kenya.

Store facts you can rely on for policy/delivery/payment questions:
- Nationwide delivery across Kenya, flat delivery fee of KSh 300.
- Returns/exchanges accepted within 5 days of delivery, items must be unworn
  with original tags. Customer pays return shipping unless the item is
  defective or wrong.
- Payment options at checkout: Pay on Delivery, M-Pesa, Card.

Rules:
- Always use the search_products tool before recommending any product. Never
  invent product names, prices, sizes, colors, or stock -- only describe what
  the tool actually returns.
- If a search returns no matches, say so plainly and suggest trying a
  different category, price range, or keyword. Do not claim a similar product
  exists if it doesn't.
- If the customer's request is vague (just "shoes", or no budget/category
  given), ask one short clarifying question before searching.
- Keep replies brief and conversational -- a few sentences, not an essay.
- Only answer policy/delivery/payment questions using the facts listed above.
  For anything else (e.g. order status, complaints), suggest contacting the
  store via WhatsApp.`;

const TOOLS = [
  {
    name: 'search_products',
    description:
      'Search the real Step N Carry product catalog. Returns actual matching products with price, images, and available sizes/stock. Use this before recommending anything.',
    input_schema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Free-text term to match against product name, brand, or description (e.g. a color, style, or brand the customer mentioned).',
        },
        category: {
          type: 'string',
          description: 'One of: Sneakers, Formal, Running, Heels, Boots, Sandals, Kids, Loafers, Bags',
        },
        max_price: { type: 'number', description: 'Maximum price in KSh' },
        min_price: { type: 'number', description: 'Minimum price in KSh' },
      },
    },
  },
];

async function searchProducts(supabase: ReturnType<typeof createClient>, args: Record<string, unknown>) {
  let query = supabase
    .from('products')
    .select('id, name, brand, category, price, images, stock, product_sizes(size, stock)')
    .eq('approval_status', 'approved')
    .eq('is_available', true)
    .limit(MAX_RESULTS);

  if (typeof args.category === 'string' && args.category) query = query.ilike('category', `%${args.category}%`);
  if (typeof args.max_price === 'number') query = query.lte('price', args.max_price);
  if (typeof args.min_price === 'number') query = query.gte('price', args.min_price);
  if (typeof args.keyword === 'string' && args.keyword) {
    const kw = args.keyword.replace(/[%,]/g, '');
    query = query.or(`name.ilike.%${kw}%,brand.ilike.%${kw}%,description.ilike.%${kw}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

Deno.serve(async (req) => {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const conversation = [...messages];
    let lastProducts: unknown[] = [];
    let finalText = '';

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools: TOOLS,
          messages: conversation,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error('Anthropic API error:', errText);
        throw new Error('Assistant is temporarily unavailable');
      }

      const data = await resp.json();
      const toolUse = (data.content ?? []).find((b: { type: string }) => b.type === 'tool_use');
      const textBlocks = (data.content ?? [])
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { text: string }) => b.text)
        .join('\n');

      if (data.stop_reason === 'tool_use' && toolUse) {
        const results = await searchProducts(supabase, toolUse.input ?? {});
        lastProducts = results;

        conversation.push({ role: 'assistant', content: data.content });
        conversation.push({
          role: 'user',
          content: [
            { type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(results) },
          ],
        });
        continue;
      }

      finalText = textBlocks || "Sorry, I didn't catch that -- could you rephrase?";
      break;
    }

    return new Response(JSON.stringify({ reply: finalText, products: lastProducts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('shopping-assistant error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500 }
    );
  }
});
