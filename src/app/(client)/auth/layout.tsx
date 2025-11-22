// app/auth/layout.tsx
import { requireAuth } from "@lib/protected-route";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  try {
    const user = await requireAuth({ role: "any" });

    // LOG ĐÚNG CHỖ – PHẢI LOG TRƯỚC KHI redirect!
    console.log("Đã đăng nhập → đá ra khỏi auth (role:", user.role + ")");

    // ĐÁ RA NGAY – KHÔNG ĐƯỢC CÓ GÌ SAU redirect()!
    if (user.role === "admin") {
      redirect("/admin/dashboard");
    }
    redirect("/"); // user thường

    // KHÔNG ĐƯỢC CÓ DÒNG NÀO SAU redirect()!!!
    // → Dòng này là nguyên nhân chính!
  } catch {
    console.log("Chưa đăng nhập → cho vào trang auth");
    return <>{children}</>;
  }
}
