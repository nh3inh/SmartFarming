"use client";

import { motion } from "framer-motion";
import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import Container from "@/app/layout/Container";
import { Map, Cpu, Bot, Waves } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
            <Navbar />

            <main className="py-8 text-center">
                <Container>
                    <motion.h1
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-bold text-[#5b8c51] mb-4"
                    >
                        Smart Farming
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-12"
                    >
                        Một nền tảng nông nghiệp thông minh giúp quản lý và giám sát ruộng lúa
                        bằng bản đồ GIS, cảm biến IoT và trí tuệ nhân tạo để phân tích bệnh hại.
                    </motion.p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
                        {[
                            {
                                icon: <Map className="w-10 h-10 text-green-700" />,
                                title: "Bản đồ GIS tương tác",
                                desc: "Hiển thị vị trí và ranh giới các thửa ruộng ở xã Hóc Môn một cách trực quan, dễ theo dõi.",
                            },
                            {
                                icon: <Cpu className="w-10 h-10 text-green-700" />,
                                title: "Thiết bị IoT cảm biến",
                                desc: "Thu thập dữ liệu môi trường như nhiệt độ, độ ẩm, pH, ánh sáng… theo thời gian thực.",
                            },
                            {
                                icon: <Bot className="w-10 h-10 text-green-700" />,
                                title: "AI & Chatbot nông nghiệp",
                                desc: "Phân tích bệnh trên cây lúa bằng mô hình AI, đồng thời hỗ trợ tư vấn và hỏi đáp trực tiếp.",
                            },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2, duration: 0.7 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
                            >
                                <div className="flex justify-center mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 text-[#5b8c51]">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="mt-16"
                    >
                        <Waves className="w-16 h-16 text-green-400 opacity-60 mx-auto" />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        viewport={{ once: true }}
                        className="mt-12 italic text-[#5b8c51] text-lg"
                    >
                        “Công nghệ không chỉ thay đổi cách làm nông, mà còn gieo hy vọng cho mùa màng xanh hơn.”
                    </motion.p>
                </Container>
            </main>

            <Footer />
        </div>
    );
}
