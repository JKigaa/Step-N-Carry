import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { formatKsh, formatDateTime } from '@/lib/store-constants';
import { StatusBadge } from '@/components/store/status-badge';
import { ORDER_STATUSES, type OrderStatus } from '@/types/db';

interface AdminOrdersPageProps {
  navigate: (to: string) => void;
}

interface OrderWithProfile {
  id: string;
  order_number: string;
  status: OrderStatus;
  total: number;
  full_name: string;
  phone: string;
  county: string;
  town: string;
  payment_method: string | null;
  created_at: string;
}

export function AdminOrdersPage({ navigate }: AdminOrdersPageProps) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) { navigate('/signin'); return; }
  }, [user, isAdmin, authLoading, navigate]);

      useEffect(() => {
  if (!isAdmin) return;

  let mounted = true;

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, status, total, full_name, phone, county, town, created_at, payment_method')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('ORDERS LOAD ERROR:', error);
    }

    if (mounted) {
      setOrders((data ?? []) as OrderWithProfile[]);
      setLoading(false);
    }
  };

  loadOrders();

  const channel = supabase
  .channel('admin-orders-realtime')
  .on('system', '*', (payload) => {
    console.log('REALTIME SYSTEM:', payload);
  })
  .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        console.log('REALTIME ORDER CHANGE:', payload);
        loadOrders();
      }
    )
    .subscribe((status) => {
      console.log('ADMIN ORDERS REALTIME:', status);
    });

  return () => {
    mounted = false;
    supabase.removeChannel(channel);
  };
}, [isAdmin]);

    
  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = !search
      || o.order_number.toLowerCase().includes(search.toLowerCase())
      || o.full_name.toLowerCase().includes(search.toLowerCase())
      || o.phone.includes(search);
    return matchStatus && matchSearch;
  });

  if (authLoading || !user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border/60 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <h1 className="text-xl font-bold">Orders</h1>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order#, name, phone..." className="pl-9 w-64" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Status filter tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>
            All ({orders.length})
          </Button>
          {ORDER_STATUSES.map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            if (count === 0) return null;
            return (
              <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'} onClick={() => setStatusFilter(s)}>
                {s} ({count})
              </Button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No orders found</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="w-full rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-bold text-primary">{order.order_number}</span>
                      <span className="ml-3 text-sm font-medium">{order.full_name}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{order.phone}</span>
                    </div>
                  </div>
                    <span className="rounded-md border border-border/60 px-2 py-1 text-xs font-medium">
                      {order.payment_method === "cod" ? "Pay on Delivery" : order.payment_method === "mpesa" ? "M-Pesa" : order.payment_method === "card" ? "Card Payment" : "Not specified"}
                    </span>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-bold">{formatKsh(order.total)}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>{order.town}, {order.county}</span>
                  <span>{formatDateTime(order.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
