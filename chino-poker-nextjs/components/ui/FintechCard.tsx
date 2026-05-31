"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FintechCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  delay?: number;
}

export function FintechCard({
  children,
  className = "",
  onClick,
  hoverable = true,
  delay = 0,
}: FintechCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`
        bg-white border border-gray-100 rounded-2xl p-4 transition-all
        ${hoverable ? "hover:border-red-200 hover:shadow-md cursor-pointer active:scale-[0.98]" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
