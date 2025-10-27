"use client";

import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import { useState } from "react";
import Image from "next/image";

const BE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        content: "",
    });


    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);

    const [nameError, setNameError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [contentError, setContentError] = useState("");


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // ✅ Kiểm tra lỗi họ và tên khi người dùng nhập
        if (name === "name") {
            const nameRegex = /^[A-Za-zÀ-ỹà-ỹ\s]+$/;
            if (value.trim() === "") {
                setNameError("Vui lòng nhập họ và tên.");
            } else if (!nameRegex.test(value)) {
                setNameError("Họ và tên chỉ được chứa chữ cái và khoảng trắng.");
            } else if (value.trim().split(" ").length < 2) {
                setNameError("Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ).");
            } else {
                setNameError("");
            }
        }

        // --- Validate Số điện thoại ---
        if (name === "phone") {
            const phoneRegex = /^(0|\+84)[0-9]{9,10}$/; // Hỗ trợ định dạng VN
            if (value.trim() === "") {
                setPhoneError("Vui lòng nhập số điện thoại.");
            } else if (!phoneRegex.test(value.trim())) {
                setPhoneError("Số điện thoại không hợp lệ (phải gồm 10 hoặc 11 số).");
            } else {
                setPhoneError("");
            }
        }

        // --- Validate Email ---
        if (name === "email") {
            const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
            if (value.trim() === "") {
                setEmailError("Vui lòng nhập email.");
            } else if (!emailRegex.test(value.trim())) {
                setEmailError("Địa chỉ email không hợp lệ.");
            } else {
                setEmailError("");
            }
        }

        // --- Validate Nội dung ---
        if (name === "content") {
            const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
            if (value.trim() === "") {
                setContentError("Vui lòng nhập nội dung.");
            } else if (wordCount < 10) {
                setContentError("Nội dung phải có ít nhất 10 từ.");
            } else {
                setContentError("");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra lần cuối trước khi gửi
        if (nameError || phoneError || emailError || contentError) return;
        setLoading(true);

        try {
            const res = await fetch(`${BE_URL}contact/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ name: "", phone: "", email: "", content: "" });
                setShowSuccess(true);
            } else {
                setShowError(true);
            }
        } catch (err) {
            console.error(err);
            setShowError(true);
        } finally {
            setLoading(false); // ✅ tắt loading khi hoàn tất
        }


    };
    return (
        <div className="">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-10 text-black font-[Arial]">
                <h2 className="text-[#5b8c51] font-bold text-[24px] leading-normal">LIÊN HỆ VỚI CHÚNG TÔI</h2>
                <div className="border-b border-black mb-[30px] w-full max-w-[460px]"></div>

                <p className="mb-6 text-[16px] leading-[24px]">
                    Chúng tôi luôn sẵn sàng đồng hành cùng bạn trong hành trình phát triển nông nghiệp thông minh:
                </p>
                <ul className="list-disc pl-5 mb-6">
                    <li>Email: support@smartfarming.vn – Gửi câu hỏi hoặc yêu cầu hợp tác bất kỳ lúc nào.</li>
                    <li>Hotline: +84 3952 2540 – Hoạt động [24/7].</li>
                    <li>Website: www.smartfarming.net – Tìm hiểu thêm về các giải pháp Smart Farming</li>
                </ul>
                <p className="mb-[99px]">Ý kiến và phản hồi của bạn là động lực để chúng tôi không ngừng đổi mới — chúng tôi sẽ phản hồi bạn sớm nhất có thể! 🌾🌾</p>

                <h3 className="text-[24px] font-bold text-[#5b8c51] mb-[30px]">
                    Bạn có câu hỏi hoặc góp ý?
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4 font-[16px]">
                    {/* Full Name */}
                    <div>
                        <label className="block text-gray-700 mb-1 font-[18px] font-bold">Họ và tên (*)</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border rounded-lg border-[#7f7f7f] px-3 py-2 focus:ring-1 focus:ring-[#5b8c51] focus:outline-none"
                            placeholder="Nhập họ và tên của bạn"
                        />
                        {nameError && (
                            <p className="text-red-500 text-sm mt-1">{nameError}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-gray-700 mb-1 font-[18px] font-bold">Số điện thoại (*)</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border rounded-lg border-[#7f7f7f] px-3 py-2 focus:ring-1 focus:ring-[#5b8c51] focus:outline-none"
                            placeholder="0123456xxx"
                        />
                        {phoneError && (
                            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 mb-1 font-[18px] font-bold">Email (*)</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg border-[#7f7f7f] px-3 py-2 focus:ring-1 focus:ring-[#5b8c51] focus:outline-none"
                            placeholder="Nhập email của bạn"
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1">{emailError}</p>
                        )}
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-gray-700 mb-1 font-[18px] font-bold">Nội dung (*)</label>
                        <textarea
                            name="content"
                            rows={4}
                            value={formData.content}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg border-[#7f7f7f] px-3 py-2 focus:ring-1 focus:ring-[#5b8c51] focus:outline-none"
                            placeholder="Nội dung tin nhắn của bạn..."
                        />
                        {contentError && (
                            <p className="text-red-500 text-sm mt-1">{contentError}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-[#6fa863] text-white font-[18px] font-bold py-4 px-10 flex h-[53px] justify-center items-center gap-2 shrink-0 rounded-full transition 
                                ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#527f48]"}`}
                        >
                            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                        </button>
                    </div>
                </form >
                {/* Modal Popup */}
                {
                    showSuccess && (
                        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center relative">
                                {/* Logo */}
                                <div className="mb-4 bg-orange-100 rounded-full flex items-center justify-center w-16 h-16 mx-auto">
                                    <Image
                                        src="/logo.png"
                                        alt="Logo"
                                        width={60}
                                        height={60}
                                    // className="rounded"
                                    />
                                </div>
                                {/* Message */}
                                <h2 className="text-green-700 font-bold text-lg mb-2">Email gửi thành công!</h2>
                                <p className="text-gray-600 mb-4">Chúng tôi đã nhận được yêu cầu của bạn.</p>
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="bg-[#6fa863] text-white font-[18px] px-4 py-2 rounded hover:bg-[#527f48]"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )
                }

                {
                    showError && (
                        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center relative">

                                <div className="mb-4 bg-orange-100 rounded-full flex items-center justify-center w-16 h-16 mx-auto">
                                    <Image
                                        src="/logo.png"
                                        alt="Logo"
                                        width={60}
                                        height={60}
                                    // className="rounded"
                                    />
                                </div>

                                <h2 className="text-red-700 font-bold text-lg mb-2">Gửi email không thành công</h2>
                                <p className="text-gray-600 mb-4">Không thể gửi yêu cầu của bạn. Vui lòng thử lại.</p>
                                <button
                                    onClick={() => setShowError(false)}
                                    className="bg-[#6fa863] text-white px-4 py-2 rounded hover:bg-[#527f48]"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )
                }
            </div >
            <Footer />
        </div>
    )
}