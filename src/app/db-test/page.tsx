
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { setupDatabaseAction, testDbConnectionAction } from "@/app/(main)/actions";
import { Loader2, Database, AlertCircle, CheckCircle } from "lucide-react";
import Link from 'next/link';

type ConnectionResult = {
    success: boolean;
    message: string;
}

export default function DbTestPage() {
    const [isSetupLoading, setIsSetupLoading] = React.useState(false);
    const [isTestLoading, setIsTestLoading] = React.useState(true);
    const [testResult, setTestResult] = React.useState<ConnectionResult | null>(null);

    const handleSetup = async () => {
        setIsSetupLoading(true);
        const result = await setupDatabaseAction();
        if (result.success) {
            toast({
                variant: "success",
                title: "Database Initialized!",
                description: "The database has been flushed and seeded with sample data.",
            });
        } else {
             toast({
                variant: "destructive",
                title: "Database Setup Failed",
                description: "Could not initialize the database.",
            });
        }
        setIsSetupLoading(false);
        runTest(); // Re-run test after setup
    }

    const runTest = React.useCallback(async () => {
        setIsTestLoading(true);
        const result = await testDbConnectionAction();
        setTestResult(result);
        setIsTestLoading(false);
    }, []);

    React.useEffect(() => {
        runTest();
    }, [runTest]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full mb-4">
                    <Database className="h-8 w-8"/>
                </div>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>
                    Use these tools to manage the application's database.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Card>
                    <CardHeader className="p-4">
                        <CardTitle className="text-lg">Connection Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                         {isTestLoading ? (
                             <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                <span>Testing...</span>
                             </div>
                         ) : testResult?.success ? (
                             <div className="flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle className="h-5 w-5"/>
                                <span className="font-semibold">{testResult.message}</span>
                             </div>
                         ) : (
                             <div className="flex items-center justify-center gap-2 text-destructive">
                                <AlertCircle className="h-5 w-5"/>
                                <span className="font-semibold">{testResult?.message || "Failed to connect"}</span>
                             </div>
                         )}
                    </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground pt-2">This will delete all existing data and re-seed it with the default sample dealers and vehicles.</p>
                <Button onClick={handleSetup} className="w-full" disabled={isSetupLoading}>
                    {isSetupLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Flushing & Seeding...</> : "Flush & Re-seed Database"}
                </Button>
                <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Go to Login Page</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
