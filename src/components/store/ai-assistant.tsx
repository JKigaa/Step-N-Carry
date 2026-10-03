import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Sparkles, X, Send, Search, CreditCard, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/hooks/use-cart';
import { formatKsh } from '@/lib/store-constants';

// Temporarily disabled while Anthropic API usage/billing is being sorted out.
// Flip back to true to re-enable -- nothing else needs to change.
const AI_ASSISTANT_ENABLED = false;

interface AssistantProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  images: string[];
  stock: number;
  product_sizes: { size: string; stock: number }[];
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  products?: AssistantProduct[];
  isError?: boolean;
}

interface AiAssistantProps {
  navigate: (to: string) => void;
}

const STARTERS = [
  { icon: Search, label: 'Find a product' },
  { icon: CreditCard, label: 'Payment options' },
  { icon: ShoppingCart, label: 'How do I order?' },
];

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi \u{1F44B} Welcome to Step N Carry! Tell me what you\u2019re looking for \u2014 a style, color, or budget \u2014 and I\u2019ll help you find it.',
};

function ProductResultCard({ product, navigate }: { product: AssistantProduct; navigate: (to: string) => void }) {
  const { addItem } = useCart();
  const availableSizes = (product.product_sizes ?? []).filter((s) => s.stock > 0);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]?.size ?? '');

  const handleAddToCart = () => {
    if (!selectedSize) return;
    const sizeInfo = availableSizes.find((s) => s.size === selectedSize);
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images?.[0] ?? '',
      price: product.price,
      size: selectedSize,
      quantity: 1,
      stock: sizeInfo?.stock ?? 1,
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
      <button type="button" onClick={() => navigate(`/product/${product.id}`)} className="flex w-full gap-2 p-2 text-left">
        <img src={product.images?.[0] ?? ''} alt={product.name} className="h-14 w-14 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">{product.name}</p>
          <p className="text-[10px] text-muted-foreground">{product.brand}</p>
          <p className="text-xs font-bold text-primary">{formatKsh(product.price)}</p>
        </div>
      </button>
      {availableSizes.length > 0 ? (
        <div className="flex items-center gap-1.5 border-t border-border/40 p-2">
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="rounded border border-input bg-transparent px-1.5 py-1 text-[11px]"
            aria-label="Select size"
          >
            {availableSizes.map((s) => (
              <option key={s.size} value={s.size}>Size {s.size}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add to Cart
          </button>
        </div>
      ) : (
        <p className="border-t border-border/40 p-2 text-[11px] text-muted-foreground">Out of stock</p>
      )}
    </div>
  );
}

export function AiAssistant({ navigate }: AiAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  if (!AI_ASSISTANT_ENABLED) return null;

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: trimmed };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = history
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.text }));

      const { data, error } = await supabase.functions.invoke('shopping-assistant', {
        body: { messages: apiMessages },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: data.reply ?? "Sorry, I didn't catch that.",
          products: Array.isArray(data.products) && data.products.length > 0 ? data.products : undefined,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: "Sorry, I'm having trouble connecting right now. Please try again, or reach us on WhatsApp.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Shop with AI"
        aria-expanded={open}
        className={cn(
          'fixed right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl',
          'bottom-[5.25rem]'
        )}
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-sm">Shop with AI</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl sm:w-80"
          style={{
            bottom: '8.75rem',
            right: '1.25rem',
            width: 'min(calc(100vw - 2.5rem), 22rem)',
            maxHeight: 'min(70vh, 34rem)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Step N Carry Assistant</p>
                <p className="mt-0.5 text-[10px] opacity-80">No account needed</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-full p-1 transition-colors hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex flex-col gap-2',
                  m.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : m.isError
                      ? 'flex items-center gap-1.5 border border-destructive/40 bg-destructive/10 text-destructive'
                      : 'bg-background border border-border/60 text-foreground'
                  )}
                >
                  {m.isError && <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                  {m.text}
                </div>
                {m.products && m.products.length > 0 && (
                  <div className="grid w-[90%] gap-2">
                    {m.products.map((p) => (
                      <ProductResultCard key={p.id} product={p} navigate={navigate} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
                </div>
              </div>
            )}

            {/* Starter options — show only before first user message */}
            {messages.length === 1 && !loading && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Try one of these:
                </p>
                {STARTERS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => sendMessage(s.label)}
                    className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <s.icon className="h-4 w-4 text-primary" />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border/60 bg-background p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              aria-label="Message input"
              disabled={loading}
              className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
