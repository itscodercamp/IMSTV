
import { fetchPlatformWideStats, fetchDealers } from "../../actions";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminDashboardPage() {
    const [platformStats, dealers] = await Promise.all([
        fetchPlatformWideStats(),
        fetchDealers()
    ]);
    
    const initialDealers = dealers.filter(d => d.id !== 'admin-user');

    return (
        <AdminDashboard platformStats={platformStats} initialDealers={initialDealers} />
    )
}
