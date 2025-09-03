
"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Skeleton } from "../ui/skeleton"
import { Separator } from "../ui/separator"

const chartConfig = {
  vehicles: {
    label: "Vehicles",
  },
  'For Sale': {
    label: "For Sale",
    color: "hsl(var(--chart-1))",
  },
  'Sold': {
    label: "Sold",
    color: "hsl(var(--chart-2))",
  },
  'In Refurbishment': {
    label: "In Refurbishment",
    color: "hsl(var(--chart-3))",
  },
  'Draft': {
    label: "Draft",
    color: "hsl(var(--chart-4))",
  },
}

interface VehicleInfo {
    name: string;
    reg: string;
    price: number;
}

interface StockDataPoint {
  name: string;
  value: number;
  fill: string;
  vehicles: VehicleInfo[];
}

interface StockOverviewChartProps {
  stockData: StockDataPoint[];
}

const CustomTooltipContent = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: StockDataPoint = payload[0].payload;
    return (
      <div className="p-4 bg-background/90 border rounded-lg shadow-xl max-w-sm text-sm">
        <p className="font-bold text-base mb-2">{data.name} ({data.value})</p>
        <Separator />
        {data.vehicles.length > 0 ? (
           <ul className="mt-2 space-y-2">
            {data.vehicles.map((vehicle, index) => (
              <li key={index} className="flex justify-between items-center gap-4">
                <div className="flex-1 truncate">
                  <p className="font-medium text-foreground truncate">{vehicle.name}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.reg}</p>
                </div>
                <p className="font-semibold text-primary whitespace-nowrap">₹{vehicle.price?.toLocaleString('en-IN')}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-2">No vehicles in this category.</p>
        )}
      </div>
    );
  }

  return null;
};


export function StockOverviewChart({ stockData }: StockOverviewChartProps) {
  const totalVehicles = React.useMemo(() => {
    if (!stockData) return 0;
    return stockData.reduce((acc, curr) => acc + curr.value, 0)
  }, [stockData])

  if (!stockData) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Stock Overview</CardTitle>
        <CardDescription>Current status of all vehicles.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-72"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<CustomTooltipContent />}
              />
              <Pie
                data={stockData}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                strokeWidth={5}
                activeIndex={0}
                activeShape={(props) => (
                  <Sector {...props} cornerRadius={4} />
                )}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalVehicles.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground"
                          >
                            Vehicles
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
