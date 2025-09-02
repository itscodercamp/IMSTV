
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead, Employee } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { getAllLeadsForDealerAction } from "../../actions";
import { Car, User, Calendar, Tag } from "lucide-react";

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Converted': return 'default';
        case 'Completed': return 'default';
        case 'In Progress': return 'secondary';
        case 'Scheduled': return 'secondary';
        case 'Lost': return 'destructive';
        case 'No Show': return 'destructive';
        default: return 'outline';
    }
}

const LeadDetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-center text-sm">
        <Icon className="h-4 w-4 mr-2 text-muted-foreground"/>
        <span className="text-muted-foreground mr-1">{label}:</span>
        <span className="font-medium text-foreground text-right flex-1 truncate">{value}</span>
    </div>
);

function AllLeadsLoader() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </CardContent>
        </Card>
    )
}

export default function AllLeadsPage() {
    const [leads, setLeads] = React.useState<Lead[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const info = localStorage.getItem("employee_info");
        if(info) {
            const parsedInfo: Employee = JSON.parse(info);
            getAllLeadsForDealerAction(parsedInfo.dealerId)
                .then(setLeads)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return <AllLeadsLoader />;
    }

    if (!leads || leads.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>All Dealership Leads</CardTitle>
                    <CardDescription>A list of all customer leads from your entire team.</CardDescription>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                    <p>No leads have been created at your dealership yet.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Dealership Leads</CardTitle>
                <CardDescription>A list of all customer leads from your entire team.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="hidden md:grid grid-cols-4 gap-4 p-4 font-medium text-muted-foreground border-b">
                    <div className="col-span-1">Customer</div>
                    <div className="col-span-1">Vehicle of Interest</div>
                    <div className="col-span-1">Assigned To</div>
                    <div className="col-span-1">Status</div>
                </div>

                <div className="space-y-4 md:space-y-0">
                    {leads.map((lead) => (
                        <div key={lead.id} className="block md:grid md:grid-cols-4 gap-4 items-center p-4 border-b last:border-b-0 hover:bg-muted/50 rounded-lg md:rounded-none md:p-4">
                            <div className="col-span-1 mb-4 md:mb-0">
                                <div className="font-medium text-base md:text-sm">{lead.name}</div>
                                <div className="text-sm text-muted-foreground">{lead.phone}</div>
                                <div className="text-xs text-muted-foreground pt-1">{format(new Date(lead.dateAdded), 'PP')}</div>
                            </div>
                            
                            <div className="col-span-1 mb-4 md:mb-0 text-sm">
                                {lead.vehicleMake && lead.vehicleModel ? 
                                    `${lead.vehicleMake} ${lead.vehicleModel}`
                                    : lead.otherVehicleName ? `${lead.otherVehicleName} (${lead.otherVehicleReg})`
                                    : "Any Vehicle"
                                }
                            </div>

                            <div className="col-span-1 mb-4 md:mb-0 text-sm">
                                {lead.employeeName || "Unassigned"}
                            </div>

                            <div className="col-span-1 flex flex-col gap-1.5 items-start">
                                <Badge variant={getStatusVariant(lead.conversionStatus)}>{lead.conversionStatus}</Badge>
                                <Badge variant={getStatusVariant(lead.testDriveStatus)}>{lead.testDriveStatus}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
