// src/components/client/product/ProductInfo.tsx
import { Package, Tag } from "lucide-react";

interface Product {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  detailedDescription?: string;
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const isOutOfStock = product.stock < 1;

  const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

      {/* Category Badge */}
      <div className="flex items-center gap-3 mb-5">
        <Tag size={20} className="text-gray-500" />
        <span className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
          {product.category}
        </span>
      </div>

      {/* Mô tả ngắn */}
      <p className="text-gray-600 text-lg leading-relaxed mb-8">{product.description}</p>

      {/* Giá */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-8">
        <p className="text-sm text-amber-700 font-medium mb-1">Giá sản phẩm</p>
        <p className="text-4xl font-bold text-amber-600">{formatPrice(product.price)} VNĐ</p>
      </div>

      {/* Tồn kho */}
      <div className="flex items-center gap-3 text-lg">
        <Package size={22} className="text-gray-500" />
        <span className="text-gray-600">Tồn kho:</span>
        <span className={`font-bold ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
          {product.stock} sản phẩm
        </span>
        {isOutOfStock && (
          <span className="ml-3 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
            Hết hàng
          </span>
        )}
      </div>
    </>
  );
}
