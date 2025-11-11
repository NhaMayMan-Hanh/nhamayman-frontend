import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - NhaMayMan-Hanh",
  description: "Chia sẻ câu chuyện, mẹo handmade và cảm hứng yêu thương.",
};

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "Cách làm quà handmade đơn giản tại nhà",
      excerpt: "Hướng dẫn chi tiết để bạn tự tay tạo nên món quà ý nghĩa.",
      date: "2025-10-15",
    },
    {
      id: 2,
      title: "Câu chuyện đằng sau mỗi sản phẩm của chúng tôi",
      excerpt: "Những kỷ niệm và tình yêu thương trong từng chi tiết.",
      date: "2025-09-20",
    },
    {
      id: 3,
      title: "Mẹo chọn quà tặng phù hợp cho mọi dịp",
      excerpt: "Gợi ý từ đội ngũ NhaMayMan-Hanh để lan tỏa yêu thương.",
      date: "2025-08-10",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 lg:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-xl text-gray-600">Chia sẻ cảm hứng và câu chuyện yêu thương. 💛</p>
      </div>

      <div className="grid gap-8">
        {posts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{post.date}</span>
                <a href={`/blog/${post.id}`} className="text-amber-500 hover:underline">
                  Đọc thêm →
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
