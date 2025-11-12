"use client";

import { motion } from "framer-motion";

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="bg-white p-8 rounded-2xl shadow-md prose prose-lg md:prose-xl text-gray-800 max-w-full"
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </motion.div>
  );
}
