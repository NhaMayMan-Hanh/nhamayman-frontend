"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number; // Thêm stock để validate
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  removeMultipleItems: (ids: string[]) => Promise<void>;
  loading: boolean;
  refreshCart: () => Promise<void>;
  resetToGuestCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const hasMergedRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Toast batching refs
  const addToCartCountRef = useRef(0);
  const addToCartQuantityRef = useRef(0);
  const addToCartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeToastRef = useRef<string | null>(null);
  const clearCartInProgressRef = useRef(false);

  // Remove from cart toast batching
  const removeFromCartCountRef = useRef(0);
  const removeFromCartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeRemoveToastRef = useRef<string | null>(null);

  // Debounce/throttle for add to cart
  const pendingAddToCartRef = useRef<Map<string, number>>(new Map());
  const addToCartDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // ===== STOCK VALIDATION HELPER =====
  const validateStock = async (productId: string, requestedQuantity: number): Promise<boolean> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/client/products/id/${productId}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!data.success) {
        toast.error("Không thể kiểm tra tồn kho");
        return false;
      }

      const product = data.data.product;
      const currentCartItem = cart.find((item) => item._id === productId);
      const currentQuantityInCart = currentCartItem?.quantity || 0;
      const totalQuantity = currentQuantityInCart + requestedQuantity;

      if (product.stock < totalQuantity) {
        toast.error(
          `"${product.name}" chỉ còn ${product.stock} sản phẩm (giỏ hàng đã có ${currentQuantityInCart})`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Validate stock error:", error);
      toast.error("Không thể kiểm tra tồn kho");
      return false;
    }
  };

  const refreshCart = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/cart`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setCart(data.data.items || []);
      } else {
        console.error("Failed to fetch cart:", data.message);
        setCart([]);
      }
    } catch (error) {
      console.error("Refresh cart error:", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const showAddToCartToast = useCallback((quantityAdded: number) => {
    if (addToCartTimerRef.current) {
      clearTimeout(addToCartTimerRef.current);
    }

    addToCartCountRef.current += 1;
    addToCartQuantityRef.current += quantityAdded;

    if (activeToastRef.current) {
      toast.dismiss(activeToastRef.current);
    }

    addToCartTimerRef.current = setTimeout(() => {
      const totalQuantity = addToCartQuantityRef.current;

      if (totalQuantity === 1) {
        activeToastRef.current = toast.success("Đã thêm vào giỏ hàng");
      } else {
        activeToastRef.current = toast.success(`Đã thêm ${totalQuantity} sản phẩm vào giỏ hàng`, {
          icon: "🛒",
        });
      }

      addToCartCountRef.current = 0;
      addToCartQuantityRef.current = 0;
      addToCartTimerRef.current = null;
    }, 500);
  }, []);

  const showRemoveFromCartToast = useCallback(() => {
    if (removeFromCartTimerRef.current) {
      clearTimeout(removeFromCartTimerRef.current);
    }

    removeFromCartCountRef.current += 1;

    if (activeRemoveToastRef.current) {
      toast.dismiss(activeRemoveToastRef.current);
    }

    removeFromCartTimerRef.current = setTimeout(() => {
      const count = removeFromCartCountRef.current;

      if (count === 1) {
        activeRemoveToastRef.current = toast.success("Đã xóa khỏi giỏ hàng");
      } else {
        activeRemoveToastRef.current = toast.success(`Đã xóa ${count} sản phẩm khỏi giỏ hàng`, {
          icon: "🗑️",
        });
      }

      removeFromCartCountRef.current = 0;
      removeFromCartTimerRef.current = null;
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (addToCartTimerRef.current) clearTimeout(addToCartTimerRef.current);
      if (removeFromCartTimerRef.current) clearTimeout(removeFromCartTimerRef.current);
      if (addToCartDebounceRef.current) clearTimeout(addToCartDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (user) {
      refreshCart();
    } else {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error("Error parsing saved cart:", error);
          localStorage.removeItem("cart");
        }
      }
    }
  }, [user, authLoading, refreshCart]);

  useEffect(() => {
    if (user && !hasMergedRef.current && !authLoading) {
      const savedLocal = localStorage.getItem("cart");
      if (savedLocal) {
        try {
          const localCart = JSON.parse(savedLocal);
          if (localCart.length > 0) {
            mergeLocalToServer(localCart);
          }
        } catch (error) {
          console.error("Error parsing local cart for merge:", error);
        }
      }
      hasMergedRef.current = true;
    }

    if (!user && !authLoading && hasMergedRef.current) {
      resetToGuestCart();
      hasMergedRef.current = false;
      hasInitializedRef.current = false;
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user && !authLoading) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user, authLoading]);

  const mergeLocalToServer = async (localItems: CartItem[]) => {
    setLoading(true);
    try {
      const serverRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/cart`, {
        credentials: "include",
      });
      const serverData = await serverRes.json();

      if (!serverData.success) {
        throw new Error(serverData.message || "Failed to fetch server cart");
      }

      const serverItems = serverData.data.items || [];

      const mergePromises = localItems.map(async (localItem) => {
        const existing = serverItems.find((item: CartItem) => item._id === localItem._id);

        if (existing) {
          const newQuantity = existing.quantity + localItem.quantity;
          return updateCartItemOnServer(localItem._id, newQuantity);
        } else {
          return addToCartOnServer(localItem);
        }
      });

      await Promise.all(mergePromises);
      localStorage.removeItem("cart");
      await refreshCart();
      toast.success("Đã đồng bộ giỏ hàng");
      window.dispatchEvent(new Event("cart-merged"));
    } catch (error) {
      console.error("Merge cart error:", error);
      toast.error("Lỗi khi đồng bộ giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const addToCartOnServer = async (product: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/cart`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product._id,
        quantity: product.quantity || 1,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to add to cart");
    }
    return data;
  };

  const updateCartItemOnServer = async (productId: string, quantity: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/cart`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to update cart");
    }
    return data;
  };

  const processPendingAddToCart = useCallback(async () => {
    if (pendingAddToCartRef.current.size === 0) return;

    const itemsToAdd = Array.from(pendingAddToCartRef.current.entries());
    pendingAddToCartRef.current.clear();

    setLoading(true);
    try {
      const promises = itemsToAdd.map(([productId, quantity]) => {
        const product = cart.find((item) => item._id === productId);
        return addToCartOnServer({
          _id: productId,
          ...(product || {}),
          quantity,
        });
      });

      const results = await Promise.all(promises);

      const lastResult = results[results.length - 1];
      if (lastResult.success && lastResult.data?.items) {
        setCart(lastResult.data.items);
      }
    } catch (error: any) {
      console.error("Batch add to cart error:", error);
      toast.error(error.message || "Lỗi khi thêm vào giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [cart]);

  // ===== UPDATED: Add to cart với stock validation =====
  const addToCart = async (product: any) => {
    const quantityToAdd = product.quantity || 1;

    // Validate stock trước khi thêm
    if (user) {
      const isValid = await validateStock(product._id, quantityToAdd);
      if (!isValid) return;
    } else {
      // Guest cart: validate với stock từ product
      const currentItem = cart.find((item) => item._id === product._id);
      const currentQuantity = currentItem?.quantity || 0;
      const totalQuantity = currentQuantity + quantityToAdd;

      if (product.stock && product.stock < totalQuantity) {
        toast.error(
          `"${product.name}" chỉ còn ${product.stock} sản phẩm (giỏ hàng đã có ${currentQuantity})`
        );
        return;
      }
    }

    if (user) {
      const optimisticCart = [...cart];
      const existing = cart.find((item) => item._id === product._id);

      // Update UI optimistically
      if (existing) {
        setCart((prev) =>
          prev.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + quantityToAdd } : item
          )
        );
      } else {
        setCart((prev) => [...prev, { ...product, quantity: quantityToAdd }]);
      }

      showAddToCartToast(quantityToAdd);

      // Batch API calls
      const currentPending = pendingAddToCartRef.current.get(product._id) || 0;
      pendingAddToCartRef.current.set(product._id, currentPending + quantityToAdd);

      if (addToCartDebounceRef.current) {
        clearTimeout(addToCartDebounceRef.current);
      }

      addToCartDebounceRef.current = setTimeout(() => {
        processPendingAddToCart();
      }, 300);
    } else {
      // Guest cart
      setCart((prev) => {
        const existing = prev.find((item) => item._id === product._id);
        if (existing) {
          return prev.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + quantityToAdd } : item
          );
        }
        return [...prev, { ...product, quantity: quantityToAdd }];
      });

      showAddToCartToast(quantityToAdd);
    }
  };

  const removeFromCart = async (id: string) => {
    if (user) {
      const optimisticCart = [...cart];
      setCart((prev) => prev.filter((item) => item._id !== id));

      showRemoveFromCartToast();

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/cart/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to remove from cart");
        }
      } catch (error: any) {
        setCart(optimisticCart);
        console.error("Remove from cart error:", error);
        toast.error(error.message || "Lỗi khi xóa khỏi giỏ hàng");
      }
    } else {
      setCart((prev) => prev.filter((item) => item._id !== id));
      showRemoveFromCartToast();
    }
  };

  const removeMultipleItems = async (ids: string[]) => {
    if (ids.length === 0) return;

    if (user) {
      const optimisticCart = [...cart];
      setCart((prev) => prev.filter((item) => !ids.includes(item._id)));

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/cart/batch-delete`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: ids }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success(`Đã xóa ${ids.length} sản phẩm khỏi giỏ hàng`);
          if (data.data?.items) {
            setCart(data.data.items);
          }
        } else {
          throw new Error(data.message || "Failed to remove items");
        }
      } catch (error: any) {
        setCart(optimisticCart);
        console.error("Remove multiple items error:", error);
        toast.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng");
      }
    } else {
      setCart((prev) => prev.filter((item) => !ids.includes(item._id)));
      toast.success(`Đã xóa ${ids.length} sản phẩm khỏi giỏ hàng`);
    }
  };

  // ===== UPDATED: Update quantity với stock validation =====
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(id);
      return;
    }

    const currentItem = cart.find((item) => item._id === id);
    if (!currentItem) return;

    const quantityDiff = quantity - currentItem.quantity;

    // Validate stock nếu tăng số lượng
    if (quantityDiff > 0) {
      if (user) {
        const isValid = await validateStock(id, quantityDiff);
        if (!isValid) return;
      } else {
        // Guest cart
        if (currentItem.stock && currentItem.stock < quantity) {
          toast.error(`"${currentItem.name}" chỉ còn ${currentItem.stock} sản phẩm`);
          return;
        }
      }
    }

    if (user) {
      const optimisticCart = [...cart];
      setCart((prev) => prev.map((item) => (item._id === id ? { ...item, quantity } : item)));

      try {
        await updateCartItemOnServer(id, quantity);
      } catch (error: any) {
        setCart(optimisticCart);
        console.error("Update quantity error:", error);
        toast.error(error.message || "Lỗi khi cập nhật số lượng");
      }
    } else {
      setCart((prev) => prev.map((item) => (item._id === id ? { ...item, quantity } : item)));
    }
  };

  const clearCart = async () => {
    if (clearCartInProgressRef.current) return;

    clearCartInProgressRef.current = true;

    if (user) {
      const optimisticCart = [...cart];
      setCart([]);

      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/cart`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          toast.success("Đã xóa giỏ hàng");
        } else {
          throw new Error(data.message || "Failed to clear cart");
        }
      } catch (error: any) {
        setCart(optimisticCart);
        console.error("Clear cart error:", error);
        toast.error(error.message || "Lỗi khi xóa giỏ hàng");
      } finally {
        setLoading(false);
        setTimeout(() => {
          clearCartInProgressRef.current = false;
        }, 1000);
      }
    } else {
      setCart([]);
      localStorage.removeItem("cart");
      toast.success("Đã xóa giỏ hàng");
      setTimeout(() => {
        clearCartInProgressRef.current = false;
      }, 1000);
    }
  };

  const resetToGuestCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing saved cart:", error);
        setCart([]);
      }
    } else {
      setCart([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        removeMultipleItems,
        loading,
        refreshCart,
        resetToGuestCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
