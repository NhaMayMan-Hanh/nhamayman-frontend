"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Category {
   _id: string;
   name: string;
   slug: string;
   description: string;
   img: string;
}

const getImageUrl = (img: string): string => {
   if (!img) return "/img/fallback/no-image.jpg";
   if (img.startsWith("http")) return img;
   return `http://localhost:5000${img.startsWith("/") ? "" : "/"}${img}`;
};

const getFallbackUrl = (img: string): string => {
   if (!img) return "/img/fallback/no-image.jpg";
   if (img.startsWith("http")) {
      try {
         return new URL(img).pathname;
      } catch {
         return img;
      }
   }
   return img.startsWith("/") ? img : `/${img}`;
};

export default function EditCategory() {
   const [category, setCategory] = useState<Category | null>(null);
   const [name, setName] = useState("");
   const [slug, setSlug] = useState("");
   const [description, setDescription] = useState("");
   const [newImage, setNewImage] = useState<File | null>(null);
   const [imagePreview, setImagePreview] = useState<string | null>(null);

   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState(false);

   const router = useRouter();
   const params = useParams();
   const id = params.id as string;

   // Tạo slug tự động
   const generateSlug = (text: string) => {
      return text
         .toLowerCase()
         .normalize("NFD")
         .replace(/[\u0300-\u036f]/g, "")
         .replace(/đ/g, "d")
         .replace(/[^a-z0-9\s-]/g, "")
         .trim()
         .replace(/\s+/g, "-")
         .replace(/-+/g, "-");
   };

   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setName(value);
      setSlug(generateSlug(value));
   };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
         setError("Chỉ chấp nhận file JPG hoặc PNG");
         return;
      }
      if (file.size > 2 * 1024 * 1024) {
         setError("Hình ảnh không được vượt quá 2MB");
         return;
      }

      setNewImage(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
   };

   useEffect(() => {
      if (!id) return;

      const fetchCategory = async () => {
         try {
            setLoading(true);
            const res = await fetch(
               `http://localhost:5000/api/admin/categories/${id}`,
               {
                  credentials: "include",
               }
            );
            const result = await res.json();
            if (result.success && result.data) {
               const cat = result.data;
               setCategory(cat);
               setName(cat.name);
               setSlug(cat.slug);
               setDescription(cat.description || "");
            } else {
               setError("Không tìm thấy danh mục");
            }
         } catch (err) {
            setError("Lỗi kết nối server");
         } finally {
            setLoading(false);
         }
      };

      fetchCategory();
   }, [id]);
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim() || !slug.trim()) {
         setError("Tên và Slug là bắt buộc");
         return;
      }

      setSaving(true);
      setError(null);

      try {
         const formData = new FormData();
         formData.append("name", name.trim());
         formData.append("slug", slug.trim());
         formData.append("description", description.trim());

         // Chỉ append ảnh nếu có
         if (newImage) {
            formData.append("img", newImage);
            console.log("📤 Uploading new image:", newImage.name);
         }

         console.log(
            "📤 Sending request to:",
            `http://localhost:5000/api/admin/categories/${id}`
         );
         console.log("📦 FormData contents:");
         for (let [key, value] of formData.entries()) {
            console.log(
               `  ${key}:`,
               value instanceof File ? `File(${value.name})` : value
            );
         }

         const res = await fetch(
            `http://localhost:5000/api/admin/categories/${id}`,
            {
               method: "PUT",
               credentials: "include",
               body: formData,
               // KHÔNG set Content-Type header - để browser tự động set với boundary
            }
         );

         console.log("📥 Response status:", res.status);

         const result = await res.json();
         console.log("📥 Response data:", result);

         if (result.success) {
            setSuccess(true);
            setTimeout(() => router.push("/admin/categories"), 1200);
         } else {
            setError(result.message || "Cập nhật thất bại");
         }
      } catch (err) {
         console.error("❌ Error:", err);
         setError("Lỗi kết nối server");
      } finally {
         setSaving(false);
      }
   };
   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto" />
               <p className="mt-4 text-gray-600">
                  Đang tải thông tin danh mục...
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
         <div>
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900">
                  Chỉnh sửa danh mục
               </h1>
               <p className="text-gray-600 mt-2">
                  Cập nhật thông tin danh mục sản phẩm
               </p>
            </div>

            {success && (
               <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in">
                  <svg
                     className="w-6 h-6 text-blue-600"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                     />
                  </svg>
                  <div>
                     <p className="font-medium text-green-800">
                        Cập nhật thành công!
                     </p>
                     <p className="text-sm text-green-700">
                        Đang chuyển về danh sách...
                     </p>
                  </div>
               </div>
            )}

            <form
               onSubmit={handleSubmit}
               className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-8"
            >
               {/* Ảnh hiện tại + Upload mới */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                     Hình ảnh danh mục{" "}
                     <span className="text-gray-500 text-xs">
                        (để trống nếu không thay đổi)
                     </span>
                  </label>

                  <div className="grid md:grid-cols-2 gap-6">
                     {/* Ảnh hiện tại */}
                     <div>
                        <p className="text-sm text-gray-600 mb-3 text-center">
                           Ảnh hiện tại
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                           {category && (
                              <img
                                 src={getImageUrl(category.img)}
                                 alt={category.name}
                                 className="mx-auto max-h-64 rounded-lg object-cover shadow-md"
                                 onError={(e) => {
                                    e.currentTarget.src = getFallbackUrl(
                                       category.img
                                    );
                                    e.currentTarget.onerror = () => {
                                       e.currentTarget.src =
                                          "/img/fallback/no-image.jpg";
                                    };
                                 }}
                              />
                           )}
                        </div>
                     </div>

                     {/* Upload ảnh mới */}
                     <div>
                        <p className="text-sm text-gray-600 mb-3 text-center">
                           Ảnh mới (nếu muốn thay)
                        </p>
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
                                 <svg
                                    className="mx-auto w-16 h-16 text-gray-400 mb-4"
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
                                 <p className="text-gray-600 mb-2">
                                    Chọn ảnh mới (JPG, PNG - max 2MB)
                                 </p>
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
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên danh mục *
                     </label>
                     <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug *
                     </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Mô tả
                  </label>
                  <textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     rows={4}
                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
               </div>

               {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                     <svg
                        className="w-5 h-5 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path
                           fillRule="evenodd"
                           d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                           clipRule="evenodd"
                        />
                     </svg>
                     <p className="text-red-700">{error}</p>
                  </div>
               )}

               <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                     type="submit"
                     disabled={saving}
                     className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                     {saving ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           Đang lưu...
                        </>
                     ) : (
                        <>
                           <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M5 13l4 4L19 7"
                              />
                           </svg>
                           Lưu thay đổi
                        </>
                     )}
                  </button>
                  <Link
                     href="/admin/categories"
                     className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                     Hủy bỏ
                  </Link>
               </div>
            </form>
         </div>
      </div>
   );
}
