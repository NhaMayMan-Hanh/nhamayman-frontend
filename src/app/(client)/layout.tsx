import type { ReactNode } from "react";
import { CartProvider } from "@contexts/CartContext";
import ClientHeader from "@components/client/layout/Header";
import ClientFooter from "@components/client/layout/Footer";
import { AuthProvider } from "@contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider skipFetch={false}>
      <CartProvider>
        {/* Main container - NO wrapper divs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          {/* Header - Direct render, no wrapper */}
          <ClientHeader />

          {/* Main content - Flexible */}
          <main
            style={{
              flex: "1 0 auto",
              width: "100%",
            }}
          >
            {children}
          </main>

          {/* Footer - Direct render, no wrapper */}
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
