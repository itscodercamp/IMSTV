
'use server';

import type { Employee, Lead, SalarySlip, Vehicle } from '@/lib/types';
import * as z from "zod";
import { addLead as addLeadDb, getLeadsByEmployeeId as getLeadsByEmployeeIdDb, getAllVehicles, getSalarySlipsForEmployee as getSalarySlipsForEmployeeDb, updateEmployeeDb, getAllLeads as getAllLeadsForDealerDb, getAvailableVehiclesCount as getAvailableVehiclesCountDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "A valid phone number is required"),
  testDriveStatus: z.enum(['Scheduled', 'Completed', 'No Show', 'Not Scheduled']),
  conversionStatus: z.enum(['In Progress', 'Converted', 'Lost']),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  vehicleId: z.string().optional(),
  otherVehicleName: z.string().optional(),
  otherVehicleReg: z.string().optional(),
});


export async function addLeadAction(
    values: z.infer<typeof leadSchema>,
    employeeId: string,
    dealerId: string
): Promise<{ success: boolean; error?: string }> {
     try {
        const leadData = {
            ...values,
            assignedTo: employeeId,
            dealerId: dealerId,
            dateAdded: new Date().toISOString(),
        };
        await addLeadDb(leadData);
        revalidatePath(`/employee-dashboard`); // Revalidate employee's leads
        revalidatePath(`/leads?dealerId=${dealerId}`); // Revalidate dealer's leads
        return { success: true };
    } catch (error) {
        console.error("Failed to add lead:", error);
        return { success: false, error: "A database error occurred." };
    }
}


export async function getLeadsByEmployeeIdAction(employeeId: string): Promise<Lead[]> {
    return await getLeadsByEmployeeIdDb(employeeId);
}

export async function fetchVehiclesForDealerAction(dealerId: string): Promise<Vehicle[]> {
    return await getAllVehicles(dealerId);
}

export async function getDealerInfo(dealerId: string): Promise<{dealershipName: string} | undefined> {
    const db = await require('@/lib/db').getDB();
    return db.get('SELECT dealershipName FROM dealers WHERE id = ?', dealerId);
}

export async function getSalarySlipsAction(employeeId: string): Promise<SalarySlip[]> {
    return await getSalarySlipsForEmployeeDb(employeeId);
}

export async function updateEmployeeAvatarAction(employeeId: string, avatarUrl: string): Promise<{ success: boolean; error?: string }> {
    const result = await updateEmployeeDb(employeeId, { avatarUrl });
    if (result.success) {
      const employee = await (await import('@/lib/db')).getEmployeeById(employeeId);
        if(employee) {
          revalidatePath(`/employee-dashboard`, 'layout');
          revalidatePath(`/employees/${employee.dealerId}`);
        }
    }
    return result;
}

export async function getAllLeadsForDealerAction(dealerId: string): Promise<Lead[]> {
    return await getAllLeadsForDealerDb(dealerId);
}

export async function getEmployeeDashboardData(employeeId: string, dealerId: string): Promise<{ myLeadsCount: number; availableVehiclesCount: number }> {
    const myLeads = await getLeadsByEmployeeIdDb(employeeId);
    const availableVehiclesCount = await getAvailableVehiclesCountDb(dealerId);
    return {
        myLeadsCount: myLeads.length,
        availableVehiclesCount,
    };
}
