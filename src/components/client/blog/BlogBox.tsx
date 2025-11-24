import Link from "next/link";
import Image from "next/image";

interface Blog {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description: string;
}

interface BlogBoxProps {
  blog: Blog;
}

export default function BlogBox({ blog }: BlogBoxProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image fill src={blog.img} alt={blog.name} className="object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">{blog.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.description}</p>
        <Link
          href={`/blog/${blog.slug}`}
          className="text-amber-500 hover:underline text-sm font-medium"
        >
          Đọc thêm →
        </Link>
      </div>
    </div>
  );
}
