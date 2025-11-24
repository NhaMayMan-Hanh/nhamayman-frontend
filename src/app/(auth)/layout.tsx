import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthProvider } from "@contexts/AuthContext";
import { CartProvider } from "@contexts/CartContext";
import ClientHeader from "@components/client/layout/Header";
import ClientFooter from "@components/client/layout/Footer";
import { Toaster } from "react-hot-toast";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROFILE_ENDPOINT = "http://localhost:5000/api/client/users/profile";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  console.log("🚪 [AuthLayout] Bắt đầu render...");

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Nếu KHÔNG có token → cho phép vào trang auth
  if (!token) {
    console.log("✅ [AuthLayout] Không có token → render trang auth");
    return (
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <ClientHeader />
            <main>{children}</main>
            <ClientFooter />
            <Toaster
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                style: {
                  marginTop: "80px",
                },
              }}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    );
  }

  // Nếu CÓ token → kiểm tra xem có hợp lệ không
  try {
    console.log("🔍 [AuthLayout] Có token, kiểm tra tính hợp lệ...");
    const res = await fetch(PROFILE_ENDPOINT, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      const user = json.data;

      if (user) {
        console.log("🔐 [AuthLayout] User đã login:", user.username, "| Role:", user.role);

        // User đã login → redirect về trang chính
        if (user.role === "admin") {
          console.log("➡️ [AuthLayout] Redirect admin → /admin/dashboard");
          redirect("/admin/dashboard");
        } else {
          console.log("➡️ [AuthLayout] Redirect user → /");
          redirect("/");
        }
      }
    }
  } catch (error) {
    // Nếu là NEXT_REDIRECT error, re-throw để Next.js xử lý
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      console.log("🔄 [AuthLayout] Re-throw redirect error");
      throw error;
    }
    console.log("⚠️ [AuthLayout] Token không hợp lệ hoặc lỗi API:", error);
  }

  // Token không hợp lệ hoặc có lỗi → cho phép vào trang auth
  console.log("✅ [AuthLayout] Cho phép vào trang auth");
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <ClientHeader />
        <main>{children}</main>
        <ClientFooter />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              marginTop: "80px",
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}
