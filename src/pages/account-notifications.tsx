import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, ArrowLeft, Check, Trash2, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { formatDateTime } from '@/lib/store-constants';
import type { Notification } from '@/types/db';

interface AccountNotificationsPageProps {
  navigate: (to: string) => void;
}

export function AccountNotificationsPage({ navigate }: AccountNotificationsPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/signin'); return; }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications((data ?? []) as Notification[]);
      setLoading(false);
    })();

    // Real-time new notifications
    const channel = supabase
      .channel('account-notif')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/account')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Account
      </button>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && <p className="mt-1 text-sm text-muted-foreground">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Bell className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">You'll be notified when your order status changes.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-3 rounded-xl border p-4 transition-all ${
                notif.is_read ? 'border-border/60 bg-card' : 'border-primary/30 bg-primary/5'
              }`}
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notif.is_read ? 'bg-muted' : 'bg-primary/10'}`}>
                <Package className={`h-4 w-4 ${notif.is_read ? 'text-muted-foreground' : 'text-primary'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!notif.is_read ? 'text-primary' : ''}`}>{notif.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(notif.created_at)}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{notif.message}</p>
                <div className="mt-2 flex gap-2">
                  {notif.order_id && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/order/${notif.order_id}`)}>
                      View Order
                    </Button>
                  )}
                  {!notif.is_read && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => markRead(notif.id)}>
                      Mark read
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => deleteNotif(notif.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
