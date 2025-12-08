"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { useCart } from "@contexts/CartContext";
import Image from "next/image";
import toast from "react-hot-toast";
import type { ApiResponse } from "@app/(client)/types";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  __v: number;
}

type CategoryType = string | "all";
type PriceRangeType = "all" | "under-200k" | "200k-500k" | "500k-1m" | "over-1m";
type SortByType = "default" | "name" | "price-asc" | "price-desc";

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    try {
      await addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        stock: product.stock,
      });
    } catch (err) {
      toast.error("Không thể thêm vào giỏ!");
    }
  };

  return (
    <a href={`/products/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <Image
          width={300}
          height={200}
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/300x300?text=No+Image";
          }}
        />
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 mb-2 line-clamp-2">
            {product.description
              ? `${product.description.substring(0, 80)}...`
              : "Sản phẩm chất lượng cao, giá cả hợp lý..."}
          </p>
          <p className="text-amber-500 font-bold mb-2">{product.price.toLocaleString()} VNĐ</p>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full bg-button cursor-pointer py-2 px-4 md:px-4 rounded-lg font-medium transition-colors
            ${
              product.stock === 0
                ? "bg-gray-300 text-gray-500"
                : "bg-button-g hover:bg-amber-600 text-white shadow-lg"
            }
         `}
          >
            {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
          </button>
        </div>
      </div>
    </a>
  );
};

// Filter Sidebar Component
const FilterSidebar = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  showMobileFilter,
  setShowMobileFilter,
}: {
  categories: string[];
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  priceRange: PriceRangeType;
  setPriceRange: (range: PriceRangeType) => void;
  sortBy: SortByType;
  setSortBy: (sort: SortByType) => void;
  showMobileFilter: boolean;
  setShowMobileFilter: (show: boolean) => void;
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-800">Bộ lọc</h2>
      {showMobileFilter && (
        <button onClick={() => setShowMobileFilter(false)} className="lg:hidden">
          <X className="w-6 h-6" />
        </button>
      )}
    </div>

    {/* Danh mục */}
    <div className="mb-6">
      <h3 className="font-semibold text-gray-700 mb-3">Danh mục</h3>
      <div className="space-y-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="category"
            checked={selectedCategory === "all"}
            onChange={() => setSelectedCategory("all")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Tất cả</span>
        </label>
        {categories.map((category) => (
          <label key={category} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === category}
              onChange={() => setSelectedCategory(category)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700">{category}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Khoảng giá */}
    <div className="mb-6">
      <h3 className="font-semibold text-gray-700 mb-3">Khoảng giá</h3>
      <div className="space-y-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="price"
            checked={priceRange === "all"}
            onChange={() => setPriceRange("all")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Tất cả</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="price"
            checked={priceRange === "under-200k"}
            onChange={() => setPriceRange("under-200k")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Dưới 200.000đ</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="price"
            checked={priceRange === "200k-500k"}
            onChange={() => setPriceRange("200k-500k")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="ml-2 text-gray-700">200.000đ - 500.000đ</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="price"
            checked={priceRange === "500k-1m"}
            onChange={() => setPriceRange("500k-1m")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="ml-2 text-gray-700">500.000đ - 1.000.000đ</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="price"
            checked={priceRange === "over-1m"}
            onChange={() => setPriceRange("over-1m")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Trên 1.000.000đ</span>
        </label>
      </div>
    </div>

    {/* Sắp xếp */}
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Sắp xếp theo</h3>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortByType)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="default">Mặc định</option>
        <option value="name">Tên A-Z</option>
        <option value="price-asc">Giá tăng dần</option>
        <option value="price-desc">Giá giảm dần</option>
      </select>
    </div>
  </div>
);

// Main Component
const ProductsAll = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [priceRange, setPriceRange] = useState<PriceRangeType>("all");
  const [sortBy, setSortBy] = useState<SortByType>("default");
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);

  const productsPerPage = 8;

  // Fetch products khi component mount hoặc khi URL search params thay đổi
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("search") || "";
    fetchProducts(searchQuery);
  }, []);

  // Filter và sort products khi có thay đổi
  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, priceRange, sortBy]);

  const fetchProducts = async (searchQuery: string = ""): Promise<void> => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/client/products?search=${encodeURIComponent(searchQuery)}`
        : "/client/products";

      const result = await apiRequest.get<ApiResponse<Product[]>>(url, {
        noAuth: true,
      });

      if (result.success) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      } else {
        console.error(result.message || "Lỗi không xác định");
        toast.error(result.message || "Lỗi không xác định");
      }
    } catch (err: unknown) {
      console.error("Error fetching products:", getErrorMessage(err));
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = (): void => {
    let filtered: Product[] = [...products];

    // Lọc theo danh mục
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Lọc theo giá
    if (priceRange !== "all") {
      filtered = filtered.filter((product) => {
        if (priceRange === "under-200k") return product.price < 200000;
        if (priceRange === "200k-500k") return product.price >= 200000 && product.price < 500000;
        if (priceRange === "500k-1m") return product.price >= 500000 && product.price < 1000000;
        if (priceRange === "over-1m") return product.price >= 1000000;
        return true;
      });
    }

    // Sắp xếp
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const categories: string[] = [...new Set(products.map((p) => p.category))];

  // Phân trang
  const indexOfLastProduct: number = currentPage * productsPerPage;
  const indexOfFirstProduct: number = indexOfLastProduct - productsPerPage;
  const currentProducts: Product[] = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages: number = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tất cả sản phẩm</h1>
          <p className="text-gray-600">Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden flex items-center justify-center gap-2 bg-white px-4 py-3 rounded-lg shadow-sm"
          >
            <Filter className="w-5 h-5" />
            <span>Bộ lọc</span>
          </button>

          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showMobileFilter={showMobileFilter}
              setShowMobileFilter={setShowMobileFilter}
            />
          </div>

          {/* Filter Sidebar - Mobile */}
          {showMobileFilter && (
            <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-gray-50 overflow-y-auto">
                <div className="p-4">
                  <FilterSidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    showMobileFilter={showMobileFilter}
                    setShowMobileFilter={setShowMobileFilter}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {currentProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-4 py-2 rounded-lg font-medium ${
                              currentPage === pageNumber
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return <span key={pageNumber}>...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsAll;
