
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { fetchPlatformWideStats } from "../../actions";

export default async function AdminUsersPage() {
    const platformStats = await fetchPlatformWideStats();
    return (
        <AdminDashboard platformStats={platformStats}/>
    )
}
