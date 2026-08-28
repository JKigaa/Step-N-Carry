import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { formatKsh, DEFAULT_DELIVERY_FEE } from '@/lib/store-constants';
import { toast } from 'sonner';

interface CartPageProps {
  navigate: (to: string) => void;
}

export function CartPage({ navigate }: CartPageProps) {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const deliveryFee = subtotal > 0 ? DEFAULT_DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Browse our collection and find your perfect pair.</p>
        <Button className="mt-6" size="lg" onClick={() => navigate('/shop')}>
          Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="ghost" size="sm" onClick={() => clearCart()}>
          Clear All
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 rounded-xl border border-border/60 bg-card p-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-24 shrink-0 rounded-lg object-cover"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Size: {item.size}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      removeItem(item.productId, item.size);
                      toast.success('Removed from cart');
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-lg border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      disabled={item.quantity >= (item.stock || 99)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatKsh(item.price * item.quantity)}</p>
                    <p className="text-xs text-muted-foreground">{formatKsh(item.price)} each</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={() => navigate('/shop')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Button>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-border/60 bg-card p-5">
            <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatKsh(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">{formatKsh(deliveryFee)}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">{formatKsh(total)}</span>
                </div>
              </div>
            </div>
            <Button
              className="mt-4 w-full"
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
