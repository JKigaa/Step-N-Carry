import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Package, MapPin, Calendar, Phone, Mail, User, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { formatKsh, formatDate, formatDateTime } from '@/lib/store-constants';
import { StatusBadge, StatusProgress } from '@/components/store/status-badge';
import { ORDER_STATUSES, type Order, type OrderItem, type OrderStatus } from '@/types/db';
import { toast } from 'sonner';

interface AdminOrderDetailPageProps {
  navigate: (to: string) => void;
  orderId: string;
}

export function AdminOrderDetailPage({ navigate, orderId }: AdminOrderDetailPageProps) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [status, setStatus] = useState<OrderStatus>('Order Received');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) { navigate('/signin'); return; }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ data: ord }, { data: its }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId).maybeSingle(),
        supabase.from('order_items').select('*').eq('order_id', orderId),
      ]);
      if (ord) {
        setOrder(ord as Order);
        setStatus(ord.status as OrderStatus);
        setDeliveryDate(ord.expected_delivery_date ?? '');
        setDeliveryWindow(ord.expected_delivery_window ?? '');
        setDeliveryNotes(ord.delivery_notes ?? '');
      }
      setItems((its ?? []) as OrderItem[]);
      setLoading(false);
    })();
  }, [isAdmin, orderId]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const updates: Partial<Order> = {
        status,
        expected_delivery_window: deliveryWindow,
        delivery_notes: deliveryNotes,
        expected_delivery_date: deliveryDate || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('orders').update(updates).eq('id', order.id);
      if (error) throw error;

      // Notify the customer about status change
      const prevStatus = order.status;
      const messages: Partial<Record<OrderStatus, string>> = {
        'Order Under Review': `Your order ${order.order_number} is now under review. We'll confirm your delivery timeline soon.`,
        'Payment Confirmed': `Payment for order ${order.order_number} has been confirmed. We'll start preparing your shoes.`,
        'Preparing Order': `We're preparing your order ${order.order_number}. It will be ready for delivery soon.`,
        'Out for Delivery': `Your order ${order.order_number} is out for delivery! ${deliveryDate ? `Expected: ${formatDate(deliveryDate)}${deliveryWindow ? ` between ${deliveryWindow}` : ''}` : ''}`,
        'Delivered': `Your order ${order.order_number} has been delivered. Thank you for shopping with Fancy Shoes!`,
        'Cancelled': `Your order ${order.order_number} has been cancelled. Contact us if you have any questions.`,
      };

      if (status !== prevStatus && messages[status]) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: status,
          message: messages[status],
          type: 'order',
          order_id: order.id,
        });
      }

      // Notify about delivery timeline if date was set
      if (deliveryDate && deliveryDate !== order.expected_delivery_date) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: 'Delivery Timeline Confirmed',
          message: `Your order ${order.order_number} has been reviewed. Expected delivery: ${formatDate(deliveryDate)}${deliveryWindow ? ` between ${deliveryWindow}` : ''}.${deliveryNotes ? ` Note: ${deliveryNotes}` : ''}`,
          type: 'delivery',
          order_id: order.id,
        });
      }

      setOrder((prev) => prev ? { ...prev, ...updates } : prev);
      toast.success('Order updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user || !isAdmin) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Button className="mt-4" onClick={() => navigate('/admin/orders')}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border/60 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Orders
          </button>
          <div>
            <span className="text-xl font-bold">{order.order_number}</span>
            <span className="ml-3"><StatusBadge status={order.status} /></span>
          </div>
          <div className="ml-auto">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-5 lg:col-span-2">
            {/* Status progress */}
            <div className="overflow-x-auto rounded-xl border border-border/60 bg-card p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Order Progress</h2>
              <StatusProgress currentStatus={order.status} />
            </div>

            {/* Items */}
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <Package className="h-5 w-5 text-primary" /> Ordered Items
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
            <div className="rounded-xl border border-border/60 bg-card p-5">
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
          </div>

          {/* Right column — admin controls */}
          <div className="space-y-5">
            {/* Customer info */}
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <User className="h-5 w-5 text-primary" /> Customer
              </h2>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.full_name}</p>
                <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {order.phone}</p>
                <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {order.email}</p>
              </div>
            </div>

            {/* Delivery address */}
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5 text-primary" /> Delivery Address
              </h2>
              <p className="text-sm">{order.delivery_address}</p>
              <p className="text-sm text-muted-foreground">{order.town}, {order.county}</p>
            </div>

            {/* Update status */}
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h2 className="mb-3 text-lg font-bold">Update Order</h2>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Order Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expected Delivery Date</Label>
                  <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="space-y-2">
                  <Label>Delivery Time Window</Label>
                  <Input value={deliveryWindow} onChange={(e) => setDeliveryWindow(e.target.value)} placeholder="e.g. 2:00 PM – 5:00 PM" />
                </div>

                <div className="space-y-2">
                  <Label>Delivery Notes</Label>
                  <Textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} rows={2} placeholder="Special instructions for the rider..." />
                </div>

                <Button className="w-full" onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Created: {formatDateTime(order.created_at)}</p>
              <p>Updated: {formatDateTime(order.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
