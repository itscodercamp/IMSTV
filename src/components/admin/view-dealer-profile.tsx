
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, MapPin, CheckCircle, Clock, Ban, Car, Bike, IndianRupee, Users, LineChart, Wrench, Contact, FileText, Eye as EyeIcon, Globe, Loader2, Edit } from "lucide-react";
import type { Dealer, Employee, Lead, Vehicle, WebsiteContent } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "../dashboard/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { updateWebsiteStatusAction } from "@/app/(admin)/actions";

const placeholderImage = 'https://placehold.co/600x400.png';

const statusConfig = {
    'approved': { variant: 'default', icon: CheckCircle, label: 'Approved', color: 'text-green-500' },
    'pending': { variant: 'secondary', icon: Clock, label: 'Pending', color: 'text-yellow-500' },
    'deactivated': { variant: 'destructive', icon: Ban, label: 'Deactivated', color: 'text-red-500' },
} as const;

const websiteStatusConfig = {
    'approved': { variant: 'default', icon: CheckCircle, label: 'Approved' },
    'pending_approval': { variant: 'secondary', icon: Clock, label: 'Pending Approval' },
    'rejected': { variant: 'destructive', icon: Ban, label: 'Rejected' },
    'not_requested': { variant: 'outline', icon: Globe, label: 'Not Live' },
} as const;


const VehicleCategoryIcon = ({ category }: { category: Dealer['vehicleCategory']}) => {
    if (category === 'Four Wheeler') return <Car className="h-5 w-5 text-muted-foreground" />;
    if (category === 'Two Wheeler') return <Bike className="h-5 w-5 text-muted-foreground" />;
    if (category === 'Hybrid') return <div className="flex"><Car className="h-4 w-4 text-muted-foreground"/><Bike className="h-4 w-4 text-muted-foreground"/></div>;
    return null;
}

interface DashboardData {
  totalStockValue: number;
  totalStockCount: number;
  availableStockCount: number;
  totalSalesCount: number;
  totalProfit: number;
  activeLeadsCount: number;
  totalRefurbCost: number;
}

interface ViewDealerProfileProps {
    dealer: Dealer & { websiteContent: WebsiteContent | null };
    dashboardData: DashboardData;
    vehicles: Vehicle[];
    employees: Employee[];
    leads: Lead[];
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Converted': return 'default';
        case 'Completed': return 'default';
        case 'In Progress': return 'secondary';
        case 'Scheduled': return 'secondary';
        case 'Lost': return 'destructive';
        case 'No Show': return 'destructive';
        default: return 'outline';
    }
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'D';
}

function DashboardTab({ data }: { data: DashboardData }) {
    const formatToLakhs = (value: number) => {
        if (value >= 100000) {
            return `${(value / 100000).toFixed(2)}L`;
        }
        return value.toLocaleString('en-IN');
    }
    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <StatCard title="Total Stock Value" value={`₹${formatToLakhs(data.totalStockValue)}`} icon={IndianRupee} description={`${data.totalStockCount} vehicles total`} />
            <StatCard title="Available Stock" value={data.availableStockCount.toString()} icon={Car} description="Ready for sale" />
            <StatCard title="Active Leads" value={data.activeLeadsCount.toString()} icon={Users} description="Potential customers" />
            <StatCard title="Total Profit" value={`₹${formatToLakhs(data.totalProfit)}`} icon={LineChart} description="From all sales" />
            <StatCard title="Vehicles Sold" value={`${data.totalSalesCount}`} icon={Car} description="All-time sales" />
            <StatCard title="Total Refurb Costs" value={`₹${formatToLakhs(data.totalRefurbCost)}`} icon={Wrench} description="Total spent on repairs" />
        </div>
    );
}

function InventoryTab({ vehicles, dealerId }: { vehicles: Vehicle[], dealerId: string }) {
    const router = useRouter();
    return (
        <Card>
            <CardHeader><CardTitle>Inventory ({vehicles.length})</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicles.map(v => (
                            <TableRow key={v.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Image src={v.images?.exterior?.front || placeholderImage} alt={v.make} width={64} height={48} className="rounded-md object-cover hidden sm:block aspect-[4/3]" data-ai-hint="vehicle car" />
                                        <div>
                                            <div className="font-semibold">{v.make} {v.model}</div>
                                            <div className="text-xs text-muted-foreground">{v.registrationNumber}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant={v.status === 'Sold' ? 'destructive' : 'default'}>{v.status}</Badge></TableCell>
                                <TableCell className="font-medium">₹{v.price.toLocaleString('en-IN')}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/inventory/${dealerId}/${v.id}`}>
                                            <EyeIcon className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function EmployeesTab({ employees, dealerId }: { employees: Employee[], dealerId: string }) {
     return (
        <Card>
            <CardHeader><CardTitle>Employees ({employees.length})</CardTitle></CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {employees.map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 border">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={emp.avatarUrl} alt={emp.name} data-ai-hint="person face" />
                                    <AvatarFallback>{getInitials(emp.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{emp.name}</p>
                                    <p className="text-sm text-muted-foreground">{emp.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-medium">₹{emp.salary.toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-muted-foreground">per month</p>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/users/${dealerId}/employee/${emp.id}`}>Manage Employee</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function LeadsTab({ leads }: { leads: Lead[] }) {
    return (
        <Card>
            <CardHeader><CardTitle>Leads ({leads.length})</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map(lead => (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    <div className="font-medium">{lead.name}</div>
                                    <div className="text-sm text-muted-foreground">{lead.phone}</div>
                                </TableCell>
                                <TableCell>{lead.vehicleMake} {lead.vehicleModel}</TableCell>
                                <TableCell>{lead.employeeName}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col gap-1.5 items-center">
                                        <Badge variant={getStatusVariant(lead.conversionStatus)}>{lead.conversionStatus}</Badge>
                                        <Badge variant={getStatusVariant(lead.testDriveStatus)}>{lead.testDriveStatus}</Badge>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


export function ViewDealerProfile({ dealer, dashboardData, vehicles, employees, leads }: ViewDealerProfileProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = React.useState(false);
  const { variant, icon: StatusIcon, label, color } = statusConfig[dealer.status];
  const { variant: websiteVariant, icon: WebsiteStatusIcon, label: websiteLabel } = websiteStatusConfig[dealer.websiteContent?.websiteStatus ?? 'not_requested'];

  const handleApproveWebsite = async () => {
    setIsApproving(true);
    const result = await updateWebsiteStatusAction(dealer.id, 'approved');
    if (result.success) {
        toast({
            variant: "success",
            title: "Website Approved!",
            description: `${dealer.dealershipName}'s website is now approved and can go live.`
        });
        router.refresh();
    } else {
        toast({
            variant: "destructive",
            title: "Approval Failed",
            description: result.error || "Could not approve the website.",
        });
    }
    setIsApproving(false);
  };

  return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/admin/users`}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Users
              </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
              <Link href={`/admin/users/${dealer.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2"/>
                  Edit Dealer
              </Link>
          </Button>
        </div>
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={"https://placehold.co/100x100.png"} alt={dealer.name} data-ai-hint="person face" />
                    <AvatarFallback className="text-3xl">{getInitials(dealer.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                    <CardTitle className="text-3xl font-bold">{dealer.dealershipName}</CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 text-sm text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5"><Users className="h-4 w-4"/> {dealer.name}</div>
                        <div className="flex items-center gap-1.5"><Mail className="h-4 w-4"/> {dealer.email}</div>
                        <div className="flex items-center gap-1.5"><Phone className="h-4 w-4"/> {dealer.phone}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {dealer.city}, {dealer.state}</div>
                    </div>
                     <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Badge variant={variant} className={`gap-1.5 text-sm`}>
                            <StatusIcon className={`h-4 w-4 ${color}`} />
                            Account: {label}
                        </Badge>
                         <Badge variant={websiteVariant} className="gap-1.5 text-sm">
                            <WebsiteStatusIcon className="h-4 w-4"/>
                            Website: {websiteLabel}
                        </Badge>
                        <div className="flex items-center gap-2">
                            <VehicleCategoryIcon category={dealer.vehicleCategory} />
                            <span className="text-muted-foreground text-sm">{dealer.vehicleCategory}</span>
                        </div>
                    </div>
                </div>
                </div>
            </CardHeader>
             {dealer.websiteContent?.websiteStatus === 'pending_approval' && (
                <CardFooter>
                    <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500/50 flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
                            <p className="font-medium text-yellow-800 dark:text-yellow-300">This dealer has requested to make their website live.</p>
                        </div>
                        <Button onClick={handleApproveWebsite} disabled={isApproving}>
                            {isApproving ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4" />}
                            <span className="ml-2">Approve Website</span>
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
        
        <Tabs defaultValue="dashboard">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard"><LineChart className="mr-2 h-4 w-4" />Dashboard</TabsTrigger>
                <TabsTrigger value="inventory"><Car className="mr-2 h-4 w-4" />Inventory</TabsTrigger>
                <TabsTrigger value="employees"><Users className="mr-2 h-4 w-4" />Employees</TabsTrigger>
                <TabsTrigger value="leads"><Contact className="mr-2 h-4 w-4" />Leads</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-4">
                <DashboardTab data={dashboardData}/>
            </TabsContent>
            <TabsContent value="inventory" className="mt-4">
                <InventoryTab vehicles={vehicles} dealerId={dealer.id}/>
            </TabsContent>
             <TabsContent value="employees" className="mt-4">
                <EmployeesTab employees={employees} dealerId={dealer.id} />
            </TabsContent>
            <TabsContent value="leads" className="mt-4">
                <LeadsTab leads={leads} />
            </TabsContent>
        </Tabs>
      </div>
  );
}
