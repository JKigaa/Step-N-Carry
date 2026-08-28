import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { formatKsh, DEFAULT_DELIVERY_FEE, KENYAN_COUNTIES } from '@/lib/store-constants';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, User, Phone, Mail, MapPin, Lock } from 'lucide-react';

interface CheckoutPageProps {
  navigate: (to: string) => void;
}

export function CheckoutPage({ navigate }: CheckoutPageProps) {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? '');
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.delivery_address ?? '');
  const [county, setCounty] = useState(profile?.county ?? '');
  const [town, setTown] = useState(profile?.town ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone);
      setEmail(profile.email);
      setDeliveryAddress(profile.delivery_address);
      setCounty(profile.county);
      setTown(profile.town);
    }
  }, [profile]);

  const deliveryFee = subtotal > 0 ? DEFAULT_DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!user && items.length > 0) {
      toast.info('Please sign in to checkout');
      navigate('/signin');
    }
  }, [user, items.length, navigate]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some shoes before checking out.</p>
        <Button className="mt-4" onClick={() => navigate('/shop')}>Browse Shoes</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold">Sign In Required</h1>
        <p className="mt-2 text-muted-foreground">
          You need an account to complete checkout. This helps us process your order and arrange delivery.
          Your cart will be saved while you sign in.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button size="lg" onClick={() => navigate('/signin')}>Sign In</Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>Create Account</Button>
        </div>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/cart')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !deliveryAddress || !county || !town) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!phone.match(/^\+?254\d{9}$|^0\d{9}$/)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setLoading(true);
    try {
      // Store checkout info in sessionStorage for the review page
      const checkoutData = {
        fullName, phone, email, deliveryAddress, county, town,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          brand: i.brand,
          image: i.image,
          price: i.price,
          size: i.size,
          quantity: i.quantity,
        })),
        subtotal,
        deliveryFee,
        total,
      };
      sessionStorage.setItem('checkout-data', JSON.stringify(checkoutData));
      navigate('/order-review');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/cart')}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </button>

      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Customer info form */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <User className="h-5 w-5 text-primary" /> Customer Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Mwangi" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" className="pl-9" required />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" required />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <MapPin className="h-5 w-5 text-primary" /> Delivery Address
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input id="address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="House no, Street, Estate" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger id="county">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {KENYAN_COUNTIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="town">Town / Area</Label>
                <Input id="town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. Westlands, Kasarani" required />
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-border/60 bg-card p-5">
            <h2 className="mb-4 text-lg font-bold">Your Order</h2>
            <div className="mb-4 max-h-60 space-y-2 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3 text-sm">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Size {item.size} · Qty {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatKsh(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatKsh(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">{formatKsh(deliveryFee)}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">{formatKsh(total)}</span>
                </div>
              </div>
            </div>
            <Button type="submit" className="mt-4 w-full" size="lg" disabled={loading}>
              {loading ? 'Processing...' : 'Review Order'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
