
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  Users,
  Contact,
  Wand2,
  Settings,
  ShieldCheck,
  FileText,
  PlusCircle,
  Globe,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import * as React from "react";

const NavLink = ({ href, icon: Icon, label, pathname, isMobile, onLinkClick }: { href: string, icon: React.ElementType, label: string, pathname: string, isMobile?: boolean, onLinkClick?: () => void }) => {
  const isActive = (path: string) => {
    const cleanHref = href.split('?')[0]; // For query param based links
    const cleanPath = path.split('?')[0];

    // Handle base routes
    if (cleanHref === cleanPath) return true;

    // Handle dynamic child routes, making sure it's part of the same section
    if (cleanHref.includes('/inventory') && cleanPath.startsWith(cleanHref)) return true;
    if (cleanHref.includes('/employees') && cleanPath.startsWith(cleanHref)) return true;
    if (cleanHref.includes('/salary-slips') && cleanPath.startsWith(cleanHref)) return true;
    if (cleanHref.includes('/leads') && cleanPath.startsWith(cleanHref)) return true;
    if (cleanHref.includes('/settings') && cleanPath.startsWith(cleanHref)) return true;
    if (cleanHref.includes('/my-website') && cleanPath.startsWith(cleanHref)) return true;


    return false;
  }
  
  const linkContent = (
      <Link href={href} className={cn(
          "flex items-center gap-3 transition-colors",
          isActive(pathname) ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground",
          isMobile ? "px-2.5 py-2 text-sm rounded-md" : "h-8 w-8 justify-center rounded-lg md:h-8 md:w-8",
           isActive(pathname) && isMobile && "bg-secondary",
          !isMobile && "group-hover:w-full group-hover:justify-start group-hover:px-2"
      )} onClick={onLinkClick}>
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className={cn("truncate", isMobile ? "text-sm" : "text-xs sr-only group-hover:not-sr-only group-hover:ml-2")}>{label}</span>
      </Link>
  );

  if (isMobile) {
      return linkContent;
  }

  return (
    <TooltipProvider>
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

export default function AppSidebar({ isMobile = false, onLinkClick }: { isMobile?: boolean, onLinkClick?: () => void }) {
  const pathname = usePathname();
  const [effectiveDealerId, setEffectiveDealerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const info = localStorage.getItem('dealer_info');
    if (info) {
      const parsedInfo = JSON.parse(info);
      setEffectiveDealerId(parsedInfo.id);
    }
  }, []);


  const navLinks = [
    { href: `/dashboard/${effectiveDealerId}`, icon: LayoutDashboard, label: "Dashboard" },
    { href: `/dashboard/${effectiveDealerId}/inventory`, icon: Car, label: "Inventory" },
    { href: `/employees/${effectiveDealerId}`, icon: Users, label: "Employees" },
    { href: `/leads/${effectiveDealerId}`, icon: Contact, label: "Leads" },
    { href: `/salary-slips/${effectiveDealerId}`, icon: FileText, label: "Salary Slips" },
    { href: `/my-website/${effectiveDealerId}`, icon: Globe, label: "My Website" },
  ];
  
  if (!effectiveDealerId) return null;

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
          href={`/dashboard/${effectiveDealerId}`}
          className={cn(
            "flex items-center gap-2",
            "shrink-0",
            "group-hover:w-full group-hover:justify-start group-hover:px-4 transition-all",
             isMobile 
                ? "self-start mb-4 h-10 w-full justify-start px-2" 
                : "h-9 w-9 justify-center md:h-8 md:w-8"
          )}
           onClick={onLinkClick}
        >
          <ShieldCheck className="h-5 w-5 transition-all group-hover:scale-110 flex-shrink-0 text-primary" />
          <span className={cn("truncate font-bold text-primary", isMobile ? "inline ml-2 text-base" : "sr-only group-hover:not-sr-only group-hover:inline")}>Trusted Vehicles</span>
        </Link>
        {navLinks.map(link => (
            <NavLink key={link.href} {...link} pathname={pathname} isMobile={isMobile} onLinkClick={onLinkClick}/>
        ))}
      </nav>
      <nav className={cn(
          "mt-auto flex flex-col gap-1.5 px-2 sm:py-5",
          isMobile ? "w-full p-4 border-t" : "items-center"
      )}>
        <NavLink href={`/settings/${effectiveDealerId}`} icon={Settings} label="Settings" pathname={pathname} isMobile={isMobile} onLinkClick={onLinkClick}/>
      </nav>
    </aside>
  );
}
