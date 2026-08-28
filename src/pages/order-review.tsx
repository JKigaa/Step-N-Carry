import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { formatKsh, formatDate } from '@/lib/store-constants';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, CreditCard, Smartphone } from 'lucide-react';

interface CheckoutData {
  fullName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  county: string;
  town: string;
  items: {
    productId: string;
    name: string;
    brand: string;
    image: string;
    price: number;
    size: string;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

interface OrderReviewPageProps {
  navigate: (to: string) => void;
}

export function OrderReviewPage({ navigate }: OrderReviewPageProps) {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('checkout-data');
    if (!raw) {
      navigate('/cart');
      return;
    }
    const parsed = JSON.parse(raw) as CheckoutData;
    // Reconcile with live cart in case it changed
    if (items.length > 0) {
      parsed.items = items.map((i) => ({
        productId: i.productId, name: i.name, brand: i.brand, image: i.image,
        price: i.price, size: i.size, quantity: i.quantity,
      }));
      parsed.subtotal = subtotal;
      parsed.total = subtotal + parsed.deliveryFee;
    }
    setData(parsed);
  }, []);

  if (!data) return null;

  const handlePlaceOrder = async () => {
    if (!user || !data) return;
    setLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'Order Received',
          subtotal: data.subtotal,
          delivery_fee: data.deliveryFee,
          total: data.total,
          full_name: data.fullName,
          phone: data.phone,
          email: data.email,
          delivery_address: data.deliveryAddress,
          county: data.county,
          town: data.town,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = data.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_image: item.image,
        size: item.size,
        price_at_purchase: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Create notification for the customer
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Order Received',
        message: `Your order ${order.order_number} has been received. We'll review it shortly. Total: ${formatKsh(data.total)}.`,
        type: 'order',
        order_id: order.id,
      });
      if (notifError) console.error('Notification error:', notifError);

      // Clear cart and checkout data
      clearCart();
      sessionStorage.removeItem('checkout-data');

      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/checkout')}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Edit Checkout Info
      </button>

      <h1 className="mb-6 text-3xl font-bold">Review Your Order</h1>

      <div className="space-y-6">
        {/* Delivery details */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 text-lg font-bold">Delivery Details</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{data.fullName}</span></div>
            <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{data.phone}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{data.email}</span></div>
            <div><span className="text-muted-foreground">County:</span> <span className="font-medium">{data.county}</span></div>
            <div className="sm:col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{data.deliveryAddress}, {data.town}, {data.county}</span></div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 text-lg font-bold">Items ({data.items.length})</h2>
          <div className="space-y-3">
            {data.items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.brand} · Size {item.size} · Qty {item.quantity}</p>
                  </div>
                  <span className="font-bold">{formatKsh(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method (mock) */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 text-lg font-bold">Payment Method</h2>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            This is a mock payment flow. No real payment will be processed. You can integrate M-Pesa, card payments, and other methods later.
          </div>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <RadioGroupItem value="mpesa" id="mpesa" />
              <Label htmlFor="mpesa" className="flex flex-1 cursor-pointer items-center gap-2 font-normal">
                <Smartphone className="h-5 w-5 text-green-600" /> M-Pesa (mock)
              </Label>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex flex-1 cursor-pointer items-center gap-2 font-normal">
                <CreditCard className="h-5 w-5 text-blue-600" /> Card Payment (mock)
              </Label>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod" className="flex flex-1 cursor-pointer items-center gap-2 font-normal">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" /> Pay on Delivery
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatKsh(data.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-medium">{formatKsh(data.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <span className="font-bold">Grand Total</span>
              <span className="font-bold text-primary">{formatKsh(data.total)}</span>
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={loading}
            onClick={handlePlaceOrder}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            By placing this order, you agree to our terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
