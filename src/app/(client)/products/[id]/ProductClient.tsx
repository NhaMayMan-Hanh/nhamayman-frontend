"use client";

import { useState } from "react"; // useEffect không dùng nữa nên bỏ
import { useRouter } from "next/navigation";
import { useCart } from "@contexts/CartContext";
import { useAuth } from "@contexts/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script"; // Thêm để inject JSON-LD
import ProductInfo from "@components/client/product/ProductInfo";
import QuantitySelector from "@components/client/product/QuantitySelector";
import AddToCartButton from "@components/client/product/AddToCartButton";
import BuyNowButton from "@components/client/product/BuyNowButton";
import RelatedProducts from "@components/client/product/RelatedProducts";
import CommentSection from "@components/client/product/CommentSection";
import ReviewSection from "@components/client/product/ReviewSection";

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
  const { user } = useAuth();
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
      await addToCart({ ...product, quantity });
      toast.success("Đã thêm vào giỏ hàng!");
      setQuantity(1);
    } catch (err) {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  // Đảm bảo URL hình ảnh absolute cho JSON-LD
  const absoluteImage =
    typeof window !== "undefined" && product.image.startsWith("http")
      ? product.image
      : `https://nhamayman-hanh.io.vn${product.image}`;

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      {/* Structured Data - Product Schema */}
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: absoluteImage,
            description: product.description,
            sku: product._id,
            brand: {
              "@type": "Brand",
              name: "NhaMayMan",
            },
            offers: {
              "@type": "Offer",
              url: pageUrl,
              priceCurrency: "VND",
              price: product.price,
              priceValidUntil: "2026-12-31", // Có thể dynamic nếu có
              itemCondition: "https://schema.org/NewCondition",
              availability:
                product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />

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
            className="bg-white rounded-xl shadow-md p-8 prose max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: product.detailedDescription }}
          />
        )}

        {/* Đánh giá & Bình luận */}
        <ReviewSection productId={product._id} />
        <CommentSection productId={product._id} />

        {/* Sản phẩm liên quan */}
        {initialData.relatedProducts.length > 0 && (
          <RelatedProducts products={initialData.relatedProducts} />
        )}
      </div>
    </>
  );
}
