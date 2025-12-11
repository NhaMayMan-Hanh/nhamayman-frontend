"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@contexts/CartContext";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
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
  const { addToCart, loading: cartLoading, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const product = initialData.product;
  const isOutOfStock = product.stock < 1;

  // Kiểm tra số lượng trong giỏ
  const currentCartItem = cart.find((item) => item._id === product._id);
  const quantityInCart = currentCartItem?.quantity || 0;
  const maxAvailable = product.stock - quantityInCart;

  // Validate quantity khi user thay đổi
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > maxAvailable) {
      toast.error(
        `Chỉ có thể thêm tối đa ${maxAvailable} sản phẩm (giỏ hàng đã có ${quantityInCart})`
      );
      setQuantity(maxAvailable > 0 ? maxAvailable : 1);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (quantity > maxAvailable) {
      toast.error("Số lượng vượt quá tồn kho!");
      return;
    }

    try {
      await addToCart({ ...product, quantity, stock: product.stock });
      setQuantity(1);
    } catch (err) {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    if (quantity > maxAvailable) {
      toast.error("Số lượng vượt quá tồn kho!");
      return;
    }

    await handleAddToCart();
    router.push("/cart");
  };

  const absoluteImage =
    typeof window !== "undefined" && product.image.startsWith("http")
      ? product.image
      : `https://nhamayman-hanh.io.vn${product.image}`;

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      {/* Structured Data */}
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
              priceValidUntil: "2026-12-31",
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
          {/* Image */}
          <div className="relative bg-white w-full h-[300px] md:h-[500px] rounded-xl shadow-lg overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
              priority
            />

            {isOutOfStock && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg">
                Hết hàng
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-2">
            <ProductInfo product={product} />

            {/* Stock warning */}
            {!isOutOfStock && quantityInCart > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                {/* <p className="text-sm text-blue-800">
                  <span className="font-semibold">Còn lại:</span> {product.stock} sản phẩm
                </p> */}
                {quantityInCart > 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    <span className="font-semibold">Trong giỏ:</span> {quantityInCart} sản phẩm
                  </p>
                )}
                {maxAvailable <= 5 && maxAvailable > 0 && (
                  <p className="text-sm text-red-600 mt-1 font-semibold">
                    ⚠️ Chỉ có thể thêm tối đa {maxAvailable} sản phẩm nữa
                  </p>
                )}
              </div>
            )}

            <QuantitySelector
              quantity={quantity}
              setQuantity={handleQuantityChange}
              max={maxAvailable > 0 ? maxAvailable : 0}
              disabled={isOutOfStock || cartLoading || maxAvailable <= 0}
            />

            <div className="flex flex-col gap-3">
              <AddToCartButton
                onClick={handleAddToCart}
                loading={cartLoading}
                disabled={isOutOfStock || maxAvailable <= 0}
              />
              {!isOutOfStock && maxAvailable > 0 && (
                <BuyNowButton onClick={handleBuyNow} disabled={cartLoading} />
              )}
            </div>

            {maxAvailable <= 0 && !isOutOfStock && (
              <p className="text-red-500 text-sm text-center font-semibold">
                Bạn đã thêm đủ số lượng tồn kho vào giỏ hàng
              </p>
            )}
          </div>
        </div>

        {/* Detailed Description */}
        {product.detailedDescription && (
          <div
            className="bg-white rounded-xl shadow-md p-8 prose max-w-none mb-12 leading-7"
            dangerouslySetInnerHTML={{ __html: product.detailedDescription }}
          />
        )}

        {/* Reviews & Comments */}
        <ReviewSection productId={product._id} />
        <CommentSection productId={product._id} />

        {/* Related Products */}
        {initialData.relatedProducts.length > 0 && (
          <RelatedProducts products={initialData.relatedProducts} />
        )}
      </div>
    </>
  );
}
