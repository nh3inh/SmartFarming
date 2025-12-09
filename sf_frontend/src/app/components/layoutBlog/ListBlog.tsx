"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@/app/layout/Container"

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

interface BlogData {
  items: Blog[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function BlogPage() {
  const searchParams = useSearchParams();
  const rawPage = searchParams.get("page");

  const page = !rawPage || isNaN(Number(rawPage)) || Number(rawPage) < 1
    ? 1
    : Number(rawPage);

  const [data, setData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const url = `https://tlrice.space/api/blog/list_blog/?page=${page}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch blogs");

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    fetchBlogs();
  }, [page]);

  if (loading) return <p className="text-center py-10">Đang tải dữ liệu...</p>;
  if (!data) return <p className="text-center py-10">Không có dữ liệu blog</p>;

  return (
    <Container className="mx-auto px-4 pb-10  ">
      {data.items && data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.items.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.id}`}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="relative w-full">
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-sm text-blue-600 font-medium mt-1">
                  {blog.topic}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>{new Date(blog.created_at).toLocaleDateString("vi-VN")}</span>
                  <span>{new Date(blog.updated_at).toLocaleDateString("vi-VN")}</span>
                  <span>{blog.viewer} lượt xem</span>
                </div>

                <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                  {blog.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">Không tải được bài viết.</p>
      )}

      <div className="flex justify-center gap-3 mt-10">
        {data.has_prev && (
          <Link
            href={`/blog?page=${page - 1}`}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            ← Trước
          </Link>
        )}

        <span className="px-4 py-2 border rounded bg-yellow-300">{page}</span>

        {data.has_next && (
          <Link
            href={`/blog?page=${page + 1}`}
            className="px-4 py-2 border rounded bg-yellow-300 hover:bg-yellow-400"
          >
            Sau →
          </Link>
        )}
      </div>
    </Container>
  );
}
