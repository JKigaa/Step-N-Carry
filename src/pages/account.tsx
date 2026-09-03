import { useEffect } from 'react';
import { Package, User, Bell, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AccountPageProps {
  navigate: (to: string) => void;
}

export function AccountPage({ navigate }: AccountPageProps) {
  const { user, profile, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate('/signin');
    if (!loading && user && isAdmin) navigate('/admin');
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user) return null;

  const cards = [
    { icon: Package, title: 'My Orders', desc: 'View order history and track deliveries', route: '/account/orders' },
    { icon: User, title: 'Profile', desc: 'Update your personal and delivery info', route: '/account/profile' },
    { icon: Bell, title: 'Notifications', desc: 'Order updates and alerts', route: '/account/notifications' },
    { icon: ShoppingBag, title: 'Cart', desc: 'Continue shopping and checkout', route: '/cart' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="mt-1 text-muted-foreground">Welcome back, {profile?.full_name || 'there'}!</p>
      </div>

      {/* Profile summary */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">{profile?.full_name}</p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
          <p className="text-sm text-muted-foreground">{profile?.phone}</p>
        </div>
      </div>

      {/* Quick access cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <button
            key={card.route}
            onClick={() => navigate(card.route)}
            className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <card.icon className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
