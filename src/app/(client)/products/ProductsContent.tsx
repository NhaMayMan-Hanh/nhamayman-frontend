"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";
import { Loading } from "@components/common/Loading";
import type { ApiResponse, Product } from "@app/(client)/types";

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
          {
            noAuth: true,
          }
        );

        if (result.success) {
          setProducts(result.data);
          setCategoryName(categoryName || "");
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
  }, [categoryName, categorySlug]);

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Sản phẩm theo danh mục: {categoryName}</h1>
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
      {loading && (
        <div className="py-12">
          <Loading message="Chờ chút xíu..." size="md" />
        </div>
      )}

      {!loading && error && <div className="text-center py-8 text-red-500">Lỗi: {error}</div>}

      {!loading && products && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Sản phẩm theo danh mục: {categoryName}</h1>
            <Link href="/" className="text-amber-500 hover:underline">
              ← Quay về trang chủ
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Image
                  width={300}
                  height={300}
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  unoptimized
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-amber-500 font-bold mb-2">
                    {product.price.toLocaleString()} VNĐ
                  </p>
                  <p className="text-sm text-gray-500">Tồn kho: {product.stock}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
