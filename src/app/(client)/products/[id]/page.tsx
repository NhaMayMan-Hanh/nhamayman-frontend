import ProductClient from "./ProductClient";
import apiRequest from "@lib/api/index";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const result = await apiRequest.get<{ success: boolean; data: any }>(`/client/products/${id}`, {
      noAuth: true,
    });

    if (!result.success) {
      return {
        title: "Sản phẩm | NhaMayMan",
        description: "Thông tin sản phẩm.",
      };
    }

    const product = result.data.product;

    return {
      title: `${product.name} | NhaMayMan`,
      description: product.description,
      openGraph: {
        title: `${product.name} | NhaMayMan`,
        description: product.description,
        images: [
          {
            url: product.image,
            width: 1200,
            height: 630,
          },
        ],
        type: "product",
      },
      alternates: {
        canonical: `https://nhamayman-hanh.io.vn/products/${id}`,
      },
    };
  } catch (e) {
    return {
      title: "Sản phẩm | NhaMayMan",
      description: "Thông tin sản phẩm.",
    };
  }
}

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

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
