import { useEffect, useState, useMemo } from 'react';
import { ProductCard } from '@/components/store/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchProducts, fetchProductsWithSizes } from '@/lib/products';
import { SHOE_CATEGORIES } from '@/lib/store-constants';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Product } from '@/types/db';

interface ShopPageProps {
  navigate: (to: string) => void;
  params: Record<string, string>;
}

export function ShopPage({ navigate, params }: ShopPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sizeMap, setSizeMap] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(params.search ?? '');
  const [category, setCategory] = useState(params.category ?? 'all');
  const [sort, setSort] = useState(params.sort ?? 'newest');
  const [filter, setFilter] = useState(params.filter ?? '');
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL params on mount and when params change
  useEffect(() => {
    setSearch(params.search ?? '');
    setCategory(params.category ?? 'all');
    setFilter(params.filter ?? '');
  }, [params.search, params.category, params.filter]);

  useEffect(() => {
    setLoading(true);
    const debounce = setTimeout(() => {
      (async () => {
        try {
          const result = await fetchProducts({
            category: category === 'all' ? undefined : category,
            search: search || undefined,
            sort: (sort as 'price-asc' | 'price-desc' | 'newest' | 'popular') || 'newest',
            filter: (filter as 'featured' | 'popular') || undefined,
          });
          setProducts(result);

          const sm = await fetchProductsWithSizes(result.map((p) => p.id));
          const szMap = new Map<string, string[]>();
          for (const [pid, sizes] of sm.entries()) {
            szMap.set(pid, sizes.filter((s) => s.stock > 0).map((s) => s.size));
          }
          setSizeMap(szMap);
        } catch {
          // ignore
        } finally {
          setLoading(false);
        }
      })();
    }, 200);
    return () => clearTimeout(debounce);
  }, [search, category, sort, filter]);

  const handleAddToCart = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Shop Shoes</h1>
        <p className="mt-1 text-muted-foreground">
          {products.length} {products.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {/* Search + sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, or description..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters((v) => !v)}
            className="sm:hidden"
          >
            <SlidersHorizontal className="mr-1 h-4 w-4" /> Filters
          </Button>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter bar */}
      <div className={`mb-6 flex flex-wrap items-center gap-2 ${showFilters ? '' : 'hidden sm:flex'}`}>
        <Button
          variant={category === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setCategory('all'); navigate('/shop'); }}
        >
          All Categories
        </Button>
        {SHOE_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Button>
        ))}
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          variant={filter === 'featured' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter(filter === 'featured' ? '' : 'featured')}
        >
          Featured
        </Button>
        <Button
          variant={filter === 'popular' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter(filter === 'popular' ? '' : 'popular')}
        >
          Popular
        </Button>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No shoes found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
          <Button className="mt-4" variant="outline" onClick={() => { setSearch(''); setCategory('all'); setFilter(''); setSort('newest'); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              sizes={sizeMap.get(p.id)}
              navigate={navigate}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
