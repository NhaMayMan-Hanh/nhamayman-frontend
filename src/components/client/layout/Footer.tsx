import Link from "next/link";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = 2025;

  return (
    <footer
      className="w-full bg-gray-900 text-white"
      style={{
        // height: "420px",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        marginTop: "auto",
      }}
    >
      <div
        className="max-w-6xl mx-auto px-4 lg:px-6 w-full"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          paddingTop: "48px",
          paddingBottom: "48px",
        }}
      >
        {/* Main Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full"
          style={{
            flex: "1 0 auto",
          }}
        >
          {/* BRAND */}
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/"
              className="text-2xl font-bold text-amber-400 block leading-tight"
              style={{
                height: "32px",
                marginBottom: "16px",
                display: "block",
              }}
            >
              NhaMayMan-Hanh
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed break-words">
              Lan tỏa yêu thương 💛 qua những món quà handmade tinh tế, mang đến niềm vui và sự ấm
              áp cho mọi người.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3
              className="text-lg font-semibold text-amber-400"
              style={{
                height: "28px",
                lineHeight: "28px",
                marginBottom: "16px",
              }}
            >
              Liên kết nhanh
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li style={{ height: "24px", lineHeight: "24px" }}>
                <Link
                  href="/productsAll"
                  className="hover:text-amber-400 transition-colors inline-block"
                >
                  Sản phẩm
                </Link>
              </li>
              <li style={{ height: "24px", lineHeight: "24px" }}>
                <Link href="/blog" className="hover:text-amber-400 transition-colors inline-block">
                  Tin tức
                </Link>
              </li>
              <li style={{ height: "24px", lineHeight: "24px" }}>
                <Link href="/about" className="hover:text-amber-400 transition-colors inline-block">
                  Giới thiệu
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3
              className="text-lg font-semibold text-amber-400"
              style={{
                height: "28px",
                lineHeight: "28px",
                marginBottom: "16px",
              }}
            >
              Liên hệ
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2" style={{ minHeight: "24px" }}>
                <Mail
                  size={16}
                  className="shrink-0 mt-0.5"
                  style={{ width: "16px", height: "16px", flexShrink: 0 }}
                  aria-hidden="true"
                />
                <span className="break-words">hanh.together1@gmail.com</span>
              </li>

              <li className="flex items-start gap-2" style={{ minHeight: "24px" }}>
                <Phone
                  size={16}
                  className="shrink-0 mt-0.5"
                  style={{ width: "16px", height: "16px", flexShrink: 0 }}
                  aria-hidden="true"
                />
                <span className="break-words">+84 813115895 ( Kim Thanh )</span>
              </li>

              <li className="flex items-start gap-2" style={{ minHeight: "60px" }}>
                <MapPin
                  size={30}
                  className="shrink-0 mt-0.5"
                  style={{ width: "32px", height: "32px", flexShrink: 0 }}
                  aria-hidden="true"
                />
                <span className="break-words">
                  QTSC 9 Building, Đ. Tô Ký, Tân Chánh Hiệp, Quận 12, Hồ Chí Minh, Vietnam
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div
          className="border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 w-full"
          style={{
            paddingTop: "32px",
            marginTop: "auto",
          }}
        >
          <p
            className="text-sm text-gray-400 whitespace-nowrap flex items-center"
            style={{ height: "24px", lineHeight: "24px" }}
          >
            © {currentYear} NhaMayMan-Hanh. All rights reserved.
          </p>

          <div className="flex items-center gap-4" style={{ height: "40px" }}>
            <a
              href="https://www.facebook.com/share/17NL8JQQSz/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-amber-400 transition-colors p-2 flex items-center justify-center"
              style={{ width: "40px", height: "40px" }}
              aria-label="Facebook"
            >
              <Facebook size={20} style={{ width: "20px", height: "20px" }} aria-hidden="true" />
            </a>

            <a
              href="https://www.instagram.com/hanh.together1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-amber-400 transition-colors p-2 flex items-center justify-center"
              style={{ width: "40px", height: "40px" }}
              aria-label="Instagram"
            >
              <Instagram size={20} style={{ width: "20px", height: "20px" }} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
