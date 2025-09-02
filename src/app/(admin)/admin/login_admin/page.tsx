
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Rocket, ShieldCheck, LogIn } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export default function AdminLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "admin@trustedvehicles.com",
            password: "password",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (values.email === "admin@trustedvehicles.com" && values.password.length > 0) {
            localStorage.setItem("admin_authenticated", "true");
            toast({
                variant: "success",
                title: "Login Successful",
                description: "Redirecting to the Admin Dashboard...",
            });
            router.push("/admin/dashboard");
        } else {
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid credentials. Please try again.",
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
                    Administrator Portal
                </p>
             </div>
           </div>
        </div>
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Admin Access</CardTitle>
                <CardDescription>Enter your admin credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="admin@example.com" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : <><LogIn className="mr-2 h-4 w-4"/>Sign In</>}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
