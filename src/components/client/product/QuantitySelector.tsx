"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  max: number;
  disabled?: boolean;
}

export default function QuantitySelector({
  quantity,
  setQuantity,
  max,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      setQuantity(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= max) {
      setQuantity(value);
    }
  };

  const isMaxReached = quantity >= max;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Số lượng:</label>
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrease}
          disabled={disabled || quantity <= 1}
          className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={20} />
        </button>

        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          min={1}
          max={max}
          className="w-15 text-center border-2 border-gray-300 rounded-lg py-2 font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        <button
          onClick={handleIncrease}
          disabled={disabled || isMaxReached}
          className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={isMaxReached ? "Đã đạt số lượng tối đa" : "Tăng số lượng"}
        >
          <Plus size={20} />
        </button>
      </div>

      {max > 0 && (
        <p className="text-sm text-gray-600">
          Tối đa: <span className="font-semibold text-orange-500">{max}</span> sản phẩm
        </p>
      )}

      {isMaxReached && max > 0 && (
        <p className="text-sm text-red-500 font-semibold">⚠️ Đã đạt số lượng tối đa có thể thêm</p>
      )}
    </div>
  );
}
