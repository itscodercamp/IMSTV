
"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PaymentPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const dealerId = params.dealerId as string;
    const plan = searchParams.get('plan') || '12';
    const [isProcessing, setIsProcessing] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsProcessing(false);
            
            // Mark plan as active in localStorage
            localStorage.setItem(`my_website_plan_active_${dealerId}`, 'true');
            localStorage.setItem(`my_website_plan_type_${dealerId}`, plan);

            toast({
                title: "Payment Successful!",
                description: "Your plan has been activated. Redirecting to your dashboard...",
                variant: "success"
            });
            
            // Redirect to dashboard
            const redirectTimer = setTimeout(() => {
                router.replace(`/my-website/${dealerId}/dashboard`);
            }, 1500);

            return () => clearTimeout(redirectTimer);
        }, 2500);

        return () => clearTimeout(timer);
    }, [dealerId, plan, router]);

    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    {isProcessing ? (
                        <>
                         <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                            <Loader2 className="h-8 w-8 text-primary animate-spin"/>
                         </div>
                         <CardTitle>Processing Your Payment</CardTitle>
                         <CardDescription>This is a placeholder for a real payment gateway. Please wait while we activate your plan.</CardDescription>
                        </>
                    ) : (
                         <>
                         <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600"/>
                         </div>
                         <CardTitle>Payment Successful!</CardTitle>
                         <CardDescription>Your plan has been activated. You will be redirected shortly.</CardDescription>
                        </>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="p-4 rounded-lg bg-secondary/50 flex items-center justify-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground"/>
                        <p className="text-sm text-muted-foreground">Secure Payment Gateway Simulation</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
