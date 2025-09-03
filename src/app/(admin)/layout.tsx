
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LogOut, ShieldCheck, LayoutDashboard, Users } from "lucide-react";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SidebarNavLink = ({ href, children, label }: { href: string; children: React.ReactNode, label: string }) => {
    const pathname = usePathname();
    const isActive = href === pathname || 
                     (href.startsWith('/admin/users') && pathname.startsWith('/admin/users')) ||
                     (href.startsWith('/admin/dashboard') && pathname.startsWith('/admin/dashboard'));


    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={href} className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                        "group-hover:w-full group-hover:justify-start group-hover:px-2 group-hover:py-1.5",
                        isActive && "bg-secondary text-foreground"
                    )}>
                        {children}
                        <span className="sr-only group-hover:not-sr-only group-hover:ml-2">{label}</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  React.useEffect(() => {
    if (isMounted) {
      const isAuthenticated = localStorage.getItem("admin_authenticated") === "true";
      if (!isAuthenticated && pathname !== '/admin/login_admin') {
        router.replace("/admin/login_admin");
      }
    }
  }, [router, pathname, isMounted]);

  if (!isMounted) {
    return null;
  }
  
  const isLoginPage = pathname === '/admin/login_admin';
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem("admin_authenticated") === "true";
  
  if (!isAuthenticated && !isLoginPage) {
    return null; 
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("user_authenticated"); // Also remove user auth if present
    localStorage.removeItem("dealer_info");
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out from the admin portal.",
    });
    router.push("/admin/login_admin");
  };
  
  const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
       <aside className="hidden md:flex group z-10 h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out w-14 hover:w-56">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="sr-only group-hover:not-sr-only">Trusted Vehicles</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <SidebarNavLink href="/admin/dashboard" label="Dashboard">
                <LayoutDashboard className="h-5 w-5" />
              </SidebarNavLink>
              <SidebarNavLink href="/admin/users" label="Users">
                <Users className="h-5 w-5" />
              </SidebarNavLink>
            </nav>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
          </div>
          <ThemeToggleButton />
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>
        <main className="relative flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );

  const AdminLoginLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--primary-rgb),0.15),rgba(255,255,255,0))] animate-pulse"></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );

  if (isLoginPage || !isAuthenticated) {
      return <AdminLoginLayout>{children}</AdminLoginLayout>
  }

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>
}
