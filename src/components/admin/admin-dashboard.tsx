
"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, UserCheck, UserX, Search, MoreHorizontal, CheckCircle, XCircle, Ban, Clock, Trash2, AlertTriangle, Eye, Car, Bike, Package, Users as UsersIcon, BadgeCheck, ShoppingCart } from "lucide-react";
import type { Dealer } from "@/lib/types";
import { Input } from "../ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { fetchDealers, updateDealerStatusAction, deleteDealerAction } from "@/app/(admin)/actions";
import { usePathname } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import Link from 'next/link';
import { Separator } from "../ui/separator";


const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number | string, icon: React.ElementType, color: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">{value}</div>
        </CardContent>
    </Card>
)

const statusConfig = {
    'approved': { variant: 'default', icon: CheckCircle, label: 'Approved', color: 'text-green-500' },
    'pending': { variant: 'secondary', icon: Clock, label: 'Pending', color: 'text-yellow-500' },
    'deactivated': { variant: 'destructive', icon: Ban, label: 'Deactivated', color: 'text-red-500' },
} as const;


const DashboardContent = ({ dealerCounts, platformStats }: { 
    dealerCounts: { total: number, approved: number, pending: number, deactivated: number },
    platformStats?: { totalVehicles: number, soldVehicles: number, inStockVehicles: number, totalEmployees: number }
}) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">Dealerships Overview</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Dealers" value={dealerCounts.total} icon={User} color="text-sky-500"/>
                    <StatCard title="Approved" value={dealerCounts.approved} icon={UserCheck} color="text-green-500"/>
                    <StatCard title="Pending" value={dealerCounts.pending} icon={Clock} color="text-yellow-500"/>
                    <StatCard title="Deactivated" value={dealerCounts.deactivated} icon={UserX} color="text-red-500"/>
                </div>
            </div>
            {platformStats && (
                <>
                <Separator />
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">Platform-Wide Stats</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="All Registered Vehicles" value={platformStats.totalVehicles} icon={Package} color="text-blue-500"/>
                        <StatCard title="All Sold Vehicles" value={platformStats.soldVehicles} icon={ShoppingCart} color="text-red-500"/>
                        <StatCard title="All Available in Stock" value={platformStats.inStockVehicles} icon={BadgeCheck} color="text-green-500"/>
                        <StatCard title="All Employees" value={platformStats.totalEmployees} icon={UsersIcon} color="text-orange-500"/>
                    </div>
                </div>
                </>
            )}

        </div>
    )
}

const UsersContent = ({ users, isLoading, onUpdateStatus, onDeleteUser }: { users: Dealer[], isLoading: boolean, onUpdateStatus: (id: string, status: Dealer['status']) => void, onDeleteUser: (id: string) => void }) => {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [userToDelete, setUserToDelete] = React.useState<Dealer | null>(null);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.dealershipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            await onDeleteUser(userToDelete.id);
            setUserToDelete(null);
        }
    }
    
    const VehicleCategoryIcon = ({ category }: { category: Dealer['vehicleCategory']}) => {
        if (category === 'Four Wheeler') return <Car className="h-4 w-4 text-muted-foreground" />;
        if (category === 'Two Wheeler') return <Bike className="h-4 w-4 text-muted-foreground" />;
        if (category === 'Hybrid') return <div className="flex"><Car className="h-3 w-3 text-muted-foreground"/><Bike className="h-3 w-3 text-muted-foreground"/></div>;
        return null;
    }


    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Approve, deactivate, and manage all dealer accounts.</CardDescription>
                <div className="relative mt-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, dealership, or status..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Dealership</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-center">Status</TableHead>
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
                        ) : filteredUsers.map(user => {
                            const { variant, icon: Icon, label, color } = statusConfig[user.status];
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
                                    <TableCell className="text-center">
                                        <Badge variant={variant} className={`gap-1.5`}>
                                            <Icon className={`h-3.5 w-3.5 ${color}`} />
                                            {label}
                                        </Badge>
                                    </TableCell>
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
                                                    <DropdownMenuItem onClick={() => onUpdateStatus(user.id, 'deactivated')}>
                                                        <XCircle className="mr-2 h-4 w-4" /> Deactivate
                                                    </DropdownMenuItem>
                                                )}
                                                 {user.status === 'deactivated' && (
                                                    <DropdownMenuItem onClick={() => onUpdateStatus(user.id, 'pending')}>
                                                        <Clock className="mr-2 h-4 w-4" /> Re-Activate
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
        </>
    )
}


export function AdminDashboard({ initialDealers, platformStats }: { initialDealers?: Dealer[], platformStats?: any }) {
    const [userList, setUserList] = React.useState<Dealer[]>(initialDealers || []);
    const [isLoading, setIsLoading] = React.useState(!initialDealers);
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
        // Only fetch if initial data wasn't provided (like on the users page)
        if (!initialDealers) {
            loadDealers();
        }
    }, [initialDealers, loadDealers]);

    const dealerCounts = React.useMemo(() => {
        const counts = userList.reduce((acc, user) => {
            acc[user.status] = (acc[user.status] || 0) + 1;
            return acc;
        }, { approved: 0, pending: 0, deactivated: 0 });
    
        return {
            ...counts,
            total: userList.length,
        };
    }, [userList]);

    const handleUpdateStatus = async (userId: string, status: Dealer['status']) => {
        const result = await updateDealerStatusAction(userId, status);
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

    return <DashboardContent dealerCounts={dealerCounts} platformStats={platformStats} />
}
