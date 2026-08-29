import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, Shield, Tag, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/store/product-card';
import { fetchProducts, fetchProductsWithSizes } from '@/lib/products';
import { SHOE_CATEGORIES } from '@/lib/store-constants';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import type { Product } from '@/types/db';

interface HomePageProps {
  navigate: (to: string) => void;
}

export function HomePage({ navigate }: HomePageProps) {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [popular, setPopular] = useState<Product[]>([]);
  const [sizeMap, setSizeMap] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [feat, late, pop] = await Promise.all([
          fetchProducts({ filter: 'featured', sort: 'newest' }),
          fetchProducts({ sort: 'newest' }),
          fetchProducts({ filter: 'popular', sort: 'popular' }),
        ]);
        setFeatured(feat.slice(0, 4));
        setLatest(late.slice(0, 8));
        setPopular(pop.slice(0, 4));

        const allIds = [...new Set([...feat, ...late, ...pop].map((p) => p.id))];
        const sm = await fetchProductsWithSizes(allIds);
        const result = new Map<string, string[]>();
        for (const [pid, sizes] of sm.entries()) {
          result.set(pid, sizes.filter((s) => s.stock > 0).map((s) => s.size));
        }
        setSizeMap(result);
      } catch {
        toast.error('Could not load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = (product: Product) => {
    navigate(`/product/${product.id}`);
    toast.info('Select a size to add to cart');
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.08),_transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Quality shoes, delivered across Kenya
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              Step Into <span className="text-primary">Step N Carry</span> Style
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              From sneakers to formal shoes, running trainers to elegant heels — browse, pick your size, and get delivery anywhere in Kenya.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/shop')}>
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/shop?filter=featured')}>
                View Featured
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Nationwide delivery</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Secure checkout</div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/1456733/pexels-photo-1456733.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Sneakers"
                className="aspect-[3/4] w-full rounded-2xl object-cover shadow-lg"
              />
              <div className="flex flex-col gap-4">
                <img
                  src="https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Formal shoes"
                  className="aspect-square w-full rounded-2xl object-cover shadow-lg"
                />
                <img
                  src="https://images.pexels.com/photos/134064/pexels-photo-134064.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Heels"
                  className="aspect-square w-full rounded-2xl object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-2xl font-bold">Shop by Category</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {SHOE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate(`/shop?category=${cat}`)}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-card px-5 py-3 text-sm font-medium transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <Tag className="h-4 w-4" /> {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Shoes</h2>
            <Button variant="ghost" onClick={() => navigate('/shop?filter=featured')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} sizes={sizeMap.get(p.id)} navigate={navigate} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* Popular */}
      {popular.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Popular Right Now</h2>
            <Button variant="ghost" onClick={() => navigate('/shop?filter=popular')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} sizes={sizeMap.get(p.id)} navigate={navigate} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <Button variant="ghost" onClick={() => navigate('/shop')}>
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} sizes={sizeMap.get(p.id)} navigate={navigate} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
