
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
import { updateDealerAction } from "@/app/(admin)/actions";
import { Loader2 } from "lucide-react";
import type { Dealer } from "@/lib/types";

const dealerEditSchema = z.object({
  name: z.string().min(2, "Name is required."),
  dealershipName: z.string().min(2, "Dealership name is required."),
  phone: z.string().min(10, "A valid 10-digit phone number is required.").max(15),
  email: z.string().email("Invalid email address."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  vehicleCategory: z.enum(['Two Wheeler', 'Four Wheeler', 'Hybrid']),
  status: z.enum(['approved', 'pending', 'deactivated']),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
});

type DealerFormValues = z.infer<typeof dealerEditSchema>;

export function EditDealerForm({ dealer }: { dealer: Dealer }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const form = useForm<DealerFormValues>({
    resolver: zodResolver(dealerEditSchema),
    defaultValues: {
      name: dealer.name,
      dealershipName: dealer.dealershipName,
      phone: dealer.phone,
      email: dealer.email,
      city: dealer.city,
      state: dealer.state,
      vehicleCategory: dealer.vehicleCategory,
      status: dealer.status,
      password: "",
    },
  });

  async function onSubmit(values: DealerFormValues) {
    setIsSubmitting(true);
    
    const dataToUpdate: Partial<Omit<Dealer, 'id'>> = { ...values };
    if (!values.password) {
        delete dataToUpdate.password;
    }

    const result = await updateDealerAction(dealer.id, dataToUpdate);
    
    if (result.success) {
        toast({
            variant: 'success',
            title: "Dealer Updated",
            description: `${values.dealershipName}'s details have been updated.`,
        });
        router.push(`/admin/users/${dealer.id}`);
        router.refresh();
    } else {
        toast({
            variant: 'destructive',
            title: "Failed to Update Dealer",
            description: result.error || "An unexpected error occurred.",
        });
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Owner Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="dealershipName" render={({ field }) => (
                <FormItem><FormLabel>Dealership Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="vehicleCategory" render={({ field }) => (
                <FormItem><FormLabel>Vehicle Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Four Wheeler">Four Wheeler</SelectItem>
                            <SelectItem value="Two Wheeler">Two Wheeler</SelectItem>
                            <SelectItem value="Hybrid">Hybrid (Both)</SelectItem>
                        </SelectContent>
                    </Select>
                <FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Account Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="deactivated">Deactivated</SelectItem>
                        </SelectContent>
                    </Select>
                <FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel>New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Leave blank to keep unchanged" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
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
