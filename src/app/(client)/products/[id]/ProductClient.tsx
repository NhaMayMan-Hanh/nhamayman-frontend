"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@contexts/CartContext";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import ProductInfo from "@components/client/product/ProductInfo";
import QuantitySelector from "@components/client/product/QuantitySelector";
import AddToCartButton from "@components/client/product/AddToCartButton";
import BuyNowButton from "@components/client/product/BuyNowButton";
import RelatedProducts from "@components/client/product/RelatedProducts";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  detailedDescription?: string;
  stock: number;
  category: string;
}

interface ProductClientProps {
  initialData: {
    product: Product;
    relatedProducts: Array<{
      _id: string;
      name: string;
      price: number;
      image: string;
    }>;
  };
}

export default function ProductClient({ initialData }: ProductClientProps) {
  const router = useRouter();
  const { addToCart, loading: cartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const product = initialData.product;
  const isOutOfStock = product.stock < 1;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    if (quantity > product.stock) {
      toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho`);
      return;
    }

    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
      setQuantity(1);
    } catch (err) {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <nav className="flex mb-8 text-sm text-gray-600">
        <Link href="/" className="hover:text-amber-500">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Hình ảnh */}
        <div className="relative w-full h-8/12 rounded-xl shadow-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
            priority
          />
          {isOutOfStock && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg">
              Hết hàng
            </div>
          )}
        </div>

        {/* Thông tin */}
        <div className="space-y-2">
          <ProductInfo product={product} />

          <QuantitySelector
            quantity={quantity}
            setQuantity={setQuantity}
            max={product.stock}
            disabled={isOutOfStock || cartLoading}
          />

          <div className="flex flex-col gap-3">
            <AddToCartButton
              onClick={handleAddToCart}
              loading={cartLoading}
              disabled={isOutOfStock}
            />
            {!isOutOfStock && <BuyNowButton onClick={handleBuyNow} disabled={cartLoading} />}
          </div>
        </div>
      </div>

      {/* Mô tả chi tiết */}
      {product.detailedDescription && (
        <div
          className="bg-white rounded-xl shadow-md p-8 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: product.detailedDescription }}
        />
      )}

      {/* Sản phẩm liên quan */}
      {initialData.relatedProducts.length > 0 && (
        <RelatedProducts products={initialData.relatedProducts} />
      )}
    </div>
  );
}
