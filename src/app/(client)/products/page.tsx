// app/(client)/products/page.tsx (Trang products - filter theo category slug từ query param)
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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

interface ProductsData {
  success: boolean;
  categoryName?: string;
  data: Product[];
}

export default function ProductsPage() {
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
        const res = await fetch(
          `http://localhost:5000/api/client/products?category=${categorySlug}`
        );
        if (!res.ok) {
          throw new Error("Lỗi khi fetch products");
        }
        const result: ProductsData = await res.json();
        if (result.success) {
          setProducts(result.data);
          setCategoryName(result.categoryName || "");
        } else {
          setError(result.message || "Lỗi không xác định");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  if (loading) {
    return <div className="text-center py-8">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Lỗi: {error}</div>;
  }

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
    <div className="max-w-6xl mx-auto py-12 px-4">
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
            href={`/products/${product._id}`} // Route chi tiết sản phẩm (sẽ code sau)
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Image
              width={300}
              height={300}
              src={product.image}
              alt={product.name}
              unoptimized
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
              {/* <p className="text-gray-600 mb-2">{product.description.substring(0, 100)}...</p> */}
              <p className="text-amber-500 font-bold mb-2">{product.price.toLocaleString()} VNĐ</p>
              <p className="text-sm text-gray-500">Tồn kho: {product.stock}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
