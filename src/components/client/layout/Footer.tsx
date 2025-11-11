import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone } from "lucide-react"; // Giả sử bạn cài đặt lucide-react cho icons

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-900 text-white mt-10">
      <div className="max-w-6xl mx-auto py-12 px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-amber-400 mb-4 block">
              NhaMayMan-Hanh
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Lan tỏa yêu thương 💛 qua những món quà handmade tinh tế, mang đến niềm vui và sự ấm
              áp cho mọi người.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-amber-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  Giới thiệu
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>info@nhamayman-hanh.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>+84 123 456 789</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} NhaMayMan-Hanh. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-gray-400 hover:text-amber-400 transition-colors p-2">
              <Facebook size={20} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-amber-400 transition-colors p-2">
              <Instagram size={20} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-amber-400 transition-colors p-2">
              <Youtube size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
