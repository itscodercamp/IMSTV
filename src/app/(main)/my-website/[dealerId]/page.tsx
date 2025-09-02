
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, Search, IndianRupee, Rocket, BarChart, ShoppingCart, Globe, FileText, Loader2 } from "lucide-react";

export default function MyWebsiteTermsPage() {
  const [isChecked, setIsChecked] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const dealerId = params.dealerId as string;
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user has an active plan
    if (localStorage.getItem(`my_website_plan_active_${dealerId}`) === 'true') {
      router.replace(`/my-website/${dealerId}/dashboard`);
    } else {
      setIsLoading(false);
    }
  }, [dealerId, router]);


  const handleAccept = () => {
    if (isChecked) {
      toast({
        title: "Terms Accepted!",
        description: "Please select a plan to continue.",
        variant: "success",
      });
      router.push(`/my-website/${dealerId}/pricing`);
    } else {
      toast({
        title: "Acceptance Required",
        description: "You must accept the terms and conditions to continue.",
        variant: "destructive",
      });
    }
  };

  const ListItem = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <li className="flex items-start gap-4">
      <div className="p-2 bg-primary/10 text-primary rounded-full mt-1">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </li>
  );
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Globe className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl">Launch Your Own Professional Website</CardTitle>
              <CardDescription className="text-base">Read and accept the terms to unlock your online presence.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-secondary/50">
            <h3 className="font-bold text-lg mb-2 text-center">Terms & Conditions for Your Dealership Website</h3>
            <ul className="space-y-4">
              <ListItem icon={ShieldCheck} title="Admin Oversight">
                To maintain platform quality and security, the Trusted Vehicles admin team reserves the right to view and analyze your website's data, including vehicle listings and user traffic.
              </ListItem>
              <ListItem icon={ShieldCheck} title="Suspicious Activity">
                In case of any suspected fraudulent or malicious activities, we reserve the right to temporarily suspend or permanently shut down your website to protect the integrity of our network.
              </ListItem>
              <ListItem icon={FileText} title="Customization & Content">
                You are free to customize your website's look and feel, and you are solely responsible for the products and information you list.
              </ListItem>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 border-t pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} />
            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I have read and agree to the terms and conditions.
            </Label>
          </div>
          <Button onClick={handleAccept} disabled={!isChecked} size="lg" className="w-full sm:w-auto">
            Accept & Choose a Plan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
