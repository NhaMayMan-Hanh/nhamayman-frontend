"use client";

import Link from "next/link";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description?: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-6">Danh mục sản phẩm</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/products?category=${category.slug}`}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Image
              width={300}
              height={300}
              src={category.img}
              alt={category.name}
              className="w-full h-48 object-cover mb-4 rounded-lg"
            />
            <h3 className="font-bold mb-2">{category.name}</h3>
            <p className="text-gray-600 text-sm">{category.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
