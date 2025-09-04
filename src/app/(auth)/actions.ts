
'use server';

import type { Dealer, Employee } from '@/lib/types';
import * as z from "zod";
import { getDealerByPhone, getEmployeeByPhone, getDealerByEmail, addDealer, checkExistingUser } from '@/lib/db';
import { addTestHit } from '@/lib/db';

const loginFormSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits.").max(15),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const registerFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  dealershipName: z.string().min(2, "Dealership name is required."),
  phone: z.string().min(10, "A valid 10-digit phone number is required.").max(15),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  vehicleCategory: z.enum(['Two Wheeler', 'Four Wheeler', 'Hybrid']),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


export async function loginAction(values: z.infer<typeof loginFormSchema>): Promise<{ success: boolean; message: string; userType?: 'dealer' | 'employee'; userData?: Dealer | Employee }> {
    try {
        // First, check if it's a dealer
        const dealer = await getDealerByPhone(values.phone);
        if (dealer) {
            if (dealer.password !== values.password) {
                return { success: false, message: 'Incorrect password.' };
            }

            // If it's the admin user, bypass status checks
            if (dealer.email === 'admin@trustedvehicles.com' && dealer.id === 'admin-user') {
                 return { success: true, message: 'Login successful!', userType: 'dealer', userData: dealer };
            }
            
            if (dealer.status === 'pending') {
                return { success: false, message: 'Your account is pending admin approval.' };
            }
            if (dealer.status === 'deactivated') {
                return { success: false, message: 'Your account has been deactivated by the administrator.' };
            }
            if (dealer.status === 'approved') {
                return { success: true, message: 'Login successful!', userType: 'dealer', userData: dealer };
            }
            return { success: false, message: 'Invalid account status. Please contact support.' };
        }

        // If not a dealer, check if it's an employee
        const employee = await getEmployeeByPhone(values.phone);
        if (employee) {
            if (employee.password !== values.password) {
                return { success: false, message: 'Incorrect password.' };
            }
            if (employee.status !== 'active') {
                return { success: false, message: 'Your account is inactive. Please contact your manager.' };
            }
            return { success: true, message: 'Login successful!', userType: 'employee', userData: employee };
        }
        
        // If neither is found
        return { success: false, message: 'No account found with this phone number.' };

    } catch (error) {
        console.error('Unified Login Error:', error);
        return { success: false, message: 'An unexpected error occurred during login.' };
    }
}


export async function registerDealerAction(values: z.infer<typeof registerFormSchema>): Promise<{ success: boolean; message: string; }> {
    try {
        const existingUser = await checkExistingUser(values.phone, values.email || '');
        if (existingUser) {
            return { success: false, message: 'A user with this phone number or email already exists.' };
        }

        const dealerData: Omit<Dealer, 'id' | 'status'> = {
            name: values.name,
            dealershipName: values.dealershipName,
            phone: values.phone,
            email: values.email || '',
            city: values.city,
            state: values.state,
            vehicleCategory: values.vehicleCategory,
            password: values.password,
        };

        await addDealer(dealerData);

        return { success: true, message: 'Registration successful! Your account is pending admin approval.' };

    } catch (error) {
        console.error('Registration Error:', error);
        return { success: false, message: 'An unexpected error occurred during registration.' };
    }
}


export async function testDbHit(name: string, phone: string) {
    return await addTestHit(name, phone);
}
