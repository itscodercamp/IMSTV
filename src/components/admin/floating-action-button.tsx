
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function FloatingActionButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/admin/new-feature');
  };

  return (
    <motion.button
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={cn(
        "fixed bottom-8 right-8 z-50",
        "h-14 w-14 rounded-full",
        "bg-primary text-primary-foreground",
        "flex items-center justify-center",
        "shadow-lg hover:shadow-xl transition-shadow",
        "cursor-grab active:cursor-grabbing"
      )}
      title="Add New Feature"
    >
      <Plus className="h-7 w-7" />
    </motion.button>
  );
}
