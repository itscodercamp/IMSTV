
"use client";
import * as React from "react";
import AdminLayout from "@/app/(admin)/layout";
import MainLayout from "@/app/(main)/layout";


export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isDealer, setIsDealer] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const adminAuth = localStorage.getItem("admin_authenticated") === "true";
        const userAuth = localStorage.getItem("user_authenticated") === "true";
        
        setIsAdmin(adminAuth);
        setIsDealer(userAuth && !adminAuth);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return null; // or a loading skeleton
    }

    if (isAdmin) {
        return <AdminLayout inventory={null}>{children}</AdminLayout>;
    }
    
    // Default to dealer view if not admin, main layout will handle auth
    return <MainLayout>{children}</MainLayout>;
}
