"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/services/userService";

interface UserDropdownProps {
    avatar?: string;
}

export default function UserDropdown({ avatar }: UserDropdownProps) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    const isLoggedIn = !!avatar; // nếu có avatar => đăng nhập

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 300);
    };

    const handleLogout = async () => {
        setOpen(false);
        const success = await logoutUser();
        router.push(success ? "/login" : "/login?error=logout_failed");
    };

    const menuItems = isLoggedIn
        ? [
            { href: "/profile", label: "Hồ sơ cá nhân" },
            { href: "/asset", label: "Tài sản" },
        ]
        : [{ href: "/login", label: "Đăng nhập" }];

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Avatar + Arrow */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center focus:outline-none"
            >
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    {avatar || "?"}
                </div>
                <ChevronDown
                    size={20}
                    className={`ml-1 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
                />
            </button>

            {/* Dropdown menu */}
            {open && (
                <ul className="absolute right-0 top-full mt-2 w-48 bg-white border-gray-200 rounded shadow-lg z-50 font-bold">
                    {menuItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="block px-4 py-3 text-gray-800 border-b-4 border-transparent hover:text-[#5b8c51] hover:border-[#5b8c51] transition-colors duration-200"
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    {isLoggedIn && (
                        <li>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-gray-800 hover:text-[#5b8c51] border-transparent border-b-4 hover:border-[#5b8c51] transition-colors duration-200 cursor-pointer"
                            >
                                Đăng xuất
                            </button>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
