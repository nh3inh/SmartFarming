"use client";

import { motion } from "framer-motion";

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  if (!content) return null;

  const paragraphs = content.split("\n").filter((p) => p.trim() !== "");

  return (
    <div className="max-w-4xl mx-auto px-4">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="mb-6 text-lg text-gray-800 leading-8 text-justify font-light"
        >
          {paragraph.trim()}
        </p>
      ))}
    </div>
  );
}
