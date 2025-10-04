"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function HomePage() {
    return (
        <div className="relative min-h-screen">
            {/* Navbar luôn nổi trên overlay */}
            <Navbar className="relative z-20" />

            <main className="pt-[80px] min-h-screen bg-gradient-to-r from-green-700 via-green-500 to-yellow-400 text-white relative">

                {/* Overlay mờ chỉ làm background, không chặn click */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                    {/* Hero Section */}
                    <section className="max-w-2xl">
                        <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="border px-4 py-1 rounded-full text-sm uppercase tracking-wider mb-4 hover:bg-white hover:text-green-800"
                        >
                            Hãy tin vào chất lượng!
                        </motion.button>

                        <h1 className="text-5xl font-semibold leading-tight mb-4">
                            Niềm tin vào chất lượng: <br />
                            Trực tiếp từ nông trại
                        </h1>

                        <p className="text-lg text-gray-100 mb-6">
                            Chúng ta đều cần một không gian để phát triển.
                            Hãy dành cho cây trồng và chính bạn khoảng không cần thiết để nuôi dưỡng giá trị bền vững.
                        </p>

                        <button className="bg-white text-green-800 font-semibold px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-gray-200">
                            <span>Liên hệ với chúng tôi</span>
                            <ArrowRight size={18} />
                        </button>
                    </section>
                </div>
            </main>
            <Footer className="relative z-20" />
        </div>
    );
}
