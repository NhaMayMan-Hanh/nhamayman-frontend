"use client";

import ProductCard from "../product/ProductCard";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface CategorySectionProps {
  category: Category;
  products: Product[];
}

export default function CategorySection({ category, products }: CategorySectionProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{category.name}</h2>
          <p className="text-gray-600">{category.description}</p>
        </div>
        <Link
          href={`/products?category=${category.slug}`}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Xem tất cả ({products.length})
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.slice(0, 6).map((product) => <ProductCard key={product._id} product={product} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">Chưa có sản phẩm</p>
        )}
      </div>
    </div>
  );
}
