// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// // import { getCardsByPage, Card } from "@/services/getCardService";

// // Trang định dạng card và phân trang
// export function formatCopies(num: number): string {
//     if (num >= 1000) {
//         return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
//     }
//     return num.toString();
// }

// export default function DictationEnglish() {
//     const [lessons, setLessons] = useState<Card[]>([]);
//     const [loading, setLoading] = useState(true);

//     const [page, setPage] = useState(1);
//     const [limit] = useState(12); // mỗi trang 9 item
//     const [total, setTotal] = useState(0);
//     const totalPages = Math.ceil(total / limit);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const result = await getCardsByPage(page, limit);
//                 setLessons(result.data);
//                 setTotal(result.total);
//             } catch (error) {
//                 console.error("❌ Lỗi khi load cards:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [page, limit]);

//     // ===== Hàm tạo danh sách số trang rút gọn =====
//     const getPageNumbers = () => {
//         const pages: (number | string)[] = [];

//         if (totalPages <= 7) {
//             for (let i = 1; i <= totalPages; i++) pages.push(i);
//         } else {
//             if (page <= 4) {
//                 pages.push(1, 2, 3, 4, 5, "...", totalPages);
//             } else if (page >= totalPages - 3) {
//                 pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
//             } else {
//                 pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
//             }
//         }

//         return pages;
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-64 space-x-2">
//                 <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
//                 <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
//                 <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
//             </div>
//         );
//     }

//     if (lessons.length === 0) {
//         console.log("✅ Rendering lessons 1:", lessons);
//         return <div className="text-center py-10">No data available.</div>;
//     }

//     return (
//         <div>
//             {/* Danh sách card */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
//                 {lessons.map((lesson) => (
//                     <div
//                         key={lesson.id}
//                         className="bg-white rounded-md flex flex-col"
//                     >
//                         <div className="w-full h-[200px]  bg-gray-200 rounded-md mb-4 flex items-center justify-center overflow-hidden">
//                             <img
//                                 src={lesson.image_url}
//                                 alt="video"
//                                 className="w-full h-full object-cover" />
//                         </div>

//                         <p className="text-sm text-[#A11D33]">{lesson.type}</p>
//                         <p className="text-lg font-semibold truncate w-full">
//                             {lesson.title}
//                         </p>
//                         <p className="text-base text-[#000000B3] mb-4"> {formatCopies(lesson.copies)} copies</p>

//                         <Link
//                             href={lesson.type == "Video"
//                                 ? `/exercise-video/${lesson.id}`
//                                 : `/exercise-audio/${lesson.id}`}   // ✅ Điều hướng theo type
//                             className="w-[145px] h-[36px] flex items-center justify-center bg-[#DA1E21] text-white text-sm font-arial rounded-xl hover:bg-red-700 transition"
//                         >
//                             Transcription
//                         </Link>

//                     </div>
//                 ))}
//             </div>

//             {/* Phân trang rút gọn */}
//             <div className="flex justify-center items-center mt-10 space-x-2">
//                 {/* Nút Prev */}
//                 <button
//                     onClick={() => page > 1 && setPage(page - 1)}
//                     disabled={page === 1}
//                     className="px-3 py-1 text-2xl text-black hover:bg-gray-100 disabled:opacity-50"
//                 >
//                     &lt;
//                 </button>

//                 {getPageNumbers().map((p, i) =>
//                     p === "..." ? (
//                         <span key={i} className="px-3 py-1 text-gray-500">
//                             ...
//                         </span>
//                     ) : (
//                         <button
//                             key={i}
//                             onClick={() => setPage(Number(p))}
//                             className={`px-3 py-1 rounded-md  ${page === p
//                                 ? "bg-blue-600 text-white border-blue-600"
//                                 : "border-gray-300 text-gray-700 hover:bg-gray-100"
//                                 }`}
//                         >
//                             {p}
//                         </button>
//                     )
//                 )}

//                 {/* Nút Next */}
//                 <button
//                     onClick={() => page < totalPages && setPage(page + 1)}
//                     disabled={page === totalPages}
//                     className="px-3 py-1 text-2xl text-black hover:bg-gray-100 disabled:opacity-50"
//                 >
//                     &gt;
//                 </button>
//             </div>

//         </div>
//     );

// }
