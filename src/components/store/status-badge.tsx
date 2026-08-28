import { ORDER_STATUSES, type OrderStatus } from '@/types/db';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusStyles: Record<OrderStatus, string> = {
  'Order Received': 'bg-blue-100 text-blue-700 border-blue-200',
  'Order Under Review': 'bg-amber-100 text-amber-700 border-amber-200',
  'Payment Pending': 'bg-orange-100 text-orange-700 border-orange-200',
  'Payment Confirmed': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Preparing Order': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Out for Delivery': 'bg-purple-100 text-purple-700 border-purple-200',
  'Delivered': 'bg-green-100 text-green-700 border-green-200',
  'Cancelled': 'bg-red-100 text-red-700 border-red-200',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style} ${className}`}>
      {status}
    </span>
  );
}

export function StatusProgress({ currentStatus }: { currentStatus: OrderStatus }) {
  const flow = ORDER_STATUSES.filter((s) => s !== 'Cancelled') as Exclude<OrderStatus, 'Cancelled'>[];
  const currentIndex = flow.indexOf(currentStatus as Exclude<OrderStatus, 'Cancelled'>);
  const isCancelled = currentStatus === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <span className="text-sm font-medium text-red-700">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {flow.map((status, i) => (
        <div key={status} className="flex items-center gap-1">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              i <= currentIndex
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
              i < currentIndex ? 'bg-primary-foreground/30 text-primary-foreground' : i === currentIndex ? 'bg-primary-foreground text-primary' : 'bg-muted-foreground/20'
            }`}>
              {i < currentIndex ? '✓' : i + 1}
            </span>
            {status}
          </div>
          {i < flow.length - 1 && (
            <div className={`h-px w-3 ${i < currentIndex ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
