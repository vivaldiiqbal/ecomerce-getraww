import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { promoCodes } from '../data/products';

const ShopContext = createContext();

const ALL_CATEGORIES_LIST = ['Tees', 'Shirts', 'Outerwear', 'Sweaters', 'Pants', 'Accessories', 'Headwear'];

const CURRENCY_RATES = {
  IDR: { symbol: 'Rp ', rate: 1, digits: 0 },
  USD: { symbol: '$', rate: 0.000065, digits: 2 },
  SGD: { symbol: 'S$', rate: 0.000086, digits: 2 }
};

export const ShopProvider = ({ children }) => {
  // 1. User Auth State with LocalStorage Persistence
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('thx_token');
    }
  }, [user]);

  // 2. Cart & Wishlist State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('thx_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('thx_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('thx_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('thx_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // 3. Currency
  const [currency, setCurrency] = useState('IDR');

  const formatPrice = useCallback((amountInIDR) => {
    const numAmount = Number(amountInIDR) || 0;
    const config = CURRENCY_RATES[currency] || CURRENCY_RATES.IDR;
    const converted = numAmount * config.rate;
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(converted).replace('Rp', 'Rp ');
    } else {
      return `${config.symbol}${converted.toFixed(config.digits)}`;
    }
  }, [currency]);

  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  // 4. Products Catalog & Fetching State
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // 5. Filters State
  const [filters, setFilters] = useState({
    categories: [...ALL_CATEGORIES_LIST],
    productType: 'all',
    availability: 'all',
    priceRange: 'all',
    selectedSize: null,
    searchQuery: '',
    sortBy: 'featured'
  });

  const activeFiltersCount = useMemo(() => {
    return (
      (filters.categories && filters.categories.length > 0 && filters.categories.length < ALL_CATEGORIES_LIST.length ? 1 : 0) +
      (filters.productType !== 'all' ? 1 : 0) +
      (filters.availability !== 'all' ? 1 : 0) +
      (filters.priceRange !== 'all' ? 1 : 0) +
      (filters.selectedSize ? 1 : 0) +
      (filters.searchQuery ? 1 : 0)
    );
  }, [filters]);

  // Fetch Products Effect based on filters
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const params = {};
      if (filters.searchQuery) params.q = filters.searchQuery;
      if (filters.categories && filters.categories.length < ALL_CATEGORIES_LIST.length) {
        params.categories = filters.categories.join(',');
      }
      if (filters.productType !== 'all') params.productType = filters.productType;
      if (filters.availability !== 'all') params.availability = filters.availability;
      if (filters.priceRange !== 'all') params.priceRange = filters.priceRange;
      if (filters.selectedSize) params.size = filters.selectedSize;
      if (filters.sortBy !== 'featured') params.sortBy = filters.sortBy;

      const response = await api.get('/products', { params });
      setProducts(response.data.data || []);
    } catch {
      setProducts([]);
      showToast('Gagal memuat katalog produk', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 6. Drawers Visibility
  const [drawers, setDrawers] = useState({
    cart: false,
    wishlist: false,
    mobileFilter: false,
    mobileMenu: false,
    orderTracker: false,
    auth: false,
    filter: false
  });

  const toggleDrawer = useCallback((name, value) => {
    setDrawers(prev => ({ ...prev, [name]: value !== undefined ? value : !prev[name] }));
  }, []);

  // 7. Modals & Promo
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  // 8. API Auth Functions
  const loginUser = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: profile } = res.data.data;
      localStorage.setItem('thx_token', token);
      setUser(profile);
      showToast(`Selamat datang kembali, ${profile.name}!`);
      setDrawers(prev => ({ ...prev, auth: false }));
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal';
      showToast(msg, 'error');
      return false;
    }
  }, [showToast]);

  const registerUser = useCallback(async (name, email, phone, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, phone, password });
      const { token, user: profile } = res.data.data;
      localStorage.setItem('thx_token', token);
      setUser(profile);
      showToast(`Akun berhasil dibuat! Selamat datang, ${profile.name}!`);
      setDrawers(prev => ({ ...prev, auth: false }));
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registrasi gagal';
      showToast(msg, 'error');
      return false;
    }
  }, [showToast]);

  const logoutUser = useCallback(() => {
    setUser(null);
    showToast('Anda telah keluar dari akun.', 'info');
    setDrawers(prev => ({ ...prev, auth: false }));
  }, [showToast]);

  // 10. API Order & Checkout Functions
  const checkoutOrder = useCallback(async (orderPayload) => {
    try {
      const res = await api.post('/orders/checkout', orderPayload);
      const newOrder = res.data.data;
      setLastOrder(newOrder);
      setCart([]);
      fetchProducts();
      return newOrder;
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membuat pesanan.';
      showToast(msg, 'error');
      throw err;
    }
  }, [fetchProducts, showToast]);

  const simulatePayment = useCallback(async (orderNumber) => {
    try {
      const cleanNumber = encodeURIComponent(String(orderNumber || '').replace(/^#+/, ''));
      const res = await api.post(`/orders/${cleanNumber}/simulate-pay`);
      const updatedOrder = res.data.data;
      setLastOrder(updatedOrder);
      setCart([]);
      fetchProducts();
      showToast(`Pembayaran berhasil (Order: ${orderNumber})`);
      return updatedOrder;
    } catch (err) {
      const msg = err.response?.data?.message || 'Simulasi pembayaran gagal.';
      showToast(msg, 'error');
      throw err;
    }
  }, [fetchProducts, showToast]);

  // 11. Cart Functions
  const addToCart = useCallback((product, size, quantity = 1) => {
    if (!size) {
      showToast('Pilih ukuran terlebih dahulu!', 'error');
      return;
    }
    const numQty = Math.max(1, Number(quantity) || 1);
    const numPrice = Number(product.finalPrice ?? product.price ?? 0);

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id && item.size === size);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity = Number(updated[existingIdx].quantity || 0) + numQty;
        return updated;
      } else {
        return [...prev, {
          id: product.id,
          title: product.title,
          price: numPrice,
          image: product.image,
          size: size,
          quantity: numQty,
          category: product.category
        }];
      }
    });
    showToast(`Added: ${numQty}x ${product.title} (${size})`);
    setDrawers(prev => ({ ...prev, cart: true }));
  }, [showToast]);

  const updateCartQuantity = useCallback((index, delta) => {
    setCart(prev => {
      const updated = [...prev];
      if (!updated[index]) return prev;
      const newQty = Number(updated[index].quantity || 0) + Number(delta);
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    showToast('Produk dihapus dari kantong belanja', 'info');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // 12. Wishlist Functions
  const toggleWishlist = useCallback((productId) => {
    setWishlist(prev => {
      const isSaved = prev.includes(productId);
      if (isSaved) {
        showToast('Dihapus dari Wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Disimpan ke Wishlist ♥');
        return [...prev, productId];
      }
    });
  }, [showToast]);

  // 13. Filter Actions
  const resetAllFilters = useCallback(() => {
    setFilters({
      categories: [...ALL_CATEGORIES_LIST],
      productType: 'all',
      availability: 'all',
      priceRange: 'all',
      selectedSize: null,
      searchQuery: '',
      sortBy: 'featured'
    });
    showToast('Semua filter berhasil di-reset');
  }, [showToast]);

  // 14. Coupon Actions
  const applyPromoCode = useCallback((code) => {
    const cleanCode = code.trim().toUpperCase();
    if (promoCodes && promoCodes[cleanCode]) {
      setAppliedPromo({ code: cleanCode, ...promoCodes[cleanCode] });
      showToast(`Kupon "${cleanCode}" berhasil dipasang!`);
      return true;
    } else {
      showToast('Kode promo tidak valid atau telah kedaluwarsa.', 'error');
      return false;
    }
  }, [showToast]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    showToast('Kode promo dilepas');
  }, [showToast]);

  // 15. Cart Calculations
  const { cartItemsCount, cartSubtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (let i = 0; i < cart.length; i++) {
      const qty = Number(cart[i].quantity) || 0;
      const price = Number(cart[i].price) || 0;
      count += qty;
      subtotal += price * qty;
    }
    return { cartItemsCount: count, cartSubtotal: subtotal };
  }, [cart]);

  const { cartDiscount, isFreeShippingApplied } = useMemo(() => {
    let discount = 0;
    let freeShipping = false;

    if (appliedPromo) {
      if (appliedPromo.discountPercent) {
        discount += (cartSubtotal * Number(appliedPromo.discountPercent)) / 100;
      }
      if (appliedPromo.fixedAmount) {
        discount += Number(appliedPromo.fixedAmount);
      }
      if (appliedPromo.freeShipping) {
        freeShipping = true;
      }
    }

    if (cartSubtotal >= 300000) {
      freeShipping = true;
    }

    return { cartDiscount: discount, isFreeShippingApplied: freeShipping };
  }, [cartSubtotal, appliedPromo]);

  const contextValue = useMemo(() => ({
    products,
    isLoadingProducts,
    fetchProducts,
    user,
    loginUser,
    registerUser,
    logoutUser,
    checkoutOrder,
    simulatePayment,
    cart,
    wishlist,
    currency,
    setCurrency,
    formatPrice,
    filters,
    setFilters,
    activeFiltersCount,
    resetAllFilters,
    drawers,
    toggleDrawer,
    quickViewProduct,
    setQuickViewProduct,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isReceiptOpen,
    setIsReceiptOpen,
    isSizeGuideOpen,
    setIsSizeGuideOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    cartItemsCount,
    cartSubtotal,
    cartDiscount,
    isFreeShippingApplied,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    lastOrder,
    setLastOrder,
    toast,
    showToast
  }), [
    products,
    isLoadingProducts,
    fetchProducts,
    user,
    loginUser,
    registerUser,
    logoutUser,
    checkoutOrder,
    simulatePayment,
    cart,
    wishlist,
    currency,
    formatPrice,
    filters,
    activeFiltersCount,
    resetAllFilters,
    drawers,
    toggleDrawer,
    quickViewProduct,
    isCheckoutOpen,
    isReceiptOpen,
    isSizeGuideOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    cartItemsCount,
    cartSubtotal,
    cartDiscount,
    isFreeShippingApplied,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    lastOrder,
    toast,
    showToast
  ]);

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
