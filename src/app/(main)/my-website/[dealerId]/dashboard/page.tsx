
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PartyPopper, Calendar, ExternalLink, Brush, MessageSquare, PieChart, Users, Eye, CheckCircle, ChevronLeft, ChevronRight, Settings, Copy, ShieldCheck, Clock, Loader2, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";
import { add, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { getWebsiteContentAction, upsertWebsiteContentAction } from "@/app/(main)/actions";
import type { WebsiteContent } from "@/lib/types";

const StatCard = ({ title, value, icon: Icon, action, children }: { title: string, value: string, icon: React.ElementType, action?: React.ReactNode, children?: React.ReactNode }) => (
    <Card className="flex flex-col">
        <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center">
            <p className="text-2xl font-bold">{value}</p>
            {children}
        </CardContent>
         {action && <CardContent className="pt-0">{action}</CardContent>}
    </Card>
);

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();


// Mock data for demonstration
const mockOffers = [
    { id: 1, userName: "Rohan Sharma", vehicle: "Maruti Swift VXI", offerPrice: 450000, date: new Date(), phone: "9876543210" },
    { id: 2, userName: "Priya Patel", vehicle: "Hyundai i20 Asta", offerPrice: 620000, date: add(new Date(), { days: -1 }), phone: "9876543211" },
    { id: 3, userName: "Amit Kumar", vehicle: "Honda City VX", offerPrice: 800000, date: add(new Date(), { days: -2 }), phone: "9876543212" },
    { id: 4, userName: "Sneha Reddy", vehicle: "Tata Nexon XZ+", offerPrice: 750000, date: add(new Date(), { days: -4 }), phone: "9876543213" },
    { id: 5, userName: "Vijay Singh", vehicle: "Ford EcoSport", offerPrice: 580000, date: add(new Date(), { days: -5 }), phone: "9876543214" },
    { id: 6, userName: "Anjali Mehta", vehicle: "Kia Seltos HTK", offerPrice: 950000, date: add(new Date(), { days: -6 }), phone: "9876543215" },
    { id: 7, userName: "Sandeep Desai", vehicle: "Mahindra XUV500", offerPrice: 1200000, date: add(new Date(), { days: -7 }), phone: "9876543216" },
];

const mockMessages = [
    { id: 1, userName: "Kavita Iyer", email: "kavita@example.com", phone: "8765432109", message: "Interested in the Swift. Is it available for a test drive tomorrow?", date: new Date() },
    { id: 2, userName: "Manish Gupta", email: "manish@example.com", phone: "8765432108", message: "Do you provide financing options? Please share details.", date: add(new Date(), { hours: -5 }) },
    { id: 3, userName: "Sunita Rao", email: "sunita@example.com", phone: "8765432107", message: "I want to sell my old car. Do you accept trade-ins?", date: add(new Date(), { days: -1 }) },
    { id: 4, userName: "Arjun Pillai", email: "arjun@example.com", phone: "8765432106", message: "What is the final on-road price for the Honda City?", date: add(new Date(), { days: -2 }) },
    { id: 5, userName: "Pooja Trivedi", email: "pooja@example.com", phone: "8765432105", message: "Can you source a used Toyota Innova for me?", date: add(new Date(), { days: -3 }) },
    { id: 6, userName: "Imran Khan", email: "imran@example.com", phone: "8765432104", message: "The location of your dealership is not clear on the map.", date: add(new Date(), { days: -4 }) },
];

const ITEMS_PER_PAGE = 5;

const LiveStatusControl = ({ websiteContent, dealerId, reload }: { websiteContent: WebsiteContent | null, dealerId: string, reload: () => void }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    
    const handleRequestLive = async () => {
        setIsLoading(true);
        const result = await upsertWebsiteContentAction(dealerId, { websiteStatus: 'pending_approval' });
        if (result.success) {
            toast({ title: "Request Sent!", description: "Your request to go live has been sent to the admin for approval." });
            reload();
        } else {
            toast({ title: "Request Failed", description: result.error, variant: 'destructive' });
        }
        setIsLoading(false);
    }
    
    const handleToggleLive = async (isLive: boolean) => {
        setIsLoading(true);
        const result = await upsertWebsiteContentAction(dealerId, { isLive });
        if (result.success) {
            toast({ title: `Website is now ${isLive ? 'Live' : 'Offline'}` });
            reload();
        } else {
            toast({ title: "Update Failed", description: result.error, variant: 'destructive' });
        }
        setIsLoading(false);
    }
    
    const websiteStatus = websiteContent?.websiteStatus;
    const isLive = websiteContent?.isLive ?? false;

    if (websiteStatus === 'approved') {
        return (
             <div className="flex items-center space-x-2">
                <Switch id="live-status" checked={isLive} onCheckedChange={handleToggleLive} disabled={isLoading}/>
                <Label htmlFor="live-status" className="font-medium">Go Live</Label>
            </div>
        )
    }

    if (websiteStatus === 'pending_approval') {
        return (
            <Badge variant="secondary" className="gap-2 text-base px-4 py-2">
                <Clock className="h-4 w-4"/>
                <span>Pending Admin Approval</span>
            </Badge>
        )
    }

    if (websiteStatus === 'rejected') {
        return (
            <Badge variant="destructive" className="gap-2 text-base px-4 py-2">Website Rejected</Badge>
        )
    }
    
    return (
        <Button onClick={handleRequestLive} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Request to Go Live
        </Button>
    )
}


export default function MyWebsiteDashboardPage() {
    const [dealerInfo, setDealerInfo] = React.useState({dealershipName: 'Your Brand'});
    const [websiteContent, setWebsiteContent] = React.useState<WebsiteContent | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [planExpiry, setPlanExpiry] = React.useState<Date | null>(null);
    const [offersPage, setOffersPage] = React.useState(1);
    const [messagesPage, setMessagesPage] = React.useState(1);
    const params = useParams();
    const dealerId = params.dealerId as string;

    const loadData = React.useCallback(async () => {
        if (!dealerId) return;
        setIsLoading(true);
        const content = await getWebsiteContentAction(dealerId);
        setWebsiteContent(content);

        const info = localStorage.getItem('dealer_info');
        if (info) setDealerInfo(JSON.parse(info));

        const planType = localStorage.getItem(`my_website_plan_type_${dealerId}`);
        const activationDate = new Date();
        let expiryDate;

        if (planType === 'trial') {
            expiryDate = add(activationDate, { months: 1 });
        } else if (planType === '24') {
            expiryDate = add(activationDate, { months: 24 });
        } else { // Default to 12 months / annual
            expiryDate = add(activationDate, { months: 12 });
        }
        setPlanExpiry(expiryDate);
        setIsLoading(false);
    }, [dealerId]);

     React.useEffect(() => {
       loadData();
    }, [loadData]);

    const websiteUrl = `${dealerInfo.dealershipName.toLowerCase().replace(/\s+/g, '-')}.trustedvehicles.com`;
    
    // Pagination logic for offers
    const totalOfferPages = Math.ceil(mockOffers.length / ITEMS_PER_PAGE);
    const paginatedOffers = mockOffers.slice((offersPage - 1) * ITEMS_PER_PAGE, offersPage * ITEMS_PER_PAGE);

    // Pagination logic for messages
    const totalMessagePages = Math.ceil(mockMessages.length / ITEMS_PER_PAGE);
    const paginatedMessages = mockMessages.slice((messagesPage - 1) * ITEMS_PER_PAGE, messagesPage * ITEMS_PER_PAGE);

    const handleCopyId = () => {
        navigator.clipboard.writeText(dealerId);
        toast({
            title: "Dealer ID Copied!",
            description: "Your ID for API access has been copied to the clipboard.",
            variant: "success",
        });
    }
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

  return (
    <div className="space-y-6">
        {/* Header Row */}
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-5 w-5 text-primary"/>
                    <div>
                        <p className="text-muted-foreground">Plan expires on</p>
                        <p className="font-semibold">{planExpiry ? format(planExpiry, 'PPP') : 'Calculating...'}</p>
                    </div>
                     <Button size="sm" variant="outline">Renew Now</Button>
                 </div>
                 <div className="flex flex-col items-center gap-3">
                    <LiveStatusControl websiteContent={websiteContent} dealerId={dealerId} reload={loadData} />
                    {websiteContent?.isLive && (
                         <div className="flex flex-col items-center gap-2 text-xs">
                             <Button size="sm" asChild variant="secondary" className="w-full">
                                <a href={`https://${websiteUrl}`} target="_blank" rel="noopener noreferrer">
                                    {websiteUrl}
                                    <ExternalLink className="h-4 w-4 ml-2"/>
                                </a>
                            </Button>
                             <div className="flex items-center gap-1 text-muted-foreground bg-muted p-1 px-2 rounded-md">
                                <span>API ID: {dealerId}</span>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCopyId}><Copy className="h-3 w-3"/></Button>
                             </div>
                         </div>
                    )}
                 </div>
            </CardContent>
        </Card>
        
        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <StatCard title="Monthly Website Visits" value="1,204" icon={PieChart}/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Data refreshes every 24 hours.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <StatCard title="Active Theme" value="Modern" icon={Brush}>
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-4 w-4 rounded-full bg-primary" />
                    <div className="h-4 w-4 rounded-full bg-accent" />
                    <div className="h-4 w-4 rounded-full bg-secondary" />
                </div>
            </StatCard>

            <StatCard title="New Contact Messages" value="15" icon={MessageSquare} action={<Button size="sm" variant="outline">View Messages</Button>}/>
             <Card className="flex flex-col items-center justify-center text-center p-4 bg-primary/10 border-primary/20">
                <Settings className="h-8 w-8 text-primary mb-2"/>
                <p className="font-semibold mb-2">Design Your Website</p>
                <p className="text-xs text-muted-foreground mb-3">Change themes, colors, and layout.</p>
                <Button asChild>
                    <Link href={`/my-website/${dealerId}/customize`}>
                        Customize Website
                    </Link>
                </Button>
            </Card>
        </div>

        {/* Offers Table */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Offers from Website</CardTitle>
                    <CardDescription>Latest offers made by customers on your website.</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead className="text-right">Offer Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedOffers.map(offer => (
                        <TableRow key={offer.id}>
                            <TableCell>
                                <div className="font-medium">{offer.userName}</div>
                                <div className="text-sm text-muted-foreground">{offer.phone}</div>
                            </TableCell>
                            <TableCell>{offer.vehicle}</TableCell>
                            <TableCell className="text-right font-semibold">₹{offer.offerPrice.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-right">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Delete Offer</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOffersPage(prev => Math.max(prev - 1, 1))}
                        disabled={offersPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOffersPage(prev => Math.min(prev + 1, totalOfferPages))}
                        disabled={offersPage === totalOfferPages}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>

         {/* Contact Messages Table */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Contact Messages</CardTitle>
                    <CardDescription>Latest messages from your website's contact form.</CardDescription>
                </div>
                 <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[200px]">Customer</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="w-[150px]">Received</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedMessages.map(msg => (
                        <TableRow key={msg.id}>
                            <TableCell>
                                <div className="font-medium">{msg.userName}</div>
                                <div className="text-sm text-muted-foreground">{msg.phone}</div>
                                <div className="text-xs text-muted-foreground truncate">{msg.email}</div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                <p className="truncate">{msg.message}</p>
                            </TableCell>
                            <TableCell className="text-xs">{format(msg.date, "PPp")}</TableCell>
                            <TableCell className="text-right">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Delete Message</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMessagesPage(prev => Math.max(prev - 1, 1))}
                        disabled={messagesPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMessagesPage(prev => Math.min(prev + 1, totalMessagePages))}
                        disabled={messagesPage === totalMessagePages}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>

    </div>
  );
}
