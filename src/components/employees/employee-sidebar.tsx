
"use client";

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";
import {
  User,
  PlusCircle,
  FileSpreadsheet,
  ShieldCheck,
  LayoutGrid,
  Users,
  LayoutDashboard
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import * as React from "react";

const NavLink = ({ href, icon: Icon, label, isMobile, onLinkClick }: { href: string, icon: React.ElementType, label: string, isMobile?: boolean, onLinkClick?: () => void }) => {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || '';
  const linkTab = new URLSearchParams(href.split('?')[1] || '').get('tab') || (href.endsWith('/employee-dashboard') ? '' : null);
  
  const isActive = linkTab === currentTab;
  
  const linkContent = (
      <Link href={href} className={cn(
          "flex items-center gap-3 transition-colors",
          isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground",
          isMobile ? "px-2.5 py-2 text-base rounded-md" : "h-9 w-9 justify-center rounded-lg md:h-9 md:w-9",
           isActive && isMobile && "bg-secondary",
          !isMobile && "group-hover:w-full group-hover:justify-start group-hover:px-2"
      )} onClick={onLinkClick}>
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className={cn("truncate text-sm", isMobile ? "inline" : "sr-only group-hover:not-sr-only group-hover:ml-2")}>{label}</span>
      </Link>
  );

  if (isMobile) {
      return linkContent;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
            {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function EmployeeSidebar({ isMobile = false, onLinkClick }: { isMobile?: boolean, onLinkClick?: () => void }) {
  const navLinks = [
    { href: `/employee-dashboard`, icon: LayoutDashboard, label: "Dashboard" },
    { href: `/employee-dashboard?tab=new-lead`, icon: PlusCircle, label: "New Lead" },
    { href: `/employee-dashboard?tab=my-leads`, icon: LayoutGrid, label: "My Leads" },
    { href: `/employee-dashboard/all-leads`, icon: Users, label: "All Leads" },
    { href: `/employee-dashboard?tab=profile`, icon: User, label: "My Profile" },
    { href: `/employee-dashboard?tab=salary-slips`, icon: FileSpreadsheet, label: "Salary Slips" },
  ];
  
  return (
    <aside className={cn(
        "group z-10 flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isMobile ? "flex w-full" : "hidden sm:flex w-14 hover:w-56"
    )}>
       <nav className={cn(
          "flex flex-col gap-1.5 px-2 sm:py-5",
          isMobile ? "w-full p-4 flex-1" : "items-center"
      )}>
         <Link
          href={`/employee-dashboard`}
          className={cn(
            "flex items-center gap-2 mb-4",
            "shrink-0",
            "group-hover:w-full group-hover:justify-start group-hover:px-4 transition-all",
             isMobile 
                ? "self-start h-10 w-full justify-start px-2" 
                : "h-9 w-9 justify-center md:h-9 md:w-9"
          )}
           onClick={onLinkClick}
        >
          <ShieldCheck className="h-6 w-6 transition-all group-hover:scale-110 flex-shrink-0 text-primary" />
          <span className={cn("truncate font-bold text-primary", isMobile ? "inline ml-2 text-base" : "sr-only group-hover:not-sr-only group-hover:inline")}>Employee Portal</span>
        </Link>
        {navLinks.map(link => (
            <NavLink key={link.href} {...link} isMobile={isMobile} onLinkClick={onLinkClick}/>
        ))}
      </nav>
    </aside>
  );
}
