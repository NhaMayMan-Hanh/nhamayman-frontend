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
    slug: string;
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
  params: Promise<{ slug: string }>;
};

// === Dynamic Metadata (rất quan trọng cho SEO) ===
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  let productData: ProductData | null = null;

  try {
    const result = await apiRequest.get<{ success: boolean; data: ProductData }>(
      `/client/products/${slug}`,
      { noAuth: true }
    );

    if (result.success) {
      productData = result.data;
    }
  } catch {}

  if (!productData) {
    return {
      title: "Sản phẩm không tồn tại | NhaMayMan",
      description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
    };
  }

  const { product } = productData;
  const url = `https://nhamayman-hanh.io.vn/products/${slug}`;

  const absoluteImage = product.image.startsWith("http")
    ? product.image
    : `https://nhamayman-hanh.io.vn${product.image}`;

  return {
    title: `${product.name} - ${product.price.toLocaleString("vi-VN")}₫ | NhaMayMan`,
    description:
      product.detailedDescription?.replace(/<[^>]*>/g, "").slice(0, 160) || product.description,
    openGraph: {
      title: `${product.name} | NhaMayMan`,
      description: product.description,
      url,
      images: [{ url: absoluteImage }],
      type: "website",
    },
    alternates: { canonical: url },
  };
}

// === Page component ===
export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let productData: ProductData | null = null;

  try {
    const result = await apiRequest.get<{ success: boolean; data: ProductData }>(
      `/client/products/${slug}`,
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

  if (!productData) notFound();

  return <ProductClient initialData={productData} />;
}
