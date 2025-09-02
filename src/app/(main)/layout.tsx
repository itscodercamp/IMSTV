
"use client";
import * as React from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import AppHeader from "@/components/layout/app-header";
import { useRouter } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = React.useState(false);
  const router = useRouter();
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted) {
        const isAuthenticated = localStorage.getItem("user_authenticated") === "true";
        if (!isAuthenticated) {
            router.replace("/login");
        }
    }
  }, [router, isMounted]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem("user_authenticated") === "true";
  const dealerInfoRaw = typeof window !== 'undefined' ? localStorage.getItem("dealer_info") : null;
  
  if (!isAuthenticated || !dealerInfoRaw) {
    return null; 
  }
  
  const dealerInfo = JSON.parse(dealerInfoRaw);
  if (!dealerInfo || !dealerInfo.id) {
    // Potentially redirect to login if info is corrupted
    return null;
  }

  return (
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="relative flex-1 p-2 md:p-4 bg-background">
              {children}
          </main>
        </div>
      </div>
  );
}
