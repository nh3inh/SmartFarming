"use client";

import Link from "next/link";

interface UserMenuItemProps {
    label: string;
    href: string;
    onClick?: () => void;
}

export default function UserMenuItem({ label, href, onClick }: UserMenuItemProps) {
    return (
        <li>
            <Link
                href={href}
                onClick={onClick}
                className="block px-3 py-2 hover:bg-gray-100 rounded transition-colors"
            >
                {label}
            </Link>
        </li>
    );
}
