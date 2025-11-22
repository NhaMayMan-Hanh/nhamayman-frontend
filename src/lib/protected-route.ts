import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PROFILE_ENDPOINT = "http://localhost:5000/api/client/users/profile";

export async function requireAuth(options: { role?: "admin" | "user" | "any" } = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // LOG 1: Xem có lấy được token không
  console.log(
    "🔑 [requireAuth] Token từ cookie:",
    token ? "Có (dài " + token.length + " ký tự)" : "KHÔNG CÓ"
  );

  if (!token) {
    console.log("❌ Không có token → redirect về /auth/login");
    redirect("/auth/login");
  }

  try {
    console.log("🌐 Đang gọi API profile:", PROFILE_ENDPOINT);
    const res = await fetch(PROFILE_ENDPOINT, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    });

    console.log("📶 Response status:", res.status);

    if (!res.ok) {
      console.log("❌ API trả về lỗi:", res.status, res.statusText);
      throw new Error("Invalid token");
    }

    const json = await res.json();
    console.log("✅ Dữ liệu từ /profile:", json);

    if (!json.success || !json.data) {
      console.log("❌ Profile không success hoặc không có data");
      throw new Error("No user data");
    }

    const user = json.data;
    console.log("👤 User hiện tại:", { id: user.id, username: user.username, role: user.role });

    // Kiểm tra role
    if (options.role === "admin" && user.role !== "admin") {
      console.log("⛔ Không phải admin → redirect về /");
      redirect("/");
    }

    console.log("✅ requireAuth thành công → cho qua");
    return user;
  } catch (error) {
    console.log("💥 Lỗi trong requireAuth → redirect về /auth/login", error);
    redirect("/auth/login"); // hoặc "/" tùy bạn
  }
}
