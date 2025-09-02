
import { fetchDashboardData, fetchAgingInventory } from "../../actions";
import { getStockOverview } from "@/lib/db";
import { DashboardClientPage } from "@/components/dashboard/dashboard-client-page";

export default async function DashboardPage({ params }: { params: { dealerId: string } }) {
  const { dealerId } = params;
  const [dashboardData, agingInventory, stockOverviewData] = await Promise.all([
    fetchDashboardData(dealerId),
    fetchAgingInventory(dealerId),
    getStockOverview(dealerId),
  ]);

  const stockOverviewChartData = [
    { name: 'For Sale', value: stockOverviewData['For Sale'], fill: 'hsl(var(--chart-1))' },
    { name: 'Sold', value: stockOverviewData['Sold'], fill: 'hsl(var(--chart-2))' },
    { name: 'In Refurbishment', value: stockOverviewData['In Refurbishment'], fill: 'hsl(var(--chart-3))' },
    { name: 'Draft', value: stockOverviewData['Draft'], fill: 'hsl(var(--chart-4))' },
  ];

  return (
    <DashboardClientPage
      dashboardData={dashboardData}
      agingInventory={agingInventory}
      dealerId={dealerId}
      stockOverview={stockOverviewChartData}
    />
  );
}
