
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { UserPlus, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { registerDealerAction } from "../actions";

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  dealershipName: z.string().min(2, "Dealership name is required."),
  phone: z.string().min(10, "A valid 10-digit phone number is required.").max(15),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  vehicleCategory: z.enum(['Two Wheeler', 'Four Wheeler', 'Hybrid'], {
      required_error: "Please select a vehicle category."
  }),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [registrationSuccess, setRegistrationSuccess] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            dealershipName: "",
            phone: "",
            email: "",
            city: "",
            state: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const result = await registerDealerAction(values);

        if (result.success) {
            setRegistrationSuccess(true);
        } else {
             toast({
                variant: "destructive",
                title: "Registration Failed",
                description: result.message,
            });
            setIsLoading(false);
        }
    }

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
           <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary text-primary-foreground rounded-full">
             <ShieldCheck className="h-8 w-8" />
            </div>
             <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Trusted Vehicles</h1>
                <p className="mt-1 text-base text-muted-foreground">
                    New Dealer Registration
                </p>
             </div>
           </div>
        </div>
        <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border-border/50">
            {registrationSuccess ? (
                <CardContent className="flex flex-col items-center justify-center text-center p-6 min-h-[380px]">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Registration Complete!</h2>
                    <p className="text-muted-foreground">
                        Your account has been created and is now pending for admin approval. You will be notified once it is active.
                    </p>
                     <Button asChild className="mt-6">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </CardContent>
            ) : (
                <>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2"><UserPlus /> Create Your Account</CardTitle>
                    <CardDescription>Fill out the details below to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="e.g. Rakesh Sharma" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="dealershipName" render={({ field }) => (
                                <FormItem><FormLabel>Dealership Name</FormLabel><FormControl><Input placeholder="e.g. Sharma Motors" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone Number (User ID)</FormLabel><FormControl><Input placeholder="Your 10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email Address (Optional)</FormLabel><FormControl><Input type="email" placeholder="e.g. contact@sharmamotors.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Pune" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="state" render={({ field }) => (
                                <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="e.g. Maharashtra" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="md:col-span-2">
                                <FormField control={form.control} name="vehicleCategory" render={({ field }) => (
                                    <FormItem><FormLabel>Vehicle Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select your business type" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Four Wheeler">Four Wheeler</SelectItem>
                                                <SelectItem value="Two Wheeler">Two Wheeler</SelectItem>
                                                <SelectItem value="Hybrid">Hybrid (Both)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="Create a strong password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                <FormItem><FormLabel>Re-enter Password</FormLabel><FormControl><Input type="password" placeholder="Confirm your password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Registering...</> : <>Register Now</>}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex-col text-sm text-center">
                    <Separator className="mb-4" />
                    <p className="text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Login here
                        </Link>
                    </p>
                </CardFooter>
                </>
            )}
        </Card>
    </div>
  );
}
