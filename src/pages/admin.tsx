import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, TrendingUp, Clock, Truck, CheckCircle2, XCircle, AlertTriangle, Users, BarChart3, LogOut, Settings, User, Lock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { formatKsh } from '@/lib/store-constants';

interface AdminPageProps {
  navigate: (to: string) => void;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  lowStockProducts: number;
}

export function AdminPage({ navigate }: AdminPageProps) {
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/signin'); return; }
    if (!authLoading && user && !isAdmin) { navigate('/'); return; }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [
        { data: orders },
        { data: products },
      ] = await Promise.all([
        supabase.from('orders').select('status, total'),
        supabase.from('products').select('stock, is_available'),
      ]);

      const byStatus: Record<string, number> = {};
      let revenue = 0;
      for (const o of orders ?? []) {
        byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
        if (o.status !== 'Cancelled') revenue += o.total;
      }

      const lowStock = (products ?? []).filter((p) => p.stock <= 5 && p.is_available).length;

      setStats({
        totalOrders: orders?.length ?? 0,
        totalRevenue: revenue,
        totalProducts: products?.length ?? 0,
        ordersByStatus: byStatus,
        lowStockProducts: lowStock,
      });
      setLoading(false);
    })();
  }, [isAdmin]);

  if (authLoading || !user || !isAdmin) return null;

  const statusCards = [
    { label: 'Order Received', key: 'Order Received', icon: Package, color: 'bg-blue-100 text-blue-700' },
    { label: 'Under Review', key: 'Order Under Review', icon: Clock, color: 'bg-amber-100 text-amber-700' },
    { label: 'Preparing', key: 'Preparing Order', icon: ShoppingBag, color: 'bg-indigo-100 text-indigo-700' },
    { label: 'Out for Delivery', key: 'Out for Delivery', icon: Truck, color: 'bg-purple-100 text-purple-700' },
    { label: 'Delivered', key: 'Delivered', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
    { label: 'Cancelled', key: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Admin header */}
      <div className="border-b border-border/60 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="Step N Carry" className="h-9 w-auto rounded-lg" />
            <div>
              <p className="font-bold leading-none">Step N Carry Admin</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>View Store</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Settings">
                  <Settings className="mr-1 h-4 w-4" /> Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/account/profile')}>
                  <User className="mr-2 h-4 w-4" /> Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account/password')}>
                  <Lock className="mr-2 h-4 w-4" /> Change Password
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate('/'))}>
              <LogOut className="mr-1 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

        {/* Top stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: Package, color: 'text-blue-600 bg-blue-100' },
            { label: 'Total Revenue', value: formatKsh(stats?.totalRevenue ?? 0), icon: TrendingUp, color: 'text-green-600 bg-green-100' },
            { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: ShoppingBag, color: 'text-primary bg-primary/10' },
            { label: 'Low Stock Products', value: stats?.lowStockProducts ?? 0, icon: AlertTriangle, color: 'text-amber-600 bg-amber-100' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '...' : s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order status breakdown */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statusCards.map((s) => (
            <button
              key={s.key}
              onClick={() => navigate(`/admin/orders?status=${encodeURIComponent(s.key)}`)}
              className="rounded-xl border border-border/60 bg-card p-4 text-center transition-all hover:border-primary hover:shadow-md"
            >
              <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{loading ? '...' : (stats?.ordersByStatus[s.key] ?? 0)}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => navigate('/admin/orders')}
            className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary">
              <Package className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Manage Orders</h3>
              <p className="text-sm text-muted-foreground">View, review, and update order statuses</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary">
              <ShoppingBag className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Manage Products</h3>
              <p className="text-sm text-muted-foreground">Add, edit, and manage your shoe inventory</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
