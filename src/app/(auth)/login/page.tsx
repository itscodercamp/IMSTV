
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { CheckCircle, LogIn, User } from "lucide-react";
import type { Dealer, Employee } from "@/lib/types";
import { loginAction } from "../actions";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits.").max(15),
  password: z.string().min(6, "Password must be at least 6 characters."),
});


export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [loginSuccess, setLoginSuccess] = React.useState(false);
    const [userName, setUserName] = React.useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const result = await loginAction(values);
        
        if (result.success && result.userData) {
            setUserName(result.userData.name);
            setLoginSuccess(true);
            toast({
                variant: "success",
                title: "Login Successful",
                description: `Welcome back, ${result.userData.name}! Redirecting...`,
            });
            
            if (result.userType === 'dealer') {
                const dealer = result.userData as Dealer;
                localStorage.setItem("user_authenticated", "true");
                localStorage.setItem("dealer_info", JSON.stringify({ 
                    id: dealer.id,
                    name: dealer.name, 
                    dealershipName: dealer.dealershipName 
                }));
                router.push(`/dashboard/${dealer.id}`);
            } else if (result.userType === 'employee') {
                const employee = result.userData as Employee;
                localStorage.setItem("employee_authenticated", "true");
                localStorage.setItem("employee_info", JSON.stringify(employee));
                router.push(`/employee-dashboard`);
            }
        } else {
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: result.message,
            });
            setIsLoading(false);
        }
    }

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Trusted Vehicles</h1>
            <p className="mt-1 text-base text-muted-foreground">
                Dealership & Employee Portal
            </p>
        </div>
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
            {loginSuccess ? (
                <CardContent className="flex flex-col items-center justify-center text-center p-6 min-h-[380px]">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Access Approved!</h2>
                    <p className="text-muted-foreground mb-6">
                        Welcome, {userName}! Redirecting you...
                    </p>
                </CardContent>
            ) : (
            <>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2"><User /> User Login</CardTitle>
                    <CardDescription>Enter your credentials to access your portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>User ID (Phone Number)</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your phone number" {...field} />
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
                            {isLoading ? "Signing in..." : <><LogIn className="mr-2 h-4 w-4" /> Sign In</>}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
                 <CardFooter className="flex-col text-sm text-center">
                    <Separator className="mb-4" />
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                        Register here
                        </Link>
                    </p>
                </CardFooter>
            </>
            )}
        </Card>
    </div>
  );
}
