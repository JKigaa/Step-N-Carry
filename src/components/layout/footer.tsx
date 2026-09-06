import { Mail, Phone, MapPin, Truck, Shield, RotateCcw } from 'lucide-react';

interface FooterProps {
  navigate: (to: string) => void;
}

export function Footer({ navigate }: FooterProps) {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="border-b border-border/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Truck, title: 'Nationwide Delivery', desc: 'To all 47 counties' },
            { icon: Shield, title: 'Secure Checkout', desc: 'Your data is protected' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '5-day return policy' },
          ].map((badge) => (
            <div key={badge.title} className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <badge.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/logo-icon.png" alt="Step N Carry" className="h-9 w-auto rounded-lg" />
              <span className="text-lg font-bold">Step N<span className="text-primary"> Carry</span></span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Kenya's premier online shoe store. Quality footwear delivered to your doorstep, wherever you are.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => navigate('/shop')} className="hover:text-foreground">All Shoes</button></li>
              <li><button onClick={() => navigate('/shop?category=Sneakers')} className="hover:text-foreground">Sneakers</button></li>
              <li><button onClick={() => navigate('/shop?category=Formal')} className="hover:text-foreground">Formal</button></li>
              <li><button onClick={() => navigate('/shop?category=Running')} className="hover:text-foreground">Running</button></li>
              <li><button onClick={() => navigate('/shop?category=Heels')} className="hover:text-foreground">Heels</button></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => navigate('/signin')} className="hover:text-foreground">Sign In</button></li>
              <li><button onClick={() => navigate('/signup')} className="hover:text-foreground">Create Account</button></li>
              <li><button onClick={() => navigate('/account')} className="hover:text-foreground">My Account</button></li>
              <li><button onClick={() => navigate('/account/orders')} className="hover:text-foreground">My Orders</button></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +254 702 918 650</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@stepncarry.co.ke</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Nairobi, Kenya</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Step N Carry Kenya. All rights reserved. Prices in Kenyan Shillings (KSh).</p>
        </div>
      </div>
    </footer>
  );
}
