"use client";

import { useCart } from "@contexts/CartContext";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn link navigate khi click button
    addToCart(product);
  };

  return (
    <Link href={`/products/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <Image
          width={300}
          height={300}
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 mb-2 line-clamp-2">
            {product.description.substring(0, 80)}...
          </p>
          <p className="text-amber-500 font-bold mb-2">{product.price.toLocaleString()} VNĐ</p>
          <button
            onClick={handleAddToCart}
            className="w-full bg-button-g text-white py-2 px-4 rounded-lg transition-colors"
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </Link>
  );
}
