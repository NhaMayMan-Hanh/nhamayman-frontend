"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";
import type { ApiResponse, Product } from "@app/(client)/types";
import ProductCard from "@components/client/product/ProductCard";
import { LoadingPage } from "@components/ui/Loading";

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categorySlug) {
      setError("Không có danh mục được chọn");
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const result = await apiRequest.get<ApiResponse<Product[]>>(
          `/client/products?category=${categorySlug}`,
          { noAuth: true }
        );

        if (result.success) {
          setProducts(result.data);
          setCategoryName(result.data[0]?.category || categorySlug);
        } else {
          setError(result.message || "Lỗi không xác định");
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  if (loading) {
    return <LoadingPage message="Đang tải trang..." />;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Lỗi: {error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">
          Sản phẩm theo danh mục: {categoryName || categorySlug}
        </h1>
        <p className="text-gray-600">Chưa có sản phẩm nào trong danh mục này.</p>
        <Link
          href="/"
          className="mt-4 inline-block bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl min-h-screen mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Sản phẩm theo danh mục: {categoryName || categorySlug}
        </h1>
        <Link href="/" className="text-amber-500 hover:underline">
          ← Quay về trang chủ
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="group relative">
            {/* Link bao quanh để click vào ảnh/tên vẫn vào chi tiết */}
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
