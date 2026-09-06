import { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, X, Package, LogOut, LayoutDashboard, Bell, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { supabase } from '@/lib/supabase';

interface NavbarProps {
  navigate: (to: string) => void;
  path: string;
}

export function Navbar({ navigate, path }: NavbarProps) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count ?? 0);
    })();

    channel = supabase
      .channel('navbar-notif')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => setUnreadCount((c) => c + 1))
      .subscribe();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
      setMobileOpen(false);
    }
  };

  const isActive = (route: string) => path === route || (route !== '/' && path.startsWith(route));

  const navLinks = [
    { label: 'Home', route: '/' },
    { label: 'Shop', route: '/shop' },
    { label: 'Featured', route: '/shop?filter=featured' },
    { label: 'Popular', route: '/shop?filter=popular' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex shrink-0 items-center gap-2">
          <img src="/logo-icon.png" alt="Step N Carry" className="h-9 w-auto rounded-lg" />
          <span className="hidden text-lg font-bold tracking-tight text-foreground sm:inline">
            Step N<span className="text-primary"> Carry</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => navigate(link.route)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.route) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Search (desktop) */}
        <form onSubmit={handleSearch} className="ml-auto hidden flex-1 max-w-xs lg:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search shoes..." className="pl-9" />
          </div>
        </form>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          {user && (
            <Button variant="ghost" size="icon" onClick={() => navigate('/account/notifications')} className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1"><User className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || 'Account'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/account/orders')}>
                      <Package className="mr-2 h-4 w-4" /> My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/account/password')}>
                      <Lock className="mr-2 h-4 w-4" /> Change Password
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/account/notifications')}>
                      <Bell className="mr-2 h-4 w-4" /> Notifications
                      {unreadCount > 0 && <Badge className="ml-auto" variant="destructive">{unreadCount}</Badge>}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut().then(() => navigate('/'))}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate('/signin')} className="ml-1 hidden sm:inline-flex">Sign In</Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="space-y-2 px-4 py-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search shoes..." className="pl-9" />
            </form>
            {navLinks.map((link) => (
              <button key={link.route} onClick={() => { navigate(link.route); setMobileOpen(false); }} className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted">
                {link.label}
              </button>
            ))}
            {!user && <Button className="w-full" onClick={() => { navigate('/signin'); setMobileOpen(false); }}>Sign In</Button>}
          </div>
        </div>
      )}
    </header>
  );
}
