import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản phẩm - NhaMayMan-Hanh",
  description: "Khám phá bộ sưu tập sản phẩm handmade đầy yêu thương.",
};

export default function ProductsPage() {
  const products = [
    { id: 1, name: "Hộp quà handmade nhỏ", price: "150.000 VNĐ", image: "/images/product1.jpg" },
    {
      id: 2,
      name: "Thiệp chúc mừng cá nhân hóa",
      price: "50.000 VNĐ",
      image: "/images/product2.jpg",
    },
    { id: 3, name: "Bình hoa vải tự làm", price: "200.000 VNĐ", image: "/images/product3.jpg" },
    { id: 4, name: "Sổ tay da handmade", price: "180.000 VNĐ", image: "/images/product4.jpg" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 lg:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sản phẩm</h1>
        <p className="text-xl text-gray-600">Những món quà handmade được làm từ trái tim. 💛</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
            <img
              src={product.image} // Thay bằng hình ảnh thực tế
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-amber-500 font-bold mb-4">{product.price}</p>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg transition-colors">
                Thêm vào giỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
