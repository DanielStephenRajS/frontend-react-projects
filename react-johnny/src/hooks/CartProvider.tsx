import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { CartItem, Product, ProductVariant } from "../types";
import { CartContext } from "./cart-context";
import { useProducts } from "./useProducts";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "add"; productId: string; quantity: number; variant?: ProductVariant | null }
  | { type: "remove"; productId: string; variantId?: string }
  | { type: "set-quantity"; productId: string; quantity: number; variantId?: string }
  | { type: "hydrate"; items: CartItem[] }
  | { type: "clear" };

const CART_STORAGE_KEY = "johnny-fishing-cart";

const reducer = (state: CartState, action: CartAction): CartState => {
  if (action.type === "hydrate") {
    return { items: action.items };
  }

  if (action.type === "add") {
    const variantKey = action.variant ? String(action.variant.variant_id ?? `${action.productId}-${action.variant.variant_type}-${action.variant.variant_value}`) : "base";
    const existing = state.items.find((item) => item.productId === action.productId && (item.variantId ?? "base") === variantKey);

    if (existing) {
      return {
        items: state.items.map((item) =>
          item.productId === action.productId && (item.variantId ?? "base") === variantKey
            ? { ...item, quantity: item.quantity + action.quantity }
            : item,
        ),
      };
    }

    return {
      items: [
        ...state.items,
        {
          productId: action.productId,
          quantity: action.quantity,
          variantId: variantKey === "base" ? undefined : variantKey,
          variantType: action.variant?.variant_type,
          variantValue: action.variant?.variant_value,
          price: action.variant?.price_inr ?? undefined,
        },
      ],
    };
  }

  if (action.type === "remove") {
    const variantKey = action.variantId ?? "base";
    return {
      items: state.items.filter((item) => !(item.productId === action.productId && (item.variantId ?? "base") === variantKey)),
    };
  }

  if (action.type === "set-quantity") {
    const variantKey = action.variantId ?? "base";
    if (action.quantity <= 0) {
      return {
        items: state.items.filter((item) => !(item.productId === action.productId && (item.variantId ?? "base") === variantKey)),
      };
    }

    return {
      items: state.items.map((item) =>
        item.productId === action.productId && (item.variantId ?? "base") === variantKey ? { ...item, quantity: action.quantity } : item,
      ),
    };
  }

  return { items: [] };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const { products } = useProducts();

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
    (productId: string, quantity: number = 1, variant?: ProductVariant | null) => {
      const product = products.find((item) => item.id === productId);
      const requestedQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
      const variantKey = variant ? String(variant.variant_id ?? `${productId}-${variant.variant_type}-${variant.variant_value}`) : "base";

      if (!product || requestedQuantity <= 0) {
        return;
      }

      if (variant) {
        const variantStock = Number(variant.stock ?? 0);
        const quantityInCart = state.items.find((item) => item.productId === productId && (item.variantId ?? "base") === variantKey)?.quantity ?? 0;

        if (variantStock <= 0 || quantityInCart + requestedQuantity > variantStock) {
          return;
        }

        dispatch({ type: "add", productId, quantity: requestedQuantity, variant });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cart:add", { detail: { productId, quantity: requestedQuantity } }));
        }
        return;
      }

      const quantityInCart = state.items.find((item) => item.productId === productId && !(item.variantId))?.quantity ?? 0;
      if (typeof product.quantity === "number") {
        if (product.quantity <= 0 || quantityInCart + requestedQuantity > product.quantity) {
          return;
        }
      }

      dispatch({ type: "add", productId, quantity: requestedQuantity });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:add", { detail: { productId, quantity: requestedQuantity } }));
      }
    },
    [products, state.items],
  );

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    dispatch({ type: "remove", productId, variantId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    dispatch({ type: "set-quantity", productId, quantity, variantId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  const productsInCart = useMemo(() => {
    const entries: Array<{ product: Product; quantity: number; variant?: ProductVariant }> = [];

    for (const item of state.items) {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        continue;
      }

      const variant = product.variants?.find((entry) =>
        String(entry.variant_id ?? `${entry.variant_type}-${entry.variant_value}`) === (item.variantId ?? "base"),
      );

      entries.push({
        product,
        quantity: item.quantity,
        variant,
      });
    }

    return entries;
  }, [state.items, products]);

  const itemCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items],
  );

  const total = useMemo(
    () => productsInCart.reduce((sum, item) => sum + (item.variant?.price_inr ?? item.product.price) * item.quantity, 0),
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