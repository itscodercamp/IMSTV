
'use server';

import type { Dealer, Employee, Lead, Vehicle } from "@/lib/types";
import { 
    fetchDealers as fetchDealersDb, 
    updateDealerStatusAction as updateDealerStatusDb, 
    deleteDealerAction as deleteDealerDb, 
    getDealerById as getDealerByIdDb,
    getDashboardData,
    getAllVehicles,
    getAllEmployees,
    getAllLeads,
    getPlatformWideStats
} from "@/lib/db"; 

export async function fetchDealers(): Promise<Dealer[]> {
    return await fetchDealersDb();
}

export async function fetchDealerById(id: string): Promise<Dealer | undefined> {
    return await getDealerByIdDb(id);
}

export async function updateDealerStatusAction(id: string, status: Dealer['status']): Promise<{ success: boolean }> {
    return await updateDealerStatusDb(id, status);
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
