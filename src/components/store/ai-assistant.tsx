import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Sparkles, X, Send, Search, CreditCard, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
}

const STARTERS = [
  { icon: Search, label: 'Find a product' },
  { icon: CreditCard, label: 'Payment options' },
  { icon: ShoppingCart, label: 'How do I order?' },
];

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi \u{1F44B} Welcome to Step N Carry! I can help you find products and guide you through shopping.',
};

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: trimmed },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: "Thanks for your question! I'm currently in preview mode and will be fully connected soon. In the meantime, feel free to browse our shop or contact us on WhatsApp.",
      },
    ]);
    setInput('');
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
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border/60 text-foreground'
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Starter options — show only before first user message */}
            {messages.length === 1 && (
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
              className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
