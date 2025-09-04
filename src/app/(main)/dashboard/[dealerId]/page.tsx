
import { fetchDashboardData, fetchAgingInventory, fetchLeads } from "../../actions";
import { getStockOverview } from "@/lib/db";
import { DashboardClientPage } from "@/components/dashboard/dashboard-client-page";

export default async function DashboardPage({ params }: { params: { dealerId: string } }) {
  const { dealerId } = params;
  const [dashboardData, agingInventory, stockOverviewData, leads] = await Promise.all([
    fetchDashboardData(dealerId),
    fetchAgingInventory(dealerId),
    getStockOverview(dealerId),
    fetchLeads(dealerId, 5), // Fetch leads from the last 5 days for the dashboard
  ]);

  const stockOverviewChartData = [
    { name: 'For Sale', value: stockOverviewData['For Sale'].count, vehicles: stockOverviewData['For Sale'].vehicles, fill: 'hsl(var(--chart-1))' },
    { name: 'Sold', value: stockOverviewData['Sold'].count, vehicles: stockOverviewData['Sold'].vehicles, fill: 'hsl(var(--chart-2))' },
    { name: 'In Refurbishment', value: stockOverviewData['In Refurbishment'].count, vehicles: stockOverviewData['In Refurbishment'].vehicles, fill: 'hsl(var(--chart-3))' },
    { name: 'Draft', value: stockOverviewData['Draft'].count, vehicles: stockOverviewData['Draft'].vehicles, fill: 'hsl(var(--chart-4))' },
  ];

  return (
    <DashboardClientPage
      dashboardData={dashboardData}
      agingInventory={agingInventory}
      dealerId={dealerId}
      stockOverview={stockOverviewChartData}
      leads={leads}
    />
  );
}
