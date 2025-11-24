import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PROFILE_ENDPOINT = "http://localhost:5000/api/client/users/profile";

export async function requireAuth(options: { role?: "admin" | "user" | "any" } = {}) {
  console.log("🔍 [requireAuth] Bắt đầu kiểm tra auth...");

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  console.log("🔑 Token lấy từ cookie:", token);

  if (!token) {
    console.log("❌ Không có token → redirect('/login')");
    redirect("/login");
  }

  try {
    console.log("🌐 Gửi request đến PROFILE_ENDPOINT...");
    const res = await fetch(PROFILE_ENDPOINT, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });

    console.log("📡 Status API /profile:", res.status);

    if (!res.ok) {
      console.log("❌ API trả về status FAIL → redirect('/login')");
      throw new Error("PROFILE_RESPONSE_NOT_OK");
    }

    // Parse JSON trước khi làm gì khác
    const json = await res.json();
    console.log("📦 JSON trả về:", json);

    const user = json.data;
    console.log("👤 User parse được:", user);

    if (!user) {
      console.log("❌ Không có user trong API → redirect('/login')");
      throw new Error("NO_USER_DATA");
    }

    // Kiểm tra role
    if (options.role === "admin") {
      console.log(`🛡 Kiểm tra role admin: user.role = ${user.role}, yêu cầu = admin`);
      if (user.role !== "admin") {
        console.log("❌ User không phải admin → redirect('/')");
        redirect("/");
      }
    }

    console.log("✅ Auth hợp lệ → return user");
    return user;
  } catch (err) {
    console.log("💥 Lỗi trong requireAuth:", err);

    // Chỉ redirect khi KHÔNG phải lỗi redirect
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err; // Re-throw redirect errors
    }

    console.log("➡️ Redirect('/login')");
    redirect("/login");
  }
}
