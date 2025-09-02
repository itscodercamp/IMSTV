
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { addLeadAction } from "@/app/(employee)/actions";
import type { Employee, Vehicle } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "A valid phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  testDriveStatus: z.enum(['Scheduled', 'Completed', 'No Show', 'Not Scheduled']),
  conversionStatus: z.enum(['In Progress', 'Converted', 'Lost']),
  vehicleInterestType: z.enum(['inventory', 'other']),
  vehicleId: z.string().optional(),
  otherVehicleName: z.string().optional(),
  otherVehicleReg: z.string().optional(),
}).refine(data => {
    if (data.vehicleInterestType === 'inventory') return !!data.vehicleId;
    return true;
}, {
    message: "Please select a vehicle from inventory.",
    path: ['vehicleId']
}).refine(data => {
    if (data.vehicleInterestType === 'other') return !!data.otherVehicleName && !!data.otherVehicleReg;
    return true;
}, {
    message: "Vehicle name and registration are required.",
    path: ['otherVehicleName']
});

type LeadFormValues = z.infer<typeof leadSchema>;

export function AddLeadForm({ employee, inventory, onLeadAdded }: { employee: Employee, inventory: Vehicle[], onLeadAdded: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      testDriveStatus: "Not Scheduled",
      conversionStatus: "In Progress",
      vehicleInterestType: "inventory",
    },
  });

  const vehicleInterestType = form.watch('vehicleInterestType');

  async function onSubmit(values: LeadFormValues) {
    setIsSubmitting(true);
    const result = await addLeadAction(values, employee.id, employee.dealerId);

    if (result.success) {
      toast({
        variant: "success",
        title: "Lead Added",
        description: `Lead for ${values.name} has been successfully created.`,
      });
      form.reset();
      onLeadAdded(); // Callback to refresh recent leads
    } else {
      toast({
        variant: "destructive",
        title: "Failed to Add Lead",
        description: result.error || "An unexpected error occurred.",
      });
    }

    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Vikram Singh" {...field} />
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
                <FormLabel>Client Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 9876543210" {...field} />
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
                <FormLabel>Client Email (Optional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="e.g., vikram@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="conversionStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <FormField
                control={form.control}
                name="testDriveStatus"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Test Drive Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select test drive status" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Not Scheduled">Not Scheduled</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="No Show">No Show</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <FormField
                control={form.control}
                name="vehicleInterestType"
                render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>Vehicle of Interest</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="inventory" />
                            </FormControl>
                            <FormLabel className="font-normal">Select from Inventory</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="other" />
                            </FormControl>
                            <FormLabel className="font-normal">Other Vehicle</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {vehicleInterestType === 'inventory' && (
                 <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Select Vehicle</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Choose a vehicle from inventory..." />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {inventory.map(v => (
                                <SelectItem key={v.id} value={v.id}>
                                    {v.make} {v.model} ({v.year}) - {v.vin}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
            {vehicleInterestType === 'other' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
                     <FormField
                        control={form.control}
                        name="otherVehicleName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vehicle Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Maruti Suzuki Swift" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="otherVehicleReg"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Registration No.</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., MH12AB1234" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            )}
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" className="ml-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Lead...
              </>
            ) : (
              "Save New Lead"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
