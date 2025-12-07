import { CartProvider } from "@contexts/CartContext";
import { AuthProvider } from "@contexts/AuthContext";
import ClientHeader from "@components/client/layout/Header";
import ClientFooter from "@components/client/layout/Footer";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "@contexts/NotificationContext";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuthLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <AuthProvider skipFetch={false}>
         <NotificationProvider>
            <CartProvider>
               <div className="flex flex-col min-h-screen">
                  <ClientHeader />
                  <main className="flex-1">{children}</main>
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
         </NotificationProvider>
      </AuthProvider>
   );
}
