import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product, ProductVariant } from "../types";
import { CartContext } from "./cart-context";
import { getProductById, useProducts } from "./useProducts";

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
const CARTS_BY_PHONE_STORAGE_KEY = "johnny-fishing-carts-by-phone";
const WHATSAPP_PHONE_KEY = "johnny-fishing-whatsapp-phone";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

const normalizePhoneNumber = (value: string): string => value.replace(/\D/g, "").slice(0, 10);
const formatPhoneNumber = (digits: string): string => `+91${digits}`;
const isValidIndianMobileNumber = (digits: string): boolean => /^[6-9]\d{9}$/.test(digits);

const normalizeCartApiItem = (item: Record<string, unknown>): CartItem | null => {
  const productIdValue = item.product_id ?? item.productId ?? item.id;
  if (productIdValue == null || productIdValue === "") {
    return null;
  }

  return {
    productId: String(productIdValue),
    quantity: Number(item.quantity ?? 1),
    variantId: item.variant_id ? String(item.variant_id) : item.variantId ? String(item.variantId) : undefined,
    variantType: item.variant_type ? String(item.variant_type) : item.variantType ? String(item.variantType) : undefined,
    variantValue: item.variant_value ? String(item.variant_value) : item.variantValue ? String(item.variantValue) : undefined,
    price: item.price != null ? Number(item.price) : undefined,
  };
};

const normalizeCartResponse = (payload: unknown): CartItem[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => (item && typeof item === "object" ? normalizeCartApiItem(item as Record<string, unknown>) : null))
      .filter((item): item is CartItem => Boolean(item));
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.items)) {
      return record.items
        .map((item) => (item && typeof item === "object" ? normalizeCartApiItem(item as Record<string, unknown>) : null))
        .filter((item): item is CartItem => Boolean(item));
    }

    if (Array.isArray(record.cart)) {
      return record.cart
        .map((item) => (item && typeof item === "object" ? normalizeCartApiItem(item as Record<string, unknown>) : null))
        .filter((item): item is CartItem => Boolean(item));
    }

    const directItem = normalizeCartApiItem(record);
    return directItem ? [directItem] : [];
  }

  return [];
};

const fetchCartForPhone = async (phoneNumber: string): Promise<CartItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart?mobile_number=${encodeURIComponent(phoneNumber)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const items = normalizeCartResponse(payload);
    savePhoneCart(phoneNumber, items);
    return items;
  } catch {
    return [];
  }
};

const addCartItemToApi = async (
  phoneNumber: string,
  productId: string,
  quantity: number,
  variant?: ProductVariant | null,
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        mobile_number: phoneNumber,
        product_id: productId,
        quantity,
        variant_id: variant ? Number(variant.variant_id ?? 0) : 0,
      }),
    });

    if (!response.ok) {
      throw new Error("Cart add API failed");
    }

    return true;
  } catch {
    return false;
  }
};

const removeCartItemFromApi = async (phoneNumber: string, productId: string, variantId?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        mobile_number: phoneNumber,
        product_id: productId,
        variant_id: variantId ? Number(variantId) : 0,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
};

const updateCartItemQuantityInApi = async (
  phoneNumber: string,
  productId: string,
  quantity: number,
  variantId?: string,
) => {
  try {
    const payloadQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
    const response = await fetch(`${API_BASE_URL}/api/cart/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        mobile_number: phoneNumber,
        product_id: productId,
        quantity: payloadQuantity,
        variant_id: variantId ? Number(variantId) : 0,
      }),
    });

    if (!response.ok) {
      throw new Error("Cart update API failed");
    }

    return true;
  } catch {
    return false;
  }
};

const getCurrentPhoneNumber = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = sessionStorage.getItem(WHATSAPP_PHONE_KEY);
  if (!stored) {
    return null;
  }

  const digits = normalizePhoneNumber(stored);
  return isValidIndianMobileNumber(digits) ? formatPhoneNumber(digits) : null;
};

const readPhoneCartMap = (): Record<string, CartItem[]> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(CARTS_BY_PHONE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, CartItem[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    localStorage.removeItem(CARTS_BY_PHONE_STORAGE_KEY);
    return {};
  }
};

const writePhoneCartMap = (nextMap: Record<string, CartItem[]>) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CARTS_BY_PHONE_STORAGE_KEY, JSON.stringify(nextMap));
};

const savePhoneCart = (phoneNumber: string, items: CartItem[]) => {
  if (!phoneNumber) {
    return;
  }

  const nextMap = readPhoneCartMap();
  nextMap[phoneNumber] = items;
  writePhoneCartMap(nextMap);
};

const reducer = (state: CartState, action: CartAction): CartState => {
  if (action.type === "hydrate") {
    return { items: action.items };
  }

  if (action.type === "add") {
    const variantKey = action.variant
      ? String(action.variant.variant_id ?? `${action.productId}-${action.variant.variant_type}-${action.variant.variant_value}`)
      : "base";
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

  if (action.type === "clear") {
    return { items: [] };
  }

  return { items: [] };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const { products } = useProducts();
  const [fetchedProducts, setFetchedProducts] = useState<Record<string, Product>>({});
  const [isPhonePromptOpen, setIsPhonePromptOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const pendingCartAddRef = useRef<{ productId: string; quantity: number; variant?: ProductVariant | null } | null>(null);

  const refreshCartFromApi = useCallback(async (phoneNumber: string) => {
    const items = await fetchCartForPhone(phoneNumber);
    dispatch({ type: "hydrate", items });
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    return items;
  }, []);

  useEffect(() => {
    const currentPhone = getCurrentPhoneNumber();
    if (currentPhone) {
      void refreshCartFromApi(currentPhone);
    }
  }, [refreshCartFromApi]);

  useEffect(() => {
    const currentPhone = getCurrentPhoneNumber();
    if (currentPhone) {
      savePhoneCart(currentPhone, state.items);
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  useEffect(() => {
    const missingIds = [...new Set(state.items.map((item) => item.productId))].filter(
      (productId) => !products.some((product) => product.id === productId) && !fetchedProducts[productId],
    );

    if (missingIds.length === 0) {
      return;
    }

    let isActive = true;

    Promise.all(
      missingIds.map(async (productId) => {
        try {
          const product = await getProductById(productId);
          return [productId, product] as const;
        } catch {
          return [productId, {
            id: productId,
            name: `Product ${productId}`,
            description: "",
            shortDescription: "",
            brand: "",
            brandSlug: "",
            category: "Unknown",
            categorySlug: "unknown",
            price: 0,
            images: [],
            featured: false,
            specifications: {},
            variants: [],
          } as Product] as const;
        }
      }),
    )
      .then((results) => {
        if (!isActive) {
          return;
        }

        setFetchedProducts((current) => ({
          ...current,
          ...Object.fromEntries(results),
        }));
      })
      .catch(() => {
        // ignore fetch failures; cart can still render placeholders
      });

    return () => {
      isActive = false;
    };
  }, [products, state.items, fetchedProducts]);

  const addToCart = useCallback(
    (productId: string, quantity: number = 1, variant?: ProductVariant | null) => {
      const currentPhone = getCurrentPhoneNumber();
      if (!currentPhone) {
        pendingCartAddRef.current = { productId, quantity, variant };
        setPhoneInput("");
        setPhoneError("");
        setIsPhonePromptOpen(true);
        return;
      }

      const requestedQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
      const variantKey = variant ? String(variant.variant_id ?? `${productId}-${variant.variant_type}-${variant.variant_value}`) : "base";
      const quantityInCart = state.items.find((item) => item.productId === productId && (item.variantId ?? "base") === variantKey)?.quantity ?? 0;

      if (variant) {
        const variantStock = Number(variant.stock ?? 0);
        if (variantStock <= 0 || quantityInCart + requestedQuantity > variantStock) {
          return;
        }
      }

      const product = products.find((item) => item.id === productId);
      if (typeof product?.quantity === "number") {
        if (product.quantity <= 0 || quantityInCart + requestedQuantity > product.quantity) {
          return;
        }
      }

      void addCartItemToApi(currentPhone, productId, requestedQuantity, variant).then(async (apiAdded) => {
        if (apiAdded) {
          const refreshedItems = await refreshCartFromApi(currentPhone);
          savePhoneCart(currentPhone, refreshedItems);
        }
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:add", { detail: { productId, quantity: requestedQuantity } }));
      }
    },
    [products, refreshCartFromApi, state.items],
  );

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    const currentPhone = getCurrentPhoneNumber();

    if (currentPhone) {
      void removeCartItemFromApi(currentPhone, productId, variantId).then(async (ok) => {
        if (ok) {
          const refreshedItems = await refreshCartFromApi(currentPhone);
          savePhoneCart(currentPhone, refreshedItems);
        }
      });
      return;
    }

    const nextItems = state.items.filter((item) => !(item.productId === productId && (item.variantId ?? "base") === (variantId ?? "base")));
    dispatch({ type: "hydrate", items: nextItems });
  }, [refreshCartFromApi, state.items]);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    const currentPhone = getCurrentPhoneNumber();
    const sanitizedQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

    if (!currentPhone) {
      const nextItems = state.items.map((item) =>
        item.productId === productId && (item.variantId ?? "base") === (variantId ?? "base")
          ? { ...item, quantity: sanitizedQuantity }
          : item,
      );
      dispatch({ type: "hydrate", items: nextItems });
      return;
    }

    void updateCartItemQuantityInApi(currentPhone, productId, sanitizedQuantity, variantId).then(async (ok) => {
      if (ok) {
        const refreshedItems = await refreshCartFromApi(currentPhone);
        savePhoneCart(currentPhone, refreshedItems);
      }
    });
  }, [refreshCartFromApi, state.items]);

  const clearCart = useCallback(() => {
    const currentPhone = getCurrentPhoneNumber();
    dispatch({ type: "hydrate", items: [] });

    if (currentPhone) {
      savePhoneCart(currentPhone, []);
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
  }, []);

  const handlePhoneSubmit = useCallback(() => {
    const digits = normalizePhoneNumber(phoneInput);

    if (!isValidIndianMobileNumber(digits) || digits.length !== 10) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const normalizedPhone = formatPhoneNumber(digits);
    sessionStorage.setItem(WHATSAPP_PHONE_KEY, normalizedPhone);

    const pendingAdd = pendingCartAddRef.current;

    const finalizeCart = async () => {
      const fetchedItems = await refreshCartFromApi(normalizedPhone);
      dispatch({ type: "hydrate", items: fetchedItems });
      savePhoneCart(normalizedPhone, fetchedItems);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(fetchedItems));
      setPhoneInput("");
      setPhoneError("");
      setIsPhonePromptOpen(false);
      pendingCartAddRef.current = null;

      if (pendingAdd && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:add", { detail: { productId: pendingAdd.productId, quantity: pendingAdd.quantity } }));
      }
    };

    if (pendingAdd) {
      void addCartItemToApi(normalizedPhone, pendingAdd.productId, pendingAdd.quantity, pendingAdd.variant).then(() => {
        void finalizeCart();
      });
      return;
    }

    void finalizeCart();
  }, [phoneInput, refreshCartFromApi]);

  const productsInCart = useMemo(() => {
    const productMap = new Map<string, Product>();

    for (const product of products) {
      productMap.set(product.id, product);
    }

    for (const [productId, product] of Object.entries(fetchedProducts)) {
      if (!productMap.has(productId)) {
        productMap.set(productId, product);
      }
    }

    const entries: Array<{ product: Product; quantity: number; variant?: ProductVariant }> = [];

    for (const item of state.items) {
      const product = productMap.get(item.productId) ?? {
        id: item.productId,
        name: `Product ${item.productId}`,
        description: "",
        shortDescription: "",
        brand: "",
        brandSlug: "",
        category: "Unknown",
        categorySlug: "unknown",
        price: item.price ?? 0,
        images: [],
        featured: false,
        specifications: {},
        variants: [],
      };

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
  }, [state.items, products, fetchedProducts]);

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

  return (
    <CartContext.Provider value={value}>
      {children}
      {isPhonePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-lg font-semibold text-slate-900">Please enter your WhatsApp mobile number to add to cart.</p>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-sm font-medium text-slate-700">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                value={phoneInput}
                maxLength={10}
                onChange={(event) => {
                  const digits = normalizePhoneNumber(event.target.value);
                  setPhoneInput(digits);
                  if (phoneError) {
                    setPhoneError("");
                  }
                }}
                className="w-full border-0 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="9876543210"
              />
            </div>

            {phoneError ? <p className="mt-2 text-sm text-red-600">{phoneError}</p> : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhoneError("");
                  setPhoneInput("");
                  setIsPhonePromptOpen(false);
                  pendingCartAddRef.current = null;
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePhoneSubmit}
                disabled={phoneInput.length !== 10}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};
