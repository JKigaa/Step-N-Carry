import { supabase } from '@/lib/supabase';
import type { Product, ProductSize, ProductWithSizes } from '@/types/db';

export async function fetchProducts(filters?: {
  category?: string;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
  filter?: 'featured' | 'popular';
}): Promise<ProductWithSizes[]> {
  let query = supabase.from('products').select('*');

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  if (filters?.filter === 'featured') query = query.eq('is_featured', true);
  if (filters?.filter === 'popular') query = query.eq('is_popular', true);

  switch (filters?.sort) {
    case 'price-asc': query = query.order('price', { ascending: true }); break;
    case 'price-desc': query = query.order('price', { ascending: false }); break;
    case 'popular': query = query.order('is_popular', { ascending: false }).order('created_at', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const { data: products, error } = await query;
  if (error) throw error;

  if (!products || products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const { data: sizes } = await supabase
    .from('product_sizes')
    .select('*')
    .in('product_id', productIds)
    .order('size', { ascending: true });

  const sizeMap = new Map<string, ProductSize[]>();
  for (const s of sizes ?? []) {
    const arr = sizeMap.get(s.product_id) ?? [];
    arr.push(s);
    sizeMap.set(s.product_id, arr);
  }

  return products.map((p) => ({
    ...(p as Product),
    sizes: sizeMap.get(p.id) ?? [],
  }));
}

export async function fetchProductById(id: string): Promise<ProductWithSizes | null> {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !product) return null;

  const { data: sizes } = await supabase
    .from('product_sizes')
    .select('*')
    .eq('product_id', id)
    .order('size', { ascending: true });

  return { ...(product as Product), sizes: (sizes as ProductSize[]) ?? [] };
}

export async function fetchProductsWithSizes(productIds: string[]): Promise<Map<string, ProductSize[]>> {
  if (productIds.length === 0) return new Map();
  const { data } = await supabase
    .from('product_sizes')
    .select('*')
    .in('product_id', productIds)
    .order('size', { ascending: true });
  const map = new Map<string, ProductSize[]>();
  for (const s of data ?? []) {
    const arr = map.get(s.product_id) ?? [];
    arr.push(s);
    map.set(s.product_id, arr);
  }
  return map;
}
