"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/home");
    console.log("Login with:", { username, password });
  };

  return (
    <main className="flex h-screen items-center justify-center bg-gray-200">
      <div className="bg-white rounded-2xl shadow-xl flex w-[900px] overflow-hidden">
        {/* Left side */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-600 to-yellow-300 items-center justify-center p-6">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold">Chào mừng quay lại</h2>
            <p className="mt-2 text-sm text-gray-200">Bạn của nhà nông!</p>
          </div>
        </div>

        {/* Right side */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Canh tác <span className="txt-green">thông minh!</span>
          </h2>
          <p className="mt-2 text-gray-500">
            Đăng nhập bằng tài khoản của bạn
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-600">
                Địa chỉ Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-2 py-1 border-0 border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex justify-between items-center">
              <a
                onClick={() => router.push("/forgot-password")}
                className="text-sm txt-green hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
            >
              Đăng nhập
            </button>

            <p className="text-center text-sm text-gray-500">
              Bạn không có tài khoản?{" "}
              <a
                onClick={() => router.push("/register")}
                className="txt-green font-medium hover:underline cursor-pointer"
              >
                Tạo tài khoản
              </a>
            </p>

          </form>
        </div>
      </div>
    </main>
  );
}
