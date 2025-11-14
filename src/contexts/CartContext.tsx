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

  // Memoize refreshCart to prevent unnecessary re-renders
  const refreshCart = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/client/cart", {
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

  // Initialize cart based on auth state
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

  // Merge local cart to server on login
  useEffect(() => {
    if (user && !hasMergedRef.current && !authLoading) {
      console.log("🔄 CartContext: User logged in, checking for merge...");
      const savedLocal = localStorage.getItem("cart");
      if (savedLocal) {
        try {
          const localCart = JSON.parse(savedLocal);
          if (localCart.length > 0) {
            mergeLocalToServer(localCart);
          }
        } catch (error) {
          console.error("❌ CartContext: Error parsing local cart for merge:", error);
        }
      } else {
        console.log("📭 CartContext: No local cart found");
      }
      hasMergedRef.current = true;
    }

    if (!user && !authLoading && hasMergedRef.current) {
      resetToGuestCart();
      hasMergedRef.current = false;
      hasInitializedRef.current = false;
    }
  }, [user, authLoading]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!user && !authLoading) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user, authLoading]);

  const mergeLocalToServer = async (localItems: CartItem[]) => {
    setLoading(true);
    try {
      const serverRes = await fetch("http://localhost:5000/api/client/cart", {
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
    const res = await fetch("http://localhost:5000/api/client/cart", {
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
    const res = await fetch("http://localhost:5000/api/client/cart", {
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

  const addToCart = async (product: any) => {
    if (user) {
      const optimisticCart = [...cart];
      const existing = cart.find((item) => item._id === product._id);

      if (existing) {
        setCart((prev) =>
          prev.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        setCart((prev) => [...prev, { ...product, quantity: 1 }]);
      }

      setLoading(true);
      try {
        await addToCartOnServer({ ...product, quantity: 1 });
        await refreshCart();
        toast.success("Đã thêm vào giỏ hàng");
      } catch (error: any) {
        setCart(optimisticCart);
        console.error("Add to cart error:", error);
        toast.error(error.message || "Lỗi khi thêm vào giỏ hàng");
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) => {
        const existing = prev.find((item) => item._id === product._id);
        if (existing) {
          return prev.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      toast.success("Đã thêm vào giỏ hàng");
    }
  };

  const removeFromCart = async (id: string) => {
    if (user) {
      const optimisticCart = [...cart];
      setCart((prev) => prev.filter((item) => item._id !== id));

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/client/cart/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          toast.success("Đã xóa khỏi giỏ hàng");
        } else {
          throw new Error(data.message || "Failed to remove from cart");
        }
      } catch (error: any) {
        setCart(optimisticCart);
        console.error("Remove from cart error:", error);
        toast.error(error.message || "Lỗi khi xóa khỏi giỏ hàng");
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) => prev.filter((item) => item._id !== id));
      toast.success("Đã xóa khỏi giỏ hàng");
    }
  };

  // New function to remove multiple items
  const removeMultipleItems = async (ids: string[]) => {
    if (user) {
      const optimisticCart = [...cart];
      setCart((prev) => prev.filter((item) => !ids.includes(item._id)));

      setLoading(true);
      try {
        // Remove items one by one from server
        const removePromises = ids.map((id) =>
          fetch(`http://localhost:5000/api/client/cart/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
        );

        const results = await Promise.all(removePromises);
        const allSuccess = results.every((res) => res.ok);

        if (allSuccess) {
          toast.success(`Đã xóa ${ids.length} sản phẩm khỏi giỏ hàng`);
        } else {
          throw new Error("Some items failed to remove");
        }
      } catch (error: any) {
        setCart(optimisticCart);
        console.error("Remove multiple items error:", error);
        toast.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng");
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) => prev.filter((item) => !ids.includes(item._id)));
      toast.success(`Đã xóa ${ids.length} sản phẩm khỏi giỏ hàng`);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(id);
      return;
    }

    if (user) {
      const optimisticCart = [...cart];
      setCart((prev) => prev.map((item) => (item._id === id ? { ...item, quantity } : item)));

      setLoading(true);
      try {
        await updateCartItemOnServer(id, quantity);
      } catch (error: any) {
        setCart(optimisticCart);
        console.error("Update quantity error:", error);
        toast.error(error.message || "Lỗi khi cập nhật số lượng");
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) => prev.map((item) => (item._id === id ? { ...item, quantity } : item)));
    }
  };

  const clearCart = async () => {
    if (user) {
      const optimisticCart = [...cart];
      setCart([]);

      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/client/cart", {
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
      }
    } else {
      setCart([]);
      localStorage.removeItem("cart");
      toast.success("Đã xóa giỏ hàng");
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
