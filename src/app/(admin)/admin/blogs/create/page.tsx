"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Image as ImageIcon, X, Loader2, Eye } from "lucide-react";

interface BlogFormData {
  name: string;
  slug: string;
  description: string;
  content: string;
  img: File | null;
}

interface BlogResponse {
  success: boolean;
  data?: any;
  message?: string;
}

const CreateBlogs = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BlogFormData>({
    name: "",
    slug: "",
    description: "",
    content: "",
    img: null,
  });

  // Hàm tạo slug từ tiêu đề
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ ký tự đặc biệt
      .trim()
      .replace(/\s+/g, "-") // Thay khoảng trắng bằng -
      .replace(/-+/g, "-"); // Loại bỏ - trùng lặp
  };

  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "name") {
      // Tự động tạo slug khi nhập tiêu đề
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        img: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      img: null,
    }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả ngắn");
      return;
    }
    if (!formData.content.trim()) {
      setError("Vui lòng nhập nội dung bài viết");
      return;
    }
    if (!formData.img) {
      setError("Vui lòng chọn ảnh đại diện");
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("slug", formData.slug);
      submitData.append("description", formData.description);
      submitData.append("content", formData.content);
      submitData.append("img", formData.img);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs`, {
        method: "POST",
        body: submitData,
        credentials: "include",
      });

      const data: BlogResponse = await res.json();

      if (data.success) {
        alert("Tạo bài viết thành công! 🎉");
        router.push("/admin/blogs");
      } else {
        setError(data.message || "Có lỗi xảy ra khi tạo bài viết");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition"
            disabled={loading}
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <h1 className="text-xl font-bold text-gray-900">Tạo bài viết mới</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tiêu đề bài viết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề bài viết..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
                {formData.slug && (
                  <p className="mt-2 text-xs text-gray-500">
                    Slug: <span className="font-mono text-pink-600">{formData.slug}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả ngắn <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả ngắn về bài viết..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none transition"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-gray-500">{formData.description.length} ký tự</p>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nội dung bài viết <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? "Ẩn xem trước" : "Xem trước"}
                  </button>
                </div>

                {!showPreview ? (
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Nhập nội dung bài viết (hỗ trợ HTML)..."
                    rows={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none font-mono text-sm transition"
                    disabled={loading}
                  />
                ) : (
                  <div
                    className="w-full min-h-[400px] px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: formData.content,
                    }}
                  />
                )}

                <p className="mt-2 text-sm text-gray-500">
                  Hỗ trợ HTML: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;...
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo bài viết...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Tạo bài viết
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Image Upload Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Ảnh đại diện <span className="text-red-500">*</span>
              </label>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition"
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Nhấp để tải ảnh lên</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (tối đa 5MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={loading}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="absolute bottom-2 right-2 bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition opacity-0 group-hover:opacity-100 flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    Đổi ảnh
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-pink-600">✓</span>
                  <span>Kích thước khuyến nghị: 800x400px</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pink-600">✓</span>
                  <span>Định dạng: JPG, PNG, GIF</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pink-600">✓</span>
                  <span>Dung lượng tối đa: 5MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogs;
