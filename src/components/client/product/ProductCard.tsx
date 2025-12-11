"use client";

import { useCart } from "@contexts/CartContext";
import AddToCartButton from "@components/client/product/AddToCartButton";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, loading: cartLoading, cart } = useCart();
  const isOutOfStock = product.stock < 1;

  // Kiểm tra số lượng hiện tại trong giỏ
  const currentCartItem = cart.find((item) => item._id === product._id);
  const quantityInCart = currentCartItem?.quantity || 0;
  const isMaxedOut = quantityInCart >= product.stock;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      return;
    }

    if (isMaxedOut) {
      return;
    }

    // Pass stock info để context validate
    await addToCart({
      ...product,
      quantity: 1,
      stock: product.stock,
    });
  };

  const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <Link href={`/products/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
        <div className="relative aspect-square bg-white">
          <Image
            fill
            src={product.image}
            alt={product.name}
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Stock badge */}
          {product.stock > 0 && product.stock <= 10 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Chỉ còn {product.stock}
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Hết hàng
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 mb-2 line-clamp-2">
            {product?.description?.substring(0, 80)}...
          </p>
          <p className="text-amber-500 font-bold mb-2">{formatPrice(product.price)} VNĐ</p>

          {/* Stock info */}
          {/* {!isOutOfStock && (
          
          )} */}
          <p className="text-sm text-gray-500 mb-2">
            Còn lại: <span className="font-semibold">{product.stock}</span> sản phẩm
            {/* {quantityInCart > 0 && (
                <span className="text-orange-500 ml-2">(Trong giỏ: {quantityInCart})</span>
              )} */}
          </p>

          <AddToCartButton onClick={handleAddToCart} disabled={isOutOfStock || isMaxedOut} />

          {/* {isMaxedOut && !isOutOfStock && (
            <p className="text-xs text-red-500 mt-1 text-center">Đã đạt số lượng tối đa</p>
          )} */}
        </div>
      </div>
    </Link>
  );
}
