import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatKsh } from '@/lib/store-constants';
import type { Product } from '@/types/db';
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  sizes?: string[];
  navigate: (to: string) => void;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, sizes, navigate, onAddToCart }: ProductCardProps) {
  const outOfStock = !product.is_available || product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all hover:shadow-lg">
      <button
        onClick={() => navigate(`/product/${product.id}`)}
        className="relative aspect-square overflow-hidden bg-muted/30"
      >
        <img
          src={product.images[0] ?? ''}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.is_featured && (
          <Badge className="absolute left-3 top-3" variant="default">Featured</Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <button onClick={() => navigate(`/product/${product.id}`)} className="text-left">
          <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
          <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold text-foreground">{product.name}</h3>
        </button>

        {sizes && sizes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {sizes.slice(0, 5).map((s) => (
              <span key={s} className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {s}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className="text-[10px] text-muted-foreground">+{sizes.length - 5}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-foreground">{formatKsh(product.price)}</span>
          <div className="flex gap-1.5">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => navigate(`/product/${product.id}`)}
              aria-label="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-8 w-8"
              disabled={outOfStock}
              onClick={() => onAddToCart?.(product)}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
