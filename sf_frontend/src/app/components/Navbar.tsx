"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavbarProps {
    className?: string;
}

export default function Navbar({ className }: NavbarProps) {
    const pathname = usePathname();

    const navItems = [
        { href: "/home", label: "Trang chủ" },
        { href: "/products", label: "Sản phẩm" },
        { href: "/blog", label: "Bài viết" },
        { href: "/about", label: "Về chúng tôi" },
        { href: "/contact", label: "Liên hệ" },
    ];

    return (
        <div
            className={`w-full h-[80px] bg-[#f8f7f0] flex items-center px-6 sticky top-0 z-50 ${className || ""}`}
        >
            <nav className="flex items-center justify-between w-full text-[#404a3d]">
                {/* Logo + Text */}
                <div className="flex items-center text-2xl font-bold text-[#5b8c51]">
                    <Link href="/home" className="flex items-center space-x-2">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={60}
                            height={60}
                            className="rounded"
                        />
                        <span>Canh tác thông minh</span>
                    </Link>
                </div>

                {/* Menu */}
                <ul className="hidden md:flex space-x-6 font-bold">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`px-3 py-1 rounded-full transition-colors duration-200
                                ${isActive
                                            ? "text-yellow-400"
                                            : "hover:text-[#5b8c51]"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Phone + Button */}
                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center space-x-2">
                        <Phone size={18} />
                        <span>+84 3952 2540</span>
                    </div>
                    <button className="bg-yellow-300 text-green-800 font-semibold px-5 py-2 rounded-full shadow hover:bg-yellow-400 cursor-pointer">
                        Liên hệ →
                    </button>
                </div>
            </nav>
        </div>
    );
}
