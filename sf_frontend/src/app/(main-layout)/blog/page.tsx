"use client";

import { Suspense } from "react";
import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import Container from "@/app/layout/Container";
import ListBlog from "@/app/components/layoutBlog/ListBlog";

export default function BlogPageWrapper() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100 text-black font-[Arial]">
            <Navbar />

            <Container className="py-8">
                <h1 className="text-4xl md:text-6xl font-bold text-[#5b8c51] text-center">
                    Tin tức & Bài viết
                </h1>
            </Container>

            <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 rounded-2xl shadow-md">
                    <Suspense fallback={<p className="text-center py-10">Đang tải blog...</p>}>
                        <ListBlog />
                    </Suspense>
                </div>
            </div>

            <Footer />
        </div>
    );
}
