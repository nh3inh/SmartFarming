"use client";

import { motion } from "framer-motion";

interface Props {
  title: string;
}

export default function BlogTitle({ title }: Props) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-4xl md:text-5xl font-bold text-[#5b8c51] mb-6 text-center"
    >
      {title}
    </motion.h1>
  );
}
