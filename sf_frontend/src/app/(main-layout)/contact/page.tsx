"use client";

import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

        if (name === "name") {
            const nameRegex = /^[A-Za-zÀ-ỹà-ỹ\s]+$/;
            if (value.trim() === "") setNameError("Vui lòng nhập họ và tên.");
            else if (!nameRegex.test(value))
                setNameError("Họ và tên chỉ được chứa chữ cái và khoảng trắng.");
            else if (value.trim().split(" ").length < 2)
                setNameError("Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ).");
            else setNameError("");
        }

        if (name === "phone") {
            const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
            if (value.trim() === "") setPhoneError("Vui lòng nhập số điện thoại.");
            else if (!phoneRegex.test(value.trim()))
                setPhoneError("Số điện thoại không hợp lệ (phải gồm 10 hoặc 11 số).");
            else setPhoneError("");
        }

        if (name === "email") {
            const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
            if (value.trim() === "") setEmailError("Vui lòng nhập email.");
            else if (!emailRegex.test(value.trim()))
                setEmailError("Địa chỉ email không hợp lệ.");
            else setEmailError("");
        }

        if (name === "content") {
            const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
            if (value.trim() === "") setContentError("Vui lòng nhập nội dung.");
            else if (wordCount < 10)
                setContentError("Nội dung phải có ít nhất 10 từ.");
            else setContentError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            } else setShowError(true);
        } catch {
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
            <Navbar />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto px-6 py-10 text-black font-[Arial]"
            >
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-[#5b8c51] font-bold text-[28px]"
                >
                    LIÊN HỆ VỚI CHÚNG TÔI
                </motion.h2>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6 }}
                    className="border-b border-black mb-[30px] w-full max-w-[460px] origin-left"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 text-[16px]"
                >
                    Chúng tôi luôn sẵn sàng đồng hành cùng bạn trong hành trình phát triển
                    nông nghiệp thông minh:
                </motion.p>

                <ul className="list-disc pl-5 mb-6 space-y-1 text-gray-800">
                    <motion.li whileHover={{ x: 5 }}>Email: ngholinh.2263@gmail.com</motion.li>
                    <motion.li whileHover={{ x: 5 }}>Hotline: +84 3952 2540</motion.li>
                    <motion.li whileHover={{ x: 5 }}>Website: www.smartfarming.net</motion.li>
                </ul>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-[99px]"
                >
                    Ý kiến và phản hồi của bạn là động lực để chúng tôi không ngừng đổi mới —
                    chúng tôi sẽ phản hồi bạn sớm nhất có thể! 🌾🌾
                </motion.p>

                <motion.h3
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[24px] font-bold text-[#5b8c51] mb-[30px]"
                >
                    Bạn có câu hỏi hoặc góp ý?
                </motion.h3>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="space-y-4 font-[16px]"
                >
                    {[
                        { name: "name", label: "Họ và tên (*)", type: "text", error: nameError },
                        { name: "phone", label: "Số điện thoại (*)", type: "tel", error: phoneError },
                        { name: "email", label: "Email (*)", type: "email", error: emailError },
                    ].map(({ name, label, type, error }) => (
                        <motion.div key={name} whileHover={{ scale: 1.02 }}>
                            <label className="block text-gray-700 mb-1 font-bold">{label}</label>
                            <input
                                type={type}
                                name={name}
                                required
                                value={(formData as any)[name]}
                                onChange={handleChange}
                                className="w-full border rounded-lg border-[#7f7f7f] px-3 py-2 focus:ring-1 focus:ring-[#5b8c51] focus:outline-none"
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </motion.div>
                    ))}

                    <motion.div whileHover={{ scale: 1.02 }}>
                        <label className="block text-gray-700 mb-1 font-bold">Nội dung (*)</label>
                        <textarea
                            name="content"
                            rows={4}
                            value={formData.content}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg border-[#7f7f7f] px-3 py-2 focus:ring-1 focus:ring-[#5b8c51] focus:outline-none"
                        />
                        {contentError && <p className="text-red-500 text-sm mt-1">{contentError}</p>}
                    </motion.div>

                    <motion.div className="flex justify-end">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className={`bg-[#6fa863] text-white font-bold py-4 px-10 rounded-full transition 
                            ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#527f48]"}`}
                        >
                            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                        </motion.button>
                    </motion.div>
                </motion.form>

                <AnimatePresence>
                    {(showSuccess || showError) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 40, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.8, y: 40, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center relative"
                            >
                                <div className="mb-4 bg-green-100 rounded-full flex items-center justify-center w-16 h-16 mx-auto">
                                    <Image src="/logo.png" alt="Logo" width={60} height={60} />
                                </div>
                                <h2
                                    className={`font-bold text-lg mb-2 ${showSuccess ? "text-green-700" : "text-red-700"
                                        }`}
                                >
                                    {showSuccess
                                        ? "Email gửi thành công!"
                                        : "Gửi email không thành công"}
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    {showSuccess
                                        ? "Chúng tôi đã nhận được yêu cầu của bạn."
                                        : "Vui lòng thử lại sau."}
                                </p>
                                <button
                                    onClick={() => {
                                        setShowSuccess(false);
                                        setShowError(false);
                                    }}
                                    className="bg-[#6fa863] text-white font-[18px] px-4 py-2 rounded hover:bg-[#527f48]"
                                >
                                    Đóng
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <Footer />
        </div>
    );
}