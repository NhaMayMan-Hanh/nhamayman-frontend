// app/admin/products/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const updateToast = (id: string | null, message: string, type: "success" | "error" | "loading") => {
  if (id && typeof window !== "undefined" && typeof window.updateToast === "function") {
    window.updateToast(id, message, type);
  }
};

interface Category {
  _id: string;
  name: string;
}

export default function CreateProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => data.success && setCategories(data.data || []))
      .catch(() => showToast("Lỗi tải danh mục", "error"));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      showToast("Chỉ chấp nhận file JPG hoặc PNG", "error");
      return;
    }

    // Kiểm tra dung lượng (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("Ảnh không được quá 10MB", "error");
      return;
    }

    setImageFile(file);

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    // Validate
    if (!formData.name.trim() || !formData.category || !formData.price || !formData.stock) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }

    if (!imageFile) {
      showToast("Vui lòng chọn hình ảnh sản phẩm", "error");
      return;
    }

    const toastId = showToast("Đang tạo sản phẩm...", "loading");
    setSaving(true);

    // Tạo FormData - GỬI HẾT TRONG 1 REQUEST (giống Categories)
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("description", formData.description.trim());
    formDataToSend.append("detailedDescription", formData.detailedDescription.trim());
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("image", imageFile); // ✅ File ảnh đính kèm luôn

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend, // ✅ Gửi FormData, KHÔNG có Content-Type header
      });

      const result = await res.json();

      if (res.ok && result.success) {
        updateToast(toastId, `Tạo sản phẩm "${formData.name}" thành công!`, "success");
        setTimeout(() => router.push("/admin/products"), 1500);
      } else {
        updateToast(toastId, result.message || "Tạo sản phẩm thất bại", "error");
      }
    } catch (err) {
      updateToast(toastId, "Lỗi kết nối đến server", "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
            <p className="text-gray-600">Upload ảnh trực tiếp từ máy tính</p>
          </div>
          <Link
            href="/admin/products"
            className="px-6 py-3 border rounded-xl hover:bg-gray-50 transition"
          >
            Quay lại
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cột upload ảnh */}
            <div>
              <label className="block text-sm font-semibold mb-4">
                Ảnh sản phẩm <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition h-80">
                {imagePreview ? (
                  <div className="relative h-full">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={600}
                      height={600}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
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
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full text-gray-500 cursor-pointer">
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
                    <p className="text-sm mb-1">Click để chọn ảnh</p>
                    <p className="text-xs text-gray-400">JPG, PNG - Tối đa 10MB</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Form thông tin */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="iPhone 15 Pro Max"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
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
                    className="w-full px-4 py-2.5 border rounded-lg outline-none"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Giá bán (₫) <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-2.5 border rounded-lg outline-none"
                    placeholder="25000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tồn kho <span className="text-red-500">*</span>
                  </label>
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
                    className="w-full px-4 py-2.5 border rounded-lg outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mô tả ngắn <span className="text-red-500">*</span>
                </label>
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
                  className="w-full px-4 py-2.5 border rounded-lg resize-none outline-none"
                  placeholder="Điện thoại cao cấp nhất 2025..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả chi tiết (tùy chọn)</label>
                <textarea
                  rows={5}
                  value={formData.detailedDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detailedDescription: e.target.value,
                    })
                  }
                  disabled={saving}
                  className="w-full px-4 py-2.5 border rounded-lg resize-none font-mono text-sm outline-none"
                  placeholder="Chip A17 Pro, màn hình 120Hz..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Link
                  href="/admin/products"
                  className="px-8 py-3 border rounded-xl hover:bg-gray-50 transition"
                >
                  Hủy bỏ
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  disabled={saving || !imageFile}
                  className="px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {saving ? "Đang tạo..." : "Tạo sản phẩm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
