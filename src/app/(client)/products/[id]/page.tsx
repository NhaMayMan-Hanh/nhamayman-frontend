import ProductClient from "./ProductClient";
import apiRequest from "@lib/api/index";
import { notFound } from "next/navigation";

interface ProductData {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    detailedDescription?: string;
    stock: number;
    category: string;
  };
  relatedProducts: Array<{
    _id: string;
    name: string;
    price: number;
    image: string;
  }>;
}

export const metadata = {
  title: "Chi tiết sản phẩm | NhaMayMan",
  description: "Các sản phẩm handmade chi tiết từ NhaMayMan.",
  openGraph: {
    title: "Chi tiết sản phẩm | NhaMayMan",
    description: "Các sản phẩm được làm thủ công từ cô chú tại NhaMayMan",
    url: "https://nhamayman-hanh.io.vn/productsAll",
    siteName: "NhaMayMan",
    type: "website",
  },
  alternates: {
    canonical: "https://nhamayman-hanh.io.vn/productsAll",
  },
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // BẮT BUỘC PHẢI AWAIT params
  const { id } = await params;

  let productData: ProductData | null = null;

  try {
    const result = await apiRequest.get<{ success: boolean; data: ProductData }>(
      `/client/products/${id}`,
      { noAuth: true }
    );

    if (result.success) {
      productData = result.data;
    } else {
      notFound();
    }
  } catch (err) {
    console.error("Lỗi tải sản phẩm:", err);
    notFound();
  }

  if (!productData) {
    notFound();
  }

  return <ProductClient initialData={productData} />;
}
