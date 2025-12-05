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
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 mb-2 line-clamp-2">
            {product.description.substring(0, 80)}...
          </p>
          <p className="text-amber-500 font-bold mb-2">{formatPrice(product.price)} VNĐ</p>{" "}
          <button
            onClick={handleAddToCart}
            className="w-full bg-button-g text-white py-2 px-2 md:px-4 rounded-lg transition-colors"
          >
            <span className="text-sm"> Thêm vào giỏ hàng</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
