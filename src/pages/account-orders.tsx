import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { formatKsh, formatDate, formatDateTime } from '@/lib/store-constants';
import { StatusBadge } from '@/components/store/status-badge';
import type { Order, OrderItem } from '@/types/db';

interface AccountOrdersPageProps {
  navigate: (to: string) => void;
}

export function AccountOrdersPage({ navigate }: AccountOrdersPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/signin'); return; }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders((data ?? []) as Order[]);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/account')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Account
      </button>
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Package className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Start shopping to see your orders here.</p>
          <Button className="mt-4" onClick={() => navigate('/shop')}>Browse Shoes</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
              className="w-full rounded-xl border border-border/60 bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-primary">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span className="font-semibold">{formatKsh(order.total)}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {order.town}, {order.county}
                </span>
                {order.expected_delivery_date && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(order.expected_delivery_date)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-end text-xs text-primary">
                View details <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
