"use client";

import Link from "next/link";
import Image from "next/image";
import { FacebookIcon, LinkedinIcon, InstagramIcon, MailIcon } from "lucide-react";

interface FooterProps {
    className?: string;
}

export default function Footer({ className }: FooterProps) {
    return (
        <footer className="bg-white">

            <div className="px-6 md:px-20 py-12 grid grid-cols-1 md:grid-cols-3 gap-8  bg-yellow-50">
                <div>
                    <p className="text-sm text-gray-600 mb-4">
                        Chúng tôi mang đến giải pháp nông nghiệp thông minh, dễ sử dụng, giúp nhà nông quản lý hiệu quả và phát triển bền vững.
                    </p>

                    <div className="flex pl-8">
                        <Link href="/home">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={60}
                                height={60}
                                className="rounded"
                            />
                        </Link>
                    </div>
                </div>

                <div className="text-sm text-gray-700">
                    <h3 className="font-semibold mb-4">Ứng dụng công nghệ thông minh trong nông nghiệp để nâng cao năng suất.</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Liên kết hữu ích</h4>
                            <ul className="space-y-1">
                                <li><a href="/blog" className="hover:text-[#5b8c51] ">Bài viết</a></li>
                                <li><a href="/about" className="hover:text-[#5b8c51] ">Về chúng tôi</a></li>
                                <li><a href="/contact" className="hover:text-[#5b8c51] ">Liên hệ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Thời gian làm việc</h4>
                            <ul className="space-y-1">
                                <li>Thứ 2 - Thứ 6: 9:00 - 17.00</li>
                                <li>Thứ 7 - Chủ nhật: Nghỉ</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-gray-700">
                    <h4 className="font-semibold mb-4">Địa chỉ</h4>
                    <p>47/8 đường số 9, khu phố 5, phường An Hội Đông</p>
                    <p>Thành phố Hồ Chí Minh</p>
                </div>
            </div>

            <div className="bg-yellow-100 border-t text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center px-6 md:px-20 py-4">
                <div className="flex space-x-4 mb-2 md:mb-0">
                    <a href="/terms-and-conditions" className="hover:text-[#5b8c51] ">Điều khoản & Điều kiện</a>
                    <a href="/privacy-policy" className="hover:text-[#5b8c51] ">Chính sách bảo mật</a>
                </div>
                <p>© Bản quyền 2025 - SmartFarming (Canh tác thông minh)</p>
            </div>
        </footer>
    );
}
