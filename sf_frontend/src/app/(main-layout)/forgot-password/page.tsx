"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
    const [contact, setContact] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Call API gửi OTP qua mail/sms
        console.log("Send OTP to:", contact);
        setStep(2);
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Call API verify OTP
        console.log("Verify OTP:", otp);
        setStep(3);
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }
        // TODO: Call API reset password
        console.log("Reset password:", newPassword);
        router.push("/login");
    };

    return (
        <main className="flex h-screen items-center justify-center bg-gray-200">
            <div className="bg-white rounded-2xl shadow-xl w-[450px] p-8">
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                    Quên mật khẩu
                </h2>
                <p className="mt-2 text-gray-500 text-center">
                    {step === 1 &&
                        "Nhập email hoặc số điện thoại để nhận mã xác nhận"}
                    {step === 2 && "Nhập mã xác nhận được gửi đến bạn"}
                    {step === 3 && "Đặt mật khẩu mới"}
                </p>

                {/* Bước 1: Nhập email/sdt */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600">
                                Email hoặc Số điện thoại
                            </label>
                            <input
                                type="text"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="w-full px-2 py-1 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                        >
                            Gửi mã xác nhận
                        </button>
                    </form>
                )}

                {/* Bước 2: Nhập OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600">Mã xác nhận</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-2 py-1 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                        >
                            Xác nhận
                        </button>
                    </form>
                )}

                {/* Bước 3: Đặt mật khẩu mới */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600">Mật khẩu mới</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-2 py-1 pr-10 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-2 py-1 pr-10 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                        >
                            Đặt lại mật khẩu
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
