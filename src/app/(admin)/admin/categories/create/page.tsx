"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Upload, Loader2, ArrowLeft } from "lucide-react";
import { generateSlug } from "@components/admin/helpers/generateSlug";
import { useToast } from "@contexts/ToastContext";
import apiRequest from "@lib/api";

export default function CreateCategory() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const toast = useToast();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Chỉ chấp nhận file JPG hoặc PNG");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Hình ảnh không được vượt quá 2MB");
      return;
    }

    setImage(file);
    setImagePreview(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      toast.error("Tên và Slug là bắt buộc");
      return;
    }

    if (!image) {
      toast.error("Vui lòng chọn hình ảnh danh mục");
      return;
    }

    if (submitting) return; // Prevent double submit
    setSubmitting(true);

    const toastId = toast.loading("Đang tạo danh mục mới...");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    formData.append("description", description.trim());
    formData.append("status", String(status));
    formData.append("img", image);
    try {
      const result = await apiRequest.post<{
        success: boolean;
        message?: string;
      }>("/admin/categories", formData);

      if (result.success) {
        toast.updateToast(toastId, "Tạo danh mục thành công!", "success");
        setTimeout(() => router.push("/admin/categories"), 1500);
      } else {
        toast.updateToast(toastId, result.message || "Tạo danh mục thất bại", "error");
        setSubmitting(false);
      }
    } catch (err: any) {
      toast.updateToast(toastId, err.message || "Lỗi kết nối đến server", "error");
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div>
        <div className="mb-8">
          <button
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-all duration-200 cursor-pointer"
            onClick={() => window.history.back()}
          >
            <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium group-hover:underline text-[18px]">Quay lại</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Tạo danh mục mới</h1>
          <p className="text-gray-600 mt-2">Thêm một danh mục sản phẩm mới vào hệ thống</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-8"
        >
          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Hình ảnh danh mục <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto max-h-64 rounded-lg object-cover shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Kéo thả ảnh vào đây hoặc</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <span className="px-5 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      Chọn ảnh từ máy
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-3">JPG, PNG - Tối đa 2MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Tên & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Ví dụ: Tranh sơn dầu"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="tranh-son-dau"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono"
                required
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả (tùy chọn)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Mô tả ngắn về danh mục này..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors"
            />
          </div>
          {/* Trường Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Trạng thái hiển thị
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === true}
                  onChange={() => setStatus(true)}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium text-green-600">Hiển thị</span> - Danh mục sẽ hiện
                  trên trang chủ
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === false}
                  onChange={() => setStatus(false)}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium text-red-600">Ẩn</span> - Danh mục sẽ không hiện trên
                  trang chủ
                </span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Tạo danh mục
                </>
              )}
            </button>

            <Link
              href="/admin/categories"
              className={`px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                submitting ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Hủy bỏ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
