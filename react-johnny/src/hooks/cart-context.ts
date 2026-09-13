import { createContext } from "react";
import type { CartItem, Product, ProductVariant } from "../types";

export interface CartContextValue {
  items: CartItem[];
  productsInCart: Array<{ product: Product; quantity: number; variant?: ProductVariant }>;
  itemCount: number;
  total: number;
  addToCart: (productId: string, quantity?: number, variant?: ProductVariant | null) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);