import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PROFILE_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/client/users/profile`;

export async function requireAuth(options: { role?: "admin" | "user" | "any" } = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const res = await fetch(PROFILE_ENDPOINT, {
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      redirect("/login");
    }

    const json = await res.json();
    const user = json.data;

    if (!user) {
      redirect("/login");
    }

    // Check role
    if (options.role === "admin" && user.role !== "admin") {
      redirect("/"); // Redirect về home nếu không phải admin
    }

    return user;
  } catch (error) {
    // Next.js redirect throws NEXT_REDIRECT error - cần re-throw
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }

    // Các lỗi khác -> redirect login
    redirect("/login");
  }
}
