// contexts/CartContext.tsx (Cập nhật - full merge on login, refresh on cart page)
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  loading: boolean;
  refreshCart: () => void; // Thêm method refresh
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load local on mount for guest
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [user]);

  // Save local on change for guest
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  // Merge local to server on login
  useEffect(() => {
    if (user && cart.length > 0) {
      mergeLocalToServer();
    }
  }, [user, cart.length]); // Dep on user and cart length

  const mergeLocalToServer = async () => {
    setLoading(true);
    try {
      // Fetch current server cart
      const serverRes = await fetch("http://localhost:5000/api/client/cart", {
        credentials: "include",
      });
      const serverData = await serverRes.json();
      if (!serverData.success) throw new Error("Lỗi khi lấy server cart");

      const serverItems = serverData.data.items || [];

      // Merge local
      for (const localItem of cart) {
        const existing = serverItems.find((item: CartItem) => item._id === localItem._id);
        if (existing) {
          // Update quantity
          const newQuantity = existing.quantity + localItem.quantity;
          await updateCartItemOnServer(localItem._id, newQuantity);
        } else {
          // Add new
          await addToCartOnServer({
            _id: localItem._id,
            ...localItem,
            quantity: localItem.quantity,
          });
        }
      }

      // Refresh local from server
      await refreshCart();
    } catch (error) {
      console.error("Merge cart error:", error);
      toast.error("Lỗi khi đồng bộ giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
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
        setCart([]);
      }
    } catch (error) {
      console.error("Refresh cart error:", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCartOnServer = async (product: any) => {
    await fetch("http://localhost:5000/api/client/cart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product._id, quantity: product.quantity }),
    });
  };

  const updateCartItemOnServer = async (productId: string, quantity: number) => {
    await fetch("http://localhost:5000/api/client/cart", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
  };

  const addToCart = async (product: any) => {
    if (user) {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/client/cart", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id, quantity: 1 }),
        });
        const data = await res.json();
        if (data.success) {
          await refreshCart(); // Refresh local
          toast.success("Đã thêm vào giỏ hàng");
        } else {
          toast.error(data.message || "Lỗi thêm giỏ hàng");
        }
      } catch (error) {
        toast.error("Lỗi kết nối");
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
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/client/cart/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          await refreshCart();
          toast.success("Đã xóa khỏi giỏ hàng");
        } else {
          toast.error(data.message || "Lỗi xóa giỏ hàng");
        }
      } catch (error) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) => prev.filter((item) => item._id !== id));
      toast.success("Đã xóa khỏi giỏ hàng");
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (user) {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/client/cart", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id, quantity }),
        });
        const data = await res.json();
        if (data.success) {
          await refreshCart();
        } else {
          toast.error(data.message || "Lỗi cập nhật giỏ hàng");
        }
      } catch (error) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) => prev.map((item) => (item._id === id ? { ...item, quantity } : item)));
    }
  };

  const clearCart = async () => {
    if (user) {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/client/cart", {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          await refreshCart();
          toast.success("Đã xóa giỏ hàng");
        } else {
          toast.error(data.message || "Lỗi xóa giỏ hàng");
        }
      } catch (error) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    } else {
      setCart([]);
      toast.success("Đã xóa giỏ hàng");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, loading, refreshCart }}
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
