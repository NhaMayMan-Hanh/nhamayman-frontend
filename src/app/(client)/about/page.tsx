import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu - NhaMayMan-Hanh",
  description: "Tìm hiểu về chúng tôi và sứ mệnh lan tỏa yêu thương qua những món quà handmade.",
};

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 lg:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Về NhaMayMan-Hanh</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Chúng tôi là những người yêu thích handmade, mang đến những món quà nhỏ bé nhưng chứa đựng
          tình yêu thương lớn lao. 💛
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sứ mệnh của chúng tôi</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Lan tỏa yêu thương qua từng sản phẩm được làm bằng tay, với nguyên liệu tự nhiên và
            thiết kế độc đáo. Mỗi món quà là một câu chuyện, một thông điệp ấm áp gửi đến người
            nhận.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• Sản phẩm handmade 100% thủ công</li>
            <li>• Nguyên liệu thân thiện với môi trường</li>
            <li>• Giao hàng nhanh chóng toàn quốc</li>
          </ul>
        </div>
        <div>
          <img
            src="/images/about-placeholder.jpg" // Thay bằng hình ảnh thực tế
            alt="Handmade products"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 italic">"Yêu thương bắt đầu từ những điều nhỏ bé."</p>
      </div>
    </div>
  );
}
