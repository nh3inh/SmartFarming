"use client";

import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import Container from "@/app/layout/Container";
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
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "name") {
            const nameRegex = /^[A-Za-zÀ-ỹà-ỹ\s]+$/;
            if (!value.trim()) setNameError("Vui lòng nhập họ và tên.");
            else if (!nameRegex.test(value))
                setNameError("Họ và tên chỉ được chứa chữ cái và khoảng trắng.");
            else if (value.trim().split(" ").length < 2)
                setNameError("Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ).");
            else setNameError("");
        }

        if (name === "phone") {
            const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
            if (!value.trim()) setPhoneError("Vui lòng nhập số điện thoại.");
            else if (!phoneRegex.test(value.trim()))
                setPhoneError("Số điện thoại không hợp lệ (10–11 số).");
            else setPhoneError("");
        }

        if (name === "email") {
            const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
            if (!value.trim()) setEmailError("Vui lòng nhập email.");
            else if (!emailRegex.test(value.trim()))
                setEmailError("Địa chỉ email không hợp lệ.");
            else setEmailError("");
        }

        if (name === "content") {
            const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
            if (!value.trim()) setContentError("Vui lòng nhập nội dung.");
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
        <div className="bg-gradient-to-b from-green-50 to-green-100 min-h-screen">
            <Navbar />
            <Container className="py-8 text-black">
                <div className="w-full flex flex-col items-center text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-bold text-[#5b8c51] mb-4"
                    >
                        Liên hệ với chúng tôi
                    </motion.h1>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                >
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-5"
                    >
                        <div className="border-b border-black w-[100px]" />

                        <p className="text-[16px] leading-relaxed text-gray-800">
                            Chúng tôi luôn sẵn sàng đồng hành cùng bạn trong hành trình phát
                            triển nông nghiệp thông minh.
                            <br />
                            Hãy để lại thông tin, đội ngũ của chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                        </p>

                        <motion.ul
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 space-y-3 text-gray-700"
                        >
                            <li>• Email: <span className="font-semibold">ngholinh.2263@gmail.com</span></li>
                            <li>• Hotline: <span className="font-semibold">+84 3952 2540</span></li>
                            <li>• Website: <span className="font-semibold">https://tlrice.space</span></li>
                        </motion.ul>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 relative flex justify-center"
                        >
                            <Image
                                src="/contact-illustration.png"
                                alt="Contact Illustration"
                                width={420}
                                height={320}
                                className="mx-auto rounded-2xl shadow-md z-10"
                            />

                            <motion.div
                                initial={{ y: 0 }}
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-[20%] right-[15%] bg-white shadow-lg border border-green-200 rounded-md w-16 h-12 flex items-center justify-center z-50"
                            >
                                ✉️
                            </motion.div>
                        </motion.div>

                    </motion.div>

                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-green-100 space-y-5"
                    >
                        <h3 className="text-[24px] font-bold text-[#5b8c51] mb-4">
                            Gửi thông tin liên hệ
                        </h3>

                        {[
                            { name: "name", label: "Họ và tên (*)", type: "text", error: nameError },
                            { name: "phone", label: "Số điện thoại (*)", type: "tel", error: phoneError },
                            { name: "email", label: "Email (*)", type: "email", error: emailError },
                        ].map(({ name, label, type, error }) => (
                            <motion.div key={name} whileHover={{ scale: 1.02 }}>
                                <label className="block text-gray-700 mb-1 font-semibold">{label}</label>
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
                            <label className="block text-gray-700 mb-1 font-semibold">
                                Nội dung (*)</label>
                            <textarea
                                name="content"
                                rows={4}
                                value={formData.content}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg border-[#7f7f7f] px-3 py-2 focus:ring-1 focus:ring-[#5b8c51] focus:outline-none resize-none"
                            />
                            {contentError && <p className="text-red-500 text-sm mt-1">{contentError}</p>}
                        </motion.div>

                        <div className="flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={loading}
                                className={`bg-[#6fa863] text-white font-bold py-3 px-8 rounded-full transition 
                ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#527f48]"}`}
                            >
                                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                            </motion.button>
                        </div>
                    </motion.form>
                </motion.div>
            </Container>

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
            <Footer />
        </div>
    );
}
