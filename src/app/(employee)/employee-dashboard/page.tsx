
"use client";

import * as React from "react";
import type { Employee, Vehicle } from "@/lib/types";
import { getEmployeeDashboardData, fetchVehiclesForDealerAction } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

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


export default function EmployeeDashboardPage() {
    const [employee, setEmployee] = React.useState<Employee | null>(null);
    const [dashboardData, setDashboardData] = React.useState<{ myLeadsCount: number; availableVehiclesCount: number } | null>(null);
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const info = localStorage.getItem("employee_info");
        if(info) {
            const parsedInfo: Employee = JSON.parse(info);
            setEmployee(parsedInfo);
            fetchInitialData(parsedInfo.id, parsedInfo.dealerId);
        } else {
            setIsLoading(false);
        }
    }, [])

    const fetchInitialData = async (employeeId: string, dealerId: string) => {
        setIsLoading(true);
        try {
            const [fetchedDashboardData, fetchedVehicles] = await Promise.all([
                getEmployeeDashboardData(employeeId, dealerId),
                fetchVehiclesForDealerAction(dealerId)
            ]);
            setDashboardData(fetchedDashboardData);
            setVehicles(fetchedVehicles.filter(v => v.status === 'For Sale'));
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        } finally {
            setIsLoading(false);
        }
    }
  
    if (isLoading || !employee || !dashboardData) {
        return <DashboardLoader />;
    }

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
