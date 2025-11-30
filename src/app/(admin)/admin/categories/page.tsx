"use client";

import { useState, useEffect } from "react";
import { ApiResponse, Category } from "./types";
import DeleteConfirmModal from "@components/admin/DeleteModal";
import { useToast } from "@contexts/ToastContext";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import Loading from "@components/admin/Loading";
import apiRequest from "@lib/api";

// Lọc và sắp xếp danh mục
const filterCategories = (
  categories: Category[],
  searchTerm: string,
  sortBy: "newest" | "oldest" | "name"
): Category[] => {
  const filtered = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b._id.localeCompare(a._id);
      case "oldest":
        return a._id.localeCompare(b._id);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Dùng 1 state duy nhất để điều khiển modal xóa → rõ nghĩa rõ ràng hơn
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const toast = useToast();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await apiRequest.get<ApiResponse>("/admin/categories");
      if (result.success) {
        setCategories(result.data);
        setError(null);
      } else {
        setError("Không thể tải danh mục");
        toast.error("Không thể tải danh mục");
      }
    } catch (err: any) {
      const errorMsg = "Lỗi kết nối: " + err.message;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filterCategories(categories, searchTerm, sortBy);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    const toastId = toast.loading("Đang xóa danh mục...");

    try {
      await apiRequest.delete(`/admin/categories/${deletingCategory._id}`);
      toast.updateToast(toastId, `Đã xóa "${deletingCategory.name}" thành công!`, "success");

      setCategories((prev) => prev.filter((cat) => cat._id !== deletingCategory._id));
      setDeletingCategory(null); // Đóng modal tự động
    } catch (err: any) {
      toast.updateToast(toastId, err.message || "Xóa danh mục thất bại", "error");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-gray-600 mt-2">Xem, chỉnh sửa và xóa các danh mục sản phẩm</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tên, slug, mô tả..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name">Tên (A-Z)</option>
              </select>

              <button
                onClick={() => (window.location.href = "/admin/categories/create")}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Thêm danh mục
              </button>
            </div>
          </div>
        </div>

        {/* Bảng danh mục */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Mô tả
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        Không tìm thấy danh mục nào
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={cat.img || "/placeholder.jpg"}
                          alt={cat.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-mono">{cat.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {cat.description || "(Không có mô tả)"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            cat.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cat.status ? (
                            <>
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Hiển thị
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              Ẩn
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => (window.location.href = `/admin/categories/${cat._id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg group"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5 group-hover:scale-110 transition cursor-pointer" />
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `/admin/categories/edit/${cat._id}`)
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg group"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5 group-hover:scale-110 transition cursor-pointer" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(cat)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg group"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition cursor-pointer" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-700">
                  Trang <span className="font-medium">{currentPage}</span> /{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmModal
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={confirmDelete}
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
        entityName={deletingCategory?.name || ""}
        details={
          deletingCategory && (
            <>
              <p className="mt-1 text-xs text-gray-500">Slug: {deletingCategory.slug}</p>
              {deletingCategory.description && (
                <p className="mt-1 text-xs text-gray-500">{deletingCategory.description}</p>
              )}
            </>
          )
        }
      />
    </div>
  );
}
