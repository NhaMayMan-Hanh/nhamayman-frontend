"use client";

import { useState, useEffect } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, Package, Tag } from "lucide-react";
import { useCart } from "@contexts/CartContext";
import toast from "react-hot-toast";
import * as GA from "../../../../lib/services/googleAnalytics";

// Type definitions for product data returned by the API
interface Product {
  _id: string;
  name: string;
  image: string;
  category: string;
  description?: string;
  detailedDescription?: string;
  price: number;
  stock: number;
  // allow additional fields from the API without causing type errors
  [key: string]: any;
}

interface RelatedProduct {
  _id: string;
  name: string;
  image: string;
  price: number;
  [key: string]: any;
}

interface ProductData {
  success: boolean;
  message?: string;
  data: {
    product: Product;
    relatedProducts: RelatedProduct[];
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [productData, setProductData] = useState<ProductData["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/products/${id}`);
        if (!res.ok) throw new Error("Lỗi khi fetch sản phẩm");
        const result: ProductData = await res.json();
        if (result.success) {
          setProductData(result.data);
        } else setError(result.message || "Lỗi không xác định");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (productData?.product) GA.trackViewItem(productData.product);
  }, [productData]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (productData?.product.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!productData?.product) return;
    const product = productData.product;
    if (product.stock < 1) return toast.error("Sản phẩm đã hết hàng");
    if (quantity > product.stock) return toast.error(`Chỉ còn ${product.stock} sản phẩm`);

    for (let i = 0; i < quantity; i++) await addToCart(product);
    GA.trackAddToCart(product, quantity);
    setQuantity(1);
  };

  const handleBuyNow = async () => {
    if (!productData?.product) return;
    const product = productData.product;
    if (product.stock < 1) return toast.error("Sản phẩm đã hết hàng");

    for (let i = 0; i < quantity; i++) await addToCart(product);
    GA.trackAddToCart(product, quantity);
    GA.trackBeginCheckout({
      total: product.price * quantity,
      items: [{ ...product, quantity }],
    });
    setQuantity(1);
    router.push("/cart");
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error || !productData) return notFound();

  const product = productData.product;
  const isOutOfStock = product.stock < 1;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Breadcrumb */}
      <nav className="flex mb-8 text-sm text-gray-600">
        <Link href="/" className="hover:text-amber-500">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative">
          <Image
            width={600}
            height={1000}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg shadow-lg"
            priority
          />
          {isOutOfStock && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Hết hàng
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{product.name}</h1>

          {/* Category */}
          <div className="flex items-center gap-2 mb-4">
            <Tag size={18} className="text-gray-500" />
            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              {product.category}
            </span>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {/* Price */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Giá bán</p>
            <p className="text-amber-600 font-bold text-3xl">{product.price.toLocaleString()} VNĐ</p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <Package size={20} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              Tồn kho:{" "}
              <span className={`font-semibold ${isOutOfStock ? "text-red-500" : "text-green-600"}`}>
                {product.stock} sản phẩm
              </span>
            </span>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || cartLoading}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    if (val >= 1 && val <= product.stock) setQuantity(val);
                  }}
                  className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min="1"
                  max={product.stock}
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock || cartLoading}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-colors mb-4 ${
              isOutOfStock ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-amber-500 text-white hover:bg-amber-600"
            } ${cartLoading ? "opacity-70 cursor-wait" : ""}`}
          >
            {cartLoading ? (
              <span>Đang thêm...</span>
            ) : (
              <>
                <ShoppingCart size={20} /> Thêm vào giỏ hàng
              </>
            )}
          </button>

          {/* Buy Now */}
          {!isOutOfStock && (
            <button
              onClick={handleBuyNow}
              className="block w-full text-center border-2 border-amber-500 text-amber-500 py-3 px-6 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
            >
              Mua ngay
            </button>
          )}
        </div>
      </div>

      {/* Detailed Description */}
      {product.detailedDescription && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-2xl font-bold mb-4">Mô tả chi tiết</h2>
          <div
            className="prose max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: product.detailedDescription }}
          />
        </div>
      )}

      {/* Related Products */}
      {productData.relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productData.relatedProducts.map((related) => (
              <Link
                key={related._id}
                href={`/products/${related._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div className="relative overflow-hidden">
                  <Image
                    width={300}
                    height={300}
                    src={related.image}
                    alt={related.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {related.name}
                  </h3>
                  <p className="text-amber-500 font-bold">{related.price.toLocaleString()} VNĐ</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
