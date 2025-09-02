
'use server';

import { getDashboardData, getAgingInventory, getAllEmployees, getAllLeads, getAllVehicles, addEmployeeDb, deleteEmployeeDb, updateEmployeeDb, getVehicleByIdDb as getVehicleByIdDb, getEmployeeById as getEmployeeByIdDb, generateSalarySlipDb, getSalarySlipsForEmployee, addVehicleDb, deleteVehicleDb, updateVehicleDb, testDbConnection, setupDatabase, upsertWebsiteContent as upsertWebsiteContentDb, getWebsiteContent as getWebsiteContentDb } from '@/lib/db';
import type { Employee, SalarySlip, Vehicle, WebsiteContent } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function fetchDashboardData(dealerId: string) {
    return await getDashboardData(dealerId);
}

export async function fetchAgingInventory(dealerId: string) {
    return await getAgingInventory(dealerId);
}

export async function fetchEmployees(dealerId: string): Promise<(Employee & { salarySlips: SalarySlip[] })[]> {
    const employees = await getAllEmployees(dealerId);
    const employeesWithSlips = await Promise.all(
        employees.map(async (employee) => {
            const salarySlips = await getSalarySlipsForEmployee(employee.id);
            return { ...employee, salarySlips };
        })
    );
    return employeesWithSlips;
}

export async function addEmployeeAction(
    employeeData: Omit<Employee, 'id' | 'avatarUrl' | 'dealerId'>,
    dealerId: string
) {
    const result = await addEmployeeDb(employeeData, dealerId);
    if (result.success) {
        revalidatePath(`/employees?dealerId=${dealerId}`);
        revalidatePath(`/salary-slips?dealerId=${dealerId}`);
    }
    return result;
}

export async function updateEmployeeAction(
    employeeId: string,
    employeeData: Partial<Omit<Employee, 'id' | 'dealerId'>>,
    dealerId: string
): Promise<{ success: boolean; error?: string }> {
    const result = await updateEmployeeDb(employeeId, employeeData);
    if (result.success) {
        revalidatePath(`/employees?dealerId=${dealerId}`);
        revalidatePath(`/employees/${employeeId}/edit`);
        revalidatePath(`/salary-slips?dealerId=${dealerId}`);
    }
    return result;
}


export async function deleteEmployeeAction(employeeId: string, dealerId: string): Promise<{ success: boolean; error?: string }> {
    const result = await deleteEmployeeDb(employeeId);
    if (result.success) {
        revalidatePath(`/employees?dealerId=${dealerId}`);
        revalidatePath(`/salary-slips?dealerId=${dealerId}`);
    }
    return result;
}

export async function fetchLeads(dealerId: string) {
    return await getAllLeads(dealerId);
}

export async function fetchVehicles(dealerId: string) {
    return await getAllVehicles(dealerId);
}

export async function fetchVehicleById(vehicleId: string, dealerId: string): Promise<Vehicle | undefined> {
    return await getVehicleByIdDb(vehicleId, dealerId);
}

export async function fetchEmployeeById(employeeId: string): Promise<Employee | undefined> {
    return await getEmployeeByIdDb(employeeId);
}

export async function generateSalarySlipAction(
    slipData: Omit<SalarySlip, 'id' | 'generatedDate'>
): Promise<{ success: boolean; error?: string }> {
    const result = await generateSalarySlipDb(slipData);
    if (result.success) {
        revalidatePath(`/salary-slips?dealerId=${slipData.dealerId}`);
        revalidatePath(`/employee-dashboard?tab=salary-slip`);
    }
    return result;
}

export async function addVehicleAction(vehicleData: Partial<Vehicle>, dealerId: string): Promise<{ success: boolean; error?: string, vehicleId?: string }> {
    const result = await addVehicleDb(vehicleData, dealerId);
    if (result.success) {
        revalidatePath(`/inventory/${dealerId}`);
    }
    return result;
}

export async function updateVehicleAction(vehicleId: string, data: Partial<Vehicle>): Promise<{ success: boolean; error?: string }> {
    const result = await updateVehicleDb(vehicleId, data);
    if (result.success) {
        const vehicle = await getVehicleByIdDb(vehicleId);
        if (vehicle) {
            revalidatePath(`/inventory/${vehicle.dealerId}`);
            revalidatePath(`/inventory/${vehicle.dealerId}/edit/${vehicleId}`);
        }
    }
    return result;
}

export async function deleteVehicleAction(vehicleId: string, dealerId: string): Promise<{ success: boolean; error?: string }> {
    const result = await deleteVehicleDb(vehicleId);
    if (result.success) {
        revalidatePath(`/inventory/${dealerId}`);
    }
    return result;
}

export async function markVehicleAsSoldAction(vehicleId: string, soldData: Partial<Vehicle>): Promise<{ success: boolean; error?: string }> {
    const dataToUpdate = {
        ...soldData,
        status: 'Sold' as const,
        sellingDate: new Date(soldData.sellingDate!).toISOString(),
    };
    const result = await updateVehicleDb(vehicleId, dataToUpdate);
    if (result.success) {
        const vehicle = await getVehicleByIdDb(vehicleId);
        if (vehicle) {
            revalidatePath(`/inventory/${vehicle.dealerId}`);
        }
    }
    return result;
}

export async function testDbConnectionAction() {
    return await testDbConnection();
}

export async function setupDatabaseAction() {
    await setupDatabase();
    return { success: true };
}

export async function upsertWebsiteContentAction(dealerId: string, content: Partial<WebsiteContent>): Promise<{ success: boolean; error?: string }> {
    const result = await upsertWebsiteContentDb(dealerId, content);
    if (result.success) {
        revalidatePath(`/my-website/${dealerId}/customize`);
        revalidatePath(`/api/website/${dealerId}/[...slug]`, 'page');
    }
    return result;
}

export async function getWebsiteContentAction(dealerId: string) {
    return getWebsiteContentDb(dealerId);
}
    
