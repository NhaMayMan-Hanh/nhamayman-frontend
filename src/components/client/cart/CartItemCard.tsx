"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@contexts/CartContext";
import { Trash2, Minus, Plus } from "lucide-react";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartItemCardProps {
  item: CartItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
}

export default function CartItemCard({
  item,
  isSelected,
  onToggleSelect,
  onDelete,
}: CartItemCardProps) {
  const { updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  const [productStock, setProductStock] = useState<number | null>(null);

  // Fetch stock khi component mount
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/products/${item._id}`);
        const data = await res.json();
        if (data.success) {
          setProductStock(data.data.product.stock);
        }
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };

    fetchStock();
  }, [item._id]);

  // Sync local quantity với cart item
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleIncrease = () => {
    const newQuantity = quantity + 1;

    // Validate stock
    if (productStock !== null && newQuantity > productStock) {
      return; // Không cho tăng nếu vượt stock
    }

    setQuantity(newQuantity);
    updateQuantity(item._id, newQuantity);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateQuantity(item._id, newQuantity);
    }
  };

  const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const isMaxStock = productStock !== null && quantity >= productStock;

  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-300 hover:shadow-md transition-shadow">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="w-5 h-5 mt-1 cursor-pointer"
      />

      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded-md"
          sizes="96px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.name}</h3>
        <p className="text-orange-500 font-bold mb-2">{formatPrice(item.price)} VNĐ</p>

        {/* Stock info */}
        {productStock !== null && (
          <p className="text-sm text-gray-500 mb-2">
            Còn lại: <span className="font-semibold">{productStock}</span> sản phẩm
          </p>
        )}

        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrease}
            disabled={quantity <= 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={16} />
          </button>

          <input
            type="number"
            value={quantity}
            readOnly
            className="w-16 text-center border border-gray-300 rounded-md py-1"
          />

          <button
            onClick={handleIncrease}
            disabled={isMaxStock}
            className="w-8 h-8 flex items-center justify-center border border-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isMaxStock ? "Đã đạt số lượng tối đa" : "Tăng số lượng"}
          >
            <Plus size={16} />
          </button>
        </div>

        {isMaxStock && <p className="text-xs text-red-500 mt-1">Đã đạt số lượng tối đa</p>}
      </div>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="text-red-500 hover:text-red-700 p-2 h-fit"
        title="Xóa sản phẩm"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
