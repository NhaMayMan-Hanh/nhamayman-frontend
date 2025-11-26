// app/admin/products/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const showToast = (
  message: string,
  type: "success" | "error" | "loading" = "success"
): string | null => {
  if (typeof window !== "undefined" && typeof window.showToast === "function") {
    return window.showToast(message, type);
  }
  console.log("[Toast]", type, message);
  return null;
};

const updateToast = (id: string | null, message: string, type: "success" | "error") => {
  if (id && typeof window !== "undefined" && typeof window.updateToast === "function") {
    window.updateToast(id, message, type);
  }
};

interface Category {
  _id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const productId = id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    detailedDescription: "",
    price: "",
    category: "",
    stock: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch categories + product detail
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [catRes, prodRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/products/${productId}`), // Dùng API public để lấy ảnh chuẩn
        ]);

        const [catJson, prodJson] = await Promise.all([catRes.json(), prodRes.json()]);

        if (catJson.success) {
          setCategories(catJson.data || []);
        }

        if (prodJson.success && prodJson.data?.product) {
          const p = prodJson.data.product;
          setProduct(p);
          setCurrentImage(p.image || "");
          setFormData({
            name: p.name || "",
            description: p.description || "",
            detailedDescription: p.detailedDescription || "",
            price: p.price?.toString() || "",
            stock: p.stock?.toString() || "",
            category: p.category?._id || p.category || "", // Hỗ trợ cả object và string
          });
        } else {
          showToast("Không tìm thấy sản phẩm", "error");
          router.replace("/admin/products");
        }
      } catch (err) {
        showToast("Lỗi kết nối server", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchData();
  }, [productId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Chỉ chấp nhận file ảnh", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Ảnh không được quá 10MB", "error");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const toastId = showToast("Đang lưu thay đổi...", "loading");
    setSaving(true);

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("description", formData.description.trim());
    if (formData.detailedDescription.trim()) {
      data.append("detailedDescription", formData.detailedDescription.trim());
    }
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("category", formData.category);
    if (imageFile) data.append("image", imageFile);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}`, {
        method: "PUT",
        credentials: "include",
        body: data,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        updateToast(toastId, "Cập nhật sản phẩm thành công!", "success");
        setTimeout(() => router.push("/admin/products"), 1600);
      } else {
        updateToast(toastId, result.message || "Cập nhật thất bại", "error");
      }
    } catch (err) {
      updateToast(toastId, "Lỗi server", "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const displayImage = imagePreview || (currentImage ? `http://localhost:5000${currentImage}` : "");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
            <p className="text-gray-600 mt-1">{product.name}</p>
          </div>
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
          >
            Quay lại danh sách
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Ảnh sản phẩm */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Ảnh sản phẩm{" "}
                {imageFile && <span className="text-green-600 text-xs">(Đã chọn ảnh mới)</span>}
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl h-96 overflow-hidden group">
                {displayImage ? (
                  <>
                    <img src={displayImage} alt="Product" className="object-cover" />
                    {imageFile && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-3 py-1 rounded-full z-10">
                        Ảnh mới
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer text-gray-500 hover:text-blue-600">
                    <svg
                      className="w-16 h-16 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="font-medium">Click để thay ảnh</p>
                    <p className="text-xs mt-1">JPG, PNG - Tối đa 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {!imageFile && currentImage && (
                <label className="mt-4 block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="block text-center py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer text-sm font-medium">
                    Thay đổi ảnh
                  </span>
                </label>
              )}
            </div>

            {/* Form thông tin */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    disabled={saving}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                      })
                    }
                    disabled={saving}
                    className="w-full px-4 py-2.5 border rounded-lg"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá bán (₫) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value,
                      })
                    }
                    disabled={saving}
                    className="w-full px-4 py-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: e.target.value,
                      })
                    }
                    disabled={saving}
                    className="w-full px-4 py-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  disabled={saving}
                  className="w-full px-4 py-2.5 border rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết (tùy chọn)
                </label>
                <textarea
                  rows={6}
                  value={formData.detailedDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detailedDescription: e.target.value,
                    })
                  }
                  disabled={saving}
                  className="w-full px-4 py-2.5 border rounded-lg resize-none font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Link
                  href="/admin/products"
                  className="px-8 py-3 border rounded-xl hover:bg-gray-50 transition"
                >
                  Hủy bỏ
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
