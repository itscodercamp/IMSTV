
"use client";
import * as React from "react";
import { usePathname } from "next/navigation";

export default function PublicLayout({
    admin,
    dealer
}: {
    admin: React.ReactNode;
    dealer: React.ReactNode;
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
        return admin;
    }
    
    if (isDealer) {
        return dealer;
    }
    
    // Default or fallback view if no one is authenticated
    // This part might need adjustment based on desired public-facing behavior
    return dealer; 
}
