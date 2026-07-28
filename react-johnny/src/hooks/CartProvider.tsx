import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { catalogRepository } from "../data/catalog";
import type { CartItem, Product } from "../types";
import { CartContext } from "./cart-context";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "add"; productId: string }
  | { type: "remove"; productId: string }
  | { type: "set-quantity"; productId: string; quantity: number }
  | { type: "hydrate"; items: CartItem[] }
  | { type: "clear" };

const CART_STORAGE_KEY = "johnny-fishing-cart";

const reducer = (state: CartState, action: CartAction): CartState => {
  if (action.type === "hydrate") {
    return { items: action.items };
  }

  if (action.type === "add") {
    const existing = state.items.find((item) => item.productId === action.productId);
    if (existing) {
      return {
        items: state.items.map((item) =>
          item.productId === action.productId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      };
    }
    return { items: [...state.items, { productId: action.productId, quantity: 1 }] };
  }

  if (action.type === "remove") {
    return { items: state.items.filter((item) => item.productId !== action.productId) };
  }

  if (action.type === "set-quantity") {
    if (action.quantity <= 0) {
      return { items: state.items.filter((item) => item.productId !== action.productId) };
    }

    return {
      items: state.items.map((item) =>
        item.productId === action.productId ? { ...item, quantity: action.quantity } : item,
      ),
    };
  }

  return { items: [] };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const products = catalogRepository.getProducts();

  useEffect(() => {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        dispatch({ type: "hydrate", items: parsed });
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = useCallback(
    (productId: string) => {
      const product = products.find((item) => item.id === productId);
      if (!product) {
        return;
      }

      const quantityInCart = state.items.find((item) => item.productId === productId)?.quantity ?? 0;
      if (typeof product.quantity === "number") {
        if (product.quantity <= 0 || quantityInCart >= product.quantity) {
          return;
        }
      }

      dispatch({ type: "add", productId });
    },
    [products, state.items],
  );

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: "remove", productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "set-quantity", productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  const productsInCart = useMemo(
    () =>
      state.items
        .map((item) => ({
          product: products.find((product) => product.id === item.productId),
          quantity: item.quantity,
        }))
        .filter((entry): entry is { product: Product; quantity: number } => Boolean(entry.product)),
    [state.items, products],
  );

  const itemCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items],
  );

  const total = useMemo(
    () => productsInCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [productsInCart],
  );

  const value = useMemo(
    () => ({
      items: state.items,
      productsInCart,
      itemCount,
      total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [state.items, productsInCart, itemCount, total, addToCart, removeFromCart, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};