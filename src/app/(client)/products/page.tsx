import { Suspense } from "react";
import ProductsContent from "./ProductsContent";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Đang tải...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
