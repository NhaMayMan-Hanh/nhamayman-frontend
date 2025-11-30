"use client";

import { useCart } from "@contexts/CartContext";
import { useAuth } from "@contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import CartHeader from "@components/client/cart/CartHeader";
import CartItemCard from "@components/client/cart/CartItemCard";
import CartSummary from "@components/client/cart/CartSummary";
import EmptyCart from "@components/client/cart/EmptyCart";
import DeleteConfirmModal from "@components/client/cart/DeleteConfirmModal";

export default function CartClient() {
  const router = useRouter();
  const { cart, loading: cartLoading, removeFromCart, removeMultipleItems, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "selected" | "all">("all");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const isAllSelected = selectedItems.length === cart.length && cart.length > 0;

  // Tự động chọn tất cả khi giỏ thay đổi
  useEffect(() => {
    if (cart.length > 0 && selectedItems.length === 0) {
      setTimeout(() => setSelectedItems(cart.map((i) => i._id)), 0);
    }
  }, [cart.length]);

  if (cartLoading || authLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return <EmptyCart />;
  }

  const selectedCartItems = cart.filter((item) => selectedItems.includes(item._id));
  const total = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }

    const checkoutData = selectedCartItems.map((item) => ({
      _id: item._id,
      ten_sp: item.name,
      gia_mua: item.price,
      hinh: item.image,
      so_luong: item.quantity,
      giam_gia_sp: 0,
    }));

    localStorage.setItem("checkout_items", JSON.stringify(checkoutData));

    if (!user) {
      toast("Vui lòng đăng nhập để thanh toán");
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const openDeleteModal = (mode: "single" | "selected" | "all", itemId?: string) => {
    setDeleteMode(mode);
    setItemToDelete(itemId || null);
    setShowDeleteModal(true);
  };

  // ✅ FIX: Gọi removeMultipleItems() thay vì loop
  const handleConfirmDelete = async () => {
    try {
      if (deleteMode === "single" && itemToDelete) {
        await removeFromCart(itemToDelete);
        setSelectedItems((prev) => prev.filter((id) => id !== itemToDelete));
      } else if (deleteMode === "selected" && selectedItems.length > 0) {
        // ✅ Gọi 1 lần duy nhất với array IDs
        await removeMultipleItems(selectedItems);
        setSelectedItems([]);
      } else if (deleteMode === "all") {
        await clearCart();
        setSelectedItems([]);
      }
    } catch (err) {
      toast.error("Xóa thất bại");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-12 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2 space-y-4">
          <CartHeader
            selectedCount={selectedItems.length}
            totalCount={cart.length}
            onSelectAll={() => {
              setSelectedItems(isAllSelected ? [] : cart.map((i) => i._id));
            }}
            onDeleteSelected={() => openDeleteModal("selected")}
            isAllSelected={isAllSelected}
            hasSelected={selectedItems.length > 0}
          />

          {cart.map((item) => (
            <CartItemCard
              key={item._id}
              item={item}
              isSelected={selectedItems.includes(item._id)}
              onToggleSelect={() => {
                setSelectedItems((prev) =>
                  prev.includes(item._id)
                    ? prev.filter((id) => id !== item._id)
                    : [...prev, item._id]
                );
              }}
              onDelete={() => openDeleteModal("single", item._id)}
            />
          ))}
        </div>

        {/* Tóm tắt */}
        <div className="lg:col-span-1">
          <CartSummary
            selectedCount={selectedItems.length}
            total={total}
            onCheckout={handleCheckout}
            disabled={selectedItems.length === 0}
          />
        </div>
      </div>
      <DeleteConfirmModal
        open={showDeleteModal}
        mode={deleteMode}
        itemCount={
          deleteMode === "single"
            ? 1
            : deleteMode === "selected"
            ? selectedItems.length
            : cart.length
        }
        itemId={itemToDelete}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
