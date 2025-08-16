"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        // Call API register ở đây
        console.log("Register with:", { username, email, password });

        router.push("/login");
    };

    return (
        <main className="flex h-screen items-center justify-center bg-gray-200">
            <div className="bg-white rounded-2xl shadow-xl flex w-[900px] overflow-hidden">
                {/* Left side */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-600 to-yellow-300 items-center justify-center p-6">
                    <div className="text-center text-white">
                        <h2 className="text-2xl font-bold">Chào mừng bạn mới</h2>
                        <p className="mt-2 text-sm text-gray-200">Hãy tham gia cùng chúng tôi!</p>
                    </div>
                </div>

                {/* Right side */}
                <div className="w-full md:w-1/2 p-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Tạo <span className="txt-green">tài khoản!</span>
                    </h2>
                    <p className="mt-2 text-gray-500">Điền thông tin để đăng ký</p>

                    <form onSubmit={handleRegister} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600">Họ và tên</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-2 py-1 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Số điện thoại</label>
                            <input
                                type="tel"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-2 py-1 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
                                pattern="^(0\d{9}|\+84\d{9})$"
                            />
                        </div>


                        <div>
                            <label className="block text-sm text-gray-600">Địa chỉ Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-2 py-1 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Mật khẩu</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-2 py-1 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-2 py-1 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                        >
                            Đăng ký
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Đã có tài khoản?{" "}
                            <a href="/login" className="txt-green font-medium hover:underline">
                                Đăng nhập
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
}
