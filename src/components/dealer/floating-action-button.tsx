
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function FloatingActionButton() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const dealerId = params.dealerId as string;

  const handleClick = () => {
    if (dealerId) {
      router.push(`/dashboard/${dealerId}/inventory/add`);
    } else {
      const storedInfo = localStorage.getItem('dealer_info');
      if (storedInfo) {
        const parsedInfo = JSON.parse(storedInfo);
        if(parsedInfo.id) {
            router.push(`/dashboard/${parsedInfo.id}/inventory/add`);
        }
      }
    }
  };

  if (pathname.includes('/inventory/add') || pathname.includes('/inventory/edit')) {
      return null;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={cn(
        "fixed bottom-8 right-8 z-50",
        "h-14 w-14 rounded-full",
        "bg-primary text-primary-foreground",
        "flex items-center justify-center",
        "shadow-lg hover:shadow-xl transition-shadow",
        "cursor-pointer",
        "opacity-80 hover:opacity-100"
      )}
      title="Add New Purchase"
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  );
}


