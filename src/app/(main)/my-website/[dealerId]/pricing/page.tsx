
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CheckCircle, IndianRupee, Percent, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type Plan = '12' | '24';

const planDetails = {
    '12': {
        name: 'Annual Plan',
        originalPrice: 1499,
        discountedPrice: 999,
        platformCharges: 59,
        maintenanceFee: 199,
    },
    '24': {
        name: 'Biennial Plan',
        originalPrice: 2499,
        discountedPrice: 1859,
        platformCharges: 59 * 2,
        maintenanceFee: 199 * 2,
    }
}

export default function PricingPage() {
    const [selectedPlan, setSelectedPlan] = React.useState<Plan>('12');
    const router = useRouter();
    const params = useParams();
    const dealerId = params.dealerId as string;
    const [dealerInfo, setDealerInfo] = React.useState({dealershipName: 'Your Brand'});

    React.useEffect(() => {
        const info = localStorage.getItem('dealer_info');
        if (info) {
            setDealerInfo(JSON.parse(info));
        }
    }, [])

    const handleFreeTrial = () => {
        localStorage.setItem(`my_website_plan_active_${dealerId}`, 'true');
        localStorage.setItem(`my_website_plan_type_${dealerId}`, 'trial');
        router.push(`/my-website/${dealerId}/dashboard`);
    }
    
    const handleMakePayment = () => {
        router.push(`/my-website/${dealerId}/payment?plan=${selectedPlan}`);
    }

    const currentPlan = planDetails[selectedPlan];
    const gstAmount = currentPlan.discountedPrice * 0.18;
    const totalAmount = currentPlan.discountedPrice + gstAmount + currentPlan.platformCharges + currentPlan.maintenanceFee;

    const PlanCard = ({ plan, popular = false }: { plan: Plan, popular?: boolean }) => {
        const details = planDetails[plan];
        return (
             <Card 
                className={cn(
                    "cursor-pointer transition-all", 
                    selectedPlan === plan ? "border-primary ring-2 ring-primary shadow-lg" : "border-border hover:shadow-md"
                )}
                onClick={() => setSelectedPlan(plan)}
            >
                <CardHeader>
                    {popular && <p className="font-semibold text-xs text-primary -mt-1 mb-2">MOST POPULAR</p>}
                    <CardTitle className="text-2xl">{details.name}</CardTitle>
                    <CardDescription>Get your website for {plan} months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">₹{details.discountedPrice}</span>
                        <span className="text-xl font-medium text-muted-foreground line-through">₹{details.originalPrice}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">plus taxes & fees</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Choose Your Plan</CardTitle>
                    <CardDescription className="text-base">Your professional website <span className="font-bold text-primary">{dealerInfo.dealershipName.toLowerCase().replace(/\s+/g, '-')}.trustedvehicles.com</span> is just a step away.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6 p-6">
                    <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                        <PlanCard plan="12" popular/>
                        <PlanCard plan="24"/>
                        <Card className="sm:col-span-2 p-6 flex flex-col items-center justify-center text-center bg-secondary/50 border-dashed">
                             <h3 className="text-xl font-semibold">New to Trusted Vehicles?</h3>
                             <p className="text-muted-foreground mt-2 mb-4">Get all features of the Annual Plan, absolutely free for 1 month.</p>
                             <Button onClick={handleFreeTrial} size="lg">Start 1-Month Free Trial</Button>
                        </Card>
                    </div>

                    <Card className="md:col-span-1 bg-secondary/50">
                        <CardHeader>
                            <CardTitle>What's Included</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <ul className="space-y-2">
                                {["Free SSL", "Free Hosting", "Free Sub-domain", "Free Monitoring", "Automatic Inventory Sync", "Customizable Themes", "Free SEO"].map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500"/>
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Separator/>
                            <div className="space-y-1 pt-2">
                                <div className="flex justify-between items-center text-muted-foreground"><span>Base Price</span><span>₹{currentPlan.discountedPrice.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-muted-foreground"><span>Platform Charges</span><span>₹{currentPlan.platformCharges.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-muted-foreground"><span>Maintenance Fee</span><span>₹{currentPlan.maintenanceFee.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-muted-foreground"><span>GST (18%)</span><span>₹{gstAmount.toFixed(2)}</span></div>
                            </div>
                            <Separator/>
                             <div className="flex justify-between items-center font-bold text-lg pt-2">
                                <span>Total Payable</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleMakePayment} className="w-full" size="lg">Make Payment</Button>
                        </CardFooter>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}
