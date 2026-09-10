import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Star, TrendingUp, Package, CheckCircle2, XCircle, Clock, AlertTriangle, FileEdit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { formatKsh, SHOE_CATEGORIES } from '@/lib/store-constants';
import { toast } from 'sonner';
import type { Product, ProductSize, ProductEditRequest } from '@/types/db';

interface AdminProductsPageProps {
  navigate: (to: string) => void;
}

type ProductWithSizes = Product & { sizes: ProductSize[] };

const EMPTY_FORM = {
  name: '', brand: '', category: 'Sneakers', description: '',
  price: '', images: '', stock: '', is_available: true, is_featured: false, is_popular: false,
};

type ProductForm = typeof EMPTY_FORM;

export function AdminProductsPage({ navigate }: AdminProductsPageProps) {
  const { user, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<ProductWithSizes[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'pending_edits' | 'deletion_requests'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editRequests, setEditRequests] = useState<ProductEditRequest[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [sizes, setSizes] = useState<{ size: string; stock: string }[]>([
    { size: '39', stock: '10' }, { size: '40', stock: '10' }, { size: '41', stock: '10' },
    { size: '42', stock: '10' }, { size: '43', stock: '5' },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) { navigate('/signin'); return; }
  }, [user, isAdmin, authLoading, navigate]);

  const loadProducts = async () => {
    const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!prods) { setLoading(false); return; }
    const ids = prods.map((p) => p.id);
    const { data: szs } = await supabase.from('product_sizes').select('*').in('product_id', ids).order('size');
    const sizeMap = new Map<string, ProductSize[]>();
    for (const s of szs ?? []) { const arr = sizeMap.get(s.product_id) ?? []; arr.push(s); sizeMap.set(s.product_id, arr); }
    setProducts(prods.map((p) => ({ ...(p as Product), sizes: sizeMap.get(p.id) ?? [] })));
    setLoading(false);
  };

  const loadEditRequests = async () => {
    const { data, error } = await supabase
      .from('product_edit_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) { console.error('LOAD EDIT REQUESTS ERROR:', error); return; }
    setEditRequests((data ?? []) as ProductEditRequest[]);
  };

  useEffect(() => { if (isAdmin) { loadProducts(); loadEditRequests(); } }, [isAdmin]);

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setSizes([
      { size: '39', stock: '10' }, { size: '40', stock: '10' }, { size: '41', stock: '10' },
      { size: '42', stock: '10' }, { size: '43', stock: '5' },
    ]);
    setDialogOpen(true);
  };

  const openEdit = (p: ProductWithSizes) => {
    setEditProduct(p);
    setForm({
      name: p.name, brand: p.brand, category: p.category, description: p.description,
      price: String(p.price), images: p.images.join('\n'), stock: String(p.stock),
      is_available: p.is_available, is_featured: p.is_featured, is_popular: p.is_popular,
    });
    setSizes(p.sizes.length > 0 ? p.sizes.map((s) => ({ size: s.size, stock: String(s.stock) })) : [{ size: '40', stock: '10' }]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.brand) { toast.error('Name, brand, and price are required'); return; }
    const price = parseInt(form.price);
    if (isNaN(price) || price < 0) { toast.error('Invalid price'); return; }
    setSaving(true);
    try {
      const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean);
      const productData = {
        name: form.name, brand: form.brand, category: form.category,
        description: form.description, price, images,
        stock: parseInt(form.stock) || 0,
        is_available: form.is_available, is_featured: form.is_featured, is_popular: form.is_popular,
      };
      const sizeRows = sizes.filter((s) => s.size).map((s) => ({ size: s.size, stock: parseInt(s.stock) || 0 }));

      if (editProduct && !isSuperAdmin) {
        // Assistant admin editing an existing, already-live product: stage the
        // change for review instead of touching the live product at all.
        const { error } = await supabase.from('product_edit_requests').insert({
          product_id: editProduct.id,
          proposed_data: productData,
          proposed_sizes: sizeRows,
        });
        if (error) throw error;
        toast.success('Edit submitted for review — the live product is unchanged until a super admin approves it');
        setDialogOpen(false);
        await loadEditRequests();
        setSaving(false);
        return;
      }

      let productId = editProduct?.id;

      if (editProduct) {
        // Super admin editing directly: applies immediately, as before.
        const { error } = await supabase.from('products').update({ ...productData, updated_at: new Date().toISOString() }).eq('id', editProduct.id);
        if (error) throw error;
        await supabase.from('product_sizes').delete().eq('product_id', editProduct.id);
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        productId = data.id;
      }

      if (sizeRows.length > 0) {
        const { error } = await supabase.from('product_sizes').insert(sizeRows.map((s) => ({ ...s, product_id: productId! })));
        if (error) throw error;
      }

      const isNewProductByAssistant = !editProduct && !isSuperAdmin;
      toast.success(
        editProduct
          ? 'Product updated'
          : isNewProductByAssistant
          ? 'Product submitted — awaiting super admin approval before it goes live'
          : 'Product added'
      );
      setDialogOpen(false);
      await loadProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isSuperAdmin) {
      if (!confirm('Are you sure you want to delete this product?')) return;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) { toast.error('Failed to delete'); return; }
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      if (!confirm('Request deletion of this product? It will stay live until a super admin approves the request.')) return;
      const { error } = await supabase.from('products').update({ pending_deletion: true }).eq('id', id);
      if (error) { toast.error('Failed to request deletion'); return; }
      toast.success('Deletion requested — awaiting super admin approval');
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, pending_deletion: true } : p));
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('products').update({ approval_status: 'approved' }).eq('id', id);
    if (error) { toast.error('Failed to approve'); return; }
    toast.success('Product approved and now visible to customers');
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, approval_status: 'approved' } : p));
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('products').update({ approval_status: 'rejected' }).eq('id', id);
    if (error) { toast.error('Failed to reject'); return; }
    toast.success('Product rejected');
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, approval_status: 'rejected' } : p));
  };

  const handleApproveDeletion = async (id: string) => {
    if (!confirm('Permanently delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Product deleted');
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCancelDeletion = async (id: string) => {
    const { error } = await supabase.from('products').update({ pending_deletion: false }).eq('id', id);
    if (error) { toast.error('Failed to cancel deletion request'); return; }
    toast.success('Deletion request cancelled — product stays live');
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, pending_deletion: false } : p));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from('products').update({ approval_status: 'approved' }).in('id', ids);
    if (error) { toast.error('Failed to approve selected products'); return; }
    toast.success(`${ids.length} product${ids.length === 1 ? '' : 's'} approved`);
    setProducts((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, approval_status: 'approved' } : p));
    setSelectedIds(new Set());
  };

  const handleBulkReject = async () => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from('products').update({ approval_status: 'rejected' }).in('id', ids);
    if (error) { toast.error('Failed to reject selected products'); return; }
    toast.success(`${ids.length} product${ids.length === 1 ? '' : 's'} rejected`);
    setProducts((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, approval_status: 'rejected' } : p));
    setSelectedIds(new Set());
  };

  const handleBulkApproveDeletion = async () => {
    const ids = Array.from(selectedIds);
    if (!confirm(`Permanently delete ${ids.length} product${ids.length === 1 ? '' : 's'}?`)) return;
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) { toast.error('Failed to delete selected products'); return; }
    toast.success(`${ids.length} product${ids.length === 1 ? '' : 's'} deleted`);
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelectedIds(new Set());
  };

  const handleBulkCancelDeletion = async () => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from('products').update({ pending_deletion: false }).in('id', ids);
    if (error) { toast.error('Failed to cancel deletion requests'); return; }
    toast.success(`${ids.length} deletion request${ids.length === 1 ? '' : 's'} cancelled`);
    setProducts((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, pending_deletion: false } : p));
    setSelectedIds(new Set());
  };

  const handleApproveEdit = async (id: string) => {
    const { error } = await supabase.rpc('approve_product_edit_request', { request_id: id });
    if (error) { toast.error(error.message || 'Failed to approve edit'); return; }
    toast.success('Edit approved and applied');
    setEditRequests((prev) => prev.filter((r) => r.id !== id));
    await loadProducts();
  };

  const handleRejectEdit = async (id: string) => {
    const { error } = await supabase.rpc('reject_product_edit_request', { request_id: id });
    if (error) { toast.error(error.message || 'Failed to reject edit'); return; }
    toast.success('Edit rejected');
    setEditRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleBulkApproveEdits = async () => {
    const ids = Array.from(selectedIds);
    const results = await Promise.all(ids.map((id) => supabase.rpc('approve_product_edit_request', { request_id: id })));
    const failed = results.filter((r) => r.error).length;
    if (failed > 0) toast.error(`${failed} edit${failed === 1 ? '' : 's'} failed to approve`);
    toast.success(`${ids.length - failed} edit${ids.length - failed === 1 ? '' : 's'} approved`);
    setEditRequests((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelectedIds(new Set());
    await loadProducts();
  };

  const handleBulkRejectEdits = async () => {
    const ids = Array.from(selectedIds);
    const results = await Promise.all(ids.map((id) => supabase.rpc('reject_product_edit_request', { request_id: id })));
    const failed = results.filter((r) => r.error).length;
    if (failed > 0) toast.error(`${failed} edit${failed === 1 ? '' : 's'} failed to reject`);
    toast.success(`${ids.length - failed} edit${ids.length - failed === 1 ? '' : 's'} rejected`);
    setEditRequests((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelectedIds(new Set());
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_available: !current }).eq('id', id);
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_available: !current } : p));
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && p.approval_status === 'pending') ||
      (statusFilter === 'deletion_requests' && p.pending_deletion);
    return matchSearch && matchStatus;
  });

  const pendingCount = products.filter((p) => p.approval_status === 'pending').length;
  const deletionRequestCount = products.filter((p) => p.pending_deletion).length;

  if (authLoading || !user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border/60 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <h1 className="text-xl font-bold">Products</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 w-56" />
            </div>
            <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" /> Add Product</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Status filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => { setStatusFilter('all'); setSelectedIds(new Set()); }}>
            All ({products.length})
          </Button>
          <Button size="sm" variant={statusFilter === 'pending' ? 'default' : 'outline'} onClick={() => { setStatusFilter('pending'); setSelectedIds(new Set()); }}>
            Pending Approval ({pendingCount})
          </Button>
          <Button size="sm" variant={statusFilter === 'pending_edits' ? 'default' : 'outline'} onClick={() => { setStatusFilter('pending_edits'); setSelectedIds(new Set()); }}>
            Pending Edits ({editRequests.length})
          </Button>
          <Button size="sm" variant={statusFilter === 'deletion_requests' ? 'default' : 'outline'} onClick={() => { setStatusFilter('deletion_requests'); setSelectedIds(new Set()); }}>
            Deletion Requests ({deletionRequestCount})
          </Button>
        </div>

        {/* Bulk action bar - super admin only, only meaningful in the review tabs */}
        {isSuperAdmin && statusFilter !== 'all' && selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            {statusFilter === 'pending' && (
              <>
                <Button size="sm" onClick={handleBulkApprove}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve Selected</Button>
                <Button size="sm" variant="outline" onClick={handleBulkReject}><XCircle className="mr-1.5 h-4 w-4" /> Reject Selected</Button>
              </>
            )}
            {statusFilter === 'pending_edits' && (
              <>
                <Button size="sm" onClick={handleBulkApproveEdits}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve Selected</Button>
                <Button size="sm" variant="outline" onClick={handleBulkRejectEdits}><XCircle className="mr-1.5 h-4 w-4" /> Reject Selected</Button>
              </>
            )}
            {statusFilter === 'deletion_requests' && (
              <>
                <Button size="sm" variant="destructive" onClick={handleBulkApproveDeletion}><Trash2 className="mr-1.5 h-4 w-4" /> Approve Deletion</Button>
                <Button size="sm" variant="outline" onClick={handleBulkCancelDeletion}><XCircle className="mr-1.5 h-4 w-4" /> Cancel Requests</Button>
              </>
            )}
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear selection</button>
          </div>
        )}

        {statusFilter === 'pending_edits' ? (
          <div className="space-y-3">
            {editRequests.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">No pending edits.</p>
            ) : (
              editRequests.map((req) => {
                const product = products.find((p) => p.id === req.product_id);
                const proposed = req.proposed_data as Record<string, unknown>;
                const changedFields = product
                  ? Object.entries(proposed).filter(([key, value]) => {
                      if (key === 'images') return JSON.stringify(value) !== JSON.stringify(product.images);
                      return String((product as any)[key]) !== String(value);
                    })
                  : Object.entries(proposed);
                return (
                  <div key={req.id} className="rounded-xl border border-amber-300 bg-amber-50/30 p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isSuperAdmin && (
                          <input type="checkbox" checked={selectedIds.has(req.id)} onChange={() => toggleSelect(req.id)} className="h-4 w-4" />
                        )}
                        <div>
                          <p className="font-semibold">{product?.name ?? 'Unknown product'}</p>
                          <p className="text-xs text-muted-foreground">Submitted {new Date(req.created_at).toLocaleString('en-KE')}</p>
                        </div>
                      </div>
                      {isSuperAdmin && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApproveEdit(req.id)}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectEdit(req.id)}><XCircle className="mr-1.5 h-4 w-4" /> Reject</Button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      {changedFields.length === 0 ? (
                        <p className="text-muted-foreground">No field changes detected (sizes/stock may have changed).</p>
                      ) : (
                        changedFields.map(([key, value]) => (
                          <div key={key} className="flex flex-wrap items-baseline gap-2">
                            <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-red-600 line-through">{product ? String((product as any)[key]) : ''}</span>
                            <span>→</span>
                            <span className="text-green-700">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <div key={p.id} className={`rounded-xl border overflow-hidden ${p.approval_status === 'pending' ? 'border-amber-300 bg-amber-50/30' : p.pending_deletion ? 'border-red-300 bg-red-50/30' : 'border-border/60 bg-card'}`}>
                <div className="relative h-48">
                  <img src={p.images[0] ?? ''} alt={p.name} className="h-full w-full object-cover" />
                  {isSuperAdmin && statusFilter !== 'all' && (
                    <label className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded bg-white/90 shadow">
                      <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="h-4 w-4" />
                    </label>
                  )}
                  <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                    {p.is_featured && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Featured</span>}
                    {p.is_popular && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">Popular</span>}
                    {p.approval_status === 'pending' && <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white"><Clock className="h-2.5 w-2.5" /> Pending Approval</span>}
                    {p.approval_status === 'rejected' && <span className="flex items-center gap-1 rounded-full bg-gray-500 px-2 py-0.5 text-[10px] font-bold text-white"><XCircle className="h-2.5 w-2.5" /> Rejected</span>}
                    {p.pending_deletion && <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white"><AlertTriangle className="h-2.5 w-2.5" /> Deletion Requested</span>}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{p.brand} · {p.category}</p>
                      <h3 className="font-semibold">{p.name}</h3>
                      <p className="font-bold text-primary">{formatKsh(p.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={p.is_available} onCheckedChange={() => toggleAvailability(p.id, p.is_available)} className="scale-75" />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.sizes.slice(0, 5).map((s) => (
                      <span key={s.size} className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${s.stock > 0 ? 'border-border text-muted-foreground' : 'border-red-200 bg-red-50 text-red-500 line-through'}`}>
                        {s.size}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Stock: {p.stock}</span>
                    {p.stock <= 5 && <span className="text-xs font-medium text-amber-600">Low stock</span>}
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(p)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {isSuperAdmin && p.approval_status === 'pending' && (
                    <div className="mt-3 flex gap-2 border-t border-amber-200 pt-3">
                      <Button size="sm" className="flex-1" onClick={() => handleApprove(p.id)}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReject(p.id)}>
                        <XCircle className="mr-1.5 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                  {isSuperAdmin && p.pending_deletion && (
                    <div className="mt-3 flex gap-2 border-t border-red-200 pt-3">
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleApproveDeletion(p.id)}>
                        <Trash2 className="mr-1.5 h-4 w-4" /> Approve Deletion
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCancelDeletion(p.id)}>
                        <XCircle className="mr-1.5 h-4 w-4" /> Cancel Request
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          {!isSuperAdmin && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {editProduct
                ? 'This edit will be sent to a super admin for review. The live product stays unchanged until approved.'
                : 'This product will need super admin approval before it appears in the shop.'}
            </p>
          )}
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nike Air Max" />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="Nike" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SHOE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (KSh)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="3500" min="0" />
              </div>
              <div className="space-y-2">
                <Label>Total Stock</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="50" min="0" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Describe the shoe..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Image URLs (one per line)</Label>
                <Textarea value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} rows={3} placeholder="https://images.pexels.com/..." />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Sizes & Stock</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setSizes((s) => [...s, { size: '', stock: '10' }])}>
                  <Plus className="mr-1 h-3 w-3" /> Add Size
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sizes.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={s.size} onChange={(e) => setSizes((prev) => prev.map((sz, idx) => idx === i ? { ...sz, size: e.target.value } : sz))} placeholder="Size (e.g. 40)" className="w-24" />
                    <Input type="number" value={s.stock} onChange={(e) => setSizes((prev) => prev.map((sz, idx) => idx === i ? { ...sz, stock: e.target.value } : sz))} placeholder="Stock" className="w-24" min="0" />
                    <span className="text-xs text-muted-foreground">{parseInt(s.stock) === 0 ? 'Sold out' : 'In stock'}</span>
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setSizes((prev) => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_available} onCheckedChange={(v) => setForm((f) => ({ ...f, is_available: v }))} id="available" />
                <Label htmlFor="available">Available</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))} id="featured" />
                <Label htmlFor="featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_popular} onCheckedChange={(v) => setForm((f) => ({ ...f, is_popular: v }))} id="popular" />
                <Label htmlFor="popular">Popular</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
