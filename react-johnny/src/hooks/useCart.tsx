import { useContext } from "react";
import { CartContext, type CartContextValue } from "./cart-context";

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
