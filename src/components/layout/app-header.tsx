
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
import { Button } from "../ui/button";
import { LogOut, Settings, PanelLeft, ShieldCheck, Sun, Moon } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import AppSidebar from "./app-sidebar";
import { useTheme } from "next-themes";

export default function AppHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [dealerInfo, setDealerInfo] = React.useState({ id: '', name: '', dealershipName: '' });

  React.useEffect(() => {
    const info = localStorage.getItem('dealer_info');
    if (info) {
      setDealerInfo(JSON.parse(info));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_authenticated");
    localStorage.removeItem("dealer_info");
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'D';
  }

  const closeSheet = () => setIsSheetOpen(false);

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
             <AppSidebar isMobile={true} onLinkClick={closeSheet} />
          </SheetContent>
        </Sheet>
      
      <div className="flex-1 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-x-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="font-semibold text-foreground">IMS</span>
            <span>by</span>
            <span className="font-semibold text-foreground">Trusted Vehicles</span>
          </div>
          <div className="sm:block">
            <span>for</span>
            <span className="font-semibold text-foreground"> {dealerInfo.dealershipName}</span>
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://placehold.co/100x100.png" alt={dealerInfo.name} data-ai-hint="person face" />
                <AvatarFallback>{getInitials(dealerInfo.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{dealerInfo.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
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
