

import { fetchPlatformWideStats } from "../../actions";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminDashboardPage() {
    const platformStats = await fetchPlatformWideStats();
    
    return (
        <AdminDashboard platformStats={platformStats} />
    )
}

