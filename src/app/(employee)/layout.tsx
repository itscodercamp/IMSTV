
"use client";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, PanelLeft, ShieldCheck, User as UserIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import type { Employee } from "@/lib/types";
import { EmployeeSidebar } from "@/components/employees/employee-sidebar";
import { EmployeeLayoutClient } from "./employee-dashboard/layout-client";


function AppHeader({ employeeInfo }: { employeeInfo: Employee }) {
    const router = useRouter();
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const closeSheet = () => setIsSheetOpen(false);


    const handleLogout = () => {
        localStorage.removeItem("employee_authenticated");
        localStorage.removeItem("employee_info");
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
        router.push("/login");
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'E';
    }

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs p-0">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Main Menu</SheetTitle>
                    </SheetHeader>
                    <EmployeeSidebar isMobile={true} onLinkClick={closeSheet} />
                </SheetContent>
            </Sheet>

            <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="truncate">Trusted Vehicles Portal for <span className="font-semibold text-foreground">{employeeInfo.dealershipName} - {employeeInfo.name}</span></span>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
                <ThemeToggleButton />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="overflow-hidden rounded-full"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={employeeInfo.avatarUrl} alt={employeeInfo.name} data-ai-hint="person face" />
                                <AvatarFallback>{getInitials(employeeInfo.name)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{employeeInfo.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

export default function EmployeeLayout({
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

  const [employeeInfo, setEmployeeInfo] = React.useState<Employee | null>(null);

  React.useEffect(() => {
    if (isMounted) {
      const isAuthenticated = localStorage.getItem("employee_authenticated") === "true";
      const infoRaw = localStorage.getItem("employee_info");
      
      if (!isAuthenticated) {
        router.replace("/login");
      }
      
      if(infoRaw) {
        setEmployeeInfo(JSON.parse(infoRaw));
      }

    }
  }, [router, pathname, isMounted]);

  const isLoginPage = pathname === '/login';

  if (!isMounted) {
    return null; // or a loading spinner
  }

  const isAuthenticated = !!employeeInfo;

  if (!isAuthenticated && !isLoginPage) {
    return null; // Wait for redirect to kick in
  }

  const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-screen w-full">
        <EmployeeSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
            <AppHeader employeeInfo={employeeInfo!}/>
            <main className="flex-1 overflow-y-auto bg-background">
                <div className="p-4 md:p-6">
                    <React.Suspense fallback={<div>Loading...</div>}>
                        <EmployeeLayoutClient>{children}</EmployeeLayoutClient>
                    </React.Suspense>
                </div>
            </main>
        </div>
    </div>
  )


  if (isLoginPage || !isAuthenticated) {
      // This part of layout is now handled by the (auth) layout
      // but we keep a simple wrapper for child components in case it's rendered during transition.
      return <div className="min-h-screen bg-background">{children}</div>;
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
