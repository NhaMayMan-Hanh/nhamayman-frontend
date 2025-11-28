import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
  id?: string | number;
  _id?: string | number;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  avatar?: string;
  iat?: number;
  exp?: number;
}

export async function requireAuth(options: { role?: "admin" | "user" | "any" } = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // if (!token) {
  //   redirect("/login");
  // }
  console.log("TOKEN FROM COOKIE:", token);

  if (!token) {
    console.log("Không tìm thấy token → redirect /login");
    redirect("/login");
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

    const rawPayload = payload as JwtPayload;

    console.log(rawPayload);

    const userId = String(rawPayload.id || rawPayload._id || "");

    const user = {
      id: userId,
      name: (rawPayload.name || "Unknown") as string,
      username: (rawPayload.username || "user") as string,
      email: (rawPayload.email || "") as string,
      role: (rawPayload.role || "user") as string,
      avatar: (rawPayload.avatar || "") as string,
    };

    console.log("options role", options.role);
    console.log("options role2", user.role);

    if (options.role === "admin" && user.role !== "admin") {
      console.log("Không phải admin → redirect /");
      // redirect("/");
      redirect("/");
    }

    return user;
  } catch (error) {
    console.error(error);
    redirect("/login");
  }
}
