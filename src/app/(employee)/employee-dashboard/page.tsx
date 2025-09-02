
"use client";

import * as React from "react";
import type { Employee, Vehicle, Lead, SalarySlip, Dealer } from "@/lib/types";
import { getEmployeeDashboardData, fetchVehiclesForDealerAction, getLeadsByEmployeeIdAction, getSalarySlipsAction, getDealerInfo } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, User, FileSpreadsheet, PlusCircle, LayoutGrid, LayoutDashboard } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import Image from "next/image";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { AddLeadForm } from "@/components/leads/add-lead-form";
import { RecentLeadsList } from "@/components/leads/recent-leads-list";
import { MyLeadsTable } from "@/components/leads/my-leads-table";
import { MyProfileCard } from "@/components/employees/my-profile-card";
import { MySalarySlipsTable } from "@/components/salary/my-salary-slips-table";

const placeholderImage = 'https://placehold.co/600x400.png';

function DashboardLoader() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 grid-cols-2">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

function MainDashboard({ employee, dashboardData, vehicles }: { employee: Employee, dashboardData: {myLeadsCount: number, availableVehiclesCount: number}, vehicles: Vehicle[] }) {
     return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2">
            <StatCard
                title="My Active Leads"
                value={dashboardData.myLeadsCount.toString()}
                icon={Users}
                description="Leads assigned to you"
            />
            <StatCard
                title="Available Vehicles"
                value={dashboardData.availableVehiclesCount.toString()}
                icon={Car}
                description="Vehicles ready for sale"
            />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Available Inventory</CardTitle>
                <CardDescription>Vehicles currently available for sale at your dealership.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {vehicles.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No vehicles are currently listed for sale.</p>
                    ) : (
                        vehicles.map(vehicle => (
                            <div key={vehicle.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-secondary/50">
                                <Image
                                    src={vehicle.images?.exterior?.front || placeholderImage}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    width={96}
                                    height={72}
                                    className="rounded-md object-cover aspect-[4/3]"
                                    data-ai-hint="vehicle car"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                                    <p className="text-sm text-muted-foreground">{vehicle.variant}</p>
                                    <p className="text-sm font-bold text-primary mt-1">₹{vehicle.price.toLocaleString('en-IN')}</p>
                                </div>
                                 <Button asChild variant="outline" size="sm">
                                    <Link href={`/inventory/${employee.dealerId}/${vehicle.id}`}>View</Link>
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
  );
}

function NewLeadTab({ employee, inventory, onLeadAdded }: { employee: Employee, inventory: Vehicle[], onLeadAdded: () => void }) {
    return (
        <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-2">
                 <CardHeader>
                    <CardTitle className="text-xl">Add New Lead</CardTitle>
                    <CardDescription>Fill out the form below to create a new customer lead.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddLeadForm employee={employee} inventory={inventory} onLeadAdded={onLeadAdded} />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Recent Leads</CardTitle>
                     <CardDescription>Your 3 most recently added leads.</CardDescription>
                </CardHeader>
                <CardContent>
                    <React.Suspense fallback={<p>Loading recent leads...</p>}>
                       <RecentLeadsListWrapper employeeId={employee.id} />
                    </React.Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

function RecentLeadsListWrapper({ employeeId }: { employeeId: string }) {
    const [recentLeads, setRecentLeads] = React.useState<Lead[]>([]);

    React.useEffect(() => {
        getLeadsByEmployeeIdAction(employeeId).then(allLeads => {
            setRecentLeads(allLeads.slice(0, 3));
        });
    }, [employeeId]);

    return <RecentLeadsList leads={recentLeads} />
}


export default function EmployeeDashboardPage() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || '';
    
    const [employee, setEmployee] = React.useState<Employee | null>(null);
    const [dealer, setDealer] = React.useState<Dealer | null>(null);
    const [dashboardData, setDashboardData] = React.useState<{ myLeadsCount: number; availableVehiclesCount: number } | null>(null);
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
    const [myLeads, setMyLeads] = React.useState<Lead[]>([]);
    const [salarySlips, setSalarySlips] = React.useState<SalarySlip[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const loadInitialData = React.useCallback(async (employeeInfo: Employee) => {
        setIsLoading(true);
        try {
            const [fetchedDashboardData, fetchedVehicles, fetchedLeads, fetchedSalarySlips, fetchedDealer] = await Promise.all([
                getEmployeeDashboardData(employeeInfo.id, employeeInfo.dealerId),
                fetchVehiclesForDealerAction(employeeInfo.dealerId),
                getLeadsByEmployeeIdAction(employeeInfo.id),
                getSalarySlipsAction(employeeInfo.id),
                getDealerInfo(employeeInfo.dealerId)
            ]);
            setDashboardData(fetchedDashboardData);
            setVehicles(fetchedVehicles.filter(v => v.status === 'For Sale'));
            setMyLeads(fetchedLeads);
            setSalarySlips(fetchedSalarySlips);
            setDealer(fetchedDealer as Dealer);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        const info = localStorage.getItem("employee_info");
        if (info) {
            const parsedInfo: Employee = JSON.parse(info);
            setEmployee(parsedInfo);
            loadInitialData(parsedInfo);
        } else {
            setIsLoading(false);
        }
    }, [loadInitialData])

    const handleAvatarChange = (newAvatarUrl: string) => {
        if(employee) {
            const updatedEmployee = { ...employee, avatarUrl: newAvatarUrl };
            setEmployee(updatedEmployee);
            localStorage.setItem("employee_info", JSON.stringify(updatedEmployee));
        }
    }
  
    if (isLoading || !employee) {
        return <DashboardLoader />;
    }

    const renderContent = () => {
        switch (tab) {
            case 'new-lead':
                return <NewLeadTab employee={employee} inventory={vehicles} onLeadAdded={() => loadInitialData(employee)} />;
            case 'my-leads':
                return <MyLeadsTable leads={myLeads} />;
            case 'profile':
                return <MyProfileCard employee={employee} onAvatarChange={handleAvatarChange} />;
            case 'salary-slips':
                 if (!dealer) return <DashboardLoader />;
                 return <MySalarySlipsTable salarySlips={salarySlips} employee={employee} dealer={dealer} />;
            case '': // Default dashboard
            default:
                if (!dashboardData) return <DashboardLoader />;
                return <MainDashboard employee={employee} dashboardData={dashboardData} vehicles={vehicles} />;
        }
    }

    return renderContent();
}
