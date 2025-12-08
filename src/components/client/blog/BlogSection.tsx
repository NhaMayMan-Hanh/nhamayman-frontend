import type { Blog } from "@app/(client)/types";
import BlogBox from "./BlogBox";

export default function BlogSection({ blogs }: { blogs: Blog[] }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold mb-8 text-center">Tin tức & Câu chuyện</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <BlogBox key={blog._id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
