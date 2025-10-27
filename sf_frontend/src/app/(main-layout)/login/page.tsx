"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/google_oauth_start/`;
  };

  const handleAnonymous = () => {
    router.push("/home");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden h-auto md:h-[400px]">
        {/* Left side */}
        <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-green-600 to-yellow-300 items-center justify-center p-8">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold">Chào mừng quay lại</h2>
            <p className="mt-4 text-lg text-gray-200">Bạn của nhà nông!</p>
          </div>
        </div>

        {/* Right side */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Canh tác <span className="text-green-600">thông minh!</span>
          </h2>
          <p className="mt-2 text-gray-500 text-sm md:text-base">Đăng nhập bằng tài khoản của bạn</p>

          {errorMsg && (
            <p className="text-red-500 text-sm mt-2">{errorMsg}</p>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full mt-6 md:mt-8 bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 cursor-pointer transition-colors duration-200 text-sm md:text-base"
          >
            Đăng nhập bằng Google
          </button>
          <button
            onClick={handleAnonymous}
            className="w-full mt-6 md:mt-8 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 cursor-pointer transition-colors duration-200 text-sm md:text-base"
          >
            Tiếp tục với tư cách khách
          </button>
        </div>
      </div>
    </main>
  );
}
