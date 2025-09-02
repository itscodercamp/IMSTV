
import type { Vehicle, Employee, Lead, Dealer } from './types';

// All data is now fetched from the database via server actions.
// This file can be removed or kept for type definitions if needed,
// but the mock data arrays are no longer used.

export const vehicles: Vehicle[] = [];
export const employees: Employee[] = [];
export const leads: (Lead & { vehicleMake?: string, vehicleModel?: string, employeeName?: string })[] = [];
export const dealers: Dealer[] = [];
