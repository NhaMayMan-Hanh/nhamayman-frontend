"use client";

import Image from "next/image";
import { useCart } from "@contexts/CartContext";

interface CartItemCardProps {
  item: any;
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
  const { updateQuantity, loading } = useCart();

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white rounded-lg shadow transition-all ${
        isSelected ? "ring-2 ring-orange-500" : "hover:shadow-lg"
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="w-5 h-5 text-orange-500 rounded"
      />

      <div className="relative w-20 h-20 shrink-0">
        <Image src={item.image} alt={item.name} fill className="object-cover rounded-lg" />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 line-clamp-2">{item.name}</h3>
        <p className="text-orange-600 font-bold">{item.price.toLocaleString()}₫</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => updateQuantity(item._id, item.quantity - 1)}
            disabled={loading}
            className="px-3 py-1 hover:bg-gray-100"
          >
            −
          </button>
          <span className="px-4 py-1 font-semibold">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item._id, item.quantity + 1)}
            disabled={loading}
            className="px-3 py-1 hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <button onClick={onDelete} className="text-red-500 hover:bg-red-50 p-2 rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2.375 2.375 0 0116.138 21H7.862a2.375 2.375 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
