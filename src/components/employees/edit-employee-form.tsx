
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { updateEmployeeAction } from "@/app/(main)/actions";
import { Loader2 } from "lucide-react";
import type { Employee } from "@/lib/types";

const employeeEditSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  role: z.enum(['Sales', 'Manager', 'Mechanic', 'HR', 'Office Boy', 'Cleaner', 'Security Guard', 'Other']),
  salary: z.coerce.number().min(0, "Salary must be a positive number."),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
});

type EmployeeFormValues = z.infer<typeof employeeEditSchema>;

export function EditEmployeeForm({ employee }: { employee: Employee }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeEditSchema),
    defaultValues: {
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role || "Sales",
      salary: employee.salary || 0,
      password: "",
    },
  });

  async function onSubmit(values: EmployeeFormValues) {
    setIsSubmitting(true);
    
    const dataToUpdate: Partial<Omit<Employee, 'id' | 'dealerId'>> = { ...values };
    if (!values.password) {
        delete dataToUpdate.password;
    }

    const result = await updateEmployeeAction(employee.id, dataToUpdate, employee.dealerId);
    
    if (result.success) {
        toast({
            variant: 'success',
            title: "Employee Updated",
            description: `${values.name}'s details have been updated.`,
        });
        router.push(`/employees/${employee.dealerId}/${employee.id}`);
        router.refresh();
    } else {
        toast({
            variant: 'destructive',
            title: "Failed to Update Employee",
            description: result.error || "An unexpected error occurred.",
        });
    }

    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Ramesh Kumar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="e.g., ramesh@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role / Designation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Mechanic">Mechanic</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Office Boy">Office Boy</SelectItem>
                    <SelectItem value="Cleaner">Cleaner</SelectItem>
                    <SelectItem value="Security Guard">Security Guard</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary (Monthly, ₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 25000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="Leave blank to keep unchanged" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
                </>
            ) : (
                "Save Changes"
            )}
            </Button>
        </div>
      </form>
    </Form>
  );
}
