
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminUsersPage() {
    // The AdminDashboard component will fetch the users itself when on the /admin/users page.
    return (
        <AdminDashboard />
    )
}
