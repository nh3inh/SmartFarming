"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

interface UserDropdownProps {
    avatar: string;
}

export default function UserDropdown({ avatar }: UserDropdownProps) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();

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

    const menuItems = [
        { href: "/profile", label: "Hồ sơ cá nhân" },
        { href: "/asset", label: "Tài sản" },
    ];

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
                    {avatar}
                </div>
                <ChevronDown
                    size={20}
                    className={`ml-1 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
                />
            </button>

            {/* Dropdown menu*/}
            {open && (
                <ul className="absolute right-0 top-full mt-2 w-48 bg-white border-gray-200 rounded shadow-lg z-50 font-bold">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <li key={item.href} className="last:border-b-0">
                                <Link
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={`block px-4 py-3 transition-colors duration-200 border-b-4
                    ${isActive
                                            ? "text-yellow-500 border-yellow-500"
                                            : "text-gray-800 border-transparent hover:text-[#5b8c51] hover:border-[#5b8c51]"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
