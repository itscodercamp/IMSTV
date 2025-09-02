
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Loader2, CheckCircle, XCircle, Server, Database, User, CircleDot } from "lucide-react";
import { testDbConnectionAction } from "@/app/(main)/actions";
import { Separator } from "./ui/separator";

type ConnectionResult = {
    success: boolean;
    message: string;
    credentials: {
        host?: string;
        port?: string;
        database?: string;
        user?: string;
    };
}

const DetailRow = ({ label, value, icon: Icon }: { label: string, value: string | undefined, icon: React.ElementType }) => (
    <div className="flex items-center gap-3 text-sm">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className="font-mono text-foreground break-all">{value || 'Not Set'}</span>
    </div>
);

export function DbTestDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [result, setResult] = React.useState<ConnectionResult | null>(null);

    React.useEffect(() => {
        if (open) {
            setIsLoading(true);
            setResult(null);
            testDbConnectionAction()
                .then(setResult)
                .finally(() => setIsLoading(false));
        }
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database Connection Test
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This dialog shows the live status of the connection to the PostgreSQL database.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-48 gap-4 text-muted-foreground">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p>Attempting to connect...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                           {result.success ? (
                                <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-500/50 flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400"/>
                                    <div>
                                        <h3 className="font-semibold text-green-800 dark:text-green-300">Connection Successful</h3>
                                        <p className="text-sm text-green-700 dark:text-green-400">{result.message}</p>
                                    </div>
                                </div>
                           ) : (
                                <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-500/50 flex items-center gap-3">
                                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400"/>
                                    <div>
                                        <h3 className="font-semibold text-red-800 dark:text-red-300">Connection Failed</h3>
                                        <p className="text-sm text-red-700 dark:text-red-400 break-words">{result.message}</p>
                                    </div>
                                </div>
                           )}

                            <Separator />

                            <div>
                                <h4 className="font-medium mb-3 text-foreground">Connection Details</h4>
                                <div className="space-y-2 rounded-md border p-3 bg-secondary/50">
                                    <DetailRow icon={Server} label="Host" value={result.credentials.host}/>
                                    <DetailRow icon={CircleDot} label="Port" value={result.credentials.port}/>
                                    <DetailRow icon={Database} label="Database" value={result.credentials.database}/>
                                    <DetailRow icon={User} label="User" value={result.credentials.user}/>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

    