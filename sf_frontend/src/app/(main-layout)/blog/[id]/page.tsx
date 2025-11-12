"use client";

import BlogTitle from "./BlogTitle";
import BlogContent from "./BlogContent";
import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import Container from "@/app/layout/Container";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // import useRouter

interface Blog {
  id: number;
  title: string;
  topic: string;
  image_url: string;
  content: string;
  viewer: number;
  created_at: string;
  updated_at: string;
}

interface PageProps {
  params: { id: string };
}

export default function BlogDetailPage({ params }: PageProps) {
  const { id } = params;
  const [blog, setBlog] = useState<Blog | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchBlog() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}blog/list_blog/${id}/`);
      const data = await res.json();
      setBlog(data);

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}blog/list_blog/${id}/view/`, {
        method: "PATCH",
      });
    }
    fetchBlog();
  }, [id]);

  if (!blog) return <p>Đang tải...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white text-black font-[Arial]">
      <Navbar />
      <Container className="">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-yellow-300 rounded hover:bg-yellow-400"
        >
          ← Quay lại
        </button>

        <BlogTitle title={blog.title} />
        <div className="flex justify-center gap-4 text-gray-500 text-sm mb-2">
          <span>{new Date(blog.created_at).toLocaleDateString("vi-VN")}</span>
          <span>•</span>
          <span>{blog.viewer} lượt xem</span>
          <span className="text-green-700 font-medium">{blog.topic}</span>
        </div>
      </Container>

      <div className="relative w-[80%] h-96 rounded-2xl overflow-hidden shadow-lg mx-auto">
        <Image src={blog.image_url} alt={blog.title} fill className="object-cover" />
      </div>

      <Container className="py-14">
        <BlogContent content={blog.content} />
      </Container>
      <Footer />
    </div>
  );
}
