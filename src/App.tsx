import { useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';
import { useHashRouter } from '@/hooks/use-router';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { HomePage } from '@/pages/home';
import { ShopPage } from '@/pages/shop';
import { ProductDetailPage } from '@/pages/product-detail';
import { CartPage } from '@/pages/cart';
import { CheckoutPage } from '@/pages/checkout';
import { OrderReviewPage } from '@/pages/order-review';
import { OrderConfirmationPage } from '@/pages/order-confirmation';
import { SignInPage } from '@/pages/signin';
import { SignUpPage } from '@/pages/signup';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import { AccountPage } from '@/pages/account';
import { AccountOrdersPage } from '@/pages/account-orders';
import { AccountProfilePage } from '@/pages/account-profile';
import { AccountNotificationsPage } from '@/pages/account-notifications';
import { OrderDetailPage } from '@/pages/order-detail';
import { AdminPage } from '@/pages/admin';
import { AdminProductsPage } from '@/pages/admin-products';
import { AdminOrdersPage } from '@/pages/admin-orders';
import { AdminOrderDetailPage } from '@/pages/admin-order-detail';

export default function App() {
  const router = useHashRouter();
  const { path, segments, navigate } = router;

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Step N Carry — Online Shoe Store Kenya',
      '/shop': 'Shop Shoes — Step N Carry',
      '/cart': 'Your Cart — Step N Carry',
      '/checkout': 'Checkout — Step N Carry',
      '/signin': 'Sign In — Step N Carry',
      '/signup': 'Create Account — Step N Carry',
      '/account': 'My Account — Step N Carry',
      '/admin': 'Admin Dashboard — Step N Carry',
    };
    document.title = titles[path] ?? 'Step N Carry — Online Shoe Store Kenya';
  }, [path]);

  const top = segments[0] ?? '';
  const isAdminRoute = top === 'admin';
  const isAccountRoute = top === 'account';

  function renderPage() {
    if (top === '') return <HomePage navigate={navigate} />;
    if (top === 'shop') return <ShopPage navigate={navigate} params={router.params} />;
    if (top === 'product' && segments[1]) return <ProductDetailPage navigate={navigate} productId={segments[1]} />;
    if (top === 'cart') return <CartPage navigate={navigate} />;
    if (top === 'checkout') return <CheckoutPage navigate={navigate} />;
    if (top === 'order-review') return <OrderReviewPage navigate={navigate} />;
    if (top === 'order-confirmation' && segments[1]) return <OrderConfirmationPage navigate={navigate} orderId={segments[1]} />;
    if (top === 'order' && segments[1]) return <OrderDetailPage navigate={navigate} orderId={segments[1]} />;
    if (top === 'signin') return <SignInPage navigate={navigate} />;
    if (top === 'signup') return <SignUpPage navigate={navigate} />;
    if (top === 'forgot-password') return <ForgotPasswordPage navigate={navigate} />;
    if (top === 'account') {
      const sub = segments[1];
      if (sub === 'orders') return <AccountOrdersPage navigate={navigate} />;
      if (sub === 'profile') return <AccountProfilePage navigate={navigate} />;
      if (sub === 'notifications') return <AccountNotificationsPage navigate={navigate} />;
      return <AccountPage navigate={navigate} />;
    }
    if (top === 'admin') {
      const sub = segments[1];
      const sub2 = segments[2];
      if (sub === 'products') return <AdminProductsPage navigate={navigate} />;
      if (sub === 'orders' && sub2) return <AdminOrderDetailPage navigate={navigate} orderId={sub2} />;
      if (sub === 'orders') return <AdminOrdersPage navigate={navigate} />;
      return <AdminPage navigate={navigate} />;
    }
    return <HomePage navigate={navigate} />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar navigate={navigate} path={path} />
          <main className="flex-1">{renderPage()}</main>
          {!isAdminRoute && !isAccountRoute && <Footer navigate={navigate} />}
          <Toaster richColors position="bottom-right" />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
