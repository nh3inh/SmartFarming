"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import UserDropdown from "@/components/UserDropdown"
import { getUserProfile, UserData } from "@/services/userService";
import React, { useEffect, useState } from "react";


interface NavbarProps {
    className?: string;
}

export default function Navbar({ className }: NavbarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const navItems = [
        { href: "/home", label: "Trang chủ" },
        { href: "/products", label: "Sản phẩm" },
        { href: "/blog", label: "Bài viết" },
        { href: "/about", label: "Về chúng tôi" },
        { href: "/contact", label: "Liên hệ" },
    ];
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserProfile();
            if (userData) setUser(userData);
        };
        fetchUser();
    }, []);

    const userAvatar = user
        ? user.last_name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
        : "";

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
                        <span className="hidden lg:inline">Canh tác thông minh</span>
                    </Link>
                </div>

                {/* Menu desktop */}
                <ul className="hidden lg:flex space-x-6 font-bold">
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

                {/* Phone + Button desktop + User dropdown */}
                <div className="hidden lg:flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Phone size={18} />
                        <span>+84 3952 2540</span>
                    </div>
                    <button className="bg-yellow-300 text-green-800 font-semibold px-5 py-2 rounded-full shadow hover:bg-yellow-400 cursor-pointer">
                        Liên hệ →
                    </button>

                    {/* User avatar dropdown */}
                    <UserDropdown avatar={userAvatar} />
                </div>

                {/* Hamburger menu */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded focus:outline-none hover:text-[#5b8c51] cursor-pointer"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile + Tablet menu */}
                {isOpen && (
                    <div className="absolute top-[80px] left-0 w-full bg-[#f8f7f0] shadow-md border-t border-gray-300 lg:hidden">
                        <ul className="flex flex-col p-6 font-bold">
                            {navItems.map((item) => {
                                const isActive =
                                    pathname === item.href || pathname.startsWith(item.href + "/");

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-3"
                                        >
                                            <span
                                                className={`inline-block w-[20%] transition-colors duration-200 border-b-4
                                                ${isActive
                                                        ? "text-yellow-600 border-yellow-500"
                                                        : "text-gray-800 border-transparent hover:text-[#5b8c51] hover:border-[#5b8c51]"}`}
                                            >
                                                {item.label}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </nav>
        </div>
    );
}
