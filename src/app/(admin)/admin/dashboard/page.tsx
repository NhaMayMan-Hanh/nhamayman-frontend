// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   Legend,
   ResponsiveContainer,
   PieChart,
   Pie,
   Cell,
   LineChart,
   Line,
} from "recharts";
import {
   ShoppingBag,
   Users,
   Package,
   FileText,
   DollarSign,
   TrendingUp,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// Types
interface Product {
   _id: string;
   name: string;
   description?: string;
   price: number;
   category: string;
   image: string;
   stock: number;
}

interface User {
   _id: string;
   name: string;
   username: string;
   email: string;
   role: string;
   isVerified: boolean;
}

interface Order {
   _id: string;
   userId: string;
   items: Array<{
      productId: string;
      quantity: number;
      price: number;
   }>;
   total: number;
   status: string;
   shippingAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      country: string;
   };
   paymentMethod: string;
}

interface Category {
   _id: string;
   name: string;
   img: string;
   slug: string;
   description: string;
}

interface Blog {
   _id: string;
   name: string;
   img: string;
   slug: string;
   description: string;
   content: string;
}

interface About {
   _id: string;
   name: string;
   img: string;
   slug: string;
   description: string;
   content: string;
}

interface Stats {
   products: Product[];
   users: User[];
   orders: Order[];
   categories: Category[];
   blogs: Blog[];
   about: About[];
}

interface ChartData {
   name: string;
   value: number;
   [key: string]: string | number;
}

interface ProductChartData {
   name: string;
   stock: number;
   price: number;
   [key: string]: string | number;
}

interface StatCardProps {
   icon: React.ReactNode;
   title: string;
   value: string | number;
   subtitle: string;
   color: string;
}

interface InfoCardProps {
   icon: React.ReactNode;
   title: string;
   value: string;
   color: string;
}

export default function Dashboard() {
   const [loading, setLoading] = useState<boolean>(true);
   const [stats, setStats] = useState<Stats>({
      products: [],
      users: [],
      orders: [],
      categories: [],
      blogs: [],
      about: [],
   });

   useEffect(() => {
      fetchAllData();
   }, []);

   const fetchAllData = async (): Promise<void> => {
      try {
         setLoading(true);
         const [
            productsRes,
            usersRes,
            ordersRes,
            categoriesRes,
            blogsRes,
            aboutRes,
         ] = await Promise.all([
            fetch(`${API_BASE}/client/products`, {
               credentials: "include",
            }).then((r) => r.json()),
            fetch(`${API_BASE}/admin/users`, {
               credentials: "include",
            }).then((r) => r.json()),
            fetch(`${API_BASE}/admin/orders`, {
               credentials: "include",
            }).then((r) => r.json()),
            fetch(`${API_BASE}/admin/categories`, {
               credentials: "include",
            }).then((r) => r.json()),
            fetch(`${API_BASE}/admin/blogs`, {
               credentials: "include",
            }).then((r) => r.json()),
            fetch(`${API_BASE}/admin/about`, {
               credentials: "include",
            }).then((r) => r.json()),
         ]);
         setStats({
            products: productsRes.data,
            users: usersRes.data,
            orders: ordersRes.data,
            categories: categoriesRes.data,
            blogs: blogsRes.data,
            about: aboutRes.data,
         });
         console.log(stats);
      } catch (error) {
         console.error("Error fetching data:", error);
      } finally {
         setLoading(false);
      }
   };

   const calculateRevenue = (): number => {
      return stats.orders?.reduce((sum, order) => sum + (order.total || 0), 0);
   };

   const getProductsByCategory = (): ChartData[] => {
      const categoryMap: Record<string, number> = {};
      stats.products.forEach((product) => {
         const cat = product.category || "Unknown";
         categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });
      return Object.entries(categoryMap).map(([name, value]) => ({
         name,
         value,
      }));
   };

   const getTopProducts = (): ProductChartData[] => {
      return stats.products
         .sort((a, b) => (b.stock || 0) - (a.stock || 0))
         .slice(0, 5)
         .map((p) => ({
            name: p.name?.substring(0, 20) || "N/A",
            stock: p.stock || 0,
            price: p.price || 0,
         }));
   };

   const getOrderStatusData = (): ChartData[] => {
      const statusMap: Record<string, number> = {};
      stats.orders.forEach((order) => {
         const status = order.status || "unknown";
         statusMap[status] = (statusMap[status] || 0) + 1;
      });
      return Object.entries(statusMap).map(([name, value]) => ({
         name,
         value,
      }));
   };

   const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
               <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
               <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
            </div>
         </div>
      );
   }

   const revenue = calculateRevenue();
   const totalStock = stats.products.reduce(
      (sum, p) => sum + (p.stock || 0),
      0
   );

   return (
      <div className="min-h-screen bg-gray-50 p-6">
         <div>
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900">
                  Dashboard NhaMayMan-Hanh
               </h1>
               <p className="text-gray-600 mt-2">
                  Tổng quan hoạt động kinh doanh
               </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               <StatCard
                  icon={<Package className="w-8 h-8" />}
                  title="Sản phẩm"
                  value={stats.products.length}
                  subtitle={`${totalStock} sản phẩm trong kho`}
                  color="bg-blue-500"
               />
               <StatCard
                  icon={<ShoppingBag className="w-8 h-8" />}
                  title="Đơn hàng"
                  value={stats.orders.length}
                  subtitle="Tổng số đơn hàng"
                  color="bg-green-500"
               />
               <StatCard
                  icon={<Users className="w-8 h-8" />}
                  title="Người dùng"
                  value={stats.users.length}
                  subtitle={`${
                     stats.users.filter((u) => u.role === "admin").length
                  } admin`}
                  color="bg-purple-500"
               />
               <StatCard
                  icon={<DollarSign className="w-8 h-8" />}
                  title="Doanh thu"
                  value={`${(revenue / 1000000).toFixed(1)}M`}
                  subtitle="VNĐ"
                  color="bg-yellow-500"
               />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
               {/* Products by Category */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                     Sản phẩm theo danh mục
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                        <Pie
                           data={getProductsByCategory()}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           label={({ name, percent }: any) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                           }
                           outerRadius={100}
                           fill="#8884d8"
                           dataKey="value"
                        >
                           {getProductsByCategory().map((entry, index) => (
                              <Cell
                                 key={`cell-${index}`}
                                 fill={COLORS[index % COLORS.length]}
                              />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
               </div>

               {/* Order Status */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                     Trạng thái đơn hàng
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={getOrderStatusData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" name="Số lượng" />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
               {/* Top Products */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                     Top 5 sản phẩm có nhiều tồn kho
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={getTopProducts()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stock" fill="#10b981" name="Tồn kho" />
                     </BarChart>
                  </ResponsiveContainer>
               </div>

               {/* Category Stats */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                     Thống kê danh mục
                  </h2>
                  <div className="space-y-4">
                     {stats.categories.map((cat, idx) => (
                        <div
                           key={idx}
                           className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                 <Package className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                 <p className="font-semibold text-gray-800">
                                    {cat.name}
                                 </p>
                                 <p className="text-sm text-gray-500">
                                    {cat.description}
                                 </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                 {
                                    stats.products.filter(
                                       (p) => p.category === cat.name
                                    ).length
                                 }
                              </p>
                              <p className="text-xs text-gray-500">sản phẩm</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <InfoCard
                  icon={<FileText className="w-6 h-6" />}
                  title="Bài viết Blog"
                  value={stats.blogs.length.toString()}
                  color="bg-orange-500"
               />
               <InfoCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Tổng giá trị kho"
                  value={`${(
                     stats.products.reduce(
                        (sum, p) => sum + p.price * p.stock,
                        0
                     ) / 1000000
                  ).toFixed(1)}M VNĐ`}
                  color="bg-indigo-500"
               />
               <InfoCard
                  icon={<Users className="w-6 h-6" />}
                  title="Admin"
                  value={stats.users
                     .filter((u) => u.role === "admin")
                     .length.toString()}
                  color="bg-pink-500"
               />
            </div>
         </div>
      </div>
   );
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
   return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
         <div className="flex items-center justify-between mb-4">
            <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
         </div>
         <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
         <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
         <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
   );
}

function InfoCard({ icon, title, value, color }: InfoCardProps) {
   return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
         <div className="flex items-center gap-4">
            <div className={`${color} text-white p-4 rounded-lg`}>{icon}</div>
            <div>
               <p className="text-sm text-gray-600 mb-1">{title}</p>
               <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
         </div>
      </div>
   );
}
