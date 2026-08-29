import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart, ArrowLeft, Check, Truck, RotateCcw, Shield } from 'lucide-react';
import { fetchProductById } from '@/lib/products';
import { formatKsh } from '@/lib/store-constants';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { ProductWithSizes } from '@/types/db';

interface ProductDetailPageProps {
  navigate: (to: string) => void;
  productId: string;
}

export function ProductDetailPage({ navigate, productId }: ProductDetailPageProps) {
  const [product, setProduct] = useState<ProductWithSizes | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await fetchProductById(productId);
      setProduct(p);
      setLoading(false);
    })();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    const sizeData = product.sizes.find((s) => s.size === selectedSize);
    if (!sizeData || sizeData.stock <= 0) {
      toast.error('This size is out of stock');
      return;
    }
    if (quantity > sizeData.stock) {
      toast.error(`Only ${sizeData.stock} available in size ${selectedSize}`);
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images[0] ?? '',
      price: product.price,
      size: selectedSize,
      quantity,
      stock: sizeData.stock,
    });
    toast.success(`${product.name} (Size ${selectedSize}) added to cart`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button className="mt-4" onClick={() => navigate('/shop')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
        </Button>
      </div>
    );
  }

  const outOfStock = !product.is_available || product.stock <= 0;
  const selectedSizeData = product.sizes.find((s) => s.size === selectedSize);
  const maxQty = selectedSizeData?.stock ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/shop')}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/30">
            <img
              src={product.images[activeImage] ?? product.images[0] ?? ''}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                    activeImage === i ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold text-primary">{formatKsh(product.price)}</p>

          <div className="mt-2 flex items-center gap-2">
            {outOfStock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-700">In Stock</Badge>
            )}
            <Badge variant="outline">{product.category}</Badge>
          </div>

          <p className="mt-4 text-muted-foreground">{product.description}</p>

          {/* Size selection */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const sizeOut = s.stock <= 0;
                const isSelected = selectedSize === s.size;
                return (
                  <button
                    key={s.size}
                    disabled={sizeOut}
                    onClick={() => setSelectedSize(s.size)}
                    className={`relative flex h-12 w-12 items-center justify-center rounded-lg border-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : sizeOut
                        ? 'cursor-not-allowed border-border bg-muted text-muted-foreground/50 line-through'
                        : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {s.size}
                    {isSelected && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground">
                        <Check className="h-3 w-3 text-primary" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedSize && selectedSizeData && (
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedSizeData.stock > 0
                  ? `${selectedSizeData.stock} available in size ${selectedSize}`
                  : `Size ${selectedSize} is sold out`}
              </p>
            )}
          </div>

          {/* Quantity */}
          {selectedSize && selectedSizeData && selectedSizeData.stock > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-r-none"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-l-none"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">Max: {maxQty}</span>
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className="mt-8 flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={outOfStock || !selectedSize}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={outOfStock || !selectedSize}
              onClick={() => {
                handleAddToCart();
                navigate('/cart');
              }}
            >
              Buy Now
            </Button>
          </div>

          {!user && (
            <p className="mt-3 text-sm text-muted-foreground">
              You'll need to <button onClick={() => navigate('/signin')} className="font-medium text-primary underline">sign in</button> to checkout.
            </p>
          )}

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-6">
            {[
              { icon: Truck, label: 'Nationwide delivery' },
              { icon: RotateCcw, label: '5-day returns' },
              { icon: Shield, label: 'Secure checkout' },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1 text-center">
                <b.icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
