import type { ReactNode } from "react";
import { CartProvider } from "@contexts/CartContext";
import ClientHeader from "@components/client/layout/Header";
import ClientFooter from "@components/client/layout/Footer";
import { AuthProvider } from "../../contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }: { children: ReactNode }) {
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
