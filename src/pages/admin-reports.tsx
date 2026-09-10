import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, TrendingUp, Download, FileText, Package, ShoppingBag, Users, DollarSign,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { formatKsh } from '@/lib/store-constants';

interface AdminReportsPageProps {
  navigate: (to: string) => void;
}

type ReportType = 'sales' | 'orders' | 'products' | 'customers';

interface OrderRow {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
  full_name: string;
  phone: string;
  county: string;
  town: string;
  payment_method: string | null;
}

interface ProductRow {
  product_name: string;
  units: number;
  revenue: number;
}

interface CustomerRow {
  full_name: string;
  phone: string;
  orders: number;
  totalSpent: number;
}

const REPORT_TABS: { key: ReportType; label: string; icon: typeof TrendingUp }[] = [
  { key: 'sales', label: 'Sales', icon: TrendingUp },
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'products', label: 'Product Performance', icon: ShoppingBag },
  { key: 'customers', label: 'Customer Report', icon: Users },
];

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function firstOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function csvEscape(value: string | number): string {
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AdminReportsPage({ navigate }: AdminReportsPageProps) {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const today = new Date();
  const [dateFrom, setDateFrom] = useState(toDateInputValue(firstOfMonth(today)));
  const [dateTo, setDateTo] = useState(toDateInputValue(today));
  const [reportType, setReportType] = useState<ReportType>('sales');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) { navigate('/signin'); return; }
  }, [user, isAdmin, authLoading, navigate]);

  // Monthly sales total — always this calendar month, independent of the filters below
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const monthStart = firstOfMonth(new Date()).toISOString();
      const { data } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', monthStart);
      const total = (data ?? [])
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.total, 0);
      setMonthlyTotal(total);
    })();
  }, [isAdmin]);

  // Orders within the selected date range (source data for all four report types)
  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const fromIso = new Date(dateFrom + 'T00:00:00').toISOString();
      const toIso = new Date(dateTo + 'T23:59:59').toISOString();
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at, status, total, full_name, phone, county, town, payment_method')
        .gte('created_at', fromIso)
        .lte('created_at', toIso)
        .order('created_at', { ascending: false });
      if (error) console.error('REPORTS ORDERS LOAD ERROR:', error);
      if (mounted) {
        setOrders((data ?? []) as OrderRow[]);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAdmin, dateFrom, dateTo]);

  // Product performance — separate query, only needed for that tab
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin || reportType !== 'products') return;
    let mounted = true;
    (async () => {
      setProductsLoading(true);
      const fromIso = new Date(dateFrom + 'T00:00:00').toISOString();
      const toIso = new Date(dateTo + 'T23:59:59').toISOString();
      const { data, error } = await supabase
        .from('order_items')
        .select('product_name, quantity, price_at_purchase, orders!inner(created_at, status)')
        .gte('orders.created_at', fromIso)
        .lte('orders.created_at', toIso);
      if (error) console.error('REPORTS PRODUCTS LOAD ERROR:', error);

      const map = new Map<string, ProductRow>();
      for (const row of (data ?? []) as any[]) {
        if (row.orders?.status === 'Cancelled') continue;
        const existing = map.get(row.product_name) ?? { product_name: row.product_name, units: 0, revenue: 0 };
        existing.units += row.quantity;
        existing.revenue += row.quantity * row.price_at_purchase;
        map.set(row.product_name, existing);
      }
      const rows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
      if (mounted) {
        setProductRows(rows);
        setProductsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAdmin, reportType, dateFrom, dateTo]);

  const nonCancelledOrders = useMemo(() => orders.filter((o) => o.status !== 'Cancelled'), [orders]);

  const salesSummary = useMemo(() => {
    const revenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);
    const count = nonCancelledOrders.length;
    return { revenue, count, avg: count > 0 ? revenue / count : 0 };
  }, [nonCancelledOrders]);

  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) map[o.status] = (map[o.status] ?? 0) + 1;
    return map;
  }, [orders]);

  const customerRows = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();
    for (const o of nonCancelledOrders) {
      const key = `${o.full_name}|${o.phone}`;
      const existing = map.get(key) ?? { full_name: o.full_name, phone: o.phone, orders: 0, totalSpent: 0 };
      existing.orders += 1;
      existing.totalSpent += o.total;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [nonCancelledOrders]);

  function currentReportRows(): { headers: string[]; rows: (string | number)[][] } {
    if (reportType === 'sales') {
      return {
        headers: ['Date', 'Order #', 'Customer', 'Total (KSh)', 'Status'],
        rows: nonCancelledOrders.map((o) => [
          new Date(o.created_at).toLocaleDateString('en-KE'),
          o.order_number,
          o.full_name,
          o.total,
          o.status,
        ]),
      };
    }
    if (reportType === 'orders') {
      return {
        headers: ['Date', 'Order #', 'Customer', 'Phone', 'Location', 'Payment', 'Total (KSh)', 'Status'],
        rows: orders.map((o) => [
          new Date(o.created_at).toLocaleDateString('en-KE'),
          o.order_number,
          o.full_name,
          o.phone,
          [o.town, o.county].filter(Boolean).join(', '),
          o.payment_method ?? 'N/A',
          o.total,
          o.status,
        ]),
      };
    }
    if (reportType === 'products') {
      return {
        headers: ['Product', 'Units Sold', 'Revenue (KSh)'],
        rows: productRows.map((p) => [p.product_name, p.units, p.revenue]),
      };
    }
    return {
      headers: ['Customer', 'Phone', 'Orders', 'Total Spent (KSh)'],
      rows: customerRows.map((c) => [c.full_name, c.phone, c.orders, c.totalSpent]),
    };
  }

  function handleExportCsv() {
    const { headers, rows } = currentReportRows();
    const lines = [headers.map(csvEscape).join(',')];
    for (const row of rows) lines.push(row.map(csvEscape).join(','));
    const filename = `snc-${reportType}-report-${dateFrom}-to-${dateTo}.csv`;
    downloadBlob(lines.join('\n'), filename, 'text/csv;charset=utf-8;');
  }

  function handleExportPdf() {
    const { headers, rows } = currentReportRows();
    const doc = new jsPDF();
    const marginX = 14;
    let y = 18;

    doc.setFontSize(14);
    doc.text('Step N Carry', marginX, y);
    y += 7;
    doc.setFontSize(11);
    const tabLabel = REPORT_TABS.find((t) => t.key === reportType)?.label ?? '';
    doc.text(`${tabLabel} Report`, marginX, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(`Period: ${dateFrom} to ${dateTo}`, marginX, y);
    y += 8;

    const colWidth = (210 - marginX * 2) / headers.length;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => doc.text(String(h), marginX + i * colWidth, y));
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.line(marginX, y - 3, 210 - marginX, y - 3);

    for (const row of rows) {
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
      row.forEach((cell, i) => {
        const text = typeof cell === 'number' ? cell.toLocaleString('en-KE') : String(cell);
        doc.text(text.slice(0, 28), marginX + i * colWidth, y);
      });
      y += 6;
    }

    const filename = `snc-${reportType}-report-${dateFrom}-to-${dateTo}.pdf`;
    doc.save(filename);
  }

  if (authLoading || !user || !isAdmin) return null;

  const isProductsTab = reportType === 'products';
  const tabLoading = isProductsTab ? productsLoading : loading;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border/60 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold">Reports</h1>

        {/* Monthly sales total — this calendar month, independent of filters below */}
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{formatKsh(monthlyTotal)}</p>
            <p className="text-sm text-muted-foreground">
              This Month's Sales ({new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })})
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-border/60 bg-card p-5">
          <div className="space-y-1.5">
            <Label htmlFor="dateFrom">From</Label>
            <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dateTo">To</Label>
            <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { setDateFrom(toDateInputValue(firstOfMonth(new Date()))); setDateTo(toDateInputValue(new Date())); }}>This Month</Button>
            <Button variant="outline" size="sm" onClick={() => {
              const now = new Date();
              const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
              setDateFrom(toDateInputValue(lastMonthStart));
              setDateTo(toDateInputValue(lastMonthEnd));
            }}>Last Month</Button>
            <Button variant="outline" size="sm" onClick={() => { setDateFrom(toDateInputValue(new Date(new Date().getFullYear(), 0, 1))); setDateTo(toDateInputValue(new Date())); }}>This Year</Button>
            <Button variant="outline" size="sm" onClick={() => { setDateFrom('2020-01-01'); setDateTo(toDateInputValue(new Date())); }}>All Time</Button>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={tabLoading}>
              <Download className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={tabLoading}>
              <FileText className="mr-1.5 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Report type tabs */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REPORT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                reportType === tab.key
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/60 bg-card hover:border-primary/50'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${reportType === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <tab.icon className="h-5 w-5" />
              </div>
              <span className="font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Summary cards per report type */}
        {reportType === 'sales' && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="text-2xl font-bold">{loading ? '...' : formatKsh(salesSummary.revenue)}</p>
              <p className="text-sm text-muted-foreground">Total Revenue (period)</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="text-2xl font-bold">{loading ? '...' : salesSummary.count}</p>
              <p className="text-sm text-muted-foreground">Orders (excl. cancelled)</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="text-2xl font-bold">{loading ? '...' : formatKsh(Math.round(salesSummary.avg))}</p>
              <p className="text-sm text-muted-foreground">Average Order Value</p>
            </div>
          </div>
        )}

        {reportType === 'orders' && (
          <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{status}</p>
              </div>
            ))}
            {orders.length === 0 && !loading && (
              <p className="col-span-full text-sm text-muted-foreground">No orders in this period.</p>
            )}
          </div>
        )}

        {/* Data table */}
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
          {tabLoading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left">
                  {currentReportRows().headers.map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentReportRows().rows.length === 0 ? (
                  <tr>
                    <td colSpan={currentReportRows().headers.length} className="px-4 py-8 text-center text-muted-foreground">
                      No data for this period.
                    </td>
                  </tr>
                ) : (
                  currentReportRows().rows.map((row, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="whitespace-nowrap px-4 py-3">
                          {typeof cell === 'number' ? cell.toLocaleString('en-KE') : cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
