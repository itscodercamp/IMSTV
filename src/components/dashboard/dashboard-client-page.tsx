
"use client";

import { Car, IndianRupee, Users, LineChart, Wrench, Contact } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StockOverviewChart } from "@/components/dashboard/stock-overview-chart";
import { AgingInventoryTable } from "@/components/dashboard/aging-inventory-table";
import type { Vehicle, Lead } from "@/lib/types";
import * as React from "react";
import { Skeleton } from "../ui/skeleton";
import { FloatingActionButton } from "../dealer/floating-action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { Button } from "../ui/button";
import Link from 'next/link';

interface DashboardData {
  totalStockValue: number;
  totalStockCount: number;
  availableStockCount: number;
  totalSalesCount: number;
  totalProfit: number;
  activeLeadsCount: number;
  totalRefurbCost: number;
}

interface StockOverview {
  name: string;
  value: number;
  fill: string;
}

interface DashboardClientPageProps {
  dashboardData: DashboardData;
  agingInventory: (Vehicle & { daysInStock: number })[];
  dealerId: string;
  stockOverview: StockOverview[];
  leads: Lead[];
}

function DashboardLoader() {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-12 lg:col-span-4">
                     <Skeleton className="h-96" />
                </div>
                <div className="col-span-12 lg:col-span-3">
                    <Skeleton className="h-96" />
                </div>
            </div>
        </div>
    )
}

function getStatusVariant(status: string) {
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

export function DashboardClientPage({ dashboardData, agingInventory, dealerId, stockOverview, leads }: DashboardClientPageProps) {
  if (!dashboardData || !agingInventory || !stockOverview) {
      return <DashboardLoader />
  }
  
  const formatToLakhs = (value: number) => {
    if (value >= 100000) {
      return `${(value / 100000).toFixed(2)}L`;
    }
    return value.toLocaleString('en-IN');
  }
  
  const recentLeads = leads;

  return (
    <div className="flex flex-col gap-4">
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <StatCard
            title="Total Stock Value"
            value={`₹${formatToLakhs(dashboardData.totalStockValue)}`}
            icon={IndianRupee}
            description={`${dashboardData.totalStockCount} vehicles total`}
            />
             <StatCard
            title="Available Stock"
            value={dashboardData.availableStockCount.toString()}
            icon={Car}
            description="Ready for sale"
            />
            <StatCard
            title="Active Leads"
            value={dashboardData.activeLeadsCount.toString()}
            icon={Users}
            description="Potential customers"
            />
            <StatCard
            title="Total Profit"
            value={`₹${formatToLakhs(dashboardData.totalProfit)}`}
            icon={LineChart}
            description="From all sales"
            />
            <StatCard
            title="Total Vehicles Sold"
            value={`${dashboardData.totalSalesCount}`}
            icon={Car}
            description="All-time sales performance"
            />
            <StatCard
            title="Total Refurb Costs"
            value={`₹${formatToLakhs(dashboardData.totalRefurbCost)}`}
            icon={Wrench}
            description="Total spent on repairs"
            />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Leads (Last 5 Days)</CardTitle>
                        <CardDescription>Your newest leads from the sales team.</CardDescription>
                    </div>
                     <Button asChild size="sm" variant="outline">
                        <Link href={`/leads/${dealerId}`}>View All</Link>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recentLeads.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">No new leads in the last 5 days.</p>
                    ) : (
                        recentLeads.map(lead => (
                            <div key={lead.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-full">
                                        <Contact className="h-5 w-5 text-secondary-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{lead.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                             {lead.vehicleMake && lead.vehicleModel ? `${lead.vehicleMake} ${lead.vehicleModel}`: lead.otherVehicleName || 'Any Vehicle'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant={getStatusVariant(lead.conversionStatus)} className="text-xs">{lead.conversionStatus}</Badge>
                                    <p className="text-xs text-muted-foreground">{format(new Date(lead.dateAdded), "PP")}</p>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
             <AgingInventoryTable agingInventory={agingInventory} dealerId={dealerId} />
        </div>
        
        <StockOverviewChart stockData={stockOverview} />

        <FloatingActionButton />
    </div>
  );
}
