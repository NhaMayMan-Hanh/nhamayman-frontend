"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface RelatedProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ProductData {
  success: boolean;
  data: {
    product: Product;
    relatedProducts: RelatedProduct[];
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [productData, setProductData] = useState<ProductData["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/client/products/${id}`);
        if (!res.ok) throw new Error("Lỗi khi fetch sản phẩm");

        const result: ProductData = await res.json();
        if (result.success) setProductData(result.data);
        else setError(result.message || "Lỗi không xác định");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-8">Đang tải sản phẩm...</div>;
  if (error || !productData) return notFound();

  const product = productData.product;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Image
          width={500}
          height={500}
          src={product.image}
          alt={product.name}
          className="w-full h-96 object-cover rounded-lg"
        />
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-amber-500 font-bold text-2xl mb-4">
            {product.price.toLocaleString()} VNĐ
          </p>
          <p className="text-sm text-gray-500 mb-4">Tồn kho: {product.stock}</p>
          <button className="w-full bg-amber-500 text-white py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors mb-4">
            Thêm vào giỏ hàng
          </button>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.detailedDescription || "" }}
          />
        </div>
      </div>

      {productData.relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productData.relatedProducts.map((related) => (
              <Link
                key={related._id}
                href={`/products/${related._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Image
                  width={300}
                  height={300}
                  src={related.image}
                  alt={related.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{related.name}</h3>
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
