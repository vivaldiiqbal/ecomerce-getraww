import React, { useState, useEffect } from 'react';
import { ShopProvider } from './context/ShopContext';
import { Navbar } from './components/layout/Navbar';
import { HeroSlider } from './components/home/HeroSlider';
import { ProductGrid } from './components/catalog/ProductGrid';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AuthDrawer } from './components/AuthDrawer';
import { FilterDrawer } from './components/FilterDrawer';
import { MobileNavDrawer } from './components/MobileNavDrawer';
import { ToastNotification } from './components/ToastNotification';
import { Footer } from './components/Footer';

// Admin Pages & Protected Guard
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

function MainContent() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white">
      {/* Top Navbar */}
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>

      {/* Hero Banner Slider */}
      <ErrorBoundary>
        <HeroSlider />
      </ErrorBoundary>

      {/* Main Full-Width Catalog Store Layout */}
      <main id="catalogSection" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        <ErrorBoundary>
          <ProductGrid />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <QuickViewModal />
      <SizeGuideModal />
      <CheckoutModal />
      <ReceiptModal />
      <OrderTrackerModal />
      <AuthDrawer />
      <FilterDrawer />
      <MobileNavDrawer />

      {/* Floating WhatsApp Action Button */}
      <ErrorBoundary>
        <FloatingWhatsApp />
      </ErrorBoundary>

      {/* Toast Alert Notifications */}
      <ToastNotification />
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  let normalizedPath = currentPath;
  if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // Admin Routes (Mendukung akses root maupun subfolder di XAMPP htdocs)
  if (normalizedPath === '/admin/login' || normalizedPath.endsWith('/admin/login')) {
    return <AdminLogin />;
  }

  if (
    normalizedPath === '/admin' || 
    normalizedPath === '/admin/products' || 
    normalizedPath.endsWith('/admin') || 
    normalizedPath.endsWith('/admin/products')
  ) {
    return (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    );
  }

  // Customer Front Store Route
  return (
    <ShopProvider>
      <MainContent />
    </ShopProvider>
  );
}
