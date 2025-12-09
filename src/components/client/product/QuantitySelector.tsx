import { Plus, Minus } from "lucide-react";

interface Props {
   quantity: number;
   setQuantity: (q: number) => void;
   max: number;
   disabled?: boolean;
}

export default function QuantitySelector({
   quantity,
   setQuantity,
   max,
   disabled,
}: Props) {
   return (
      <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng
         </label>
         <div className="flex items-center gap-3">
            <button
               onClick={() => setQuantity(Math.max(1, quantity - 1))}
               disabled={disabled || quantity <= 1}
               className="flex justify-center items-center w-10 h-10 border rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
               <Minus size={20} />
            </button>
            <input
               type="number"
               value={quantity}
               onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(max, Math.max(1, val)));
               }}
               className="w-24 text-center border rounded-lg py-2"
               min="1"
               max={max}
            />
            <button
               onClick={() => setQuantity(Math.min(max, quantity + 1))}
               disabled={disabled || quantity >= max}
               className="flex justify-center items-center w-10 h-10 border rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
               <Plus size={20} />
            </button>
         </div>
         <p className="text-sm text-gray-500 mt-1">Còn lại: {max} sản phẩm</p>
      </div>
   );
}
