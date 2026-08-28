import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatKsh, formatDate } from '@/lib/store-constants';
import { StatusBadge } from '@/components/store/status-badge';
import type { Order, OrderItem } from '@/types/db';

interface OrderConfirmationPageProps {
  navigate: (to: string) => void;
  orderId: string;
}

export function OrderConfirmationPage({ navigate, orderId }: OrderConfirmationPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: ord } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();
        if (ord) setOrder(ord as Order);

        const { data: its } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
        if (its) setItems(its as OrderItem[]);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Button className="mt-4" onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">Thank you for your order. We've received it and will review it shortly.</p>
      </div>

      {/* Order number */}
      <div className="mt-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">Order Number</p>
        <p className="text-2xl font-bold text-primary">{order.order_number}</p>
        <div className="mt-2">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-xl border border-border/60 bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Package className="h-5 w-5 text-primary" /> Items Purchased
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
              {item.product_image && (
                <img src={item.product_image} alt={item.product_name} className="h-16 w-16 rounded-md object-cover" />
              )}
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">Size {item.size} · Qty {item.quantity}</p>
                </div>
                <span className="font-bold">{formatKsh(item.price_at_purchase * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 rounded-xl border border-border/60 bg-card p-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatKsh(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-medium">{formatKsh(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base">
            <span className="font-bold">Total Paid</span>
            <span className="font-bold text-primary">{formatKsh(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="mt-4 rounded-xl border border-border/60 bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <MapPin className="h-5 w-5 text-primary" /> Delivery Details
        </h2>
        <div className="text-sm">
          <p className="font-medium">{order.full_name}</p>
          <p className="text-muted-foreground">{order.phone}</p>
          <p className="text-muted-foreground">{order.delivery_address}, {order.town}, {order.county}</p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span>
            {order.expected_delivery_date
              ? `Expected delivery: ${formatDate(order.expected_delivery_date)}${order.expected_delivery_window ? `, ${order.expected_delivery_window}` : ''}`
              : 'Expected delivery timeline: Will be confirmed after order review'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button className="flex-1" size="lg" onClick={() => navigate(`/order/${order.id}`)}>
          View Order Details <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/shop')}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
