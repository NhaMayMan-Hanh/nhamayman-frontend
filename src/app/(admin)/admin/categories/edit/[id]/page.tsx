"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Check, Upload } from "lucide-react";
import Loading from "@components/admin/Loading";
import { Category } from "../../types";
import { generateSlug } from "@components/admin/helpers/generateSlug";
import { useToast } from "@contexts/ToastContext";
import ErrorState from "@components/admin/ErrorState";
import apiRequest from "@lib/api";

export default function EditCategory() {
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
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

    setNewImage(file);
    setImagePreview(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const result = await apiRequest.get<{
        success: boolean;
        data: Category;
      }>(`/admin/categories/${id}`);

      if (result.success && result.data) {
        const cat = result.data;
        setCategory(cat);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || "");
        setStatus(cat.status ?? true);
      } else {
        toast.error("Không tìm thấy danh mục");
        setTimeout(() => router.push("/admin/categories"), 2000);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối server");
      setTimeout(() => router.push("/admin/categories"), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchCategory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      toast.error("Tên và Slug là bắt buộc");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    const toastId = toast.loading("Đang lưu thay đổi...");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    formData.append("description", description.trim());
    formData.append("status", String(status));
    if (newImage) formData.append("img", newImage);

    try {
      const result = await apiRequest.put<{
        success: boolean;
        message?: string;
      }>(`/admin/categories/${id}`, formData);

      if (result.success) {
        toast.updateToast(toastId, "Cập nhật danh mục thành công!", "success");
        setTimeout(() => router.push("/admin/categories"), 1500);
      } else {
        toast.updateToast(toastId, result.message || "Cập nhật thất bại", "error");
        setSubmitting(false);
      }
    } catch (err: any) {
      if (newImage) {
        try {
          const formDataNoImage = new FormData();
          formDataNoImage.append("name", name.trim());
          formDataNoImage.append("slug", slug.trim());
          formDataNoImage.append("description", description.trim());
          formDataNoImage.append("status", String(status));

          const result2 = await apiRequest.put<{
            success: boolean;
            message?: string;
          }>(`/admin/categories/${id}`, formDataNoImage);

          if (result2.success) {
            toast.updateToast(
              toastId,
              "Lưu thành công (ảnh không được cập nhật do lỗi server)",
              "info"
            );
            setTimeout(() => router.push("/admin/categories"), 2000);
          } else {
            toast.updateToast(toastId, "Cập nhật thất bại", "error");
            setSubmitting(false);
          }
        } catch (err2: any) {
          toast.updateToast(toastId, err2.message || "Lỗi kết nối server", "error");
          setSubmitting(false);
        }
      } else {
        toast.updateToast(toastId, err.message || "Lỗi kết nối server", "error");
        console.error(err);
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!category) {
    return <ErrorState redirect="/admin/categories" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
          <p className="text-gray-600 mt-2">Cập nhật thông tin danh mục sản phẩm</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-8"
        >
          {/* Ảnh hiện tại + Upload mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Hình ảnh danh mục{" "}
              <span className="text-gray-500 text-xs">(để trống nếu không thay đổi)</span>
            </label>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Ảnh hiện tại */}
              <div>
                <p className="text-sm text-gray-600 mb-3 text-center">Ảnh hiện tại</p>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                  <img
                    src={category.img}
                    alt={category.name}
                    className="mx-auto max-h-64 rounded-lg object-cover shadow-md"
                  />
                </div>
              </div>

              {/* Upload ảnh mới */}
              <div>
                <p className="text-sm text-gray-600 mb-3 text-center">Ảnh mới (nếu muốn thay)</p>
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
                          setNewImage(null);
                          setImagePreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Xóa ảnh mới
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">Chọn ảnh mới (JPG, PNG - max 2MB)</p>
                      <label>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <span className="px-5 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                          Chọn ảnh
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục *</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Trường Status mới */}
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

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || submitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <Check className="w-5 h-5" />
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
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
