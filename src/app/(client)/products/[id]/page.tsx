// export const dynamic = "force-dynamic";

import ProductClient from "./ProductClient";
import apiRequest from "@lib/api/index";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script"; // Thêm để dùng JSON-LD nếu cần ở server, nhưng mình sẽ để ở client

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

type Props = {
  params: Promise<{ id: string }>;
};

// === Dynamic Metadata (rất quan trọng cho SEO) ===
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  let productData: ProductData | null = null;

  try {
    const result = await apiRequest.get<{ success: boolean; data: ProductData }>(
      `/client/products/${id}`,
      { noAuth: true }
    );

    if (result.success) {
      productData = result.data;
    }
  } catch (err) {
    // Im lặng, fallback về metadata cơ bản
  }

  // Nếu không lấy được data → fallback
  if (!productData) {
    return {
      title: "Sản phẩm không tồn tại | NhaMayMan",
      description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
    };
  }

  const { product } = productData;
  const url = `https://nhamayman-hanh.io.vn/products/${id}`; // Thay domain nếu deploy thật

  // Đảm bảo image là absolute URL (nếu image từ backend là relative thì thêm domain)
  const absoluteImage = product.image.startsWith("http")
    ? product.image
    : `https://nhamayman-hanh.io.vn${product.image}`;

  return {
    title: `${product.name} - ${product.price.toLocaleString("vi-VN")}₫ | NhaMayMan`,
    description:
      product.detailedDescription?.replace(/<[^>]*>/g, "").slice(0, 160) ||
      product.description ||
      `Mua ${
        product.name
      } handmade chất lượng cao tại NhaMayMan với giá chỉ ${product.price.toLocaleString(
        "vi-VN"
      )}₫`,
    openGraph: {
      title: `${product.name} | NhaMayMan`,
      description: product.description,
      url,
      siteName: "NhaMayMan",
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      // === SỬA Ở ĐÂY: thay "product" bằng "website" hoặc bỏ hẳn ===
      type: "website", // <-- Khuyến nghị dùng cái này
      // hoặc đơn giản là bỏ dòng type đi hoàn toàn
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// === Page component ===
export default async function ProductDetailPage({ params }: Props) {
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
