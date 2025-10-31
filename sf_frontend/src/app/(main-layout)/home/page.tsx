"use client";

import { ArrowRight, Bot, Leaf, Map, Sprout, Users } from "lucide-react";
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
                            className="border px-4 py-1 rounded-full text-sm uppercase tracking-wider mb-4 hover:bg-white hover:text-green-800"
                        >
                            Hãy tin vào chất lượng!
                        </motion.button>

                        <h1 className="text-5xl font-bold leading-tight mb-4">
                            Canh tác thông minh tại Hóc Môn 🌾
                        </h1>
                        <p className="text-lg text-gray-100 mb-6">
                            Áp dụng IoT, GIS và AI để giám sát, phân tích và tối ưu quá trình
                            trồng lúa – giúp nông dân nâng cao năng suất, giảm chi phí và
                            bảo vệ môi trường.
                        </p>

                        <button className="bg-white text-green-800 font-semibold px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-gray-200">
                            <span>Liên hệ với chúng tôi</span>
                            <ArrowRight size={18} />
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
                            alt="Smart farming"
                            width={600}
                            height={400}
                            className="rounded-2xl shadow-xl border-4 border-white/30"
                        />
                    </motion.div>
                </div>

                <section className="bg-white text-gray-800 py-20 min-h-screen">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
                        <motion.img
                            src="/farm-drone.jpg"
                            alt="Smart Farm Drone"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="rounded-2xl shadow-lg"
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl font-bold text-green-700 mb-4">
                                Về dự án
                            </h2>
                            <p className="text-lg leading-relaxed mb-4">
                                Dự án <strong>Canh tác thông minh Hóc Môn</strong> ứng dụng{" "}
                                <strong>GIS</strong> để theo dõi ruộng lúa, <strong>IoT</strong>{" "}
                                để thu thập dữ liệu môi trường và <strong>AI</strong> để phát
                                hiện sớm sâu bệnh.
                            </p>
                            <p className="text-lg">
                                Giúp nông dân ra quyết định chính xác, tiết kiệm tài nguyên và
                                tăng năng suất vụ mùa.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="bg-gradient-to-r from-green-50 to-green-100 py-20 text-gray-800 min-h-screen">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl font-bold text-green-700 mb-12"
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
                                    desc: "Phát hiện sớm bệnh hại trên lá và khuyến nghị điều trị.",
                                },
                                {
                                    icon: <Sprout size={36} />,
                                    title: "Tư vấn nông nghiệp",
                                    desc: "Chatbot hỗ trợ người dùng 24/7 bằng tiếng Việt.",
                                },
                            ].map((f, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition"
                                >
                                    <div className="text-green-700 mb-4 flex justify-center">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                                    <p className="text-gray-600 text-sm">{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white py-16 min-h-screen">
                    <div className="max-w-7xl mx-auto text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl font-bold text-green-700 mb-10"
                        >
                            Giám sát ruộng lúa theo thời gian thực 🌾
                        </motion.h2>

                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                { title: "Nhiệt độ", icon: "🌡️", value: "30.5°C" },
                                { title: "Độ ẩm", icon: "💧", value: "72%" },
                                { title: "Độ pH", icon: "⚗️", value: "6.3" },
                                { title: "Ánh sáng", icon: "☀️", value: "38 lx" },
                            ].map((sensor, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-green-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition"
                                >
                                    <div className="text-4xl mb-2">{sensor.icon}</div>
                                    <h3 className="text-lg font-semibold text-gray-700">{sensor.title}</h3>
                                    <p className="text-gray-600">{sensor.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-gradient-to-r from-green-600 to-green-800 py-20 text-center text-white">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl font-bold mb-6"
                    >
                        Chatbot hỗ trợ nông dân 🤖
                    </motion.h2>
                    <p className="max-w-2xl mx-auto text-gray-200 mb-10 text-lg">
                        Hỏi – đáp về cách chăm sóc lúa, dự báo thời tiết, tưới tiêu, hoặc
                        phát hiện sâu bệnh. Chatbot của chúng tôi học từ dữ liệu thực tế
                        tại đồng ruộng Việt Nam.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white text-green-700 inline-block px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-yellow-300 transition"
                    >
                        Trò chuyện ngay →
                    </motion.div>
                </section>

                <section className="bg-white py-20 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl font-bold text-green-700 mb-10"
                    >
                        Đội ngũ phát triển 👨‍💻
                    </motion.h2>
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 px-6 justify-items-center text-gray-700">
                        {[
                            { name: "Nguyễn Kim Thùy", role: "hihi" },
                            { name: "Nguyễn Hoài Linh", role: "hehe" },
                        ].map((member, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className="bg-green-50 rounded-2xl shadow-md p-6 w-80"
                            >
                                <Users className="mx-auto text-green-700 mb-3" size={36} />
                                <h3 className="font-bold text-lg">{member.name}</h3>
                                <p className="text-gray-600">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="bg-gradient-to-r from-green-600 to-yellow-400 py-16 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Hãy cùng xây dựng nền nông nghiệp bền vững 🌍
                    </h2>
                    <p className="text-lg mb-8 text-white/90">
                        Kết nối, chia sẻ và phát triển cùng nền tảng Canh Tác Thông Minh.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => router.push("/contact")}
                        className="bg-white text-green-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-200 transition"
                    >
                        Liên hệ ngay →
                    </motion.button>
                </section>
            </main>

            <Footer className="relative z-20" />
        </div>
    );
}
