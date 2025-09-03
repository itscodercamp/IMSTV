

"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { User, UserCheck, UserX, Search, MoreHorizontal, CheckCircle, XCircle, Ban, Clock, Trash2, AlertTriangle, Eye, Car, Bike, Package, Users as UsersIcon, BadgeCheck, ShoppingCart, Globe, BarChart, AreaChart, Map, Target, Crown, IndianRupee, Mail, Phone, ExternalLink, Building2 } from "lucide-react";
import type { Dealer } from "@/lib/types";
import { Input } from "../ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { fetchDealers, updateDealerStatusAction, deleteDealerAction } from "@/app/(admin)/actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import Link from 'next/link';
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const TooltipList = ({ items }: { items: { name: string, dealershipName: string }[] }) => {
    if (!items || items.length === 0) return <p>No dealers in this category.</p>;

    return (
        <div className="space-y-1 max-h-48 overflow-y-auto">
            {items.map((item, i) => (
                <div key={i} className="text-xs">
                    <p className="font-medium text-foreground">{item.dealershipName}</p>
                    <p className="text-muted-foreground">{item.name}</p>
                </div>
            ))}
        </div>
    );
};


const StatCard = ({ title, value, icon: Icon, color, tooltipContent, onClick }: { title: string, value: number | string, icon: React.ElementType, color: string, tooltipContent?: React.ReactNode, onClick?: () => void }) => {
    const cardContent = (
         <Card className={cn("cursor-pointer hover:bg-muted/50 transition-colors", onClick && "cursor-pointer")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );

    if (tooltipContent) {
        return (
             <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild onClick={onClick}>{cardContent}</TooltipTrigger>
                    <TooltipContent>{tooltipContent}</TooltipContent>
                </Tooltip>
             </TooltipProvider>
        )
    }

    return cardContent;
}

const statusConfig = {
    'approved': { variant: 'default', icon: CheckCircle, label: 'Approved', color: 'text-green-500' },
    'pending': { variant: 'secondary', icon: Clock, label: 'Pending', color: 'text-yellow-500' },
    'deactivated': { variant: 'destructive', icon: Ban, label: 'Deactivated', color: 'text-red-500' },
} as const;

const websiteStatusConfig = {
    'approved': { variant: 'default', label: 'Approved', className: 'bg-green-100 text-green-800 border-green-200' },
    'pending_approval': { variant: 'secondary', label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'rejected': { variant: 'destructive', label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200'},
    'not_requested': { variant: 'outline', label: 'Not Live', className: '' },
} as const;


const DealerStat = ({ icon: Icon, value, label }: {icon: React.ElementType, value: string | number, label: string}) => (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="font-medium">{value}</span>
        <span>{label}</span>
    </div>
)

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'D';
}

const DealerPerformanceCard = ({ dealer }: { dealer: Dealer & { stats: any }}) => {
    const { name, dealershipName, state, phone, stats, websiteStatus } = dealer;
    const { totalVehicles, soldVehicles, totalProfit, totalEmployees, totalLeads } = stats;
    const { variant, label, className } = websiteStatusConfig[websiteStatus ?? 'not_requested'];
    
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={`https://avatar.vercel.sh/${dealershipName}`} alt={dealershipName} />
                    <AvatarFallback>{getInitials(dealershipName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle className="text-base">{dealershipName}</CardTitle>
                    <CardDescription>{name} - {state}</CardDescription>
                </div>
                 <Button asChild variant="outline" size="icon" className="h-7 w-7">
                    <Link href={`/admin/users/${dealer.id}`}><ExternalLink className="h-4 w-4"/></Link>
                 </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm flex-grow">
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <DealerStat icon={Car} value={totalVehicles} label="Vehicles" />
                    <DealerStat icon={ShoppingCart} value={soldVehicles} label="Sold" />
                    <DealerStat icon={IndianRupee} value={totalProfit.toLocaleString('en-IN')} label="Profit" />
                    <DealerStat icon={UsersIcon} value={totalEmployees} label="Staff" />
                    <DealerStat icon={Target} value={totalLeads} label="Leads" />
                 </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground justify-between">
                <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3"/> {phone}
                </div>
                 <Badge variant={variant} className={cn("text-xs", className)}>{label}</Badge>
            </CardFooter>
        </Card>
    )
}

const TopPerformerCard = ({ dealer, rank }: { dealer: Dealer & { stats: any }, rank: number}) => {
    const { name, dealershipName, stats } = dealer;
    const { soldValue } = stats;
     const rankColor = rank === 1 ? "text-amber-500" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-amber-700" : "text-muted-foreground";

    return (
        <div className="flex items-center gap-4 py-2 px-1">
            <div className={`flex items-center justify-center w-6 font-bold ${rankColor}`}><Crown className="h-4 w-4"/></div>
             <Avatar className="h-9 w-9">
                <AvatarImage src={`https://avatar.vercel.sh/${dealershipName}`} alt={dealershipName} />
                <AvatarFallback>{getInitials(dealershipName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="text-sm font-medium leading-none">{dealershipName}</p>
                <p className="text-xs text-muted-foreground">{name}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold">₹{soldValue.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Sales</p>
            </div>
        </div>
    )
}


const DashboardContent = ({ dealers, platformStats }: { 
    dealers: (Dealer & { stats: any })[],
    platformStats?: { totalVehicles: number; soldVehicles: number; inStockVehicles: number; totalEmployees: number; liveWebsites: number; allDealers: any[]; approvedDealers: any[]; pendingDealers: any[]; deactivatedDealers: any[]; }
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || "");
    const [statusFilter, setStatusFilter] = React.useState(searchParams.get('status') || "");

    const handleFilterClick = (status: string) => {
        setStatusFilter(status);
        const params = new URLSearchParams(window.location.search);
        params.set('status', status);
        router.push(`${pathname}?${params.toString()}`);
    }

    const filteredDealers = React.useMemo(() => {
        let filtered = dealers;

        if (statusFilter) {
            filtered = filtered.filter(d => d.status === statusFilter);
        }

        if (!searchTerm) return filtered;

        return filtered.filter(d => 
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.dealershipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.phone.includes(searchTerm)
        );
    }, [dealers, searchTerm, statusFilter]);
    
    const topPerformers = React.useMemo(() => {
        return [...dealers].sort((a,b) => b.stats.soldValue - a.stats.soldValue).slice(0, 10);
    }, [dealers]);


    return (
        <div className="space-y-6">
            {platformStats && (
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">Platform-Wide Stats</h2>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
                        <StatCard title="All Vehicles" value={platformStats.totalVehicles} icon={Package} color="text-blue-500"/>
                        <StatCard title="Sold" value={platformStats.soldVehicles} icon={ShoppingCart} color="text-red-500"/>
                        <StatCard title="In Stock" value={platformStats.inStockVehicles} icon={BadgeCheck} color="text-green-500"/>
                        <StatCard title="Employees" value={platformStats.totalEmployees} icon={UsersIcon} color="text-orange-500"/>
                        <StatCard title="Live Websites" value={platformStats.liveWebsites} icon={Globe} color="text-purple-500"/>
                        <StatCard title="All Dealers" value={platformStats.allDealers.length} icon={Building2} color="text-gray-500" onClick={() => handleFilterClick('')} tooltipContent={<TooltipList items={platformStats.allDealers} />} />
                        <StatCard title="Approved" value={platformStats.approvedDealers.length} icon={CheckCircle} color="text-green-500" onClick={() => handleFilterClick('approved')} tooltipContent={<TooltipList items={platformStats.approvedDealers} />} />
                        <StatCard title="Pending" value={platformStats.pendingDealers.length} icon={Clock} color="text-yellow-500" onClick={() => handleFilterClick('pending')} tooltipContent={<TooltipList items={platformStats.pendingDealers} />} />
                        <StatCard title="Deactivated" value={platformStats.deactivatedDealers.length} icon={Ban} color="text-red-500" onClick={() => handleFilterClick('deactivated')} tooltipContent={<TooltipList items={platformStats.deactivatedDealers} />} />
                    </div>
                </div>
            )}
             <Separator />
            <div>
                 <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">Dealer Performance</h2>
                 
                 <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search dealers by name, state, phone..." 
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {filteredDealers.map(dealer => (
                                <DealerPerformanceCard key={dealer.id} dealer={dealer}/>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performers</CardTitle>
                                <CardDescription>Top 10 dealers by all-time sales value.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {topPerformers.map((dealer, index) => (
                                    <TopPerformerCard key={dealer.id} dealer={dealer} rank={index + 1} />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                 </div>
            </div>

        </div>
    )
}

const DeactivationDialog = ({ user, onConfirm, onCancel }: { user: Dealer | null, onConfirm: (reason: string) => void, onCancel: () => void }) => {
    const [reason, setReason] = React.useState("");

    if (!user) return null;

    return (
        <Dialog open={!!user} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Deactivate Dealer Account</DialogTitle>
                    <DialogDescription>
                        You are about to deactivate the account for <span className="font-semibold text-foreground">{user.dealershipName}</span>. Please provide a reason for this action.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="deactivationReason">Reason for Deactivation</Label>
                    <Textarea 
                        id="deactivationReason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Violation of terms, repeated customer complaints, etc."
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={() => onConfirm(reason)} disabled={!reason.trim()}>Confirm Deactivation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


const UsersContent = ({ users, isLoading, onUpdateStatus, onDeleteUser }: { users: Dealer[], isLoading: boolean, onUpdateStatus: (id: string, status: Dealer['status'], reason?: string) => void, onDeleteUser: (id: string) => void }) => {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [userToDelete, setUserToDelete] = React.useState<Dealer | null>(null);
    const [userToDeactivate, setUserToDeactivate] = React.useState<Dealer | null>(null);

    const filteredUsers = (status: Dealer['status']) => {
        return users.filter(user => 
            user.status === status &&
            (
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.dealershipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
    }
    
    const handleConfirmDelete = async () => {
        if (userToDelete) {
            await onDeleteUser(userToDelete.id);
            setUserToDelete(null);
        }
    }

    const handleConfirmDeactivation = async (reason: string) => {
        if (userToDeactivate) {
            await onUpdateStatus(userToDeactivate.id, 'deactivated', reason);
            setUserToDeactivate(null);
        }
    }
    
    const VehicleCategoryIcon = ({ category }: { category: Dealer['vehicleCategory']}) => {
        if (category === 'Four Wheeler') return <Car className="h-4 w-4 text-muted-foreground" />;
        if (category === 'Two Wheeler') return <Bike className="h-4 w-4 text-muted-foreground" />;
        if (category === 'Hybrid') return <div className="flex"><Car className="h-3 w-3 text-muted-foreground"/><Bike className="h-3 w-3 text-muted-foreground"/></div>;
        return null;
    }

    const UserTable = ({ users }: { users: Dealer[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Dealership</TableHead>
                    <TableHead>Category</TableHead>
                    {users[0]?.status === 'deactivated' && <TableHead>Reason</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Loading users...
                        </TableCell>
                    </TableRow>
                ) : users.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                            No users found in this category.
                        </TableCell>
                    </TableRow>
                ) : users.map(user => {
                    const isSystemAdmin = user.id === 'admin-user';
                    return (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="font-medium text-foreground">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{user.dealershipName}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <VehicleCategoryIcon category={user.vehicleCategory} />
                                    <span className="text-muted-foreground text-xs">{user.vehicleCategory}</span>
                                </div>
                            </TableCell>
                            {user.status === 'deactivated' && (
                                <TableCell>
                                    <p className="text-xs text-muted-foreground max-w-xs truncate">{user.deactivationReason || 'N/A'}</p>
                                </TableCell>
                            )}
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild disabled={isSystemAdmin}>
                                        <Button variant="ghost" size="icon" disabled={isSystemAdmin}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                           <Link href={`/admin/users/${user.id}`}>
                                                <Eye className="mr-2 h-4 w-4" /> View Profile
                                           </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {user.status !== 'approved' && (
                                            <DropdownMenuItem onClick={() => onUpdateStatus(user.id, 'approved')}>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                            </DropdownMenuItem>
                                        )}
                                        {user.status !== 'deactivated' && (
                                            <DropdownMenuItem onClick={() => setUserToDeactivate(user)}>
                                                <XCircle className="mr-2 h-4 w-4" /> Deactivate
                                            </DropdownMenuItem>
                                        )}
                                         {user.status === 'deactivated' && (
                                            <DropdownMenuItem onClick={() => onUpdateStatus(user.id, 'approved')}>
                                                <Clock className="mr-2 h-4 w-4" /> Re-Activate (Approve)
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setUserToDelete(user)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    );

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Approve, deactivate, and manage all dealer accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="pending">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <TabsList>
                            <TabsTrigger value="pending">New for Approval</TabsTrigger>
                            <TabsTrigger value="approved">Approved Users</TabsTrigger>
                            <TabsTrigger value="deactivated">Deactivated Users</TabsTrigger>
                        </TabsList>
                        <div className="relative w-full md:w-auto md:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or dealership..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <TabsContent value="pending" className="mt-4">
                        <UserTable users={filteredUsers('pending')} />
                    </TabsContent>
                     <TabsContent value="approved" className="mt-4">
                        <UserTable users={filteredUsers('approved')} />
                    </TabsContent>
                     <TabsContent value="deactivated" className="mt-4">
                        <UserTable users={filteredUsers('deactivated')} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>

        {/* Deletion Confirmation Dialog */}
        <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-red-600"/>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                       Are you sure you want to delete the user <span className="font-semibold text-foreground">{userToDelete?.name}</span>? This will permanently delete their account and <span className="font-bold text-destructive">all associated data (vehicles, employees, leads).</span> This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirmDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Permanently Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Deactivation Dialog */}
        <DeactivationDialog
            user={userToDeactivate}
            onConfirm={handleConfirmDeactivation}
            onCancel={() => setUserToDeactivate(null)}
        />
        </>
    )
}


export function AdminDashboard({ platformStats }: { platformStats?: any }) {
    const [userList, setUserList] = React.useState<(Dealer & { stats: any })[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const pathname = usePathname();

    const loadDealers = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const dealers = await fetchDealers();
            setUserList(dealers.filter(d => d.id !== 'admin-user'));
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to load dealers' });
            console.error("Failed to load dealers:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadDealers();
    }, [loadDealers]);
    

    const handleUpdateStatus = async (userId: string, status: Dealer['status'], reason?: string) => {
        const result = await updateDealerStatusAction(userId, status, reason);
        if (result.success) {
            loadDealers(); // Refresh the list from DB
            toast({
                variant: 'success',
                title: "Status Updated",
                description: "The dealer's status has been successfully updated."
            })
        } else {
             toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "Could not update the dealer's status."
            })
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        const result = await deleteDealerAction(userId);
        if (result.success) {
            await loadDealers();
            toast({
                variant: 'success',
                title: "User Deleted",
                description: "The dealer account has been permanently deleted."
            });
        } else {
            toast({
                variant: 'destructive',
                title: "Deletion Failed",
                description: result.error || "Could not delete the dealer's account."
            });
        }
    };

    if (pathname.startsWith('/admin/users/') && pathname.length > '/admin/users/'.length) {
        return null;
    }
    
    if (pathname === '/admin/users') {
        return <UsersContent users={userList} isLoading={isLoading} onUpdateStatus={handleUpdateStatus} onDeleteUser={handleDeleteUser} />
    }

    return <DashboardContent dealers={userList} platformStats={platformStats} />
}

