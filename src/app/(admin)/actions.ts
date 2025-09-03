

'use server';

import type { Dealer, Employee, Lead, Vehicle, WebsiteContent } from "@/lib/types";
import { 
    fetchDealers as fetchDealersDb, 
    updateDealerStatusAction as updateDealerStatusDb, 
    deleteDealerAction as deleteDealerDb, 
    getDealerById as getDealerByIdDb,
    getDashboardData,
    getAllVehicles,
    getAllEmployees,
    getAllLeads,
    getPlatformWideStats,
    updateWebsiteStatusAction as updateWebsiteStatusDb,
    getWebsiteContent,
    updateDealerDb
} from "@/lib/db"; 
import { revalidatePath } from "next/cache";

export async function fetchDealers(): Promise<(Dealer & {stats: any})[]> {
    return await fetchDealersDb();
}

export async function fetchDealerById(id: string): Promise<(Dealer & {websiteContent: WebsiteContent | null}) | undefined> {
    const [dealer, websiteContent] = await Promise.all([
        getDealerByIdDb(id),
        getWebsiteContent(id)
    ]);
    if (!dealer) return undefined;
    return { ...dealer, websiteContent };
}

export async function updateDealerAction(dealerId: string, data: Partial<Omit<Dealer, 'id'>>): Promise<{ success: boolean, error?: string }> {
    const result = await updateDealerDb(dealerId, data);
    if (result.success) {
        revalidatePath(`/admin/users`);
        revalidatePath(`/admin/users/${dealerId}`);
    }
    return result;
}

export async function updateDealerStatusAction(id: string, status: Dealer['status']): Promise<{ success: boolean }> {
    return await updateDealerStatusDb(id, status);
}

export async function updateWebsiteStatusAction(dealerId: string, status: WebsiteContent['websiteStatus']): Promise<{ success: boolean; error?: string }> {
    const result = await updateWebsiteStatusDb(dealerId, status);
    if(result.success) {
        revalidatePath(`/admin/users/${dealerId}`);
        revalidatePath(`/my-website/${dealerId}/dashboard`);
    }
    return result;
}

export async function deleteDealerAction(id: string): Promise<{ success: boolean; error?: string }> {
    return await deleteDealerDb(id);
}

export async function getDealerDashboardData(dealerId: string) {
    return await getDashboardData(dealerId);
}

export async function getDealerVehicles(dealerId: string): Promise<Vehicle[]> {
    return await getAllVehicles(dealerId);
}

export async function getDealerEmployees(dealerId: string): Promise<Employee[]> {
    const employees = await getAllEmployees(dealerId);
    return employees.map(({ salarySlips, ...employee }) => employee);
}

export async function getDealerLeads(dealerId: string): Promise<Lead[]> {
    return await getAllLeads(dealerId);
}

export async function fetchPlatformWideStats() {
    return await getPlatformWideStats();
}


