export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'admin';
  delivery_address: string;
  county: string;
  town: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  is_available: boolean;
  is_featured: boolean;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  stock: number;
}

export type OrderStatus =
  | 'Order Received'
  | 'Order Under Review'
  | 'Payment Pending'
  | 'Payment Confirmed'
  | 'Preparing Order'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'Order Received',
  'Order Under Review',
  'Payment Pending',
  'Payment Confirmed',
  'Preparing Order',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  full_name: string;
  phone: string;
  email: string;
  delivery_address: string;
  county: string;
  town: string;
  payment_method: string | null;
  expected_delivery_date: string | null;
  expected_delivery_window: string;
  delivery_notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  size: string;
  price_at_purchase: number;
  quantity: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  order_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ProductWithSizes extends Product {
  sizes: ProductSize[];
}
