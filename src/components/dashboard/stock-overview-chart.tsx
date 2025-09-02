
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

interface StockOverviewChartProps {
  stockData: {
    name: string;
    value: number;
    fill: string;
  }[];
}

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
                content={<ChartTooltipContent hideLabel />}
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
