"use client";

import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import ListBlog from "@/app/components/layoutBlog/ListBlog";
import Container from "@/app/layout/Container";
import { motion } from "framer-motion";

export default function BlogPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100 text-black font-[Arial]">
            <Navbar />

            <Container className="py-8">
                <motion.h1
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl font-bold text-[#5b8c51] text-center"
                >
                    Tin tức & Bài viết
                </motion.h1>

            </Container>
            <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 rounded-2xl shadow-md">
                    <ListBlog />
                </div>
            </div>

            <Footer />
        </div>
    );
}
