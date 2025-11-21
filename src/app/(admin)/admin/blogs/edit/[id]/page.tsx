"use client";

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
   ArrowLeft,
   Save,
   Upload,
   Image as ImageIcon,
   X,
   Loader2,
   Eye,
   Trash2,
} from "lucide-react";

interface BlogData {
   _id: string;
   name: string;
   img: string;
   slug: string;
   description: string;
   content: string;
   createdAt: string;
   updatedAt: string;
}

interface BlogFormData {
   name: string;
   slug: string;
   description: string;
   content: string;
   img: File | null;
}

interface ApiResponse {
   success: boolean;
   data?: BlogData;
   message?: string;
}

const EditBlog = () => {
   const params = useParams();
   const router = useRouter();
   const id = params?.id as string;
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [formData, setFormData] = useState<BlogFormData>({
      name: "",
      slug: "",
      description: "",
      content: "",
      img: null,
   });

   const [originalBlog, setOriginalBlog] = useState<BlogData | null>(null);
   const [imagePreview, setImagePreview] = useState<string>("");
   const [loading, setLoading] = useState<boolean>(false);
   const [fetchLoading, setFetchLoading] = useState<boolean>(true);
   const [error, setError] = useState<string>("");
   const [showPreview, setShowPreview] = useState<boolean>(false);
   const [imageChanged, setImageChanged] = useState<boolean>(false);

   useEffect(() => {
      if (id) {
         fetchBlogDetail();
      }
   }, [id]);

   const fetchBlogDetail = async () => {
      try {
         setFetchLoading(true);
         const res = await fetch(
            `http://localhost:5000/api/admin/blogs/${id}`,
            {
               credentials: "include",
            }
         );
         const data: ApiResponse = await res.json();

         if (data.success && data.data) {
            setOriginalBlog(data.data);
            setFormData({
               name: data.data.name,
               slug: data.data.slug,
               description: data.data.description,
               content: data.data.content,
               img: null,
            });
            setImagePreview(`http://localhost:5000${data.data.img}`);
         } else {
            setError("Không tìm thấy bài viết");
         }
      } catch (err) {
         console.error(err);
         setError("Lỗi khi tải bài viết");
      } finally {
         setFetchLoading(false);
      }
   };

   const generateSlug = (text: string): string => {
      return text
         .toLowerCase()
         .normalize("NFD")
         .replace(/[\u0300-\u036f]/g, "")
         .replace(/đ/g, "d")
         .replace(/Đ/g, "D")
         .replace(/[^a-z0-9\s-]/g, "")
         .trim()
         .replace(/\s+/g, "-")
         .replace(/-+/g, "-");
   };

   const handleInputChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;

      if (name === "name") {
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
         setImageChanged(true);
         setError("");
      }
   };

   const removeImage = () => {
      setFormData((prev) => ({
         ...prev,
         img: null,
      }));
      if (originalBlog) {
         setImagePreview(`http://localhost:5000${originalBlog.img}`);
      } else {
         setImagePreview("");
      }
      setImageChanged(false);
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");

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

      try {
         setLoading(true);

         const submitData = new FormData();
         submitData.append("name", formData.name);
         submitData.append("slug", formData.slug);
         submitData.append("description", formData.description);
         submitData.append("content", formData.content);

         if (formData.img) {
            submitData.append("img", formData.img);
         }

         const res = await fetch(
            `http://localhost:5000/api/admin/blogs/${id}`,
            {
               method: "PUT",
               body: submitData,
               credentials: "include",
            }
         );

         const data: ApiResponse = await res.json();

         if (data.success) {
            alert("Cập nhật bài viết thành công! 🎉");
            router.push("/admin/blogs");
         } else {
            setError(data.message || "Có lỗi xảy ra khi cập nhật bài viết");
         }
      } catch (err) {
         console.error(err);
         setError("Lỗi kết nối đến server");
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = async () => {
      if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
         return;
      }

      try {
         setLoading(true);
         const res = await fetch(
            `http://localhost:5000/api/admin/blogs/${id}`,
            {
               method: "DELETE",
               credentials: "include",
            }
         );

         const data: ApiResponse = await res.json();

         if (data.success) {
            alert("Xóa bài viết thành công!");
            router.push("/admin/blogs");
         } else {
            setError(data.message || "Có lỗi xảy ra khi xóa bài viết");
         }
      } catch (err) {
         console.error(err);
         setError("Lỗi kết nối đến server");
      } finally {
         setLoading(false);
      }
   };

   if (fetchLoading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
               <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
            </div>
         </div>
      );
   }

   if (error && !originalBlog) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  😞 Không tìm thấy bài viết
               </h2>
               <button
                  onClick={() => router.push("/admin/blogs")}
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
               >
                  Quay lại danh sách blog
               </button>
            </div>
         </div>
      );
   }

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
               <h1 className="text-xl font-bold text-gray-900">
                  Chỉnh sửa bài viết
               </h1>
               <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition disabled:opacity-50"
               >
                  <Trash2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Xóa</span>
               </button>
            </div>
         </div>

         <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Error Alert */}
            {error && originalBlog && (
               <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex items-center">
                     <X className="w-5 h-5 text-red-500 mr-2" />
                     <p className="text-red-700">{error}</p>
                  </div>
               </div>
            )}

            {/* Info Alert */}
            {originalBlog && (
               <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="text-sm text-blue-700">
                     <p>
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(originalBlog.createdAt).toLocaleString(
                           "vi-VN"
                        )}
                     </p>
                     <p>
                        <strong>Cập nhật lần cuối:</strong>{" "}
                        {new Date(originalBlog.updatedAt).toLocaleString(
                           "vi-VN"
                        )}
                     </p>
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
                           Tiêu đề bài viết{" "}
                           <span className="text-red-500">*</span>
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
                              Slug:{" "}
                              <span className="font-mono text-pink-600">
                                 {formData.slug}
                              </span>
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
                        <p className="mt-2 text-sm text-gray-500">
                           {formData.description.length} ký tự
                        </p>
                     </div>

                     {/* Content */}
                     <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                           <label className="block text-sm font-semibold text-gray-700">
                              Nội dung bài viết{" "}
                              <span className="text-red-500">*</span>
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
                           Hỗ trợ HTML: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;,
                           &lt;ul&gt;, &lt;li&gt;...
                        </p>
                     </div>

                     {/* Submit Button */}
                     <div className="flex gap-4">
                        <button
                           type="submit"
                           disabled={loading}
                           className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                           {loading ? (
                              <>
                                 <Loader2 className="w-5 h-5 animate-spin" />
                                 Đang cập nhật...
                              </>
                           ) : (
                              <>
                                 <Save className="w-5 h-5" />
                                 Cập nhật bài viết
                              </>
                           )}
                        </button>
                     </div>
                  </form>
               </div>

               {/* Image Upload Sidebar */}
               <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                     <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Ảnh đại diện
                     </label>

                     <div className="relative group">
                        <img
                           src={imagePreview}
                           alt="Preview"
                           className="w-full h-64 object-cover rounded-xl"
                           onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                 "https://via.placeholder.com/400x300?text=No+Image";
                           }}
                        />
                        {imageChanged && (
                           <button
                              type="button"
                              onClick={removeImage}
                              disabled={loading}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                           >
                              <X className="w-4 h-4" />
                           </button>
                        )}
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

                     {imageChanged && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                           <p className="text-xs text-yellow-800">
                              ⚠️ Ảnh mới sẽ thay thế ảnh cũ khi bạn cập nhật
                           </p>
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

export default EditBlog;
