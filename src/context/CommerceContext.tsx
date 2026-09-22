import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { products as allProducts } from '../data';
import type { Product } from '../data/products';
import { fetchCart } from '../services/cart/api';
import { fetchWishlist, toggleWishlist } from '../services/wishlist/api';
import type { ApiCartItem, ApiWishlistItem } from '../types/api-cart';

export type SortId = 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export type ServerCartItem = {
  id: string;
  quantity: number;
  product: ApiCartItem['product'];
  attributes: ApiCartItem['attributes'];
};

export type ServerWishlistItem = {
  id: string;
  productId: string;
  product: ApiWishlistItem['product'];
};

type CommerceUser = {
  email: string;
  name: string;
};

type CartItem = {
  product: Product;
  quantity: number;
  selectedShade?: string;
  selectedSize?: string;
};

type FilterState = {
  priceRange: { min: number; max: number } | null;
  rating: number;
  category: string;
};

type CommerceContextValue = {
  addToCart: (product: Product, quantity?: number, shade?: string, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  cartItems: CartItem[];
  checkout: () => void;
  checkoutComplete: boolean;
  clearCart: () => void;
  favoriteProducts: Product[];
  filteredProducts: Product[];
  filters: FilterState;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isAuthenticated: boolean;
  isFavorite: (productId: string) => boolean;
  login: (email: string, name: string, authToken?: string) => void;
  logout: () => void;
  register: (email: string, name: string, token?: string) => void;
  googleLogin: (name: string, email: string, token: string) => void;
  token: string | null;
  resetCheckout: () => void;
  resetFilters: () => void;
  applyFilters: (filters: Partial<FilterState>) => void;
  setSortId: (sortId: SortId) => void;
  sortId: SortId;
  toggleFavorite: (product: Product) => void;
  user: CommerceUser | null;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  serverCartItems: ServerCartItem[];
  serverWishlistItems: ServerWishlistItem[];
  serverCartTotal: number;
  serverCartItemCount: number;
  refreshCart: () => void;
  refreshWishlist: () => void;
};

const defaultFilters: FilterState = {
  priceRange: null,
  rating: 0,
  category: '',
};

const CommerceContext = createContext<CommerceContextValue | undefined>(undefined);

const sortProducts = (nextProducts: Product[], sortId: SortId) => {
  switch (sortId) {
    case 'price-asc':
      return [...nextProducts].sort(
        (left, right) => (left.salePrice ?? left.price) - (right.salePrice ?? right.price)
      );
    case 'price-desc':
      return [...nextProducts].sort(
        (left, right) => (right.salePrice ?? right.price) - (left.salePrice ?? left.price)
      );
    case 'rating':
      return [...nextProducts].sort((left, right) => right.rating - left.rating);
    case 'newest':
      return [...nextProducts].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    case 'popular':
      return [...nextProducts].sort((left, right) => right.reviewCount - left.reviewCount);
    default:
      return [...nextProducts].sort(
        (left, right) => (right.isFeatured ? 1 : 0) - (left.isFeatured ? 1 : 0)
      );
  }
};

export const CommerceProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [sortId, setSortId] = useState<SortId>('recommended');
  const [user, setUser] = useState<CommerceUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [serverCartItems, setServerCartItems] = useState<ServerCartItem[]>([]);
  const [serverWishlistItems, setServerWishlistItems] = useState<ServerWishlistItem[]>([]);

  const refreshCart = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchCart(token);
      if (res.cart?.items) {
        setServerCartItems(
          res.cart.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            product: item.product,
            attributes: item.attributes,
          }))
        );
      }
    } catch {
      // silently fail
    }
  }, [token]);

  const refreshWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchWishlist(token);
      if (res.wishlists) {
        setServerWishlistItems(
          res.wishlists.map((w) => ({
            id: w.id,
            productId: w.productId,
            product: w.product,
          }))
        );
      }
    } catch {
      // silently fail
    }
  }, [token]);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(AUTH_USER_KEY);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // silently fail
      } finally {
        setAuthLoaded(true);
      }
    };
    loadAuth();
  }, []);

  useEffect(() => {
    if (token) {
      refreshCart();
      refreshWishlist();
    } else {
      setServerCartItems([]);
      setServerWishlistItems([]);
    }
  }, [token, refreshCart, refreshWishlist]);

  const favoriteProducts = useMemo(
    () => allProducts.filter((product) => favoriteIds.includes(product.id)),
    [favoriteIds]
  );

  const filteredProducts = useMemo(() => {
    const nextProducts = allProducts.filter((product) => {
      const effectivePrice = product.salePrice ?? product.price;
      const matchesPrice = filters.priceRange
        ? effectivePrice >= filters.priceRange.min && effectivePrice <= filters.priceRange.max
        : true;
      const matchesRating = product.rating >= filters.rating;
      const matchesCategory = filters.category
        ? product.categoryId === filters.category ||
          product.category.toLowerCase().includes(filters.category.toLowerCase())
        : true;

      return matchesPrice && matchesRating && matchesCategory;
    });

    return sortProducts(nextProducts, sortId);
  }, [filters, sortId]);

  const addToCart = useCallback((product: Product, quantity = 1, shade?: string, size?: string) => {
    setCartItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedShade === shade &&
          item.selectedSize === size
      );

      if (existingIndex >= 0) {
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [...currentItems, { product, quantity, selectedShade: shade, selectedSize: size }];
    });
    setCheckoutComplete(false);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
      return;
    }
    setCartItems((currentItems) =>
      currentItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + (item.product.salePrice ?? item.product.price) * item.quantity,
      0
    );
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const toggleFavorite = useCallback(
    async (product: Product) => {
      // Optimistic local update
      setFavoriteIds((currentIds) =>
        currentIds.includes(product.id)
          ? currentIds.filter((id) => id !== product.id)
          : [...currentIds, product.id]
      );

      // Call API if authenticated
      if (token) {
        try {
          await toggleWishlist(product.id, token);
          await refreshWishlist();
        } catch {
          // Revert on failure
          setFavoriteIds((currentIds) =>
            currentIds.includes(product.id)
              ? currentIds.filter((id) => id !== product.id)
              : [...currentIds, product.id]
          );
        }
      }
    },
    [token, refreshWishlist]
  );

  const addToWishlist = useCallback((product: Product) => {
    setFavoriteIds((currentIds) =>
      currentIds.includes(product.id) ? currentIds : [...currentIds, product.id]
    );
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setFavoriteIds((currentIds) => currentIds.filter((id) => id !== productId));
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  const applyFilters = useCallback((nextFilters: Partial<FilterState>) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...nextFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const serverCartTotal = useMemo(() => {
    return serverCartItems.reduce((total, item) => {
      const priceAttr = item.attributes.find((a) => a.productAttributeValue?.stockAndPrice);
      if (priceAttr?.productAttributeValue?.stockAndPrice) {
        const sp = priceAttr.productAttributeValue.stockAndPrice;
        const effectivePrice =
          sp.isOfferedPriceActive && sp.offeredPrice ? sp.offeredPrice : Number(sp.price);
        return total + effectivePrice * item.quantity;
      }
      const productPrice =
        item.product.isOfferedPriceActive && item.product.offeredPrice
          ? item.product.offeredPrice
          : item.product.price;
      return total + productPrice * item.quantity;
    }, 0);
  }, [serverCartItems]);

  const serverCartItemCount = useMemo(() => {
    return serverCartItems.reduce((total, item) => total + item.quantity, 0);
  }, [serverCartItems]);

  const value = useMemo<CommerceContextValue>(
    () => ({
      addToCart,
      removeFromCart,
      updateCartQuantity,
      cartItems,
      checkout: () => {
        setCartItems([]);
        setCheckoutComplete(true);
      },
      checkoutComplete,
      clearCart: () => {
        setCartItems([]);
        setCheckoutComplete(false);
      },
      favoriteProducts,
      filteredProducts,
      filters,
      getCartTotal,
      getCartItemCount,
      isAuthenticated: Boolean(user),
      isFavorite,
      login: (email, name, authToken) => {
        const userData = { email, name };
        setUser(userData);
        if (authToken) {
          setToken(authToken);
          SecureStore.setItemAsync(AUTH_TOKEN_KEY, authToken).catch(() => {});
          SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(userData)).catch(() => {});
        }
      },
      logout: () => {
        setUser(null);
        setToken(null);
        setCartItems([]);
        setFavoriteIds([]);
        setServerCartItems([]);
        setServerWishlistItems([]);
        setCheckoutComplete(false);
        SecureStore.deleteItemAsync(AUTH_TOKEN_KEY).catch(() => {});
        SecureStore.deleteItemAsync(AUTH_USER_KEY).catch(() => {});
      },
      register: (email, name, authToken) => {
        const userData = { email, name };
        setUser(userData);
        if (authToken) {
          setToken(authToken);
          SecureStore.setItemAsync(AUTH_TOKEN_KEY, authToken).catch(() => {});
          SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(userData)).catch(() => {});
        }
      },
      googleLogin: (name, email, authToken) => {
        const userData = { email, name };
        setUser(userData);
        setToken(authToken);
        SecureStore.setItemAsync(AUTH_TOKEN_KEY, authToken).catch(() => {});
        SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(userData)).catch(() => {});
      },
      token,
      serverCartItems,
      serverWishlistItems,
      serverCartTotal,
      serverCartItemCount,
      refreshCart,
      refreshWishlist,
      resetCheckout: () => setCheckoutComplete(false),
      resetFilters,
      applyFilters,
      setSortId,
      sortId,
      toggleFavorite,
      user,
      addToWishlist,
      removeFromWishlist,
    }),
    [
      addToCart,
      removeFromCart,
      updateCartQuantity,
      cartItems,
      checkoutComplete,
      favoriteProducts,
      filteredProducts,
      filters,
      getCartTotal,
      getCartItemCount,
      isFavorite,
      sortId,
      toggleFavorite,
      user,
      token,
      serverCartItems,
      serverWishlistItems,
      serverCartTotal,
      serverCartItemCount,
      refreshCart,
      refreshWishlist,
      addToWishlist,
      removeFromWishlist,
      applyFilters,
      resetFilters,
    ]
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);

  if (!context) {
    throw new Error('useCommerce must be used inside CommerceProvider.');
  }

  return context;
};
