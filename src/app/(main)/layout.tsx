
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
        const isDealerAuthenticated = localStorage.getItem("user_authenticated") === "true";
        const isEmployeeAuthenticated = localStorage.getItem("employee_authenticated") === "true";
        if (!isDealerAuthenticated && !isEmployeeAuthenticated) {
            router.replace("/login");
        }
    }
  }, [router, isMounted]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  const isDealerAuthenticated = typeof window !== 'undefined' && localStorage.getItem("user_authenticated") === "true";
  const isEmployeeAuthenticated = typeof window !== 'undefined' && localStorage.getItem("employee_authenticated") === "true";
  const dealerInfoRaw = typeof window !== 'undefined' ? localStorage.getItem("dealer_info") : null;
  
  if (!isDealerAuthenticated && !isEmployeeAuthenticated) {
    return null; 
  }
  
  // This check is primarily for dealer context; employees don't need it as much
  if (isDealerAuthenticated && !dealerInfoRaw) {
    return null;
  }
  
  let dealerInfo;
  if(dealerInfoRaw){
    dealerInfo = JSON.parse(dealerInfoRaw);
    if (!dealerInfo || !dealerInfo.id) {
        // Potentially redirect to login if info is corrupted
        return null;
    }
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
