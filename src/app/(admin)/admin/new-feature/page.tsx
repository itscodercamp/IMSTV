
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft, Rocket } from "lucide-react";

export default function NewFeaturePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full mb-4">
                    <Rocket className="h-8 w-8"/>
                </div>
                <CardTitle>Feature Coming Soon!</CardTitle>
                <CardDescription>
                We are working hard to bring you this new feature. Stay tuned!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to Dashboard
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
