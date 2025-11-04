import Image from "next/image";

async function getBlog(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch blog detail");
  return res.json();
}

async function increaseView(id: string) {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}/view/`, {
    method: "PATCH",
  });
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const blog = await getBlog(params.id);
  await increaseView(params.id);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>

      <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
        <span>{new Date(blog.created_at).toLocaleDateString("vi-VN")}</span>
        <span>•</span>
        <span>{blog.view_count + 1} lượt xem</span>
        <span className="text-blue-600 font-medium">{blog.topic}</span>
      </div>

      <div className="relative w-full h-80 mt-6">
        <Image src={blog.thumbnail} alt={blog.title} fill className="object-cover rounded-lg" />
      </div>

      <div className="prose prose-lg mt-8 text-gray-800 max-w-none">
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>
    </div>
  );
}
