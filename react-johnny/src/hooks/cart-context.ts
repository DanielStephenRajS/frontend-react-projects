import { createContext } from "react";
import type { CartItem, Product } from "../types";

export interface CartContextValue {
  items: CartItem[];
  productsInCart: Array<{ product: Product; quantity: number }>;
  itemCount: number;
  total: number;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);