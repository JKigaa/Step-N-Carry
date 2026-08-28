import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { formatKsh, formatDate, formatDateTime } from '@/lib/store-constants';
import { StatusBadge, StatusProgress } from '@/components/store/status-badge';
import type { Order, OrderItem } from '@/types/db';

interface OrderDetailPageProps {
  navigate: (to: string) => void;
  orderId: string;
}

export function OrderDetailPage({ navigate, orderId }: OrderDetailPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/signin'); return; }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: ord }, { data: its }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId).maybeSingle(),
        supabase.from('order_items').select('*').eq('order_id', orderId),
      ]);
      setOrder(ord as Order | null);
      setItems((its ?? []) as OrderItem[]);
      setLoading(false);
    })();

    // Real-time order status updates
    const channel = supabase
      .channel(`order-detail-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `id=eq.${orderId}`,
      }, (payload) => setOrder(payload.new as Order))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, orderId]);

  if (authLoading || !user) return null;

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
        <Button className="mt-4" onClick={() => navigate('/account/orders')}>My Orders</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/account/orders')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Status progress */}
      <div className="mb-6 overflow-x-auto rounded-xl border border-border/60 bg-card p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Order Progress</h2>
        <StatusProgress currentStatus={order.status} />
      </div>

      {/* Items */}
      <div className="mb-4 rounded-xl border border-border/60 bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Package className="h-5 w-5 text-primary" /> Items
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
                  <p className="text-xs text-muted-foreground">{formatKsh(item.price_at_purchase)} each</p>
                </div>
                <span className="font-bold">{formatKsh(item.price_at_purchase * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mb-4 rounded-xl border border-border/60 bg-card p-5">
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
            <span className="font-bold">Total</span>
            <span className="font-bold text-primary">{formatKsh(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="mb-4 rounded-xl border border-border/60 bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <MapPin className="h-5 w-5 text-primary" /> Delivery Details
        </h2>
        <div className="text-sm">
          <p className="font-medium">{order.full_name}</p>
          <p className="text-muted-foreground">{order.phone} · {order.email}</p>
          <p className="text-muted-foreground">{order.delivery_address}, {order.town}, {order.county}</p>
        </div>

        {order.expected_delivery_date ? (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-800">Delivery Confirmed</span>
            </div>
            <p className="mt-1 text-sm text-green-700">
              {formatDate(order.expected_delivery_date)}
              {order.expected_delivery_window && ` between ${order.expected_delivery_window}`}
            </p>
            {order.delivery_notes && <p className="mt-1 text-sm text-green-700">{order.delivery_notes}</p>}
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" /> Delivery timeline will be confirmed after order review.
          </div>
        )}
      </div>
    </div>
  );
}
