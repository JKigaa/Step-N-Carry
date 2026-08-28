/* Shared store constants — Kenyan counties, shoe categories, delivery fee */

export const KENYAN_COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret (Uasin Gishu)',
  'Kiambu',
  'Machakos',
  'Kajiado',
  'Kilifi',
  'Malindi',
  'Nyeri',
  'Meru',
  'Thika',
  'Naivasha',
  'Kakamega',
  'Bungoma',
  'Kisii',
  'Kericho',
  'Nanyuki',
  'Garissa',
  'Other',
];

export const SHOE_CATEGORIES = [
  'Sneakers',
  'Formal',
  'Running',
  'Heels',
  'Boots',
  'Sandals',
  'Kids',
  'Loafers',
];

export const DEFAULT_DELIVERY_FEE = 300;

export const STORE_NAME = 'Step N Carry';
export const STORE_TAGLINE = 'Kenya\'s Premier Online Shoe Store';

export function formatKsh(amount: number): string {
  return 'KSh ' + amount.toLocaleString('en-KE');
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not set';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
