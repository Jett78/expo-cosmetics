import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { products as allProducts } from '../data';
import type { Product } from '../data/products';
import { queryClient } from '../providers/QueryProvider';
import { addToCart as addToCartApi, deleteCartItem, fetchCart } from '../services/cart/api';
import { fetchWishlist, toggleWishlist } from '../services/wishlist/api';
import type {
  AddToCartRequest,
  ApiCartItem,
  ApiWishlistItem,
  DeleteCartItemResponse,
} from '../types/api-cart';
import type { ShippingAddress } from '../types/shipping-address';

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
  avatar?: string | null;
};

type CartProduct = {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  slug: string;
  image: number | string;
};

type CartItem = {
  product: CartProduct;
  quantity: number;
  attributeIds: string[];
};

type FilterState = {
  priceRange: { min: number; max: number } | null;
  rating: number;
  category: string;
};

type CommerceContextValue = {
  addToCart: (product: CartProduct, quantity?: number, attributeIds?: string[]) => void;
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
  authLoaded: boolean;
  isFavorite: (productId: string) => boolean;
  login: (email: string, name: string, authToken?: string, avatar?: string | null) => void;
  logout: () => void;
  register: (email: string, name: string, token?: string) => void;
  googleLogin: (name: string, email: string, token: string) => void;
  updateUser: (name: string, email: string, avatar?: string | null) => void;
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
  serverWishlistItemCount: number;
  refreshCart: () => void;
  refreshWishlist: () => void;
  loginModalVisible: boolean;
  showLoginModal: () => void;
  hideLoginModal: () => void;
  selectedShippingAddress: ShippingAddress | null;
  setSelectedShippingAddress: (address: ShippingAddress | null) => void;
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
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [selectedShippingAddress, setSelectedShippingAddressState] =
    useState<ShippingAddress | null>(null);

  const setSelectedShippingAddress = useCallback((address: ShippingAddress | null) => {
    setSelectedShippingAddressState(address);
  }, []);

  const showLoginModal = useCallback(() => setLoginModalVisible(true), []);
  const hideLoginModal = useCallback(() => setLoginModalVisible(false), []);

  const updateUser = useCallback((name: string, email: string, avatar?: string | null) => {
    setUser((prev) => {
      const userData = {
        email,
        name,
        avatar: avatar !== undefined ? avatar : prev?.avatar,
      };
      SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(userData)).catch(() => {});
      return userData;
    });
  }, []);

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

  const addToCartMutation = useMutation({
    mutationFn: (payload: AddToCartRequest) => addToCartApi(token as string, payload),
  });

  const deleteCartItemMutation = useMutation({
    mutationFn: (cartItemId: string) => deleteCartItem(token as string, cartItemId),
  });

  const addToCart = useCallback(
    async (product: CartProduct, quantity = 1, attributeIds: string[] = []) => {
      if (!token) {
        setLoginModalVisible(true);
        return;
      }

      const previousItems = cartItems;

      setCartItems((currentItems) => {
        const existingIndex = currentItems.findIndex(
          (item) =>
            item.product.id === product.id &&
            JSON.stringify(item.attributeIds) === JSON.stringify(attributeIds)
        );

        if (existingIndex >= 0) {
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        return [...currentItems, { product, quantity, attributeIds }];
      });
      setCheckoutComplete(false);

      try {
        const price = product.salePrice ?? product.price;
        const total = price * quantity;
        const isOfferActive = product.salePrice != null && product.salePrice < product.price;

        await addToCartMutation.mutateAsync({
          productId: product.id,
          quantity,
          total,
          attributeIds,
          isOfferActive,
        });
        await refreshCart();
      } catch {
        setCartItems(previousItems);
      }
    },
    [token, refreshCart, cartItems, addToCartMutation]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      if (token) {
        const previousServerItems = serverCartItems;
        setServerCartItems((current) => current.filter((item) => item.id !== cartItemId));

        try {
          await deleteCartItemMutation.mutateAsync(cartItemId);
          await refreshCart();
        } catch {
          setServerCartItems(previousServerItems);
        }
      } else {
        setCartItems((currentItems) =>
          currentItems.filter((item) => item.product.id !== cartItemId)
        );
      }
    },
    [token, serverCartItems, deleteCartItemMutation, refreshCart]
  );

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
      if (!token) {
        setLoginModalVisible(true);
        return;
      }

      // Optimistic local update
      setFavoriteIds((currentIds) =>
        currentIds.includes(product.id)
          ? currentIds.filter((id) => id !== product.id)
          : [...currentIds, product.id]
      );

      // Call API if authenticated
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

  const serverWishlistItemCount = useMemo(() => serverWishlistItems.length, [serverWishlistItems]);

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
      authLoaded,
      isFavorite,
      login: (email, name, authToken, avatar) => {
        const userData: CommerceUser =
          avatar !== undefined ? { email, name, avatar } : { email, name };
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
        setSelectedShippingAddressState(null);
        queryClient.removeQueries({ queryKey: ['profile'] });
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
      updateUser,
      token,
      serverCartItems,
      serverWishlistItems,
      serverCartTotal,
      serverCartItemCount,
      serverWishlistItemCount,
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
      loginModalVisible,
      showLoginModal,
      hideLoginModal,
      selectedShippingAddress,
      setSelectedShippingAddress,
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
      authLoaded,
      token,
      serverCartItems,
      serverWishlistItems,
      serverCartTotal,
      serverCartItemCount,
      serverWishlistItemCount,
      refreshCart,
      refreshWishlist,
      addToWishlist,
      removeFromWishlist,
      applyFilters,
      resetFilters,
      showLoginModal,
      hideLoginModal,
      loginModalVisible,
      updateUser,
      selectedShippingAddress,
      setSelectedShippingAddress,
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
