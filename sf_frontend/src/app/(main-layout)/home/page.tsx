"use client";

import { ArrowUp, Bot, Leaf, Map, Sprout, Users } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen">
            <Navbar className="relative z-20" />

            <main className="pt-[80px] min-h-screen bg-gradient-to-r from-green-700 via-green-500 to-yellow-400 text-white relative">
                <div className="absolute inset-0  pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex-1"
                    >
                        <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="border px-4 py-1 rounded-full text-sm uppercase tracking-wider mb-4"
                        >
                            Hãy tin vào chất lượng!
                        </motion.button>

                        <h1 className="text-5xl font-bold leading-tight mb-4">
                            TL Rice tại Hóc Môn 🌾
                        </h1>
                        <p className="text-lg text-gray-100 mb-6">
                            Áp dụng IoT, GIS và AI để giám sát, phân tích và tối ưu quá trình
                            trồng lúa – giúp nông dân nâng cao năng suất, giảm chi phí và
                            bảo vệ môi trường.
                        </p>

                        <button className="bg-white text-[#5b8c51]  font-semibold px-6 py-3 rounded-full flex items-center space-x-2">
                            <span>Vì những ruộng lúa tươi tốt!</span>
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="flex-1 hidden md:block"
                    >
                        <Image
                            src="/smartfarm.png"
                            alt="TL Rice"
                            width={600}
                            height={400}
                            className="rounded-2xl shadow-xl border-4 border-white/30"
                        />
                    </motion.div>
                </div>

                <section className="bg-white text-gray-800 py-20">
                    <div className="mx-auto grid gap-12 items-center px-6 md:px-20 max-w-7xl">
                        <motion.img
                            src="/farm-drone.png"
                            alt="Smart Farm Drone"
                            initial={{ opacity: 0, y: -50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="w-full rounded-2xl shadow-lg mx-auto transition-transform duration-300 ease-in-out hover:scale-105"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center"
                        >
                            <h2 className="text-3xl font-bold text-[#5b8c51] mb-4">Về dự án</h2>
                            <p className="text-lg leading-relaxed mb-4">
                                <strong>TL Rice</strong> ứng dụng <strong>GIS</strong> để theo dõi ruộng lúa, <strong>IoT</strong> để thu thập dữ liệu môi trường và <strong>AI</strong> để phát hiện sớm sâu bệnh.
                            </p>
                            <p className="text-lg">
                                Giúp nông dân ra quyết định chính xác, tiết kiệm tài nguyên và tăng năng suất vụ mùa.
                            </p>
                        </motion.div>
                    </div>
                </section>


                <section className="bg-gradient-to-r from-green-50 to-green-100 py-20 text-gray-800">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl font-bold text-[#5b8c51] mb-12"
                        >
                            Công nghệ chúng tôi sử dụng 💡
                        </motion.h2>

                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <Map size={36} />,
                                    title: "Bản đồ GIS",
                                    desc: "Theo dõi vị trí, diện tích và ranh giới từng thửa ruộng.",
                                },
                                {
                                    icon: <Leaf size={36} />,
                                    title: "Cảm biến IoT",
                                    desc: "Thu thập nhiệt độ, độ ẩm, pH, ánh sáng theo thời gian thực.",
                                },
                                {
                                    icon: <Bot size={36} />,
                                    title: "AI phân tích bệnh",
                                    desc: "Phát hiện sớm bệnh hại trên lá.",
                                },
                                {
                                    icon: <Sprout size={36} />,
                                    title: "Tư vấn nông nghiệp",
                                    desc: "Chatbot hỗ trợ người dùng 24/7.",
                                },
                            ].map((f, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-white rounded-2xl p-6 shadow-md transition"
                                >
                                    <div className="text-[#5b8c51]  mb-4 flex justify-center">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                                    <p className="text-gray-600 text-sm">{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-gradient-to-r from-green-600 to-yellow-400 py-16 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Hãy cùng xây dựng nền nông nghiệp bền vững 🌍
                    </h2>
                    <p className="text-lg mb-8 text-white/90">
                        Kết nối, chia sẻ và phát triển cùng nền tảng TL Rice.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => router.push("/contact")}
                        className="bg-white text-[#5b8c51] font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-200 transition"
                    >
                        Liên hệ ngay →
                    </motion.button>
                </section>
            </main>

            <Footer className="relative z-20" />
        </div>
    );
}
