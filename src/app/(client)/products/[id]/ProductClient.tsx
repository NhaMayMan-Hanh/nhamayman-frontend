"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@contexts/CartContext";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Star, MessageCircle } from "lucide-react";
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
  const [showAllComments, setShowAllComments] = useState(false);

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

  const sampleComments = [
    {
      id: 1,
      user: "Nhà May Mắn",
      avatar: "/img/avatars/user1.jpg",
      rating: 5,
      content: "Nhà May Mắn cảm ơn quý khách",
      date: "2025-04-15",
      helpful: 12,
    },
  ];

  const displayedComments = showAllComments ? sampleComments : sampleComments.slice(0, 3);

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
        <div className="relative w-full h-[300px] md:h-[500px] rounded-xl shadow-lg overflow-hidden">
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

      {/* === PHẦN BÌNH LUẬN MỚI === */}
      <div className="mt-16 border-t pt-10">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold">Đánh giá & Bình luận</h2>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
            1 đánh giá
          </span>
        </div>

        {/* Form bình luận (tạm disable) */}
        <div className="bg-gray-50 rounded-xl p-6 mb-10">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 border-2 border-dashed" />
            <div className="flex-1 space-y-4">
              <textarea
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                disabled
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-amber-600 font-medium">
                  Tính năng bình luận đang được phát triển
                </p>
                <button
                  disabled
                  className="px-8 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60"
                >
                  Gửi bình luận
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách bình luận */}
        <div className="space-y-6">
          {displayedComments.map((comment) => (
            <div key={comment.id} className="flex gap-4 pb-6 border-b last:border-0">
              <div className="w-12 h-12 rounded-full bg-gray-200 border flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{comment.user}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-500">
                        {[...Array(comment.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{comment.date}</span>
                    </div>
                  </div>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    Hữu ích ({comment.helpful})
                  </button>
                </div>
                <p className="mt-3 text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Nút xem thêm */}
        {sampleComments.length > 3 && !showAllComments && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAllComments(true)}
              className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition"
            >
              Xem thêm bình luận
            </button>
          </div>
        )}

        {showAllComments && (
          <p className="text-center text-gray-500 mt-6 text-sm">Đã hiển thị tất cả bình luận</p>
        )}
      </div>

      {/* Sản phẩm liên quan */}
      {initialData.relatedProducts.length > 0 && (
        <RelatedProducts products={initialData.relatedProducts} />
      )}
    </div>
  );
}
