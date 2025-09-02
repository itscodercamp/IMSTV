
"use client";

import { Car, IndianRupee, Users, LineChart, Wrench } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StockOverviewChart } from "@/components/dashboard/stock-overview-chart";
import { AgingInventoryTable } from "@/components/dashboard/aging-inventory-table";
import type { Vehicle } from "@/lib/types";
import * as React from "react";
import { Skeleton } from "../ui/skeleton";
import { FloatingActionButton } from "../dealer/floating-action-button";

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
}

function DashboardLoader() {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
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

export function DashboardClientPage({ dashboardData, agingInventory, dealerId, stockOverview }: DashboardClientPageProps) {
  if (!dashboardData || !agingInventory || !stockOverview) {
      return <DashboardLoader />
  }
  
  const formatToLakhs = (value: number) => {
    if (value >= 100000) {
      return `${(value / 100000).toFixed(2)}L`;
    }
    return value.toLocaleString('en-IN');
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-12 lg:col-span-4">
                <AgingInventoryTable agingInventory={agingInventory} dealerId={dealerId} />
            </div>
            <div className="col-span-12 lg:col-span-3">
                <StockOverviewChart stockData={stockOverview} />
            </div>
        </div>
        <FloatingActionButton />
    </div>
  );
}
