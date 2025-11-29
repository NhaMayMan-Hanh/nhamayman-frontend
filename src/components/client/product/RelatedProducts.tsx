import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
}

const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold mb-8">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link
            key={p._id}
            href={`/products/${p._id}`}
            className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium line-clamp-2 group-hover:text-amber-600">{p.name}</h3>
              <p className="text-amber-600 font-bold mt-2">{formatPrice(p.price)} VNĐ</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
