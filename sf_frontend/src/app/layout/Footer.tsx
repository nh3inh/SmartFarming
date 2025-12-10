"use client";

import Link from "next/link";
import Image from "next/image";
import { FacebookIcon, LinkedinIcon, InstagramIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
interface FooterProps {
    className?: string;
}

export default function Footer({ className }: FooterProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    return (
        <footer className="bg-white">

            <div className="px-6 md:px-20 py-12 grid grid-cols-1 md:grid-cols-3 gap-8  bg-yellow-50">
                <div>
                    <p className="text-semibold text-gray-600 mb-4">
                        Chúng tôi mang đến giải pháp nông nghiệp thông minh, dễ sử dụng, giúp nhà nông quản lý hiệu quả và phát triển bền vững.
                    </p>

                    <div className="flex items-center gap-4 pl-8">
                        <Link href="/home" className="hover:opacity-80 transition-opacity">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={60}
                                height={60}
                                className="rounded"
                            />
                        </Link>

                        <div className="h-10 w-[1px] bg-gray-300"></div>

                        <div
                            className="flex items-center gap-3 group cursor-pointer"
                            onClick={() => setIsZoomed(true)}
                            title="Nhấn để phóng to mã QR"
                        >
                            <div className="relative w-[60px] h-[60px] rounded overflow-hidden shadow-sm border border-gray-200 group-hover:border-green-500 transition-all">
                                <Image
                                    src="/app.jpg"
                                    alt="App QR Code"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                                    Tải ứng dụng
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    Quét mã QR để cài đặt
                                </span>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isZoomed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                                onClick={() => setIsZoomed(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="relative bg-white p-4 rounded-2xl shadow-2xl max-w-sm w-full"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => setIsZoomed(false)}
                                        className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full text-gray-500 shadow-md flex items-center justify-center hover:text-red-500 hover:bg-gray-50 transition-all z-10 font-bold"
                                    >
                                        ✕
                                    </button>

                                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50">
                                        <Image
                                            src="/app.jpg"
                                            alt="App QR Fullsize"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>

                                    <div className="text-center mt-4">
                                        <h3 className="font-bold text-green-700 text-lg">Bác Sĩ Lúa App</h3>
                                        <p className="text-sm text-gray-500">Quét mã để tải ứng dụng trên Android</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="text-sm text-gray-700">
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
                    <p>Số 5A Nguyễn Văn Lượng, phường An Hội Đông</p>
                    <p>Thành phố Hồ Chí Minh</p>
                </div>
            </div>

            <div className="bg-yellow-100 border-t text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center px-6 md:px-20 py-4">
                <div className="flex space-x-4 mb-2 md:mb-0">
                    <a href="/terms-and-conditions" className="hover:text-[#5b8c51] ">Điều khoản & Điều kiện</a>
                    <a href="/privacy-policy" className="hover:text-[#5b8c51] ">Chính sách bảo mật</a>
                </div>
                <p>© Bản quyền 2025 - TL Rice</p>
            </div>
        </footer>
    );
}
